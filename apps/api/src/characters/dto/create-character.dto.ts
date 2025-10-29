import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCharacterDto {
  @IsString() @IsNotEmpty() @MaxLength(60) name!: string;
  @IsString() @IsNotEmpty() @MaxLength(60) displayName!: string;
  @IsString() @IsOptional() @MaxLength(2000) description?: string;
  @IsBoolean() @IsOptional() isPublic?: boolean;
}
