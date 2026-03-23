import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

/**
 * Posts module for managing Facebook post data
 * Handles data from Chrome Extension scanner
 */
@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService], // Export for use in other modules (e.g., AI processing, analytics)
})
export class PostsModule {}
