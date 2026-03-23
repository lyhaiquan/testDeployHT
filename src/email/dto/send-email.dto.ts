import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Data Transfer Object for sending email
 */
export class SendEmailDto {
  /**
   * Email recipient address
   * @example 'user@example.com'
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  to: string;

  /**
   * Email subject line
   * @example 'Welcome to our platform'
   */
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject: string;

  /**
   * Email content (HTML supported)
   * @example '<h1>Welcome!</h1><p>Thank you for joining us.</p>'
   */
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
