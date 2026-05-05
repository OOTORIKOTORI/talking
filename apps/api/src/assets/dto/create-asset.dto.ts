import { IsString, IsOptional, IsInt, Min, IsArray, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import { AssetPrimaryTag } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  key: string;

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

  @IsEnum(AssetPrimaryTag)
  primaryTag: AssetPrimaryTag;

  @IsString()
  contentType: string;

  @IsInt()
  @Min(0)
  size: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  usageTerms?: string;

  @IsOptional()
  @IsBoolean()
  creditRequired?: boolean;
}
