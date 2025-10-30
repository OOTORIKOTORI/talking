
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateCharacterImageDto } from './dto/create-image.dto';

@Injectable()
export class CharactersService {
  private readonly prisma: PrismaClient = new PrismaClient();

  async create(ownerId: string, dto: CreateCharacterDto) {
    const tags = (dto.tags || []).map(t => t.trim()).filter(Boolean).slice(0, 20)
    return this.prisma.character.create({
      data: { ownerId, name: dto.name, displayName: dto.displayName, description: dto.description, isPublic: dto.isPublic ?? true, tags },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateCharacterDto) {
  const c = await this.prisma.character.findUnique({ where: { id } });
  if (!c || c.deletedAt) throw new NotFoundException('Character not found');
  if (c.ownerId !== ownerId) throw new ForbiddenException();
  const tags = dto.tags ? dto.tags.map(t => t.trim()).filter(Boolean).slice(0, 20) : undefined
  return this.prisma.character.update({ where: { id }, data: { ...dto, ...(tags !== undefined ? { tags } : {}) } });
  }

  async remove(ownerId: string, id: string) {
    const c = await this.prisma.character.findUnique({ where: { id } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (c.ownerId !== ownerId) throw new ForbiddenException();
    await this.prisma.character.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async list(userId: string | null, q: string | undefined, publicOnly: boolean, limit = 20, offset = 0) {
    const where: any = { deletedAt: null };
    if (publicOnly) where.isPublic = true;
    if (!publicOnly && userId) where.ownerId = userId;
    if (q) where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { displayName: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];

    return this.prisma.character.findMany({
      where, take: limit, skip: offset, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], take: 1 } }, // 先頭1枚をサムネに
    });
  }

  async findPublic(id: string) {
    const c = await this.prisma.character.findFirst({
      where: { id, deletedAt: null, isPublic: true },
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!c) throw new NotFoundException('Character not found');
    return c;
  }

  async findOwned(ownerId: string, id: string) {
    const c = await this.prisma.character.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!c) throw new NotFoundException('Character not found');
    return c;
  }

  async addImage(ownerId: string, characterId: string, dto: CreateCharacterImageDto) {
    const c = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (c.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.characterImage.create({
      data: { characterId, ...dto },
    });
  }

  async updateImage(ownerId: string, characterId: string, imageId: string, dto: Partial<CreateCharacterImageDto>) {
    const c = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (c.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.characterImage.update({
      where: { id: imageId },
      data: dto,
    });
  }

  async removeImage(ownerId: string, characterId: string, imageId: string) {
    const c = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (c.ownerId !== ownerId) throw new ForbiddenException();
    await this.prisma.characterImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}
