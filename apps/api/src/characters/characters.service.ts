import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateCharacterImageDto } from './dto/create-image.dto';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

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

    const characters = await this.prisma.character.findMany({
      where, take: limit, skip: offset, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], take: 1 } }, // 先頭1枚をサムネに
    });
    
    // Check favorites for this user
    if (userId) {
      const favoriteIds = await this.prisma.favoriteCharacter.findMany({
        where: { userId },
        select: { characterId: true },
      });
      const favSet = new Set(favoriteIds.map(f => f.characterId));
      return characters.map(c => ({ ...c, isFavorited: favSet.has(c.id), isFavorite: favSet.has(c.id) }));
    }
    
    return characters.map(c => ({ ...c, isFavorited: false, isFavorite: false }));
  }

  async findPublic(id: string, userId: string | null = null) {
    const c = await this.prisma.character.findFirst({
      where: { id, deletedAt: null, isPublic: true },
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!c) throw new NotFoundException('Character not found');
    
    // Check if user has favorited this character
    let isFavorited = false;
    if (userId) {
      const fav = await this.prisma.favoriteCharacter.findUnique({
        where: { userId_characterId: { userId, characterId: id } },
      });
      isFavorited = !!fav;
    }
    
    return { ...c, isFavorited, isFavorite: isFavorited };
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

  async getUsageImpact(ownerId: string, id: string) {
    const character = await this.prisma.character.findUnique({ where: { id } });
    if (!character || character.deletedAt) throw new NotFoundException('Character not found');
    if (character.ownerId !== ownerId) throw new ForbiddenException();

    // キャラクター画像IDセット（portraits[*].imageId 参照チェック用）
    const charImages = await this.prisma.characterImage.findMany({
      where: { characterId: id },
      select: { id: true },
    });
    const charImageIds = new Set(charImages.map(i => i.id));

    const SAMPLE_LIMIT = 10;

    // 1. speakerCharacterId 参照（DB直接検索）
    const speakerNodes = await this.prisma.gameNode.findMany({
      where: {
        speakerCharacterId: id,
        scene: { project: { deletedAt: null } },
      },
      select: {
        id: true,
        order: true,
        text: true,
        scene: {
          select: {
            id: true,
            name: true,
            project: { select: { id: true, ownerId: true, title: true, isPublic: true } },
          },
        },
      },
    });

    // 2. portraits 候補ノード（JSON null 条件はPrismaに渡さず、TS側でフィルタ）
    const portraitCandidates = await this.prisma.gameNode.findMany({
      where: {
        scene: { project: { deletedAt: null } },
      },
      select: {
        id: true,
        order: true,
        text: true,
        portraits: true,
        scene: {
          select: {
            id: true,
            name: true,
            project: { select: { id: true, ownerId: true, title: true, isPublic: true } },
          },
        },
      },
    });

    type PortraitEntry = { characterId?: unknown; imageId?: unknown };
    const portraitNodes = portraitCandidates.filter(n => {
      const ps = n.portraits;
      if (!Array.isArray(ps)) return false;
      return ps.some(p => {
        if (!p || typeof p !== 'object') return false;
        const entry = p as PortraitEntry;
        return (typeof entry.characterId === 'string' && entry.characterId === id) ||
          (typeof entry.imageId === 'string' && charImageIds.has(entry.imageId));
      });
    });

    type GameAgg = {
      gameId: string;
      title: string;
      isOwn: boolean;
      isPublic: boolean;
      refs: Array<{
        field: 'speakerCharacterId' | 'portraits';
        sceneId: string | null;
        sceneName: string;
        nodeId: string | null;
        nodeOrder: number | null;
        nodePreview: string;
      }>;
    };

    const gameMap = new Map<string, GameAgg>();

    const ensureGame = (gameId: string, title: string, nodeOwnerId: string, isPublic: boolean) => {
      if (!gameMap.has(gameId)) {
        gameMap.set(gameId, { gameId, title, isOwn: nodeOwnerId === ownerId, isPublic, refs: [] });
      }
      return gameMap.get(gameId)!;
    };

    const makePreview = (text: string | null | undefined) =>
      text ? text.slice(0, 30) + (text.length > 30 ? '…' : '') : '';

    for (const n of speakerNodes) {
      const p = n.scene.project;
      const g = ensureGame(p.id, p.title, p.ownerId, p.isPublic);
      g.refs.push({
        field: 'speakerCharacterId',
        sceneId: n.scene.id,
        sceneName: n.scene.name,
        nodeId: n.id,
        nodeOrder: n.order,
        nodePreview: makePreview(n.text),
      });
    }

    for (const n of portraitNodes) {
      const p = n.scene.project;
      const g = ensureGame(p.id, p.title, p.ownerId, p.isPublic);
      g.refs.push({
        field: 'portraits',
        sceneId: n.scene.id,
        sceneName: n.scene.name,
        nodeId: n.id,
        nodeOrder: n.order,
        nodePreview: makePreview(n.text),
      });
    }

    const allGames = Array.from(gameMap.values());
    const ownGames = allGames.filter(g => g.isOwn);
    const otherGames = allGames.filter(g => !g.isOwn);

    const sumByField = (games: GameAgg[]) => {
      let speakerCount = 0;
      let portraitsCount = 0;
      for (const g of games) {
        for (const r of g.refs) {
          if (r.field === 'speakerCharacterId') speakerCount++;
          else portraitsCount++;
        }
      }
      return { speakerCharacterId: speakerCount, portraits: portraitsCount };
    };

    const ownByField = sumByField(ownGames);
    const totalReferenceCount = allGames.reduce((s, g) => s + g.refs.length, 0);
    const ownReferenceCount = ownGames.reduce((s, g) => s + g.refs.length, 0);

    const ownGameSamples = ownGames.slice(0, SAMPLE_LIMIT).map(g => ({
      gameId: g.gameId,
      title: g.title,
      isPublic: g.isPublic,
      referenceCount: g.refs.length,
      byField: sumByField([g]),
      refs: g.refs,
    }));

    return {
      characterId: id,
      totalGameCount: allGames.length,
      ownGameCount: ownGames.length,
      otherGameCount: otherGames.length,
      totalReferenceCount,
      ownReferenceCount,
      otherReferenceCount: totalReferenceCount - ownReferenceCount,
      ownByField,
      ownGameSamples,
      sampleLimit: SAMPLE_LIMIT,
      hasMoreOwnGames: ownGames.length > SAMPLE_LIMIT,
      checkedAt: new Date().toISOString(),
    };
  }

  async listImages(userId: string|null, characterId: string, publicOnly: boolean) {
    const c = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (publicOnly) {
      if (!c.isPublic && (!userId || c.ownerId !== userId)) throw new ForbiddenException();
    } else {
      if (!userId || c.ownerId !== userId) throw new ForbiddenException();
    }
    return this.prisma.characterImage.findMany({
      where: { characterId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, key: true, thumbKey: true, emotion: true, emotionLabel: true, pattern: true, width: true, height: true }
    });
  }
}
