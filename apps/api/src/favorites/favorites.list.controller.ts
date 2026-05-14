import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { AssetPrimaryTag } from '@prisma/client'
import { FavoritesService } from './favorites.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { FavoritesQueryDto } from './dto/favorites.query.dto'

@Controller('favorites')
@UseGuards(SupabaseAuthGuard)
export class FavoritesListController {
  constructor(private readonly favorites: FavoritesService) {}

  private toArray(value: unknown): string[] {
    if (value == null) return []
    if (Array.isArray(value)) {
      return value
        .flatMap((v) => String(v).split(','))
        .map((v) => v.trim())
        .filter(Boolean)
    }
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  private parseLimit(value: unknown): number {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 20
    return Math.min(Math.max(Math.trunc(parsed), 1), 100)
  }

  private parseOffset(value: unknown): number {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 0
    return Math.max(Math.trunc(parsed), 0)
  }

  private parseType(value: unknown): 'image' | 'audio' | undefined {
    const normalized = String(value ?? '').trim()
    if (normalized === 'image' || normalized === 'audio') return normalized
    return undefined
  }

  private parseSort(value: unknown): 'createdAt:desc' | 'createdAt:asc' {
    return String(value ?? '').trim() === 'createdAt:asc' ? 'createdAt:asc' : 'createdAt:desc'
  }

  private parsePrimaryTags(value: unknown, type?: 'image' | 'audio'): AssetPrimaryTag[] | undefined {
    const map: Record<string, AssetPrimaryTag> = {
      '背景': AssetPrimaryTag.IMAGE_BG,
      '一枚絵': AssetPrimaryTag.IMAGE_CG,
      BGM: AssetPrimaryTag.AUDIO_BGM,
      '効果音': AssetPrimaryTag.AUDIO_SE,
      'ボイス': AssetPrimaryTag.AUDIO_VOICE,
    }

    const allowed = new Set<AssetPrimaryTag>(Object.values(AssetPrimaryTag))
    const normalized = this.toArray(value)
      .flatMap((v) => {
        if (v === 'その他') {
          if (type === 'audio') return [AssetPrimaryTag.AUDIO_OTHER]
          if (type === 'image') return [AssetPrimaryTag.IMAGE_OTHER]
          return [AssetPrimaryTag.IMAGE_OTHER, AssetPrimaryTag.AUDIO_OTHER]
        }
        return [map[v] ?? v]
      })
      .filter((v): v is AssetPrimaryTag => allowed.has(v as AssetPrimaryTag))

    return normalized.length > 0 ? normalized : undefined
  }

  private parseTags(value: unknown): string[] | undefined {
    const normalized = this.toArray(value)
    return normalized.length > 0 ? normalized : undefined
  }

  private parseQ(value: unknown): string | undefined {
    const normalized = String(value ?? '').trim()
    return normalized.length > 0 ? normalized : undefined
  }

  @Get()
  async list(
    @Req() req: any,
    @Query() query: FavoritesQueryDto & { limit?: string | number; offset?: string | number },
  ) {
    const type = this.parseType(query.type)

    return this.favorites.list(req.user.userId, {
      limit: this.parseLimit(query.limit),
      offset: this.parseOffset(query.offset),
      q: this.parseQ(query.q),
      type,
      primaryTag: this.parsePrimaryTags(query.primaryTag, type),
      tags: this.parseTags(query.tags),
      sort: this.parseSort(query.sort),
    })
  }
}
