import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * Controller handling email-related endpoints
 */
@ApiTags('Emails')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Send a single email
   * @param dto - Email data containing recipient, subject, and content
   * @returns Success message
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a single email' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendEmail(@Body() dto: SendEmailDto): Promise<{ message: string }> {
    try {
      this.logger.log(`Received request to send email to ${dto.to}`);
      await this.emailService.sendEmail(dto);
      return {
        message: 'Email sent successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${errorMessage}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send email',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send multiple emails in bulk
   * @param body - Object containing array of email DTOs
   * @returns Object with success and failed counts
   */
  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiBody({ schema: { type: 'object', properties: { emails: { type: 'array', items: { $ref: '#/components/schemas/SendEmailDto' } } } } })
  @ApiResponse({ status: 200, description: 'Return success/failed count' })
  async sendBulkEmails(
    @Body() body: { emails: SendEmailDto[] },
  ): Promise<{ success: number; failed: number; message: string }> {
    try {
      if (!body.emails || !Array.isArray(body.emails)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'emails field must be an array of email objects',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.emails.length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'emails array cannot be empty',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Received request to send ${body.emails.length} bulk emails`);
      const result = await this.emailService.sendBulkEmails(body.emails);

      return {
        ...result,
        message: `Bulk email processing completed. Success: ${result.success}, Failed: ${result.failed}`,
      };
    } catch (error) {
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send bulk emails: ${errorMessage}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send bulk emails',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
