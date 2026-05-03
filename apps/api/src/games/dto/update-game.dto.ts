import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'title must not be blank' })
  @MaxLength(120)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
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
