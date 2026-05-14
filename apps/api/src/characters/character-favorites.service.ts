import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CharacterFavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, characterId: string) {
    const character = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!character || character.deletedAt) {
      throw new NotFoundException('character not found');
    }
    // Only own characters or public characters can be favorited
    if (character.ownerId !== userId && !character.isPublic) {
      throw new ForbiddenException('cannot favorite a non-public character');
    }

    await this.prisma.favoriteCharacter.upsert({
      where: { userId_characterId: { userId, characterId } },
      update: {},
      create: { userId, characterId },
    });
  }

  async remove(userId: string, characterId: string) {
    await this.prisma.favoriteCharacter.deleteMany({
      where: { userId, characterId },
    });
  }

  async list(userId: string, opt?: { q?: string; tags?: string[]; sort?: string; limit?: number; offset?: number }) {
    const favs = await this.prisma.favoriteCharacter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        character: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    let characters = favs
      .map(f => f.character)
      .filter((c) => !!c && !c.deletedAt)
      .filter((c) => c.ownerId === userId || c.isPublic)
      .map((c) => ({ ...c, isFavorited: true, isFavorite: true }));

    // Apply q filter
    if (opt?.q) {
      const qLower = opt.q.toLowerCase();
      characters = characters.filter(c => 
        (c.name || '').toLowerCase().includes(qLower) ||
        (c.displayName || '').toLowerCase().includes(qLower) ||
        (c.description || '').toLowerCase().includes(qLower) ||
        (c.tags || []).some(tag => tag.toLowerCase().includes(qLower))
      );
    }

    // Apply tags filter
    if (opt?.tags?.length) {
      characters = characters.filter(c => 
        opt.tags.some(tag => (c.tags || []).includes(tag))
      );
    }

    // Apply sorting
    if (opt?.sort === 'createdAt:asc') {
      characters = characters.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (opt?.sort === 'name:asc') {
      characters = characters.sort((a, b) => ((a.name || a.displayName) || '').localeCompare((b.name || b.displayName) || ''));
    } else {
      // default: createdAt:desc (newest first)
      characters = characters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Apply limit/offset
    const limit = opt?.limit ?? Number.MAX_SAFE_INTEGER;
    const offset = opt?.offset ?? 0;
    characters = characters.slice(offset, offset + limit);

    // Use isFavorited (past participle) to match frontend expectations
    return characters;
  }
}
