import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying posts with pagination and filtering
 */
export class QueryPostsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Number of posts per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'developer', description: 'Filter by keyword (searches in content and keywords array)' })
  @IsOptional()
  @IsString({ message: 'Keyword must be a string' })
  keyword?: string;
}
