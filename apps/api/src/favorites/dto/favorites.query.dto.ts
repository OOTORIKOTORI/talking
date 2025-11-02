import { IsOptional, IsString, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'
import { AssetPrimaryTag } from '@prisma/client'

export class FavoritesQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsString()
  type?: 'image' | 'audio'

  @IsOptional()
  @IsEnum(AssetPrimaryTag, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value
    return String(value || '')
      .split(',')
      .filter(Boolean)
  })
  primaryTag?: AssetPrimaryTag[]

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value
    return String(value || '')
      .split(',')
      .filter(Boolean)
  })
  tags?: string[]

  @IsOptional()
  @IsEnum(['createdAt:desc', 'createdAt:asc'])
  sort?: 'createdAt:desc' | 'createdAt:asc' = 'createdAt:desc'
}
