import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for batch creating multiple posts
 */
export class CreatePostsBatchDto {
  @ApiProperty({
    type: [CreatePostDto],
    example: [
      {
        content: 'Looking for a senior developer...',
        link: 'https://www.facebook.com/groups/123456/posts/789012',
        author: 'John Doe',
        keywords: ['developer', 'fullstack'],
        isJob: true,
      },
    ],
    description: 'Array of posts to create',
  })
  @IsArray({ message: 'Posts must be an array' })
  @ArrayMinSize(1, { message: 'At least one post is required' })
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts: CreatePostDto[];
}
