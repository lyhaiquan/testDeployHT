# Email Module Documentation

## Overview
Production-ready Email module for NestJS using nodemailer with Gmail SMTP support.

## Setup

### 1. Environment Variables
Create a `.env` file in the root directory (use `.env.example` as template):

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3000
```

**Important**: For Gmail, you must use an App Password instead of your regular password.

#### How to Generate Gmail App Password:
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to: https://myaccount.google.com/apppasswords
5. Create a new app password for "Mail"
6. Use this generated password in your `.env` file

### 2. Module Structure
```
src/email/
├── dto/
│   └── send-email.dto.ts    # Data transfer object with validation
├── email.controller.ts      # API endpoints
├── email.service.ts         # Email sending logic
└── email.module.ts          # Module definition
```

## API Endpoints

### Send Single Email
**Endpoint**: `POST /email/send`

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Welcome to our platform",
  "content": "<h1>Hello!</h1><p>Welcome to our amazing platform.</p>"
}
```

**Validation Rules**:
- `to`: Must be a valid email address (required)
- `subject`: Required, max 200 characters
- `content`: Required, supports HTML

**Success Response** (200 OK):
```json
{
  "message": "Email sent successfully"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "statusCode": 500,
  "message": "Failed to send email",
  "error": "Error details here"
}
```

### Send Bulk Emails
**Endpoint**: `POST /email/send-bulk`

**Request Body**:
```json
{
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Newsletter #1",
      "content": "<h1>Newsletter</h1>"
    },
    {
      "to": "user2@example.com",
      "subject": "Newsletter #2",
      "content": "<h1>Newsletter</h1>"
    }
  ]
}
```

**Success Response** (200 OK):
```json
{
  "success": 8,
  "failed": 2,
  "message": "Bulk email processing completed. Success: 8, Failed: 2"
}
```

**Features**:
- Sends emails sequentially
- 2-second delay between each email (to avoid rate limits)
- Continues processing even if one email fails
- Returns detailed success/failed counts

## Usage Examples

### Using cURL

**Send Single Email**:
```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "content": "<h1>Hello</h1><p>This is a test email.</p>"
  }'
```

**Send Bulk Emails**:
```bash
curl -X POST http://localhost:3000/email/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      {
        "to": "user1@example.com",
        "subject": "Test 1",
        "content": "<h1>Test 1</h1>"
      },
      {
        "to": "user2@example.com",
        "subject": "Test 2",
        "content": "<h1>Test 2</h1>"
      }
    ]
  }'
```

### Using the Service in Other Modules

If you want to use the EmailService in other modules:

```typescript
import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { YourService } from './your.service';

@Module({
  imports: [EmailModule], // Import EmailModule
  providers: [YourService],
})
export class YourModule {}
```

Then inject the service:

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async notifyUser(email: string): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Notification',
      content: '<p>You have a new notification!</p>',
    });
  }
}
```

## Features

### ✅ Production-Ready Features
- **Validation**: Automatic input validation using class-validator
- **Error Handling**: Comprehensive try-catch blocks with proper error logging
- **Logging**: Detailed logs for debugging and monitoring
- **Dependency Injection**: Clean architecture with NestJS DI
- **Type Safety**: Full TypeScript support with no `any` types
- **HTML Support**: Send rich HTML emails
- **Bulk Processing**: Send multiple emails with rate limiting
- **Graceful Failures**: Application continues running even if email sending fails

### 🛡️ Error Handling
- Service-level try-catch blocks
- Controller-level error handling
- Detailed error logging
- HTTP exceptions with proper status codes
- No application crashes on email failures

### 📝 Logging
The module logs:
- Email sent successfully (with message ID)
- Failed email attempts (with error details)
- Bulk email progress
- Transporter initialization status

## Running the Application

### Development Mode
```bash
pnpm run start:dev
```

### Production Mode
```bash
pnpm run build
pnpm run start:prod
```

## Testing

### Manual Testing with REST Client
Create a file `test-email.http`:

```http
### Send Single Email
POST http://localhost:3000/email/send
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "content": "<h1>Hello!</h1><p>This is a test email with HTML content.</p>"
}

### Send Bulk Emails
POST http://localhost:3000/email/send-bulk
Content-Type: application/json

{
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Bulk Email 1",
      "content": "<h1>Email 1</h1>"
    },
    {
      "to": "user2@example.com",
      "subject": "Bulk Email 2",
      "content": "<h1>Email 2</h1>"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **"EMAIL_USER or EMAIL_PASS not configured" warning**
   - Solution: Create a `.env` file with correct credentials

2. **"Authentication failed" error**
   - Solution: Make sure you're using an App Password for Gmail, not your regular password
   - Enable 2-Step Verification on your Google account

3. **"Email transporter verification failed"**
   - Solution: Check your internet connection and Gmail credentials
   - Verify that Gmail SMTP is not blocked by your firewall

4. **Rate limiting issues**
   - Solution: The bulk email feature already includes 2-second delays
   - For higher volumes, consider using a dedicated email service

## Security Best Practices

1. **Never commit `.env` file**: Add it to `.gitignore`
2. **Use App Passwords**: Never use your main Google password
3. **Environment Variables**: Always use environment variables for credentials
4. **Rate Limiting**: Respect email service provider limits
5. **Validation**: Input validation is enabled globally

## Gmail Sending Limits

- Free Gmail accounts: 500 emails per day
- Google Workspace accounts: 2,000 emails per day
- Per-minute limit: varies by account type

For production with high volumes, consider:
- SendGrid
- Amazon SES
- Mailgun
- Postmark

## License
UNLICENSED
