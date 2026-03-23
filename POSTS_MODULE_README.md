# Posts Module Documentation

## Overview
Production-ready NestJS module for managing Facebook post data scraped from Chrome Extension. Features automatic deduplication, batch processing, and PostgreSQL persistence via Prisma ORM.

---

## Architecture

### Tech Stack
- **NestJS** - Backend framework
- **Prisma ORM** - Database ORM with type safety
- **PostgreSQL** - Database (hosted on Supabase)
- **TypeScript** - Full type safety
- **class-validator** - DTO validation

### Module Structure
```
src/
├── prisma/
│   ├── prisma.module.ts      # Global Prisma module
│   └── prisma.service.ts     # Database connection service
├── posts/
│   ├── dto/
│   │   ├── create-post.dto.ts           # Single post DTO
│   │   ├── create-posts-batch.dto.ts    # Batch posts DTO
│   │   └── query-posts.dto.ts           # Query/filter DTO
│   ├── posts.controller.ts   # REST API endpoints
│   ├── posts.service.ts      # Business logic
│   └── posts.module.ts       # Posts module
prisma/
└── schema.prisma             # Database schema
```

---

## Setup

### 1. Database Configuration

Update `.env` file with your Supabase PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

**Get your Supabase DATABASE_URL:**
1. Login to [Supabase](https://supabase.com)
2. Select your project
3. Go to Settings → Database
4. Copy the "Connection string" under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your database password

### 2. Run Prisma Migrations

Generate and apply database schema:

```bash
# Generate Prisma client
pnpm exec prisma generate

# Create migration (first time)
pnpm exec prisma migrate dev --name init

# Or push schema directly (for development)
pnpm exec prisma db push
```

### 3. Verify Database

Check your database was created correctly:

```bash
pnpm exec prisma studio
```

This opens a GUI at `http://localhost:5555` to view your database.

---

## Database Schema

### Post Model

| Field       | Type       | Description                            |
|-------------|------------|----------------------------------------|
| `id`        | UUID       | Primary key (auto-generated)           |
| `content`   | Text       | Post content from Facebook             |
| `link`      | String     | **Unique** link to Facebook post       |
| `author`    | String?    | Post author name (optional)            |
| `keywords`  | String[]   | Extracted keywords array               |
| `isJob`     | Boolean    | Whether post is a job posting (false)  |
| `processed` | Boolean    | AI processing status (false)           |
| `createdAt` | DateTime   | Record creation timestamp              |
| `updatedAt` | DateTime   | Auto-updated on changes                |

**Indexes:**
- `link` (unique)
- `processed`
- `isJob`
- `createdAt`

---

## API Endpoints

### 1. Batch Create Posts (Main Endpoint)

**POST** `/posts/batch`

Send multiple posts from Chrome Extension with automatic deduplication.

**Request Body:**
```json
{
  "posts": [
    {
      "content": "Looking for senior React developer with 5+ years experience...",
      "link": "https://www.facebook.com/groups/123456/posts/789012",
      "author": "John Doe",
      "keywords": ["react", "developer", "senior"],
      "isJob": true
    },
    {
      "content": "Great article about NestJS best practices...",
      "link": "https://www.facebook.com/groups/123456/posts/789013",
      "author": "Jane Smith",
      "keywords": ["nestjs", "tutorial"]
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "inserted": 2,
  "skipped": 0,
  "message": "Successfully processed 2 posts. Inserted: 2, Skipped: 0",
  "details": []
}
```

**Response with Duplicates:**
```json
{
  "inserted": 1,
  "skipped": 1,
  "message": "Successfully processed 2 posts. Inserted: 1, Skipped: 1",
  "details": [
    "Skipped duplicate: https://www.facebook.com/groups/123456/posts/789013"
  ]
}
```

---

### 2. Create Single Post

**POST** `/posts`

**Request Body:**
```json
{
  "content": "Looking for developers...",
  "link": "https://www.facebook.com/groups/123456/posts/789012",
  "author": "John Doe",
  "keywords": ["developer", "job"]
}
```

**Response (201 Created):**
```json
{
  "message": "Post created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Looking for developers...",
    "link": "https://www.facebook.com/groups/123456/posts/789012",
    "author": "John Doe",
    "keywords": ["developer", "job"],
    "isJob": false,
    "processed": false,
    "createdAt": "2026-03-22T10:30:00.000Z",
    "updatedAt": "2026-03-22T10:30:00.000Z"
  }
}
```

**Error (409 Conflict) - Duplicate Link:**
```json
{
  "statusCode": 409,
  "message": "Post with link https://... already exists"
}
```

---

### 3. Get All Posts (Paginated)

**GET** `/posts?page=1&limit=20&keyword=developer`

**Query Parameters:**
- `page` (optional): Page number, default `1`
- `limit` (optional): Items per page, default `20`, max `100`
- `keyword` (optional): Search in content, keywords, or author

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Looking for senior developer...",
      "link": "https://www.facebook.com/...",
      "author": "John Doe",
      "keywords": ["developer", "senior"],
      "isJob": true,
      "processed": false,
      "createdAt": "2026-03-22T10:30:00.000Z",
      "updatedAt": "2026-03-22T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 4. Get Post Statistics

**GET** `/posts/stats`

**Response (200 OK):**
```json
{
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 1500,
    "processed": 1200,
    "unprocessed": 300,
    "jobPosts": 450
  }
}
```

---

### 5. Get Unprocessed Posts

**GET** `/posts/unprocessed?limit=100`

Retrieve posts that haven't been processed by AI.

**Query Parameters:**
- `limit` (optional): Max posts to return, default `100`

**Response (200 OK):**
```json
{
  "message": "Unprocessed posts retrieved successfully",
  "count": 50,
  "data": [...]
}
```

---

### 6. Get Single Post

**GET** `/posts/:id`

**Response (200 OK):**
```json
{
  "message": "Post retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    ...
  }
}
```

**Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Post not found"
}
```

---

### 7. Update Processed Status

**PATCH** `/posts/:id/processed`

Mark a post as processed after AI analysis.

**Request Body:**
```json
{
  "processed": true
}
```

**Response (200 OK):**
```json
{
  "message": "Post processed status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "processed": true,
    ...
  }
}
```

---

### 8. Delete Post

**DELETE** `/posts/:id`

**Response (200 OK):**
```json
{
  "message": "Post deleted successfully"
}
```

---

## Validation Rules

### CreatePostDto

| Field      | Rules                                    |
|------------|------------------------------------------|
| `content`  | Required, string, min length 10          |
| `link`     | Required, valid URL with protocol        |
| `author`   | Optional, string                         |
| `keywords` | Optional, array of strings               |
| `isJob`    | Optional, boolean                        |

### QueryPostsDto

| Field     | Rules                           |
|-----------|---------------------------------|
| `page`    | Optional, integer, min 1        |
| `limit`   | Optional, integer, min 1, max 100 |
| `keyword` | Optional, string                |

---

## Deduplication Strategy

The batch endpoint implements multi-layer deduplication:

1. **Database Check**: Query existing posts by links
2. **Filter Existing**: Remove posts with links already in database
3. **Batch Deduplication**: Remove duplicate links within the incoming batch
4. **Insert with Safety**: Use Prisma's `skipDuplicates` as final safety net

This ensures:
- ✅ No duplicate links in database
- ✅ Efficient bulk inserts
- ✅ Clear reporting of skipped vs inserted

---

## Chrome Extension Integration

### Example JavaScript Code

```javascript
// Scrape Facebook posts
const posts = scrapeFacebookPosts();

// Send to backend
const response = await fetch('http://localhost:3000/posts/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ posts }),
});

const result = await response.json();
console.log(`Inserted: ${result.inserted}, Skipped: ${result.skipped}`);
```

---

## Usage in Other Modules

The `PostsService` is exported and can be used in other modules for:
- AI processing workflows
- Email automation
- Analytics dashboards

### Example: AI Processing Module

```typescript
import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class AiProcessingService {
  constructor(private readonly postsService: PostsService) {}

  async processUnprocessedPosts(): Promise<void> {
    const posts = await this.postsService.getUnprocessedPosts(50);
    
    for (const post of posts) {
      // Run AI analysis
      await this.analyzePost(post);
      
      // Mark as processed
      await this.postsService.updateProcessedStatus(post.id, true);
    }
  }
}
```

---

## Testing

### Using cURL

**Batch Insert:**
```bash
curl -X POST http://localhost:3000/posts/batch \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [
      {
        "content": "Looking for senior developer...",
        "link": "https://facebook.com/test/1",
        "keywords": ["developer", "job"]
      }
    ]
  }'
```

**Get Posts:**
```bash
curl "http://localhost:3000/posts?page=1&limit=10&keyword=developer"
```

**Get Stats:**
```bash
curl http://localhost:3000/posts/stats
```

---

## Prisma Commands

### Development

```bash
# Generate Prisma client after schema changes
pnpm exec prisma generate

# Create and apply migration
pnpm exec prisma migrate dev --name add_new_field

# Push schema without migration (quick dev)
pnpm exec prisma db push

# Open Prisma Studio GUI
pnpm exec prisma studio

# Reset database (WARNING: deletes all data)
pnpm exec prisma migrate reset
```

### Production

```bash
# Apply pending migrations
pnpm exec prisma migrate deploy

# Generate client
pnpm exec prisma generate
```

---

## Performance Considerations

1. **Indexes**: The schema includes indexes on frequently queried fields
2. **Batch Inserts**: Uses `createMany` for efficient bulk operations
3. **Query Optimization**: Parallel execution of queries and counts
4. **Pagination**: Prevents large data transfers

### Scaling Recommendations

For > 100K posts:
- Add full-text search index for content
- Implement caching (Redis)
- Consider read replicas
- Add background job queue for processing

---

## Error Handling

All endpoints include:
- Try-catch blocks
- Detailed error logging
- Consistent error response format
- HTTP status codes (409 Conflict, 404 Not Found, 500 Internal Server Error)

---

## Logging

The module logs:
- Batch processing progress
- Individual post creation
- Database connection status
- Query execution (development only)
- All errors with stack traces

---

## Environment Variables

Required in `.env`:

```env
# Database
DATABASE_URL="postgresql://..."

# Optional
NODE_ENV=development  # Enables query logging
```

---

## Future Enhancements

Based on your requirements, here are integration points:

### 1. AI Processing
```typescript
// Service method exists:
await postsService.getUnprocessedPosts(100);
await postsService.updateProcessedStatus(postId, true);
```

### 2. Email Automation
```typescript
// Example: Email daily job posts
const jobPosts = await prisma.post.findMany({
  where: { isJob: true, createdAt: { gte: yesterday } }
});
await emailService.sendBulkEmails(emailsFromPosts);
```

### 3. Analytics
```typescript
// Use existing stats endpoint or create custom queries
const stats = await postsService.getStats();
```

---

## Troubleshooting

### "Module '@prisma/client' has no exported member 'PrismaClient'"

Run:
```bash
pnpm exec prisma generate
```

### Migration Errors

Reset and recreate:
```bash
pnpm exec prisma migrate reset
pnpm exec prisma migrate dev --name init
```

### Connection Issues

1. Verify `DATABASE_URL` in `.env`
2. Check Supabase database is running
3. Verify network/firewall settings

---

## Security Best Practices

1. ✅ Input validation with class-validator
2. ✅ Parameterized queries (Prisma prevents SQL injection)
3. ✅ Global validation pipes enabled
4. ✅ Error messages don't leak sensitive data

**TODO for Production:**
- Add authentication/authorization
- Rate limiting for batch endpoint
- CORS configuration
- Request size limits

---

## License

UNLICENSED

---

## Support

For issues or questions about this module, check:
1. Prisma logs in the console
2. Database connection in Prisma Studio
3. Validation errors in API responses
