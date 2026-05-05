import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const SAVE_SLOT_LIMITS = {
  MANUAL: 100,
  AUTO: 5,
  QUICK: 1,
} as const;

type SaveSlotType = keyof typeof SAVE_SLOT_LIMITS;

type PublicGameSummary = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  coverAssetId: string | null;
  viewCount: number;
  playCount: number;
  ownerId: string;
  ownerDisplayName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PublicGamesSort = 'new' | 'updated' | 'title';
type MyGamesSort = 'updated' | 'created' | 'title' | 'public';
type MyGamesStatus = 'all' | 'public' | 'private';
const GAME_TITLE_MAX_LENGTH = 120;
const GAME_SUMMARY_MAX_LENGTH = 500;

// Reference diagnostics types
type GameReferenceDiagnosticCode =
  | 'ASSET_MISSING'
  | 'ASSET_DELETED'
  | 'ASSET_KIND_MISMATCH'
  | 'ASSET_NOT_USABLE'
  | 'CHARACTER_MISSING'
  | 'CHARACTER_DELETED'
  | 'CHARACTER_NOT_USABLE'
  | 'CHARACTER_IMAGE_MISSING'
  | 'CHARACTER_IMAGE_MISMATCH'
  | 'PORTRAIT_KEY_MISMATCH'
  | 'PORTRAITS_INVALID';

type GameReferenceDiagnosticIssue = {
  id: string;
  source: 'reference';
  severity: 'warning';
  code: GameReferenceDiagnosticCode;
  message: string;
  field: string;
  refId?: string | null;
  sceneId: string | null;
  sceneName: string;
  sceneOrder: number | null;
  nodeId: string | null;
  nodeOrder: number | null;
  nodePreview: string;
};

type GameReferenceDiagnosticsResult = {
  issues: GameReferenceDiagnosticIssue[];
  counts: { warning: number };
  checkedAt: string;
};

type GameCreditAssetField =
  | 'coverAssetId'
  | 'bgAssetId'
  | 'musicAssetId'
  | 'sfxAssetId'
  | 'portraitAssetId';

type GameCreditCharacterField = 'speakerCharacterId' | 'portraits';

type GameAssetCreditItem = {
  assetId: string;
  title: string;
  ownerId: string | null;
  ownerDisplayName: string | null;
  contentType: string | null;
  primaryTag: string | null;
  usageCount: number;
  fields: Array<{
    field: GameCreditAssetField;
    label: string;
    count: number;
  }>;
  status: 'active' | 'deleted' | 'missing';
  linkable: boolean;
};

type GameCharacterCreditItem = {
  characterId: string;
  displayName: string;
  name: string;
  ownerId: string | null;
  ownerDisplayName: string | null;
  usageCount: number;
  fields: Array<{
    field: GameCreditCharacterField;
    label: string;
    count: number;
  }>;
  status: 'active' | 'deleted' | 'missing' | 'private';
  linkable: boolean;
};

type GameCreditsResult = {
  gameId: string;
  assetCredits: GameAssetCreditItem[];
  characterCredits: GameCharacterCreditItem[];
  counts: {
    assets: number;
    characters: number;
    total: number;
  };
  checkedAt: string;
};

const GAME_CREDIT_ASSET_FIELD_LABELS: Record<GameCreditAssetField, string> = {
  coverAssetId: 'カバー',
  bgAssetId: '背景',
  musicAssetId: 'BGM',
  sfxAssetId: 'SE',
  portraitAssetId: '立ち絵互換',
};

const GAME_CREDIT_CHARACTER_FIELD_LABELS: Record<GameCreditCharacterField, string> = {
  speakerCharacterId: '話者',
  portraits: '立ち絵',
};

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  private normalizeNodeRefId(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeGameTitle(value: unknown, opts?: { required?: boolean }): string | null {
    if (typeof value !== 'string') {
      if (opts?.required) {
        throw new BadRequestException('title is required');
      }
      return null;
    }

    const trimmed = value.trim();
    if (opts?.required && trimmed.length === 0) {
      throw new BadRequestException('title must not be empty');
    }
    if (trimmed.length > GAME_TITLE_MAX_LENGTH) {
      throw new BadRequestException(`title must be at most ${GAME_TITLE_MAX_LENGTH} characters`);
    }
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeGameSummary(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') {
      throw new BadRequestException('summary must be a string');
    }

    const trimmed = value.trim();
    if (trimmed.length > GAME_SUMMARY_MAX_LENGTH) {
      throw new BadRequestException(`summary must be at most ${GAME_SUMMARY_MAX_LENGTH} characters`);
    }
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeCoverAssetId(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== 'string') {
      throw new BadRequestException('coverAssetId must be a string or null');
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new BadRequestException('coverAssetId must not be blank');
    }
    return trimmed;
  }

  private async assertGameAssetUsable(
    userId: string,
    assetId: string | null | undefined,
    expectedKind: 'image' | 'audio',
  ): Promise<void> {
    if (!assetId || assetId.trim().length === 0) return;

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.deletedAt) {
      throw new BadRequestException(`asset ${assetId} is invalid or deleted`);
    }

    if (expectedKind === 'image' && !asset.contentType.startsWith('image/')) {
      throw new BadRequestException(`asset must be an image (got ${asset.contentType})`);
    }
    if (expectedKind === 'audio' && !asset.contentType.startsWith('audio/')) {
      throw new BadRequestException(`asset must be audio (got ${asset.contentType})`);
    }

    if (asset.ownerId === userId) return;

    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_assetId: { userId, assetId } },
    });
    if (!favorite) {
      throw new ForbiddenException(`asset ${assetId} must be owned or favorited`);
    }
  }

  private async assertCoverAssetUsable(userId: string, coverAssetId: string) {
    await this.assertGameAssetUsable(userId, coverAssetId, 'image');
  }

  private async assertGameCharacterUsable(
    userId: string,
    characterId: string | null | undefined,
  ): Promise<void> {
    if (!characterId || characterId.trim().length === 0) return;

    const character = await this.prisma.character.findUnique({ where: { id: characterId } });
    if (!character || character.deletedAt) {
      throw new BadRequestException(`character ${characterId} is invalid or deleted`);
    }

    if (character.ownerId === userId) return;

    // Other user's character: must be public AND favorited
    if (!character.isPublic) {
      throw new ForbiddenException(`character ${characterId} is not accessible (not public)`);
    }

    const favorite = await this.prisma.favoriteCharacter.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });
    if (!favorite) {
      throw new ForbiddenException(`character ${characterId} must be owned or favorited`);
    }
  }

  private async validateAndNormalizePortraits(
    userId: string,
    portraits: unknown,
  ): Promise<any[] | null | undefined> {
    if (portraits === null || portraits === undefined) return portraits as null | undefined;
    if (!Array.isArray(portraits)) {
      throw new BadRequestException('portraits must be an array');
    }

    const normalized: any[] = [];
    for (const entry of portraits) {
      if (typeof entry?.characterId !== 'string' || entry.characterId.trim().length === 0) {
        throw new BadRequestException('portraits[*].characterId must be a non-empty string');
      }
      if (typeof entry?.imageId !== 'string' || entry.imageId.trim().length === 0) {
        throw new BadRequestException('portraits[*].imageId must be a non-empty string');
      }

      const characterId = entry.characterId.trim();
      const imageId = entry.imageId.trim();

      // Validate character accessibility
      await this.assertGameCharacterUsable(userId, characterId);

      // Validate CharacterImage existence and ownership
      const image = await this.prisma.characterImage.findUnique({ where: { id: imageId } });
      if (!image) {
        throw new BadRequestException(`characterImage ${imageId} does not exist`);
      }
      if (image.characterId !== characterId) {
        throw new BadRequestException(
          `characterImage ${imageId} does not belong to character ${characterId}`,
        );
      }

      // Override key with canonical DB value to prevent S3 key spoofing
      const { key: _clientKey, ...rest } = entry;
      normalized.push({
        ...rest,
        characterId,
        imageId,
        key: image.key,
      });
    }

    return normalized;
  }

  private async validateAndNormalizeNodeReferences(userId: string, node: any): Promise<any> {
    // Validate all asset references
    await Promise.all([
      this.assertGameAssetUsable(userId, node?.bgAssetId, 'image'),
      this.assertGameAssetUsable(userId, node?.musicAssetId, 'audio'),
      this.assertGameAssetUsable(userId, node?.sfxAssetId, 'audio'),
      this.assertGameAssetUsable(userId, node?.portraitAssetId, 'image'),
    ]);

    // Validate speaker character
    await this.assertGameCharacterUsable(userId, node?.speakerCharacterId);

    // Validate and normalize portraits (also normalizes canonical keys)
    const normalizedPortraits = await this.validateAndNormalizePortraits(userId, node?.portraits);

    return { ...node, portraits: normalizedPortraits };
  }

  private normalizeChoiceInput(choice: any) {
    return {
      label: choice?.label ?? '',
      targetNodeId: this.normalizeNodeRefId(choice?.targetNodeId),
      condition: choice?.condition ?? null,
      effects: choice?.effects ?? null,
      alternateTargetNodeId: this.normalizeNodeRefId(choice?.alternateTargetNodeId),
      alternateCondition: choice?.alternateCondition ?? null,
    };
  }

  private async assertPublishableScenario(gameId: string, startSceneIdInput: unknown) {
    const game = await this.prisma.gameProject.findUnique({
      where: { id: gameId },
      include: this.playInclude,
    });
    if (!game || game.deletedAt) {
      throw new NotFoundException('game not found');
    }

    const errors: string[] = [];
    const sceneList = Array.isArray(game.scenes) ? game.scenes : [];
    const sceneById = new Map<string, any>();
    const nodeById = new Map<string, { node: any; sceneId: string }>();

    for (const scene of sceneList) {
      sceneById.set(scene.id, scene);
      const nodes = Array.isArray(scene?.nodes) ? scene.nodes : [];
      for (const node of nodes) {
        nodeById.set(node.id, { node, sceneId: scene.id });
      }
    }

    const startSceneId = this.normalizeNodeRefId(startSceneIdInput);
    if (!startSceneId) {
      errors.push('開始シーンが未設定です。ゲーム全体の開始シーンを設定してください。');
    } else {
      const startScene = sceneById.get(startSceneId);
      if (!startScene) {
        errors.push(
          '開始シーンが存在しないシーンIDを参照しています。開始シーンを再設定してください。',
        );
      } else {
        const startSceneNodes = Array.isArray(startScene?.nodes) ? startScene.nodes : [];
        if (startSceneNodes.length === 0) {
          errors.push('開始シーンにノードがありません。開始シーンとしてプレイできません。');
        }

        const startNodeId = this.normalizeNodeRefId(startScene?.startNodeId);
        if (!startNodeId) {
          errors.push('開始シーンの開始ノードが未設定です。開始ノードを指定してください。');
        } else {
          const startNodeMeta = nodeById.get(startNodeId);
          if (!startNodeMeta || startNodeMeta.sceneId !== startScene.id) {
            errors.push(
              '開始シーンの開始ノードが存在しないノードIDを参照しています。開始ノードを再設定してください。',
            );
          }
        }
      }
    }

    for (const { node } of nodeById.values()) {
      const nextNodeId = this.normalizeNodeRefId(node?.nextNodeId);
      if (nextNodeId && !nodeById.has(nextNodeId)) {
        errors.push('通常遷移先(nextNodeId)が存在しないノードIDを参照しています。');
      }

      const choices = Array.isArray(node?.choices) ? node.choices : [];
      for (const choice of choices) {
        const targetNodeId = this.normalizeNodeRefId(choice?.targetNodeId);
        if (targetNodeId && !nodeById.has(targetNodeId)) {
          errors.push('選択肢の通常遷移先(targetNodeId)が存在しないノードIDを参照しています。');
        }

        const alternateTargetNodeId = this.normalizeNodeRefId(choice?.alternateTargetNodeId);
        if (alternateTargetNodeId && !nodeById.has(alternateTargetNodeId)) {
          errors.push(
            '選択肢の条件分岐先(alternateTargetNodeId)が存在しないノードIDを参照しています。',
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: '公開できません。シナリオチェックでエラーが見つかりました。',
        errors,
      });
    }
  }

  private readonly playInclude = {
    scenes: {
      include: {
        nodes: {
          include: { choices: true },
          orderBy: { order: 'asc' as const },
        },
      },
      orderBy: { order: 'asc' as const },
    },
  };

  private parsePagination(limitRaw: unknown, offsetRaw: unknown) {
    const limit = Math.min(Math.max(Number(limitRaw) || 20, 1), 100);
    const offset = Math.max(Number(offsetRaw) || 0, 0);
    return { limit, offset };
  }

  private toPublicSummary(
    g: {
      id: string;
      title: string;
      summary: string | null;
      coverAssetId: string | null;
      viewCount: number;
      playCount: number;
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
    },
    ownerDisplayNameMap?: Map<string, string>,
  ): PublicGameSummary {
    return {
      id: g.id,
      title: g.title,
      summary: g.summary,
      description: g.summary,
      coverAssetId: g.coverAssetId,
      viewCount: g.viewCount,
      playCount: g.playCount,
      ownerId: g.ownerId,
      ownerDisplayName: ownerDisplayNameMap?.get(g.ownerId) ?? null,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
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

  private normalizePublicGamesSort(sortRaw: unknown): PublicGamesSort {
    const v = String(sortRaw ?? '')
      .trim()
      .toLowerCase();
    if (v === 'updated' || v === 'title' || v === 'new') return v;
    return 'new';
  }

  private normalizePublicGamesQuery(qRaw: unknown): string | null {
    if (typeof qRaw !== 'string') return null;
    const q = qRaw.trim();
    return q.length > 0 ? q : null;
  }

  private publicGamesOrderBy(
    sort: PublicGamesSort,
  ): Prisma.GameProjectOrderByWithRelationInput | Prisma.GameProjectOrderByWithRelationInput[] {
    if (sort === 'updated') {
      return { updatedAt: 'desc' };
    }
    if (sort === 'title') {
      return [{ title: 'asc' }, { createdAt: 'desc' }];
    }
    return { createdAt: 'desc' };
  }

  private normalizeMyGamesSort(sortRaw: unknown): MyGamesSort {
    const v = String(sortRaw ?? '')
      .trim()
      .toLowerCase();
    if (v === 'created' || v === 'title' || v === 'public' || v === 'updated') return v;
    return 'updated';
  }

  private normalizeMyGamesStatus(statusRaw: unknown): MyGamesStatus {
    const v = String(statusRaw ?? '')
      .trim()
      .toLowerCase();
    if (v === 'public' || v === 'private' || v === 'all') return v;
    return 'all';
  }

  private normalizeMyGamesQuery(qRaw: unknown): string | null {
    if (typeof qRaw !== 'string') return null;
    const q = qRaw.trim();
    return q.length > 0 ? q : null;
  }

  private myGamesOrderBy(
    sort: MyGamesSort,
  ): Prisma.GameProjectOrderByWithRelationInput | Prisma.GameProjectOrderByWithRelationInput[] {
    if (sort === 'created') {
      return { createdAt: 'desc' };
    }
    if (sort === 'title') {
      return [{ title: 'asc' }, { updatedAt: 'desc' }];
    }
    if (sort === 'public') {
      return [{ isPublic: 'desc' }, { updatedAt: 'desc' }];
    }
    return { updatedAt: 'desc' };
  }

  private async assertGameOwner(
    userId: string,
    gameId: string,
    opts?: { includeDeleted?: boolean },
  ) {
    const g = await this.prisma.gameProject.findUnique({ where: { id: gameId } });
    if (!g || (!opts?.includeDeleted && g.deletedAt)) {
      throw new NotFoundException('game not found');
    }
    if (g.ownerId !== userId) throw new ForbiddenException();
    return g;
  }

  private remapSceneRefId(value: unknown, sceneIdMap: Map<string, string>) {
    const sourceSceneId = this.normalizeNodeRefId(value);
    if (!sourceSceneId) return null;
    return sceneIdMap.get(sourceSceneId) ?? null;
  }

  private remapNodeRefId(value: unknown, nodeIdMap: Map<string, string>) {
    const sourceNodeId = this.normalizeNodeRefId(value);
    if (!sourceNodeId) return null;
    return nodeIdMap.get(sourceNodeId) ?? null;
  }

  private async buildDuplicateTitle(
    tx: Prisma.TransactionClient,
    ownerId: string,
    sourceTitleRaw: string,
  ) {
    const sourceTitle = sourceTitleRaw.trim() || '無題ゲーム';
    const base = `${sourceTitle} のコピー`;

    const existing = await tx.gameProject.findMany({
      where: {
        ownerId,
        deletedAt: null,
        title: { startsWith: base },
      },
      select: { title: true },
    });

    const existingSet = new Set(existing.map((item) => item.title));
    if (!existingSet.has(base)) return base;

    let suffix = 2;
    while (existingSet.has(`${base} ${suffix}`)) {
      suffix += 1;
    }
    return `${base} ${suffix}`;
  }

  private async getOwnedSceneOrThrow(userId: string, sceneId: string) {
    const s = await this.prisma.gameScene.findUnique({ where: { id: sceneId } });
    if (!s) throw new NotFoundException('scene not found');
    const g = await this.prisma.gameProject.findUnique({ where: { id: s.projectId } });
    if (!g || g.deletedAt) throw new NotFoundException('game not found');
    if (g.ownerId !== userId) throw new ForbiddenException();
    return { scene: s, game: g };
  }

  private async getOwnedNodeOrThrow(userId: string, nodeId: string) {
    const n = await this.prisma.gameNode.findUnique({ where: { id: nodeId } });
    if (!n) throw new NotFoundException('node not found');
    const s = await this.prisma.gameScene.findUnique({ where: { id: n.sceneId } });
    if (!s) throw new NotFoundException('scene not found');
    const g = await this.prisma.gameProject.findUnique({ where: { id: s.projectId } });
    if (!g || g.deletedAt) throw new NotFoundException('game not found');
    if (g.ownerId !== userId) throw new ForbiddenException();
    return { node: n, scene: s, game: g };
  }

  private normalizeSlotType(slotType: unknown): SaveSlotType {
    const v = String(slotType ?? '')
      .trim()
      .toUpperCase();
    if (v === 'MANUAL' || v === 'AUTO' || v === 'QUICK') return v;
    throw new BadRequestException('slotType must be MANUAL, AUTO, or QUICK');
  }

  private normalizeSlotIndex(slotType: SaveSlotType, slotIndex: unknown) {
    const n = Number(slotIndex);
    if (!Number.isInteger(n) || n <= 0) {
      throw new BadRequestException('slotIndex must be a positive integer');
    }
    const max = SAVE_SLOT_LIMITS[slotType];
    if (n > max) {
      throw new BadRequestException(
        `slotIndex is out of range for ${slotType}. allowed: 1-${max}`,
      );
    }
    return n;
  }

  private ensurePayload(payload: unknown) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new BadRequestException('payload must be a JSON object');
    }
  }

  async myList(userId: string, qRaw?: unknown, sortRaw?: unknown, statusRaw?: unknown) {
    const q = this.normalizeMyGamesQuery(qRaw);
    const sort = this.normalizeMyGamesSort(sortRaw);
    const status = this.normalizeMyGamesStatus(statusRaw);

    const where: Prisma.GameProjectWhereInput = {
      ownerId: userId,
      deletedAt: null,
      ...(status === 'all' ? {} : { isPublic: status === 'public' }),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.gameProject.findMany({
      where,
      orderBy: this.myGamesOrderBy(sort),
    });
  }

  async create(userId: string, data: { title: string; summary?: string }) {
    const normalizedTitle = this.normalizeGameTitle(data?.title, { required: true });
    const normalizedSummary = this.normalizeGameSummary(data?.summary);
    return this.prisma.gameProject.create({
      data: {
        ownerId: userId,
        title: normalizedTitle,
        summary: normalizedSummary,
      },
    });
  }

  async duplicate(userId: string, sourceGameId: string) {
    return this.prisma.$transaction(async (tx) => {
      const source = await tx.gameProject.findUnique({
        where: { id: sourceGameId },
        include: this.playInclude,
      });
      if (!source || source.deletedAt) {
        throw new NotFoundException('game not found');
      }
      if (source.ownerId !== userId) {
        throw new ForbiddenException();
      }

      const duplicatedTitle = await this.buildDuplicateTitle(tx, userId, source.title);
      const duplicatedGame = await tx.gameProject.create({
        data: {
          ownerId: userId,
          title: duplicatedTitle,
          summary: source.summary,
          coverAssetId: source.coverAssetId,
          isPublic: false,
          viewCount: 0,
          playCount: 0,
          startSceneId: null,
          messageTheme: source.messageTheme,
          gameUiTheme: source.gameUiTheme,
          backlogTheme: source.backlogTheme,
        },
      });

      const sceneIdMap = new Map<string, string>();
      const nodeIdMap = new Map<string, string>();

      for (const sourceScene of source.scenes) {
        const createdScene = await tx.gameScene.create({
          data: {
            projectId: duplicatedGame.id,
            name: sourceScene.name,
            order: sourceScene.order,
            startNodeId: null,
          },
        });
        sceneIdMap.set(sourceScene.id, createdScene.id);
      }

      for (const sourceScene of source.scenes) {
        const targetSceneId = sceneIdMap.get(sourceScene.id);
        if (!targetSceneId) continue;

        for (const sourceNode of sourceScene.nodes) {
          const createdNode = await tx.gameNode.create({
            data: {
              sceneId: targetSceneId,
              type: sourceNode.type,
              order: sourceNode.order,
              speakerCharacterId: sourceNode.speakerCharacterId,
              speakerDisplayName: sourceNode.speakerDisplayName,
              portraitAssetId: sourceNode.portraitAssetId,
              portraits: sourceNode.portraits,
              text: sourceNode.text,
              bgAssetId: sourceNode.bgAssetId,
              musicAssetId: sourceNode.musicAssetId,
              sfxAssetId: sourceNode.sfxAssetId,
              nextNodeId: null,
              camera: sourceNode.camera,
              cameraFx: sourceNode.cameraFx,
              visualFx: sourceNode.visualFx,
              colorFilter: sourceNode.colorFilter,
              continuesPreviousText: sourceNode.continuesPreviousText,
            },
          });
          nodeIdMap.set(sourceNode.id, createdNode.id);
        }
      }

      for (const sourceScene of source.scenes) {
        const targetSceneId = sceneIdMap.get(sourceScene.id);
        if (!targetSceneId) continue;

        await tx.gameScene.update({
          where: { id: targetSceneId },
          data: {
            startNodeId: this.remapNodeRefId(sourceScene.startNodeId, nodeIdMap),
          },
        });

        for (const sourceNode of sourceScene.nodes) {
          const targetNodeId = nodeIdMap.get(sourceNode.id);
          if (!targetNodeId) continue;

          await tx.gameNode.update({
            where: { id: targetNodeId },
            data: {
              nextNodeId: this.remapNodeRefId(sourceNode.nextNodeId, nodeIdMap),
            },
          });

          if (sourceNode.choices.length > 0) {
            await tx.gameChoice.createMany({
              data: sourceNode.choices.map((choice) => ({
                nodeId: targetNodeId,
                label: choice.label,
                targetNodeId: this.remapNodeRefId(choice.targetNodeId, nodeIdMap),
                condition: choice.condition,
                effects: choice.effects,
                alternateTargetNodeId: this.remapNodeRefId(choice.alternateTargetNodeId, nodeIdMap),
                alternateCondition: choice.alternateCondition,
              })) as any,
            });
          }
        }
      }

      const remappedStartSceneId = this.remapSceneRefId(source.startSceneId, sceneIdMap);
      return tx.gameProject.update({
        where: { id: duplicatedGame.id },
        data: {
          startSceneId: remappedStartSceneId,
        },
      });
    });
  }

  async listPublic(limitRaw?: unknown, offsetRaw?: unknown, qRaw?: unknown, sortRaw?: unknown) {
    const { limit, offset } = this.parsePagination(limitRaw, offsetRaw);
    const q = this.normalizePublicGamesQuery(qRaw);
    const sort = this.normalizePublicGamesSort(sortRaw);
    const where: Prisma.GameProjectWhereInput = {
      isPublic: true,
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.gameProject.findMany({
        where,
        orderBy: this.publicGamesOrderBy(sort),
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          summary: true,
          coverAssetId: true,
          viewCount: true,
          playCount: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.gameProject.count({ where }),
    ]);

    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap(items.map((g) => g.ownerId));

    return {
      items: items.map((g) => this.toPublicSummary(g, ownerDisplayNameMap)),
      total,
      limit,
      offset,
      q,
      sort,
    };
  }

  async getForPlay(userId: string | undefined, id: string) {
    const g = await this.prisma.gameProject.findUnique({
      where: { id },
      include: this.playInclude,
    });
    if (!g || g.deletedAt) throw new NotFoundException('game not found');
    if (!g.isPublic && g.ownerId !== userId) throw new NotFoundException('game not found');
    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap([g.ownerId]);
    return { ...g, ownerDisplayName: ownerDisplayNameMap.get(g.ownerId) ?? null };
  }

  async getCredits(userId: string | undefined, id: string): Promise<GameCreditsResult> {
    const game = await this.prisma.gameProject.findUnique({
      where: { id },
      include: this.playInclude,
    });
    if (!game || game.deletedAt) throw new NotFoundException('game not found');
    if (!game.isPublic && game.ownerId !== userId) throw new NotFoundException('game not found');

    const assetUsageById = new Map<
      string,
      {
        usageCount: number;
        fields: Map<GameCreditAssetField, number>;
      }
    >();

    const characterUsageById = new Map<
      string,
      {
        usageCount: number;
        fields: Map<GameCreditCharacterField, number>;
      }
    >();

    const pushAssetUsage = (assetId: string, field: GameCreditAssetField) => {
      const current = assetUsageById.get(assetId) ?? {
        usageCount: 0,
        fields: new Map<GameCreditAssetField, number>(),
      };
      current.usageCount += 1;
      current.fields.set(field, (current.fields.get(field) ?? 0) + 1);
      assetUsageById.set(assetId, current);
    };

    const pushCharacterUsage = (characterId: string, field: GameCreditCharacterField) => {
      const current = characterUsageById.get(characterId) ?? {
        usageCount: 0,
        fields: new Map<GameCreditCharacterField, number>(),
      };
      current.usageCount += 1;
      current.fields.set(field, (current.fields.get(field) ?? 0) + 1);
      characterUsageById.set(characterId, current);
    };

    if (typeof game.coverAssetId === 'string' && game.coverAssetId.trim().length > 0) {
      pushAssetUsage(game.coverAssetId, 'coverAssetId');
    }

    const portraitEntries: Array<{ characterId: string | null; imageId: string | null }> = [];
    const portraitImageIds = new Set<string>();

    for (const scene of game.scenes) {
      const nodes = Array.isArray(scene?.nodes) ? scene.nodes : [];
      for (const node of nodes) {
        if (typeof node?.bgAssetId === 'string' && node.bgAssetId.trim().length > 0) {
          pushAssetUsage(node.bgAssetId, 'bgAssetId');
        }
        if (typeof node?.musicAssetId === 'string' && node.musicAssetId.trim().length > 0) {
          pushAssetUsage(node.musicAssetId, 'musicAssetId');
        }
        if (typeof node?.sfxAssetId === 'string' && node.sfxAssetId.trim().length > 0) {
          pushAssetUsage(node.sfxAssetId, 'sfxAssetId');
        }
        if (typeof node?.portraitAssetId === 'string' && node.portraitAssetId.trim().length > 0) {
          pushAssetUsage(node.portraitAssetId, 'portraitAssetId');
        }

        if (
          typeof node?.speakerCharacterId === 'string' &&
          node.speakerCharacterId.trim().length > 0
        ) {
          pushCharacterUsage(node.speakerCharacterId, 'speakerCharacterId');
        }

        const portraits = node?.portraits;
        if (!Array.isArray(portraits)) continue;
        for (const portraitEntry of portraits) {
          if (!portraitEntry || typeof portraitEntry !== 'object') continue;

          const rawCharacterId = (portraitEntry as Record<string, unknown>).characterId;
          const rawImageId = (portraitEntry as Record<string, unknown>).imageId;

          const characterId =
            typeof rawCharacterId === 'string' && rawCharacterId.trim().length > 0
              ? rawCharacterId.trim()
              : null;
          const imageId =
            typeof rawImageId === 'string' && rawImageId.trim().length > 0
              ? rawImageId.trim()
              : null;

          if (imageId) portraitImageIds.add(imageId);
          portraitEntries.push({ characterId, imageId });
        }
      }
    }

    const portraitImageIdList = Array.from(portraitImageIds);
    const portraitImages =
      portraitImageIdList.length > 0
        ? await this.prisma.characterImage.findMany({
            where: { id: { in: portraitImageIdList } },
            select: { id: true, characterId: true },
          })
        : [];
    const portraitImageToCharacterId = new Map(
      portraitImages.map((image) => [image.id, image.characterId]),
    );

    for (const entry of portraitEntries) {
      const candidateCharacterIds = new Set<string>();
      if (entry.characterId) candidateCharacterIds.add(entry.characterId);
      if (entry.imageId) {
        const fromImage = portraitImageToCharacterId.get(entry.imageId);
        if (fromImage) candidateCharacterIds.add(fromImage);
      }

      for (const characterId of candidateCharacterIds) {
        pushCharacterUsage(characterId, 'portraits');
      }
    }

    const assetIds = Array.from(assetUsageById.keys());
    const characterIds = Array.from(characterUsageById.keys());

    const [assets, characters] = await Promise.all([
      assetIds.length > 0
        ? this.prisma.asset.findMany({
            where: { id: { in: assetIds } },
            select: {
              id: true,
              title: true,
              ownerId: true,
              contentType: true,
              primaryTag: true,
              deletedAt: true,
            },
          })
        : Promise.resolve([]),
      characterIds.length > 0
        ? this.prisma.character.findMany({
            where: { id: { in: characterIds } },
            select: {
              id: true,
              displayName: true,
              name: true,
              ownerId: true,
              isPublic: true,
              deletedAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const assetById = new Map(assets.map((item) => [item.id, item]));
    const characterById = new Map(characters.map((item) => [item.id, item]));

    // Collect all ownerIds for display name lookup (active/linkable only)
    const allOwnerIds = [
      ...assets.filter((a) => !a.deletedAt).map((a) => a.ownerId),
      ...characters.filter((c) => !c.deletedAt && c.isPublic).map((c) => c.ownerId),
    ];
    const ownerDisplayNameMap = await this.getOwnerDisplayNameMap(allOwnerIds);

    const assetCredits: GameAssetCreditItem[] = assetIds.map((assetId) => {
      const usage = assetUsageById.get(assetId)!;
      const asset = assetById.get(assetId);

      const fields = Array.from(usage.fields.entries()).map(([field, count]) => ({
        field,
        label: GAME_CREDIT_ASSET_FIELD_LABELS[field],
        count,
      }));

      if (!asset) {
        return {
          assetId,
          title: '不明な素材',
          ownerId: null,
          ownerDisplayName: null,
          contentType: null,
          primaryTag: null,
          usageCount: usage.usageCount,
          fields,
          status: 'missing',
          linkable: false,
        };
      }

      if (asset.deletedAt) {
        return {
          assetId,
          title: '削除済み素材',
          ownerId: null,
          ownerDisplayName: null,
          contentType: null,
          primaryTag: null,
          usageCount: usage.usageCount,
          fields,
          status: 'deleted',
          linkable: false,
        };
      }

      const normalizedTitle =
        typeof asset.title === 'string' && asset.title.trim().length > 0 ? asset.title : '無題素材';
      return {
        assetId,
        title: normalizedTitle,
        ownerId: asset.ownerId ?? null,
        ownerDisplayName: asset.ownerId ? (ownerDisplayNameMap.get(asset.ownerId) ?? null) : null,
        contentType: asset.contentType ?? null,
        primaryTag: asset.primaryTag ?? null,
        usageCount: usage.usageCount,
        fields,
        status: 'active',
        linkable: true,
      };
    });

    const characterCredits: GameCharacterCreditItem[] = characterIds.map((characterId) => {
      const usage = characterUsageById.get(characterId)!;
      const character = characterById.get(characterId);

      const fields = Array.from(usage.fields.entries()).map(([field, count]) => ({
        field,
        label: GAME_CREDIT_CHARACTER_FIELD_LABELS[field],
        count,
      }));

      if (!character) {
        return {
          characterId,
          displayName: '不明なキャラクター',
          name: '不明なキャラクター',
          ownerId: null,
          ownerDisplayName: null,
          usageCount: usage.usageCount,
          fields,
          status: 'missing',
          linkable: false,
        };
      }

      if (character.deletedAt) {
        return {
          characterId,
          displayName: '削除済みキャラクター',
          name: '削除済みキャラクター',
          ownerId: null,
          ownerDisplayName: null,
          usageCount: usage.usageCount,
          fields,
          status: 'deleted',
          linkable: false,
        };
      }

      if (!character.isPublic) {
        return {
          characterId,
          displayName: '非公開キャラクター',
          name: '非公開キャラクター',
          ownerId: null,
          ownerDisplayName: null,
          usageCount: usage.usageCount,
          fields,
          status: 'private',
          linkable: false,
        };
      }

      return {
        characterId,
        displayName: character.displayName,
        name: character.name,
        ownerId: character.ownerId ?? null,
        ownerDisplayName: character.ownerId ? (ownerDisplayNameMap.get(character.ownerId) ?? null) : null,
        usageCount: usage.usageCount,
        fields,
        status: 'active',
        linkable: true,
      };
    });

    const sortByUsageAndTitle = <T extends { usageCount: number; title?: string; displayName?: string }>(
      a: T,
      b: T,
    ) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return String(a.title ?? a.displayName ?? '').localeCompare(String(b.title ?? b.displayName ?? ''));
    };

    assetCredits.sort(sortByUsageAndTitle);
    characterCredits.sort(sortByUsageAndTitle);

    return {
      gameId: game.id,
      assetCredits,
      characterCredits,
      counts: {
        assets: assetCredits.length,
        characters: characterCredits.length,
        total: assetCredits.length + characterCredits.length,
      },
      checkedAt: new Date().toISOString(),
    };
  }

  async countPublicView(id: string) {
    const res = await this.prisma.gameProject.updateMany({
      where: { id, isPublic: true, deletedAt: null },
      data: { viewCount: { increment: 1 } },
    });
    if (res.count === 0) {
      throw new NotFoundException('game not found');
    }
    return { ok: true };
  }

  async countPublicPlay(id: string) {
    const res = await this.prisma.gameProject.updateMany({
      where: { id, isPublic: true, deletedAt: null },
      data: { playCount: { increment: 1 } },
    });
    if (res.count === 0) {
      throw new NotFoundException('game not found');
    }
    return { ok: true };
  }

  async getForEdit(userId: string, id: string) {
    const g = await this.prisma.gameProject.findUnique({
      where: { id },
      include: this.playInclude,
    });
    if (!g || g.deletedAt) throw new NotFoundException('game not found');
    if (g.ownerId !== userId) throw new ForbiddenException();
    return g;
  }

  async update(userId: string, id: string, data: any) {
    const g = await this.assertGameOwner(userId, id);

    if (data?.isPublic === true) {
      const nextStartSceneId = 'startSceneId' in (data ?? {}) ? data.startSceneId : g.startSceneId;
      await this.assertPublishableScenario(id, nextStartSceneId);
    }

    const allowed: any = {};
    if ('title' in (data ?? {})) {
      const normalizedTitle = this.normalizeGameTitle(data?.title, { required: true });
      allowed.title = normalizedTitle;
    }
    if ('summary' in (data ?? {})) {
      allowed.summary = this.normalizeGameSummary(data?.summary);
    }
    if ('coverAssetId' in (data ?? {})) {
      const normalizedCoverAssetId = this.normalizeCoverAssetId(data?.coverAssetId);
      if (normalizedCoverAssetId === null) {
        allowed.coverAssetId = null;
      } else if (typeof normalizedCoverAssetId === 'string') {
        await this.assertCoverAssetUsable(userId, normalizedCoverAssetId);
        allowed.coverAssetId = normalizedCoverAssetId;
      }
    }
    if (typeof data?.isPublic === 'boolean') allowed.isPublic = data.isPublic;
    if (typeof data?.startSceneId === 'string' || data?.startSceneId === null) {
      allowed.startSceneId = data.startSceneId ?? null;
    }

    if ('messageTheme' in (data ?? {})) {
      const theme = data.messageTheme;
      if (theme && typeof theme === 'object' && !Array.isArray(theme)) {
        allowed.messageTheme = {
          ...theme,
          ...(typeof data?.themeVersion === 'number' ? { themeVersion: data.themeVersion } : {}),
        };
      } else {
        allowed.messageTheme = theme ?? null;
      }
    }
    if ('gameUiTheme' in (data ?? {})) {
      const ui = data.gameUiTheme
      if (ui && typeof ui === 'object' && !Array.isArray(ui)) {
        allowed.gameUiTheme = ui
      } else {
        allowed.gameUiTheme = ui ?? null
      }
    }
    if ('backlogTheme' in (data ?? {})) {
      const backlog = data.backlogTheme
      if (backlog && typeof backlog === 'object' && !Array.isArray(backlog)) {
        allowed.backlogTheme = backlog
      } else {
        allowed.backlogTheme = backlog ?? null
      }
    }
    if (Object.keys(allowed).length === 0) return g;
    return this.prisma.gameProject.update({ where: { id }, data: allowed });
  }

  async softDelete(userId: string, id: string) {
    const g = await this.assertGameOwner(userId, id, { includeDeleted: true });
    if (g.deletedAt) throw new NotFoundException('game not found');
    return this.prisma.gameProject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Scenes
  async upsertScene(userId: string, projectId: string, scene: any) {
    await this.assertGameOwner(userId, projectId);
    if (scene.id) {
      return this.prisma.gameScene.update({
        where: { id: scene.id },
        data: scene,
      });
    }
    return this.prisma.gameScene.create({
      data: {
        projectId,
        name: scene.name || 'Scene',
        order: scene.order ?? 0,
      },
    });
  }

  async listScenes(userId: string, projectId: string) {
    await this.assertGameOwner(userId, projectId);
    return this.prisma.gameScene.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async patchScene(userId: string, sceneId: string, data: any) {
    const { scene: s } = await this.getOwnedSceneOrThrow(userId, sceneId);

    const allowed: any = {};
    if (typeof data.name === 'string') allowed.name = data.name;
    if (typeof data.order === 'number') allowed.order = data.order;
    // startNodeId は string または null を許可
    if (typeof data.startNodeId === 'string' || data.startNodeId === null) {
      allowed.startNodeId = data.startNodeId ?? null;
    }

    if (Object.keys(allowed).length === 0) {
      return s; // 変更なし
    }
    return this.prisma.gameScene.update({ where: { id: sceneId }, data: allowed });
  }

  // Nodes
  async listNodes(userId: string, sceneId: string) {
    await this.getOwnedSceneOrThrow(userId, sceneId);
    return this.prisma.gameNode.findMany({
      where: { sceneId },
      orderBy: { order: 'asc' },
      include: { choices: true },
    });
  }

  async upsertNode(userId: string, sceneId: string, node: any) {
    await this.getOwnedSceneOrThrow(userId, sceneId);

    if (node.id) {
      // Verify the existing node actually belongs to the specified scene
      const existingNode = await this.prisma.gameNode.findUnique({ where: { id: node.id } });
      if (!existingNode) throw new NotFoundException('node not found');
      if (existingNode.sceneId !== sceneId) {
        throw new BadRequestException('node does not belong to the specified scene');
      }

      // Validate and normalize all asset/character references; normalizes portraits keys
      const normalizedNode = await this.validateAndNormalizeNodeReferences(userId, node);
      const { choices, ...nodeData } = normalizedNode;

      // Strip sceneId from nodeData to prevent cross-scene move
      const { sceneId: _ignoredSceneId, ...rest } = nodeData as any;

      await this.prisma.gameNode.update({
        where: { id: node.id },
        data: rest,
      });

      // Update choices if provided
      if (choices !== undefined) {
        await this.prisma.gameChoice.deleteMany({ where: { nodeId: node.id } });
        if (choices.length > 0) {
          await this.prisma.gameChoice.createMany({
            data: choices.map((c: any) => {
              const normalized = this.normalizeChoiceInput(c);
              return { nodeId: node.id, ...normalized };
            }) as any,
          });
        }
      }

      return this.prisma.gameNode.findUnique({
        where: { id: node.id },
        include: { choices: true },
      });
    }

    // Create new node
    // Validate and normalize all asset/character references
    const normalizedNode = await this.validateAndNormalizeNodeReferences(userId, node);

    const max = await this.prisma.gameNode.aggregate({
      _max: { order: true },
      where: { sceneId },
    });

    const { choices, ...nodeData } = normalizedNode;
    // Strip any sceneId in nodeData; use URL-derived sceneId
    const { sceneId: _ignored, ...restNodeData } = nodeData as any;
    const choiceCreate =
      Array.isArray(choices) && choices.length > 0
        ? {
            create: choices.map((c: any) => this.normalizeChoiceInput(c)) as any,
          }
        : undefined;

    return this.prisma.gameNode.create({
      data: {
        sceneId,
        order: (max._max.order ?? 0) + 1,
        ...restNodeData,
        ...(choiceCreate ? { choices: choiceCreate } : {}),
      },
      include: { choices: true },
    });
  }

  async deleteNode(userId: string, nodeId: string) {
    await this.getOwnedNodeOrThrow(userId, nodeId);

    await this.prisma.$transaction(async (tx) => {
      await tx.gameScene.updateMany({
        where: { startNodeId: nodeId },
        data: { startNodeId: null },
      });

      await tx.gameNode.updateMany({
        where: { nextNodeId: nodeId },
        data: { nextNodeId: null },
      });

      await tx.gameChoice.updateMany({
        where: { targetNodeId: nodeId },
        data: { targetNodeId: null },
      });

      await tx.gameChoice.updateMany({
        where: { alternateTargetNodeId: nodeId },
        data: { alternateTargetNodeId: null },
      });

      await tx.gameNode.delete({ where: { id: nodeId } });
    });

    return { ok: true };
  }

  async getNodeDeleteSummary(userId: string, nodeId: string) {
    await this.getOwnedNodeOrThrow(userId, nodeId);

    const [startNodeRefCount, nextNodeRefCount, choiceTargetRefCount, choiceAlternateRefCount] =
      await this.prisma.$transaction([
        this.prisma.gameScene.count({ where: { startNodeId: nodeId } }),
        this.prisma.gameNode.count({ where: { nextNodeId: nodeId } }),
        this.prisma.gameChoice.count({ where: { targetNodeId: nodeId } }),
        this.prisma.gameChoice.count({ where: { alternateTargetNodeId: nodeId } }),
      ]);

    return {
      nodeId,
      usedAsStartNode: startNodeRefCount > 0,
      startNodeRefCount,
      nextNodeRefCount,
      choiceTargetRefCount,
      choiceAlternateRefCount,
      totalChoiceRefCount: choiceTargetRefCount + choiceAlternateRefCount,
    };
  }

  async getSceneDeleteSummary(userId: string, sceneId: string) {
    const { scene } = await this.getOwnedSceneOrThrow(userId, sceneId);
    const sceneCount = await this.prisma.gameScene.count({ where: { projectId: scene.projectId } });

    const sceneNodes = await this.prisma.gameNode.findMany({
      where: { sceneId },
      select: { id: true },
    });
    const nodeIds = sceneNodes.map((n) => n.id);
    const nodeCount = nodeIds.length;

    if (nodeIds.length === 0) {
      return {
        sceneId,
        nodeCount: 0,
        sceneCount,
        canDelete: sceneCount > 1,
        startSceneRefCount: 0,
        startNodeRefCount: 0,
        externalNextNodeRefCount: 0,
        externalChoiceTargetRefCount: 0,
        externalChoiceAlternateRefCount: 0,
        externalRefCount: 0,
      };
    }

    const [
      startSceneRefCount,
      startNodeRefCount,
      externalNextNodeRefCount,
      externalChoiceTargetRefCount,
      externalChoiceAlternateRefCount,
    ] = await this.prisma.$transaction([
      this.prisma.gameProject.count({ where: { startSceneId: sceneId } }),
      this.prisma.gameScene.count({ where: { startNodeId: { in: nodeIds } } }),
      this.prisma.gameNode.count({
        where: {
          nextNodeId: { in: nodeIds },
          sceneId: { not: sceneId },
        },
      }),
      this.prisma.gameChoice.count({
        where: {
          targetNodeId: { in: nodeIds },
          node: {
            sceneId: { not: sceneId },
          },
        },
      }),
      this.prisma.gameChoice.count({
        where: {
          alternateTargetNodeId: { in: nodeIds },
          node: {
            sceneId: { not: sceneId },
          },
        },
      }),
    ]);

    return {
      sceneId,
      nodeCount,
      sceneCount,
      canDelete: sceneCount > 1,
      startSceneRefCount,
      startNodeRefCount,
      externalNextNodeRefCount,
      externalChoiceTargetRefCount,
      externalChoiceAlternateRefCount,
      externalRefCount:
        externalNextNodeRefCount +
        externalChoiceTargetRefCount +
        externalChoiceAlternateRefCount,
    };
  }

  async deleteScene(userId: string, sceneId: string) {
    const { scene, game } = await this.getOwnedSceneOrThrow(userId, sceneId);
    const sceneCount = await this.prisma.gameScene.count({ where: { projectId: game.id } });
    if (sceneCount <= 1) {
      throw new BadRequestException('at least one scene must remain');
    }

    const sceneNodes = await this.prisma.gameNode.findMany({
      where: { sceneId },
      select: { id: true },
    });
    const nodeIds = sceneNodes.map((n) => n.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.gameProject.updateMany({
        where: { id: game.id, startSceneId: sceneId },
        data: { startSceneId: null },
      });

      if (nodeIds.length > 0) {
        await tx.gameScene.updateMany({
          where: { startNodeId: { in: nodeIds } },
          data: { startNodeId: null },
        });

        await tx.gameNode.updateMany({
          where: { nextNodeId: { in: nodeIds } },
          data: { nextNodeId: null },
        });

        await tx.gameChoice.updateMany({
          where: { targetNodeId: { in: nodeIds } },
          data: { targetNodeId: null },
        });

        await tx.gameChoice.updateMany({
          where: { alternateTargetNodeId: { in: nodeIds } },
          data: { alternateTargetNodeId: null },
        });
      }

      await tx.gameScene.delete({ where: { id: sceneId } });
    });

    return { ok: true };
  }

  // Save Slots (manual:100, auto:5, quick:1)
  async listSaves(userId: string, gameId: string) {
    await this.assertGameOwner(userId, gameId);
    const saves = await this.prisma.gameSave.findMany({
      where: { gameId, userId },
      orderBy: [{ slotType: 'asc' }, { slotIndex: 'asc' }, { updatedAt: 'desc' }],
    });
    return {
      limits: {
        manual: SAVE_SLOT_LIMITS.MANUAL,
        auto: SAVE_SLOT_LIMITS.AUTO,
        quick: SAVE_SLOT_LIMITS.QUICK,
        total: SAVE_SLOT_LIMITS.MANUAL + SAVE_SLOT_LIMITS.AUTO + SAVE_SLOT_LIMITS.QUICK,
      },
      saves,
    };
  }

  async getSave(userId: string, gameId: string, slotType: unknown, slotIndex: unknown) {
    await this.assertGameOwner(userId, gameId);
    const normalizedType = this.normalizeSlotType(slotType);
    const normalizedIndex = this.normalizeSlotIndex(normalizedType, slotIndex);
    const save = await this.prisma.gameSave.findUnique({
      where: {
        gameId_userId_slotType_slotIndex: {
          gameId,
          userId,
          slotType: normalizedType,
          slotIndex: normalizedIndex,
        },
      },
    });
    if (!save) throw new NotFoundException('save not found');
    return save;
  }

  async upsertSave(
    userId: string,
    gameId: string,
    input: {
      slotType: unknown;
      slotIndex: unknown;
      payload: unknown;
      title?: unknown;
      expectedVersion?: unknown;
    },
  ) {
    await this.assertGameOwner(userId, gameId);
    const normalizedType = this.normalizeSlotType(input?.slotType);
    const normalizedIndex = this.normalizeSlotIndex(normalizedType, input?.slotIndex);
    this.ensurePayload(input?.payload);

    const expectedVersion =
      typeof input?.expectedVersion === 'number' && Number.isInteger(input.expectedVersion)
        ? input.expectedVersion
        : null;
    const title = typeof input?.title === 'string' ? input.title.trim() : null;

    const existing = await this.prisma.gameSave.findUnique({
      where: {
        gameId_userId_slotType_slotIndex: {
          gameId,
          userId,
          slotType: normalizedType,
          slotIndex: normalizedIndex,
        },
      },
    });

    if (existing && expectedVersion !== null && existing.version !== expectedVersion) {
      throw new ConflictException('save version conflict');
    }

    if (!existing) {
      return this.prisma.gameSave.create({
        data: {
          gameId,
          userId,
          slotType: normalizedType,
          slotIndex: normalizedIndex,
          title,
          payload: input.payload as any,
          version: 1,
        },
      });
    }

    return this.prisma.gameSave.update({
      where: { id: existing.id },
      data: {
        title,
        payload: input.payload as any,
        version: { increment: 1 },
      },
    });
  }

  async autoSave(
    userId: string,
    gameId: string,
    input: { payload: unknown; title?: unknown; expectedVersion?: unknown },
  ) {
    await this.assertGameOwner(userId, gameId);
    const lastAutoSave = await this.prisma.gameSave.findFirst({
      where: { gameId, userId, slotType: 'AUTO' },
      orderBy: [{ updatedAt: 'desc' }, { slotIndex: 'desc' }],
    });

    const slotIndex = lastAutoSave ? (lastAutoSave.slotIndex % SAVE_SLOT_LIMITS.AUTO) + 1 : 1;
    return this.upsertSave(userId, gameId, {
      slotType: 'AUTO',
      slotIndex,
      payload: input?.payload,
      title:
        typeof input?.title === 'string' && input.title.trim().length > 0
          ? input.title
          : `Auto ${slotIndex}`,
      expectedVersion: input?.expectedVersion,
    });
  }

  async deleteSave(userId: string, gameId: string, slotType: unknown, slotIndex: unknown) {
    await this.assertGameOwner(userId, gameId);
    const normalizedType = this.normalizeSlotType(slotType);
    const normalizedIndex = this.normalizeSlotIndex(normalizedType, slotIndex);
    const deleted = await this.prisma.gameSave.deleteMany({
      where: {
        gameId,
        userId,
        slotType: normalizedType,
        slotIndex: normalizedIndex,
      },
    });
    return { ok: true, deleted: deleted.count };
  }

  async getReferenceDiagnostics(userId: string, gameId: string): Promise<GameReferenceDiagnosticsResult> {
    // Verify ownership
    await this.assertGameOwner(userId, gameId);

    // Load full game with all references
    const game = await this.prisma.gameProject.findUnique({
      where: { id: gameId },
      include: this.playInclude,
    });
    if (!game || game.deletedAt) {
      throw new NotFoundException('game not found');
    }

    const issues: GameReferenceDiagnosticIssue[] = [];
    let issueSeq = 0;

    // Build maps for efficient lookups
    const sceneList = Array.isArray(game.scenes) ? game.scenes : [];
    const sceneById = new Map<string, { scene: any; sceneOrder: number }>();
    const nodeById = new Map<string, { scene: any; sceneOrder: number; node: any; nodeOrder: number }>();

    for (let si = 0; si < sceneList.length; si++) {
      const sceneItem = sceneList[si];
      sceneById.set(sceneItem.id, { scene: sceneItem, sceneOrder: si + 1 });
      const sceneNodes = Array.isArray(sceneItem?.nodes) ? sceneItem.nodes : [];
      for (let ni = 0; ni < sceneNodes.length; ni++) {
        const nodeItem = sceneNodes[ni];
        nodeById.set(nodeItem.id, {
          scene: sceneItem,
          sceneOrder: si + 1,
          node: nodeItem,
          nodeOrder: ni + 1,
        });
      }
    }

    function pushIssue(input: {
      code: GameReferenceDiagnosticCode;
      message: string;
      field: string;
      refId?: string | null;
      sceneId?: string | null;
      nodeId?: string | null;
    }) {
      const sceneId = input.sceneId ?? null;
      const nodeId = input.nodeId ?? null;
      const sceneMeta = sceneId ? sceneById.get(sceneId) : null;
      const nodeMeta = nodeId ? nodeById.get(nodeId) : null;
      const baseScene = nodeMeta?.scene ?? sceneMeta?.scene ?? null;
      const baseSceneOrder = nodeMeta?.sceneOrder ?? sceneMeta?.sceneOrder ?? null;
      const baseNodeOrder = nodeMeta?.nodeOrder ?? null;

      let nodePreview = '';
      if (nodeMeta) {
        const nodeText = typeof nodeMeta.node?.text === 'string' ? nodeMeta.node.text : '';
        const normalized = nodeText.replace(/\s+/g, ' ').trim();
        nodePreview = normalized ? (normalized.length > 28 ? normalized.slice(0, 28) + '…' : normalized) : '(本文なし)';
      }

      issues.push({
        id: `ref-diag-${++issueSeq}`,
        source: 'reference',
        severity: 'warning',
        code: input.code,
        message: input.message,
        field: input.field,
        refId: input.refId ?? null,
        sceneId: baseScene?.id ?? sceneId,
        sceneName: baseScene?.name || '',
        sceneOrder: baseSceneOrder,
        nodeId,
        nodeOrder: baseNodeOrder,
        nodePreview,
      });
    }

    // Collect all unique reference IDs
    const assetIds = new Set<string>();
    const characterIds = new Set<string>();
    const characterImageIds = new Set<string>();

    // Game-level coverAssetId
    if (game.coverAssetId) {
      assetIds.add(game.coverAssetId);
    }

    // Node-level references
    for (const { node } of nodeById.values()) {
      if (node.bgAssetId) assetIds.add(node.bgAssetId);
      if (node.musicAssetId) assetIds.add(node.musicAssetId);
      if (node.sfxAssetId) assetIds.add(node.sfxAssetId);
      if (node.portraitAssetId) assetIds.add(node.portraitAssetId);
      if (node.speakerCharacterId) characterIds.add(node.speakerCharacterId);

      // Portraits
      if (Array.isArray(node.portraits)) {
        for (const p of node.portraits) {
          if (typeof p?.characterId === 'string' && p.characterId.trim()) {
            characterIds.add(p.characterId.trim());
          }
          if (typeof p?.imageId === 'string' && p.imageId.trim()) {
            characterImageIds.add(p.imageId.trim());
          }
        }
      }
    }

    // Fetch all assets, characters, character images, and favorites in bulk
    const assetIdArray = Array.from(assetIds);
    const characterIdArray = Array.from(characterIds);
    const characterImageIdArray = Array.from(characterImageIds);

    const [assets, favorites, characters, favoriteCharacters, characterImages] = await Promise.all([
      assetIdArray.length > 0
        ? this.prisma.asset.findMany({ where: { id: { in: assetIdArray } } })
        : Promise.resolve([]),
      assetIdArray.length > 0
        ? this.prisma.favorite.findMany({
            where: { userId, assetId: { in: assetIdArray } },
          })
        : Promise.resolve([]),
      characterIdArray.length > 0
        ? this.prisma.character.findMany({ where: { id: { in: characterIdArray } } })
        : Promise.resolve([]),
      characterIdArray.length > 0
        ? this.prisma.favoriteCharacter.findMany({
            where: { userId, characterId: { in: characterIdArray } },
          })
        : Promise.resolve([]),
      characterImageIdArray.length > 0
        ? this.prisma.characterImage.findMany({ where: { id: { in: characterImageIdArray } } })
        : Promise.resolve([]),
    ]);

    // Build maps for diagnostics
    const assetById = new Map(assets.map((a) => [a.id, a]));
    const favoriteByAssetId = new Map(
      favorites.map((f) => [`${f.userId}:${f.assetId}`, f]),
    );
    const characterById = new Map(characters.map((c) => [c.id, c]));
    const favoriteCharacterByCharId = new Map(
      favoriteCharacters.map((f) => [`${f.userId}:${f.characterId}`, f]),
    );
    const characterImageById = new Map(characterImages.map((ci) => [ci.id, ci]));

    // Helper to check asset usability
    const checkAssetUsable = (assetId: string, expectedKind: 'image' | 'audio', field: string, sceneId?: string, nodeId?: string) => {
      const asset = assetById.get(assetId);
      if (!asset) {
        pushIssue({
          code: 'ASSET_MISSING',
          message: `${field}として指定されたアセットが見つかりません。`,
          field,
          refId: assetId,
          sceneId,
          nodeId,
        });
        return;
      }

      if (asset.deletedAt) {
        pushIssue({
          code: 'ASSET_DELETED',
          message: `${field}として指定されたアセットが削除されています。別のアセットに差し替えてください。`,
          field,
          refId: assetId,
          sceneId,
          nodeId,
        });
        return;
      }

      if (expectedKind === 'image' && !asset.contentType.startsWith('image/')) {
        pushIssue({
          code: 'ASSET_KIND_MISMATCH',
          message: `${field}は画像形式である必要があります。音声素材が指定されています。`,
          field,
          refId: assetId,
          sceneId,
          nodeId,
        });
        return;
      }

      if (expectedKind === 'audio' && !asset.contentType.startsWith('audio/')) {
        pushIssue({
          code: 'ASSET_KIND_MISMATCH',
          message: `${field}は音声形式である必要があります。画像素材が指定されています。`,
          field,
          refId: assetId,
          sceneId,
          nodeId,
        });
        return;
      }

      if (asset.ownerId !== userId) {
        const isFavorited = !!favoriteByAssetId.get(`${userId}:${assetId}`);
        if (!isFavorited) {
          pushIssue({
            code: 'ASSET_NOT_USABLE',
            message: `${field}として指定されたアセットは利用できません。自分が所有するアセット、またはお気に入り済みのアセットを選び直してください。`,
            field,
            refId: assetId,
            sceneId,
            nodeId,
          });
        }
      }
    };

    // Helper to check character usability
    const checkCharacterUsable = (characterId: string, field: string, sceneId?: string, nodeId?: string) => {
      const character = characterById.get(characterId);
      if (!character) {
        pushIssue({
          code: 'CHARACTER_MISSING',
          message: `${field}として指定されたキャラクターが見つかりません。`,
          field,
          refId: characterId,
          sceneId,
          nodeId,
        });
        return;
      }

      if (character.deletedAt) {
        pushIssue({
          code: 'CHARACTER_DELETED',
          message: `${field}として指定されたキャラクターが削除されています。別のキャラクターに差し替えてください。`,
          field,
          refId: characterId,
          sceneId,
          nodeId,
        });
        return;
      }

      if (character.ownerId !== userId) {
        if (!character.isPublic) {
          pushIssue({
            code: 'CHARACTER_NOT_USABLE',
            message: `${field}は利用できません。自分のキャラクターか、公開されているお気に入りのキャラクターを選び直してください。`,
            field,
            refId: characterId,
            sceneId,
            nodeId,
          });
          return;
        }

        const isFavorited = !!favoriteCharacterByCharId.get(`${userId}:${characterId}`);
        if (!isFavorited) {
          pushIssue({
            code: 'CHARACTER_NOT_USABLE',
            message: `${field}は利用できません。このキャラクターをお気に入りにしてから使用してください。`,
            field,
            refId: characterId,
            sceneId,
            nodeId,
          });
        }
      }
    };

    // Check game-level coverAssetId
    if (game.coverAssetId) {
      checkAssetUsable(game.coverAssetId, 'image', 'ゲームカバー画像');
    }

    // Check node-level references
    for (const [nodeId, nodeMeta] of nodeById) {
      const { node, scene } = nodeMeta;
      const sceneId = scene.id;

      // Asset references
      if (node.bgAssetId) {
        checkAssetUsable(node.bgAssetId, 'image', '背景画像', sceneId, nodeId);
      }
      if (node.musicAssetId) {
        checkAssetUsable(node.musicAssetId, 'audio', 'BGM', sceneId, nodeId);
      }
      if (node.sfxAssetId) {
        checkAssetUsable(node.sfxAssetId, 'audio', 'SE', sceneId, nodeId);
      }
      if (node.portraitAssetId) {
        checkAssetUsable(node.portraitAssetId, 'image', '立ち絵画像', sceneId, nodeId);
      }

      // Speaker character
      if (node.speakerCharacterId) {
        checkCharacterUsable(node.speakerCharacterId, 'スピーカーキャラクター', sceneId, nodeId);
      }

      // Portraits validation
      if (node.portraits) {
        if (!Array.isArray(node.portraits)) {
          pushIssue({
            code: 'PORTRAITS_INVALID',
            message: 'portraits のデータ形式が不正です。',
            field: 'portraits',
            sceneId,
            nodeId,
          });
        } else {
          for (let pi = 0; pi < node.portraits.length; pi++) {
            const portrait = node.portraits[pi];

            // Validate portrait entry structure
            if (!portrait || typeof portrait !== 'object') {
              pushIssue({
                code: 'PORTRAITS_INVALID',
                message: `portraits[${pi}] のデータ形式が不正です。`,
                field: `portraits[${pi}]`,
                sceneId,
                nodeId,
              });
              continue;
            }

            const { characterId: portraitCharId, imageId: portraitImageId, key: portraitKey } = portrait;

            // Validate characterId
            if (typeof portraitCharId !== 'string' || !portraitCharId.trim()) {
              pushIssue({
                code: 'PORTRAITS_INVALID',
                message: `portraits[${pi}].characterId が無効です。`,
                field: `portraits[${pi}].characterId`,
                sceneId,
                nodeId,
              });
              continue;
            }

            // Validate imageId
            if (typeof portraitImageId !== 'string' || !portraitImageId.trim()) {
              pushIssue({
                code: 'PORTRAITS_INVALID',
                message: `portraits[${pi}].imageId が無効です。`,
                field: `portraits[${pi}].imageId`,
                sceneId,
                nodeId,
              });
              continue;
            }

            // Check character usability
            checkCharacterUsable(portraitCharId.trim(), `立ち絵[${pi}]キャラクター`, sceneId, nodeId);

            // Check character image existence and ownership
            const charImage = characterImageById.get(portraitImageId.trim());
            if (!charImage) {
              pushIssue({
                code: 'CHARACTER_IMAGE_MISSING',
                message: `立ち絵[${pi}]の画像がキャラクターに属していません。立ち絵を選び直してください。`,
                field: `portraits[${pi}].imageId`,
                refId: portraitImageId.trim(),
                sceneId,
                nodeId,
              });
            } else if (charImage.characterId !== portraitCharId.trim()) {
              pushIssue({
                code: 'CHARACTER_IMAGE_MISMATCH',
                message: `立ち絵[${pi}]の画像がキャラクターに属していません。立ち絵を選び直してください。`,
                field: `portraits[${pi}].imageId`,
                refId: portraitImageId.trim(),
                sceneId,
                nodeId,
              });
            } else if (portraitKey && charImage.key !== portraitKey) {
              // Key mismatch warning (old data, not critical)
              pushIssue({
                code: 'PORTRAIT_KEY_MISMATCH',
                message: `立ち絵[${pi}]のキーが古い値です。ノードを開いて保存し直すと正規化されます。`,
                field: `portraits[${pi}].key`,
                sceneId,
                nodeId,
              });
            }
          }
        }
      }
    }

    return {
      issues,
      counts: { warning: issues.length },
      checkedAt: new Date().toISOString(),
    };
  }
}
