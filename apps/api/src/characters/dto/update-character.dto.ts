import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCharacterDto {
  @IsString() @IsNotEmpty() @MaxLength(60) @IsOptional() name?: string;
  @IsString() @IsNotEmpty() @MaxLength(60) @IsOptional() displayName?: string;
  @IsString() @IsOptional() @MaxLength(2000) description?: string;
  @IsBoolean() @IsOptional() isPublic?: boolean;
  @IsArray() @IsString({ each: true }) @IsOptional() tags?: string[];
  @IsString() @IsOptional() @MaxLength(1000) usageTerms?: string;
  @IsBoolean() @IsOptional() creditRequired?: boolean;
}
