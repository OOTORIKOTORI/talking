import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AssetPrimaryTag } from '@prisma/client';

export class SearchAssetsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(v => v.trim());
    return value;
  })
  primaryTag?: string | string[];

  @IsOptional()
  @IsEnum(['image', 'audio'])
  contentType?: 'image' | 'audio';

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(v => v.trim());
    return value;
  })
  tags?: string | string[];

  @IsOptional()
  @IsEnum(['createdAt:desc', 'createdAt:asc'])
  sort?: 'createdAt:desc' | 'createdAt:asc' = 'createdAt:desc';

  @IsOptional()
  @IsString()
  owner?: string; // 'me' or explicit ownerId
}
