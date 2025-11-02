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

  async list(userId: string) {
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
    // Use isFavorited (past participle) to match frontend expectations
    return favs.map(f => ({ ...f.character, isFavorited: true, isFavorite: true }));
  }
}
