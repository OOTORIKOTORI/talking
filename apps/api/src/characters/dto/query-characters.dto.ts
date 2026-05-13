import { IsBooleanString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
export class QueryCharactersDto {
  @IsString() @IsOptional() q?: string;
  @IsString() @IsOptional() tags?: string;
  @IsIn(['createdAt:desc', 'createdAt:asc', 'name:asc']) @IsOptional() sort?: 'createdAt:desc' | 'createdAt:asc' | 'name:asc';
  @IsIn(['all', 'public', 'private']) @IsOptional() visibility?: 'all' | 'public' | 'private';
  @IsBooleanString() @IsOptional() publicOnly?: string; // "true"/"false"
  @IsInt() @IsOptional() limit?: number;
  @IsInt() @IsOptional() offset?: number;
}
