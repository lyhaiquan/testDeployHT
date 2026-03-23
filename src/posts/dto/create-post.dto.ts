import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  MinLength,
  IsBoolean,
} from 'class-validator';

/**
 * DTO for creating a single post
 */
export class CreatePostDto {
  /**
   * Post content (text from Facebook post)
   * @example 'Looking for a senior developer with 5 years experience...'
   */
  @IsString({ message: 'Content must be a string' })
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content: string;

  /**
   * Link to the original Facebook post
   * @example 'https://www.facebook.com/groups/123456/posts/789012'
   */
  @IsUrl(
    { require_protocol: true },
    { message: 'Link must be a valid URL with protocol' },
  )
  @IsString({ message: 'Link must be a string' })
  link: string;

  /**
   * Post author name (optional)
   * @example 'John Doe'
   */
  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  author?: string;

  /**
   * Array of keywords extracted from the post
   * @example ['developer', 'fullstack', 'remote']
   */
  @IsOptional()
  @IsArray({ message: 'Keywords must be an array' })
  @IsString({ each: true, message: 'Each keyword must be a string' })
  keywords?: string[];

  /**
   * Whether this post is identified as a job posting
   * @example true
   */
  @IsOptional()
  @IsBoolean({ message: 'isJob must be a boolean' })
  isJob?: boolean;
}
