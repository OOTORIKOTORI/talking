import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CharacterFavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, characterId: string) {
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

  async list(userId: string, opt?: { q?: string; tags?: string[] }) {
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

    let characters = favs.map(f => ({ ...f.character, isFavorited: true, isFavorite: true }));

    // Apply filters
    if (opt?.q) {
      const qLower = opt.q.toLowerCase();
      characters = characters.filter(c => 
        (c.name || '').toLowerCase().includes(qLower) ||
        (c.displayName || '').toLowerCase().includes(qLower) ||
        (c.description || '').toLowerCase().includes(qLower) ||
        (c.tags || []).some(tag => tag.toLowerCase().includes(qLower))
      );
    }

    if (opt?.tags?.length) {
      characters = characters.filter(c => 
        opt.tags.some(tag => (c.tags || []).includes(tag))
      );
    }

    // Use isFavorited (past participle) to match frontend expectations
    return characters;
  }
}
