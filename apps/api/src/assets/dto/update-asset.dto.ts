import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { AssetPrimaryTag } from '@prisma/client';

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(AssetPrimaryTag)
  primaryTag?: AssetPrimaryTag;
}
