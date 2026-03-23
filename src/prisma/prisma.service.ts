import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service for database operations
 * Implements lifecycle hooks for connection management
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });
  }

  /**
   * Connect to database when module initializes
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Log queries in development
      if (process.env.NODE_ENV !== 'production') {
        this.$on('query' as never, (event: unknown) => {
          const queryEvent = event as { query: string; duration: number };
          this.logger.debug(
            `Query: ${queryEvent.query} - Duration: ${queryEvent.duration}ms`,
          );
        });
      }

      // Log errors
      this.$on('error' as never, (event: unknown) => {
        const errorEvent = event as { message: string };
        this.logger.error(`Database error: ${errorEvent.message}`);
      });
    } catch (error) {
      this.logger.error(
        'Failed to connect to database',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error(
        'Error during database disconnection',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Clean database (useful for testing)
   * WARNING: This will delete all data!
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => key[0] !== '_' && key !== 'constructor',
    );

    await Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
      }),
    );

    this.logger.warn('Database cleaned');
  }
}
