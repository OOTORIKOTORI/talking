import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DISPLAY_NAME_MAX_LENGTH = 40;
const BIO_MAX_LENGTH = 500;

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

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
}
