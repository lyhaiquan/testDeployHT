import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';

/**
 * DTO for batch creating multiple posts
 */
export class CreatePostsBatchDto {
  /**
   * Array of posts to create
   * @example [{ content: '...', link: 'https://...', author: 'John' }]
   */
  @IsArray({ message: 'Posts must be an array' })
  @ArrayMinSize(1, { message: 'At least one post is required' })
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts: CreatePostDto[];
}
