import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  contentType: string;

  @IsInt()
  @Min(0)
  size: number;
}
