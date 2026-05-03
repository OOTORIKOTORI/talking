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
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

type PublicGamesSort = 'new' | 'updated' | 'title';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  private normalizeNodeRefId(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
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

  private toPublicSummary(g: {
    id: string;
    title: string;
    summary: string | null;
    coverAssetId: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): PublicGameSummary {
    return {
      id: g.id,
      title: g.title,
      summary: g.summary,
      description: g.summary,
      coverAssetId: g.coverAssetId,
      ownerId: g.ownerId,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
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

  async myList(userId: string) {
    return this.prisma.gameProject.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, data: { title: string; summary?: string }) {
    return this.prisma.gameProject.create({
      data: {
        ownerId: userId,
        title: data.title,
        summary: data.summary,
      },
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
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.gameProject.count({ where }),
    ]);

    return {
      items: items.map((g) => this.toPublicSummary(g)),
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
    return g;
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
    if (typeof data?.title === 'string') allowed.title = data.title;
    if ('summary' in (data ?? {})) allowed.summary = data.summary ?? null;
    if (typeof data?.coverAssetId === 'string' || data?.coverAssetId === null) {
      allowed.coverAssetId = data.coverAssetId ?? null;
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
      // Update existing node
      const { choices, ...nodeData } = node;
      
      // Update node
      // Prisma の仕様変更: sceneId を直接渡せないので connect 形式に変換
      const { sceneId, ...rest } = nodeData as any;
      const updated = await this.prisma.gameNode.update({
        where: { id: node.id },
        data: {
          ...rest,
          ...(sceneId ? { scene: { connect: { id: sceneId } } } : {}),
        },
      });

      // Update choices if provided
      if (choices !== undefined) {
        // Delete existing choices
        await this.prisma.gameChoice.deleteMany({ where: { nodeId: node.id } });
        
        // Create new choices
        if (choices.length > 0) {
          await this.prisma.gameChoice.createMany({
            data: choices.map((c: any) => {
              const normalized = this.normalizeChoiceInput(c);
              return {
              nodeId: node.id,
              ...normalized,
            };
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
    const max = await this.prisma.gameNode.aggregate({
      _max: { order: true },
      where: { sceneId },
    });

    const { choices, ...nodeData } = node;
    const choiceCreate = Array.isArray(choices) && choices.length > 0
      ? {
          create: choices.map((c: any) => this.normalizeChoiceInput(c)) as any,
        }
      : undefined
    
    return this.prisma.gameNode.create({
      data: {
        sceneId,
        order: (max._max.order ?? 0) + 1,
        ...nodeData,
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
}
