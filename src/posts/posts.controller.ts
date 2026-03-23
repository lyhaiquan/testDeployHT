import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  Patch,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostsBatchDto } from './dto/create-posts-batch.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

/**
 * Controller handling post-related endpoints
 * Designed for Chrome Extension integration
 */
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  /**
   * Batch create posts from Chrome Extension
   * POST /posts/batch
   * Deduplicates by link and only inserts new posts
   */
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() createPostsBatchDto: CreatePostsBatchDto): Promise<{
    inserted: number;
    skipped: number;
    message: string;
    details?: string[];
  }> {
    try {
      this.logger.log(
        `Received batch request with ${createPostsBatchDto.posts.length} posts`,
      );

      const result = await this.postsService.createBatch(
        createPostsBatchDto.posts,
      );

      return {
        inserted: result.inserted,
        skipped: result.skipped,
        message: `Successfully processed ${createPostsBatchDto.posts.length} posts. Inserted: ${result.inserted}, Skipped: ${result.skipped}`,
        details: result.details,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Batch insert failed: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to process batch posts',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a single post
   * POST /posts
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      const post = await this.postsService.create(createPostDto);
      return {
        message: 'Post created successfully',
        data: post,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create post: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to create post',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all posts with pagination and filtering
   * GET /posts?page=1&limit=20&keyword=developer
   */
  @Get()
  async findAll(@Query() queryDto: QueryPostsDto) {
    try {
      return await this.postsService.findAll(queryDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch posts: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch posts',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get post statistics
   * GET /posts/stats
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.postsService.getStats();
      return {
        message: 'Statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch stats: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch statistics',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get unprocessed posts for AI processing
   * GET /posts/unprocessed?limit=100
   */
  @Get('unprocessed')
  async getUnprocessed(@Query('limit') limit?: number) {
    try {
      const posts = await this.postsService.getUnprocessedPosts(limit);
      return {
        message: 'Unprocessed posts retrieved successfully',
        count: posts.length,
        data: posts,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch unprocessed posts: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch unprocessed posts',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a single post by ID
   * GET /posts/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const post = await this.postsService.findOne(id);

      if (!post) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Post not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Post retrieved successfully',
        data: post,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch post: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch post',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update post processed status
   * PATCH /posts/:id/processed
   */
  @Patch(':id/processed')
  async updateProcessedStatus(
    @Param('id') id: string,
    @Body() body: { processed: boolean },
  ) {
    try {
      const post = await this.postsService.updateProcessedStatus(
        id,
        body.processed,
      );

      return {
        message: 'Post processed status updated successfully',
        data: post,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update post: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update post',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a post
   * DELETE /posts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      await this.postsService.remove(id);
      return {
        message: 'Post deleted successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete post: ${errorMessage}`);

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to delete post',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
