import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SAVE_SLOT_LIMITS = {
  MANUAL: 100,
  AUTO: 5,
  QUICK: 1,
} as const;

type SaveSlotType = keyof typeof SAVE_SLOT_LIMITS;

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  private async assertGameOwner(userId: string, gameId: string) {
    const g = await this.prisma.gameProject.findUnique({ where: { id: gameId } });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();
    return g;
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

  async get(userId: string | undefined, id: string) {
    const g = await this.prisma.gameProject.findUnique({
      where: { id },
      include: {
        scenes: {
          include: {
            nodes: {
              include: { choices: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!g) throw new NotFoundException('game not found');
    if (!g.isPublic && g.ownerId !== userId) throw new ForbiddenException();
    return g;
  }

  async update(userId: string, id: string, data: any) {
    const g = await this.prisma.gameProject.findUnique({ where: { id } });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();

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
    if (Object.keys(allowed).length === 0) return g;
    return this.prisma.gameProject.update({ where: { id }, data: allowed });
  }

  async softDelete(userId: string, id: string) {
    const g = await this.prisma.gameProject.findUnique({ where: { id } });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.gameProject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Scenes
  async upsertScene(userId: string, projectId: string, scene: any) {
    const g = await this.prisma.gameProject.findUnique({
      where: { id: projectId },
    });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();
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
    const g = await this.prisma.gameProject.findUnique({
      where: { id: projectId },
    });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.gameScene.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async patchScene(userId: string, sceneId: string, data: any) {
    const s = await this.prisma.gameScene.findUnique({ where: { id: sceneId } });
    if (!s) throw new NotFoundException();
    const g = await this.prisma.gameProject.findUnique({ where: { id: s.projectId } });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();

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
    const s = await this.prisma.gameScene.findUnique({ where: { id: sceneId } });
    if (!s) throw new NotFoundException();
    const g = await this.prisma.gameProject.findUnique({
      where: { id: s.projectId },
    });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.gameNode.findMany({
      where: { sceneId },
      orderBy: { order: 'asc' },
      include: { choices: true },
    });
  }

  async upsertNode(userId: string, sceneId: string, node: any) {
    const s = await this.prisma.gameScene.findUnique({ where: { id: sceneId } });
    if (!s) throw new NotFoundException();
    const g = await this.prisma.gameProject.findUnique({
      where: { id: s.projectId },
    });
    if (!g || g.ownerId !== userId) throw new ForbiddenException();

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
            data: choices.map((c: any) => ({
              nodeId: node.id,
              label: c.label,
              targetNodeId: c.targetNodeId,
              condition: c.condition ?? null,
              effects: c.effects ?? null,
              alternateTargetNodeId: c.alternateTargetNodeId || null,
              alternateCondition: c.alternateCondition ?? null,
            })) as any,
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
          create: choices.map((c: any) => ({
            label: c.label,
            targetNodeId: c.targetNodeId,
            condition: c.condition ?? null,
            effects: c.effects ?? null,
            alternateTargetNodeId: c.alternateTargetNodeId || null,
            alternateCondition: c.alternateCondition ?? null,
          })) as any,
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
    const n = await this.prisma.gameNode.findUnique({ where: { id: nodeId } });
    if (!n) return;
    const s = await this.prisma.gameScene.findUnique({ where: { id: n.sceneId } });
    const g =
      s &&
      (await this.prisma.gameProject.findUnique({ where: { id: s.projectId } }));
    if (!g || g.ownerId !== userId) throw new ForbiddenException();
    await this.prisma.gameChoice.deleteMany({ where: { nodeId } });
    await this.prisma.gameNode.delete({ where: { id: nodeId } });
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
