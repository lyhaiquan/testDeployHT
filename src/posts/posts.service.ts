import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Post, Prisma } from '@prisma/client';

/**
 * Service handling all Post-related business logic
 */
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a single post
   * @param createPostDto - Post data
   * @returns Created post
   * @throws ConflictException if link already exists
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      const post = await this.prisma.post.create({
        data: {
          content: createPostDto.content,
          link: createPostDto.link,
          author: createPostDto.author,
          keywords: createPostDto.keywords || [],
          isJob: createPostDto.isJob || false,
        },
      });

      this.logger.log(`Created post with ID: ${post.id}`);
      return post;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(`Duplicate link attempted: ${createPostDto.link}`);
        throw new ConflictException(
          `Post with link ${createPostDto.link} already exists`,
        );
      }
      throw error;
    }
  }

  /**
   * Batch create posts with deduplication
   * Only inserts posts with unique links
   * @param posts - Array of posts to create
   * @returns Object with inserted and skipped counts
   */
  async createBatch(
    posts: CreatePostDto[],
  ): Promise<{ inserted: number; skipped: number; details: string[] }> {
    let insertedCount = 0;
    let skippedCount = 0;
    const details: string[] = [];

    this.logger.log(`Starting batch insert for ${posts.length} posts`);

    // Extract all links from incoming posts
    const incomingLinks = posts.map((post) => post.link);

    // Check which links already exist in database
    const existingPosts = await this.prisma.post.findMany({
      where: {
        link: {
          in: incomingLinks,
        },
      },
      select: {
        link: true,
      },
    });

    const existingLinks = new Set(existingPosts.map((post) => post.link));

    // Filter out posts with existing links
    const newPosts = posts.filter((post) => {
      if (existingLinks.has(post.link)) {
        skippedCount++;
        details.push(`Skipped duplicate: ${post.link}`);
        return false;
      }
      return true;
    });

    // Check for duplicates within the incoming batch
    const linksSeen = new Set<string>();
    const uniqueNewPosts: CreatePostDto[] = [];

    for (const post of newPosts) {
      if (linksSeen.has(post.link)) {
        skippedCount++;
        details.push(`Skipped duplicate in batch: ${post.link}`);
      } else {
        linksSeen.add(post.link);
        uniqueNewPosts.push(post);
      }
    }

    // Insert unique posts
    if (uniqueNewPosts.length > 0) {
      try {
        const result = await this.prisma.post.createMany({
          data: uniqueNewPosts.map((post) => ({
            content: post.content,
            link: post.link,
            author: post.author,
            keywords: post.keywords || [],
            isJob: post.isJob || false,
          })),
          skipDuplicates: true, // Additional safety net
        });

        insertedCount = result.count;
        this.logger.log(
          `Successfully inserted ${insertedCount} posts, skipped ${skippedCount}`,
        );
      } catch (error) {
        this.logger.error(
          `Error during batch insert: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    } else {
      this.logger.log(`No new posts to insert. All ${skippedCount} were duplicates.`);
    }

    return {
      inserted: insertedCount,
      skipped: skippedCount,
      details: details.slice(0, 10), // Return first 10 details to avoid large responses
    };
  }

  /**
   * Find all posts with pagination and filtering
   * @param queryDto - Query parameters
   * @returns Paginated posts and metadata
   */
  async findAll(queryDto: QueryPostsDto): Promise<{
    data: Post[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, keyword } = queryDto;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.PostWhereInput = keyword
      ? {
          OR: [
            { content: { contains: keyword, mode: 'insensitive' } },
            { keywords: { has: keyword } },
            { author: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    // Execute query and count in parallel
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    this.logger.log(
      `Retrieved ${posts.length} posts (page ${page}/${totalPages})`,
    );

    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find a single post by ID
   * @param id - Post UUID
   * @returns Post or null
   */
  async findOne(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  /**
   * Find a post by link
   * @param link - Post link
   * @returns Post or null
   */
  async findByLink(link: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { link },
    });
  }

  /**
   * Update a post's processed status
   * @param id - Post UUID
   * @param processed - New processed status
   * @returns Updated post
   */
  async updateProcessedStatus(id: string, processed: boolean): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data: { processed },
    });
  }

  /**
   * Get unprocessed posts for AI processing
   * @param limit - Maximum number of posts to retrieve
   * @returns Array of unprocessed posts
   */
  async getUnprocessedPosts(limit: number = 100): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { processed: false },
      take: limit,
      orderBy: { createdAt: 'asc' }, // Process oldest first
    });
  }

  /**
   * Get statistics about posts
   * @returns Various statistics
   */
  async getStats(): Promise<{
    total: number;
    processed: number;
    unprocessed: number;
    jobPosts: number;
  }> {
    const [total, processed, jobPosts] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { processed: true } }),
      this.prisma.post.count({ where: { isJob: true } }),
    ]);

    return {
      total,
      processed,
      unprocessed: total - processed,
      jobPosts,
    };
  }

  /**
   * Delete a post by ID
   * @param id - Post UUID
   * @returns Deleted post
   */
  async remove(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
