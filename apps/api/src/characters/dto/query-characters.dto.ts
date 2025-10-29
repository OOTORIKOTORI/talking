import { IsBooleanString, IsInt, IsOptional, IsString } from 'class-validator';
export class QueryCharactersDto {
  @IsString() @IsOptional() q?: string;
  @IsBooleanString() @IsOptional() publicOnly?: string; // "true"/"false"
  @IsInt() @IsOptional() limit?: number;
  @IsInt() @IsOptional() offset?: number;
}
