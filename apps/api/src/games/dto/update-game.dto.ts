import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @IsOptional()
  @IsString()
  summary?: string

  @IsOptional()
  @IsString()
  coverAssetId?: string | null

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @IsOptional()
  @IsString()
  startSceneId?: string | null

  @IsOptional()
  messageTheme?: Record<string, unknown>

  @IsOptional()
  gameUiTheme?: Record<string, unknown>

  @IsOptional()
  backlogTheme?: Record<string, unknown>
}
