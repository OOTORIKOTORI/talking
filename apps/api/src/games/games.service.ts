import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.gameProject.update({ where: { id }, data });
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
            })),
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
    
    return this.prisma.gameNode.create({
      data: {
        sceneId,
        order: (max._max.order ?? 0) + 1,
        ...nodeData,
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
}
