import { Controller, Get, Patch, Query, Req, Body, UseGuards } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ProfilesService } from '../profiles/profiles.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'

@UseGuards(SupabaseAuthGuard)
@Controller('my')
export class MyController {
  constructor(
    private prisma: PrismaService,
    private profiles: ProfilesService,
  ) {}

  @Get('profile')
  getMyProfile(@Req() req: any) {
    return this.profiles.getMyProfile(req.user.userId)
  }

  @Patch('profile')
  updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.profiles.updateMyProfile(req.user.userId, body)
  }

  @Get('assets')
  async myAssets(
    @Req() req: any,
    @Query('type') type?: 'image' | 'audio',
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    const where: any = { ownerId: req.user.userId, deletedAt: null }
    if (type) where.contentType = { startsWith: type + '/' }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: q.split(/\s+/).filter(Boolean) } },
      ]
    }
    return this.prisma.asset.findMany({
      where,
      take: Number(limit ?? 100),
      orderBy: { createdAt: 'desc' },
    })
  }

  @Get('characters')
  async myCharacters(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    const where: any = { ownerId: req.user.userId, deletedAt: null }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: q.split(/\s+/).filter(Boolean) } },
      ]
    }
    return this.prisma.character.findMany({
      where,
      take: Number(limit ?? 100),
      orderBy: { updatedAt: 'desc' },
    })
  }
}
