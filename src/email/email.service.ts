import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * Service responsible for sending emails using nodemailer
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter with Gmail SMTP
   */
  private initializeTransporter(): void {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    if (!emailUser || !emailPass) {
      this.logger.warn(
        'EMAIL_USER or EMAIL_PASS not configured. Email functionality may not work.',
      );
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`Email transporter verification failed: ${error.message}`);
      } else {
        this.logger.log('Email transporter is ready to send emails');
      }
    });
  }

  /**
   * Send a single email
   * @param dto - Email data transfer object containing to, subject, and content
   * @throws Error if email sending fails
   */
  async sendEmail(dto: SendEmailDto): Promise<void> {
    const { to, subject, content } = dto;

    try {
      const emailUser = this.configService.get<string>('EMAIL_USER');

      const mailOptions = {
        from: emailUser,
        to,
        subject,
        html: content,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to ${to} - Message ID: ${info.messageId}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send email to ${to}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Send multiple emails sequentially with a delay between each
   * @param emails - Array of email DTOs to send
   * @returns Object containing success and failed counts
   */
  async sendBulkEmails(
    emails: SendEmailDto[],
  ): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;

    this.logger.log(`Starting bulk email send for ${emails.length} emails`);

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      try {
        await this.sendEmail(email);
        successCount++;
        this.logger.log(
          `Bulk email progress: ${i + 1}/${emails.length} - Success`,
        );
      } catch (error) {
        failedCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Bulk email progress: ${i + 1}/${emails.length} - Failed: ${errorMessage}`,
        );
        // Continue processing remaining emails even if one fails
      }

      // Add delay between emails (except after the last email)
      if (i < emails.length - 1) {
        this.logger.debug('Waiting 2 seconds before sending next email...');
        await this.delay(2000);
      }
    }

    this.logger.log(
      `Bulk email send completed - Success: ${successCount}, Failed: ${failedCount}`,
    );

    return {
      success: successCount,
      failed: failedCount,
    };
  }

  /**
   * Utility function to create a delay
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
