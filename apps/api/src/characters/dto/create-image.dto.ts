import { IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CharacterEmotion } from '@prisma/client';

export class CreateCharacterImageDto {
  @IsString() @IsNotEmpty() key!: string;
  @IsString() @IsOptional() thumbKey?: string;
  @IsString() @IsNotEmpty() contentType!: string;
  @IsInt() @IsOptional() width?: number;
  @IsInt() @IsOptional() height?: number;
  @IsInt() @IsOptional() size?: number;

  @IsEnum(CharacterEmotion) @IsOptional() emotion?: CharacterEmotion;
  @IsString() @IsOptional() @MaxLength(30) emotionLabel?: string;
  @IsString() @IsOptional() @MaxLength(60) pattern?: string;
  @IsInt() @IsOptional() sortOrder?: number;
}
