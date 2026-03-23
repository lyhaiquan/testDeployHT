import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for sending email
 */
export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email recipient address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  to: string;

  @ApiProperty({ example: 'Welcome to our platform', description: 'Email subject line' })
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject: string;

  @ApiProperty({ example: '<h1>Welcome!</h1><p>Thank you for joining us.</p>', description: 'Email content (HTML supported)' })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
