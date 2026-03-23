import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a single post
 */
export class CreatePostDto {
  @ApiProperty({ example: 'Looking for a senior developer with 5 years experience...', description: 'Post content (text from Facebook post)' })
  @IsString({ message: 'Content must be a string' })
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content: string;

  @ApiProperty({ example: 'https://www.facebook.com/groups/123456/posts/789012', description: 'Link to the original Facebook post' })
  @IsUrl(
    { require_protocol: true },
    { message: 'Link must be a valid URL with protocol' },
  )
  @IsString({ message: 'Link must be a string' })
  link: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Post author name (optional)' })
  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  author?: string;

  @ApiPropertyOptional({ example: ['developer', 'fullstack', 'remote'], description: 'Array of keywords extracted from the post' })
  @IsOptional()
  @IsArray({ message: 'Keywords must be an array' })
  @IsString({ each: true, message: 'Each keyword must be a string' })
  keywords?: string[];

  @ApiPropertyOptional({ example: true, description: 'Whether this post is identified as a job posting' })
  @IsOptional()
  @IsBoolean({ message: 'isJob must be a boolean' })
  isJob?: boolean;
}
