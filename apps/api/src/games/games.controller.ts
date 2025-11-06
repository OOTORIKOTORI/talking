import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Get('my')
  my(@Req() req: any) {
    return this.games.myList(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() b: any) {
    return this.games.create(req.user.userId, b);
  }

  @UseGuards(OptionalSupabaseAuthGuard)
  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.games.get(req.user?.userId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() b: any) {
    return this.games.update(req.user.userId, id, b);
  }

  @Delete(':id')
  del(@Req() req: any, @Param('id') id: string) {
    return this.games.softDelete(req.user.userId, id);
  }

  @Get(':id/scenes')
  listScenes(@Req() req: any, @Param('id') pid: string) {
    return this.games.listScenes(req.user.userId, pid);
  }

  @Post(':id/scenes')
  upsertScene(@Req() req: any, @Param('id') pid: string, @Body() b: any) {
    return this.games.upsertScene(req.user.userId, pid, b);
  }

  @Patch('scenes/:sceneId')
  updateScene(@Req() req: any, @Param('sceneId') sceneId: string, @Body() b: any) {
    return this.games.patchScene(req.user.userId, sceneId, b);
  }

  @Get('scenes/:sceneId/nodes')
  listNodes(@Req() req: any, @Param('sceneId') sid: string) {
    return this.games.listNodes(req.user.userId, sid);
  }

  @Post('scenes/:sceneId/nodes')
  upsertNode(@Req() req: any, @Param('sceneId') sid: string, @Body() b: any) {
    return this.games.upsertNode(req.user.userId, sid, b);
  }

  @Delete('nodes/:nodeId')
  delNode(@Req() req: any, @Param('nodeId') nid: string) {
    return this.games.deleteNode(req.user.userId, nid);
  }
}
