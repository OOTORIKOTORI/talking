import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { OptionalSupabaseAuthGuard } from '../auth/optional-supabase-auth.guard';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Get()
  @UseGuards(OptionalSupabaseAuthGuard)
  listPublic(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
  ) {
    return this.games.listPublic(limit, offset, q, sort);
  }

  @Get(':id/edit')
  @UseGuards(SupabaseAuthGuard)
  getEdit(@Req() req: any, @Param('id') id: string) {
    return this.games.getForEdit(req.user.userId, id);
  }

  @Get('my')
  @UseGuards(SupabaseAuthGuard)
  my(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
  ) {
    return this.games.myList(req.user.userId, q, sort, status);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(@Req() req: any, @Body() b: any) {
    return this.games.create(req.user.userId, b);
  }

  @UseGuards(OptionalSupabaseAuthGuard)
  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.games.getForPlay(req.user?.userId, id);
  }

  @Post(':id/view')
  countView(@Param('id') id: string) {
    return this.games.countPublicView(id);
  }

  @Post(':id/play')
  countPlay(@Param('id') id: string) {
    return this.games.countPublicPlay(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() b: UpdateGameDto) {
    return this.games.update(req.user.userId, id, b);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  del(@Req() req: any, @Param('id') id: string) {
    return this.games.softDelete(req.user.userId, id);
  }

  @Get(':id/saves')
  @UseGuards(SupabaseAuthGuard)
  listSaves(@Req() req: any, @Param('id') id: string) {
    return this.games.listSaves(req.user.userId, id);
  }

  @Get(':id/saves/:slotType/:slotIndex')
  @UseGuards(SupabaseAuthGuard)
  getSave(
    @Req() req: any,
    @Param('id') id: string,
    @Param('slotType') slotType: string,
    @Param('slotIndex') slotIndex: string,
  ) {
    return this.games.getSave(req.user.userId, id, slotType, slotIndex);
  }

  @Post(':id/saves')
  @UseGuards(SupabaseAuthGuard)
  upsertSave(@Req() req: any, @Param('id') id: string, @Body() b: any) {
    return this.games.upsertSave(req.user.userId, id, b);
  }

  @Post(':id/saves/auto')
  @UseGuards(SupabaseAuthGuard)
  autoSave(@Req() req: any, @Param('id') id: string, @Body() b: any) {
    return this.games.autoSave(req.user.userId, id, b);
  }

  @Delete(':id/saves/:slotType/:slotIndex')
  @UseGuards(SupabaseAuthGuard)
  deleteSave(
    @Req() req: any,
    @Param('id') id: string,
    @Param('slotType') slotType: string,
    @Param('slotIndex') slotIndex: string,
  ) {
    return this.games.deleteSave(req.user.userId, id, slotType, slotIndex);
  }

  @Get(':id/scenes')
  @UseGuards(SupabaseAuthGuard)
  listScenes(@Req() req: any, @Param('id') pid: string) {
    return this.games.listScenes(req.user.userId, pid);
  }

  @Post(':id/scenes')
  @UseGuards(SupabaseAuthGuard)
  upsertScene(@Req() req: any, @Param('id') pid: string, @Body() b: any) {
    return this.games.upsertScene(req.user.userId, pid, b);
  }

  @Patch('scenes/:sceneId')
  @UseGuards(SupabaseAuthGuard)
  updateScene(@Req() req: any, @Param('sceneId') sceneId: string, @Body() b: any) {
    return this.games.patchScene(req.user.userId, sceneId, b);
  }

  @Get('scenes/:sceneId/nodes')
  @UseGuards(SupabaseAuthGuard)
  listNodes(@Req() req: any, @Param('sceneId') sid: string) {
    return this.games.listNodes(req.user.userId, sid);
  }

  @Post('scenes/:sceneId/nodes')
  @UseGuards(SupabaseAuthGuard)
  upsertNode(@Req() req: any, @Param('sceneId') sid: string, @Body() b: any) {
    return this.games.upsertNode(req.user.userId, sid, b);
  }

  @Delete('nodes/:nodeId')
  @UseGuards(SupabaseAuthGuard)
  delNode(@Req() req: any, @Param('nodeId') nid: string) {
    return this.games.deleteNode(req.user.userId, nid);
  }

  @Get('nodes/:nodeId/delete-summary')
  @UseGuards(SupabaseAuthGuard)
  nodeDeleteSummary(@Req() req: any, @Param('nodeId') nid: string) {
    return this.games.getNodeDeleteSummary(req.user.userId, nid);
  }

  @Delete('scenes/:sceneId')
  @UseGuards(SupabaseAuthGuard)
  delScene(@Req() req: any, @Param('sceneId') sceneId: string) {
    return this.games.deleteScene(req.user.userId, sceneId);
  }

  @Get('scenes/:sceneId/delete-summary')
  @UseGuards(SupabaseAuthGuard)
  sceneDeleteSummary(@Req() req: any, @Param('sceneId') sceneId: string) {
    return this.games.getSceneDeleteSummary(req.user.userId, sceneId);
  }
}
