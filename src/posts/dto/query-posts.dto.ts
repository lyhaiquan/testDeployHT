import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for querying posts with pagination and filtering
 */
export class QueryPostsDto {
  /**
   * Page number (1-indexed)
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  /**
   * Number of posts per page
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 20;

  /**
   * Filter by keyword (searches in content and keywords array)
   * @example 'developer'
   */
  @IsOptional()
  @IsString({ message: 'Keyword must be a string' })
  keyword?: string;
}
