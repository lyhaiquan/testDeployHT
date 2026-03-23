import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

/**
 * Email module providing email sending capabilities
 * Uses nodemailer with Gmail SMTP
 */
@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // Export service for use in other modules
})
export class EmailModule {}
