import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PROFILE_CONTENTS_LIMIT = 6;

const DISPLAY_NAME_MAX_LENGTH = 40;
const BIO_MAX_LENGTH = 500;

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  private resolveOwnerDisplayName(
    ownerDisplayNameSnapshot: string | null | undefined,
    currentDisplayName: string | null | undefined,
  ): string | null {
    const snapshot = ownerDisplayNameSnapshot?.trim();
    if (snapshot) return snapshot;
    const current = currentDisplayName?.trim();
    return current ? current : null;
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return {
        userId,
        displayName: null,
        bio: null,
        isConfigured: false,
      };
    }
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      bio: profile.bio,
      isConfigured: true,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateMyProfile(userId: string, body: { displayName?: unknown; bio?: unknown }) {
    if (typeof body.displayName !== 'string') {
      throw new BadRequestException('displayName is required');
    }
    const displayName = body.displayName.trim();
    if (displayName.length === 0) {
      throw new BadRequestException('displayName must not be empty');
    }
    if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
      throw new BadRequestException(`displayName must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`);
    }

    let bio: string | null = null;
    if (body.bio !== undefined && body.bio !== null) {
      if (typeof body.bio !== 'string') {
        throw new BadRequestException('bio must be a string');
      }
      const trimmedBio = body.bio.trim();
      if (trimmedBio.length > BIO_MAX_LENGTH) {
        throw new BadRequestException(`bio must be at most ${BIO_MAX_LENGTH} characters`);
      }
      bio = trimmedBio.length > 0 ? trimmedBio : null;
    }

    const profile = await this.prisma.creatorProfile.upsert({
      where: { userId },
      update: { displayName, bio },
      create: { userId, displayName, bio },
    });

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      bio: profile.bio,
      isConfigured: true,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async getPublicProfile(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      select: {
        userId: true,
        displayName: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!profile) {
      throw new NotFoundException('profile not found');
    }
    return profile;
  }

  async getProfileContents(userId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      select: { userId: true, displayName: true },
    });
    if (!profile) {
      throw new NotFoundException('profile not found');
    }

    const ownerDisplayName = profile.displayName?.trim() || null;

    const [games, characters, assets] = await Promise.all([
      this.prisma.gameProject.findMany({
        where: { ownerId: userId, isPublic: true, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: PROFILE_CONTENTS_LIMIT,
        select: {
          id: true,
          title: true,
          summary: true,
          coverAssetId: true,
          ownerId: true,
          ownerDisplayNameSnapshot: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.character.findMany({
        where: { ownerId: userId, isPublic: true, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: PROFILE_CONTENTS_LIMIT,
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          ownerId: true,
          ownerDisplayNameSnapshot: true,
          createdAt: true,
          updatedAt: true,
          images: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            take: 1,
            select: { id: true, key: true },
          },
        },
      }),
      this.prisma.asset.findMany({
        where: { ownerId: userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: PROFILE_CONTENTS_LIMIT,
        select: {
          id: true,
          title: true,
          description: true,
          contentType: true,
          primaryTag: true,
          key: true,
          thumbKey: true,
          thumbKeyWebp: true,
          thumbKeyAvif: true,
          ownerId: true,
          ownerDisplayNameSnapshot: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      games: games.map((g) => ({
        ...g,
        ownerDisplayName: this.resolveOwnerDisplayName(g.ownerDisplayNameSnapshot, ownerDisplayName),
      })),
      characters: characters.map((c) => ({
        ...c,
        ownerDisplayName: this.resolveOwnerDisplayName(c.ownerDisplayNameSnapshot, ownerDisplayName),
      })),
      assets: assets.map((a) => ({
        ...a,
        ownerDisplayName: this.resolveOwnerDisplayName(a.ownerDisplayNameSnapshot, ownerDisplayName),
      })),
    };
  }
}
