import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateCharacterImageDto } from './dto/create-image.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  private parseTags(input?: string): string[] {
    if (!input) return [];
    const tokens = input
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const normalized: string[] = [];
    for (const t of tokens) {
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      normalized.push(t);
      if (normalized.length >= 20) break;
    }
    return normalized;
  }

  private async getOwnerDisplayNameMap(
    ownerIds: Array<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = [
      ...new Set(
        ownerIds.filter(
          (id): id is string => typeof id === 'string' && id.trim().length > 0,
        ),
      ),
    ];
    if (ids.length === 0) return new Map();

    const profiles = await this.prisma.creatorProfile.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, displayName: true },
    });

    const map = new Map<string, string>();
    for (const p of profiles) {
      const name = p.displayName.trim();
      if (name.length > 0) map.set(p.userId, name);
    }
    return map;
  }

  private async getOwnerDisplayNameSnapshot(ownerId: string): Promise<string | null> {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId: ownerId },
      select: { displayName: true },
    });
    const name = profile?.displayName?.trim();
    return name ? name : null;
  }

  private resolveOwnerDisplayName(
    ownerId: string | null | undefined,
    ownerDisplayNameSnapshot: string | null | undefined,
    ownerDisplayNameMap: Map<string, string>,
  ): string | null {
    const snapshot = ownerDisplayNameSnapshot?.trim();
    if (snapshot) return snapshot;
    if (!ownerId) return null;
    return ownerDisplayNameMap.get(ownerId) ?? null;
  }

  private normalizeReferenceFields(value: Prisma.JsonValue | null | undefined): Record<string, number> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const out: Record<string, number> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : 0;
      if (n > 0) out[key] = n;
    }
    return out;
  }

  async create(ownerId: string, dto: CreateCharacterDto) {
    const tags = (dto.tags || []).map(t => t.trim()).filter(Boolean).slice(0, 20)
    const usageTerms = typeof dto.usageTerms === 'string' ? dto.usageTerms.trim() || null : null;
    const ownerDisplayNameSnapshot = await this.getOwnerDisplayNameSnapshot(ownerId);
    return this.prisma.character.create({
      data: {
        ownerId,
        ownerDisplayNameSnapshot,
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        tags,
        usageTerms,
        ...(dto.creditRequired !== undefined && { creditRequired: dto.creditRequired }),
      },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateCharacterDto) {
    const c = await this.prisma.character.findUnique({ where: { id } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (c.ownerId !== ownerId) throw new ForbiddenException();
    const tags = dto.tags ? dto.tags.map(t => t.trim()).filter(Boolean).slice(0, 20) : undefined;
    const usageTerms = dto.usageTerms !== undefined
      ? (dto.usageTerms.trim() || null)
      : undefined;
    const { usageTerms: _u, creditRequired: _cr, tags: _tags, ...rest } = dto;
    return this.prisma.character.update({
      where: { id },
      data: {
        ...rest,
        ...(tags !== undefined ? { tags } : {}),
        ...(usageTerms !== undefined ? { usageTerms } : {}),
        ...(dto.creditRequired !== undefined ? { creditRequired: dto.creditRequired } : {}),
      },
    });
  }

  async remove(ownerId: string, id: string) {
    const c = await this.prisma.character.findUnique({ where: { id } });
    if (!c || c.deletedAt) throw new NotFoundException('Character not found');
    if (c.ownerId !== ownerId) throw new ForbiddenException();
    await this.prisma.character.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async getUsedInGames(id: string, userId: string | null = null, rawLimit = 6) {
    const character = await this.prisma.character.findUnique({ where: { id } });
    if (!character || character.deletedAt) {
      throw new NotFoundException('Character not found');
    }
    if (!character.isPublic && character.ownerId !== userId) {
      throw new NotFoundException('Character not found');
    }

    const limit = Math.min(Math.max(Number(rawLimit) || 6, 1), 20);
    const where = {
      characterId: id,
      game: {
        deletedAt: null,
        isPublic: true,
      },
    };

    const [total, rows] = await Promise.all([
      this.prisma.gameCharacterReference.count({ where }),
      this.prisma.gameCharacterReference.findMany({
        where,
        take: limit + 1,
        orderBy: [
          { game: { updatedAt: 'desc' } },
          { gameId: 'desc' },
        ],
        select: {
          gameId: true,
          usageCount: true,
          fields: true,
          game: {
            select: {
              id: true,
              title: true,
              summary: true,
              coverAssetId: true,
              ownerId: true,
              ownerDisplayNameSnapshot: true,
              isPublic: true,
              viewCount: true,
              playCount: true,
              updatedAt: true,
            },
          },
        },
      }),
    ]);

    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap(rows.map((row) => row.game.ownerId));

    const hasMore = rows.length > limit;
    const sliced = hasMore ? rows.slice(0, limit) : rows;
    const items = sliced.map((row) => {
      const ownerId = row.game.ownerId ?? null;
      return {
        gameId: row.game.id,
        title: row.game.title,
        summary: row.game.summary,
        coverAssetId: row.game.coverAssetId,
        ownerId,
        ownerDisplayName: this.resolveOwnerDisplayName(
          ownerId,
          row.game.ownerDisplayNameSnapshot,
          ownerDisplayNameMap,
        ),
        isPublic: true,
        viewCount: row.game.viewCount,
        playCount: row.game.playCount,
        updatedAt: row.game.updatedAt.toISOString(),
        usageCount: Math.max(0, Math.floor(row.usageCount ?? 0)),
        fields: this.normalizeReferenceFields(row.fields),
      };
    });

    return {
      characterId: id,
      total,
      limit,
      hasMore,
      items,
      checkedAt: new Date().toISOString(),
    };
  }

  async list(params: {
    viewerUserId: string | null;
    ownerUserId: string | null;
    q?: string;
    tags?: string;
    sort?: 'createdAt:desc' | 'createdAt:asc' | 'name:asc';
    visibility?: 'all' | 'public' | 'private';
    publicOnly: boolean;
    limit?: number;
    offset?: number;
  }) {
    const {
      viewerUserId,
      ownerUserId,
      q,
      tags,
      sort,
      visibility,
      publicOnly,
      limit = 20,
      offset = 0,
    } = params;

    const where: any = { deletedAt: null };
    if (publicOnly) where.isPublic = true;
    if (!publicOnly && ownerUserId) {
      where.ownerId = ownerUserId;
      if (visibility === 'public') where.isPublic = true;
      if (visibility === 'private') where.isPublic = false;
    }

    const andConditions: any[] = [];

    const qValue = q?.trim();
    if (qValue) {
      const qTokens = this.parseTags(qValue);
      const orConditions: any[] = [
        { name: { contains: qValue, mode: 'insensitive' } },
        { displayName: { contains: qValue, mode: 'insensitive' } },
        { description: { contains: qValue, mode: 'insensitive' } },
      ];
      if (qTokens.length > 0) {
        orConditions.push({ tags: { hasSome: qTokens } });
      }
      andConditions.push({ OR: orConditions });
    }

    const tagList = this.parseTags(tags);
    if (tagList.length > 0) {
      andConditions.push({ tags: { hasSome: tagList } });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const orderBy =
      sort === 'createdAt:asc'
        ? [{ createdAt: 'asc' as const }, { id: 'asc' as const }]
        : sort === 'name:asc'
          ? [{ name: 'asc' as const }, { createdAt: 'desc' as const }, { id: 'desc' as const }]
          : [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

    const characters = await this.prisma.character.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy,
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], take: 1 } }, // 先頭1枚をサムネに
    });

    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap(characters.map(c => c.ownerId));
    const withOwnerDisplayName = characters.map(c => ({
      ...c,
      ownerDisplayName: this.resolveOwnerDisplayName(
        c.ownerId,
        c.ownerDisplayNameSnapshot,
        ownerDisplayNameMap,
      ),
    }));
    
    // Check favorites for this user
    if (viewerUserId) {
      const favoriteIds = await this.prisma.favoriteCharacter.findMany({
        where: { userId: viewerUserId },
        select: { characterId: true },
      });
      const favSet = new Set(favoriteIds.map(f => f.characterId));
      return withOwnerDisplayName.map(c => ({ ...c, isFavorited: favSet.has(c.id), isFavorite: favSet.has(c.id) }));
    }
    
    return withOwnerDisplayName.map(c => ({ ...c, isFavorited: false, isFavorite: false }));
  }

  async findPublic(id: string, userId: string | null = null) {
    const c = await this.prisma.character.findFirst({
      where: { id, deletedAt: null, isPublic: true },
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!c) throw new NotFoundException('Character not found');

    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap([c.ownerId]);
    const ownerDisplayName = this.resolveOwnerDisplayName(
      c.ownerId,
      c.ownerDisplayNameSnapshot,
      ownerDisplayNameMap,
    );
    
    // Check if user has favorited this character
    let isFavorited = false;
    if (userId) {
      const fav = await this.prisma.favoriteCharacter.findUnique({
        where: { userId_characterId: { userId, characterId: id } },
      });
      isFavorited = !!fav;
    }
    
    return { ...c, ownerDisplayName, isFavorited, isFavorite: isFavorited };
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
    const publicGames = allGames.filter(g => g.isPublic);
    const ownPublicGames = ownGames.filter(g => g.isPublic);
    const otherPublicGames = otherGames.filter(g => g.isPublic);

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
      publicGameCount: publicGames.length,
      privateGameCount: allGames.length - publicGames.length,
      ownPublicGameCount: ownPublicGames.length,
      otherPublicGameCount: otherPublicGames.length,
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
