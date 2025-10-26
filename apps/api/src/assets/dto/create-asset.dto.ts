import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';

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

  @IsString()
  contentType: string;

  @IsInt()
  @Min(0)
  size: number;
}
