# Quick Start Guide - Posts Module

## Prerequisites
- Node.js 18+ installed
- pnpm installed
- Supabase PostgreSQL database

---

## Step 1: Install Dependencies

Already done! Dependencies installed:
- ✅ @prisma/client
- ✅ prisma
- ✅ class-validator
- ✅ class-transformer
- ✅ @nestjs/config

---

## Step 2: Configure Database

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Get your connection string from Settings → Database
3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

### Option B: Local PostgreSQL

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scanner_social"
```

---

## Step 3: Setup Database

```bash
# Generate Prisma client
pnpm run prisma:generate

# Push schema to database (creates tables)
pnpm run prisma:push

# Or create a migration
pnpm run prisma:migrate

# Verify in Prisma Studio (opens browser)
pnpm run prisma:studio
```

---

## Step 4: Start Development Server

```bash
pnpm run start:dev
```

Server starts at `http://localhost:3000`

---

## Step 5: Test the API

### Test 1: Batch Insert Posts

```bash
curl -X POST http://localhost:3000/posts/batch \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [
      {
        "content": "Looking for senior React developer with 5+ years experience. Remote position available.",
        "link": "https://www.facebook.com/groups/devjobs/posts/123456",
        "author": "John Smith",
        "keywords": ["react", "developer", "remote", "senior"],
        "isJob": true
      },
      {
        "content": "Great tutorial on NestJS and Prisma integration!",
        "link": "https://www.facebook.com/groups/nestjs/posts/789012",
        "author": "Jane Doe",
        "keywords": ["nestjs", "prisma", "tutorial"]
      }
    ]
  }'
```

Expected response:
```json
{
  "inserted": 2,
  "skipped": 0,
  "message": "Successfully processed 2 posts. Inserted: 2, Skipped: 0",
  "details": []
}
```

### Test 2: Get All Posts

```bash
curl "http://localhost:3000/posts?page=1&limit=10"
```

### Test 3: Get Statistics

```bash
curl http://localhost:3000/posts/stats
```

### Test 4: Search by Keyword

```bash
curl "http://localhost:3000/posts?keyword=developer"
```

---

## Common Commands

### Prisma

```bash
# Generate client after schema changes
pnpm run prisma:generate

# Push schema to database (no migration files)
pnpm run prisma:push

# Create migration
pnpm run prisma:migrate

# Open database GUI
pnpm run prisma:studio

# Production: deploy migrations
pnpm run prisma:deploy
```

### NestJS

```bash
# Development with hot reload
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod

# Format code
pnpm run format

# Lint code
pnpm run lint
```

---

## Troubleshooting

### Error: "Module '@prisma/client' has no exported member..."

**Solution:**
```bash
pnpm run prisma:generate
# Restart your IDE/editor
```

### Error: "P1001: Can't reach database server"

**Solution:**
1. Check `DATABASE_URL` in `.env`
2. Verify Supabase project is running
3. Check network/firewall

### Error: "Table 'posts' does not exist"

**Solution:**
```bash
pnpm run prisma:push
```

---

## Next Steps

1. **Test Deduplication**: Insert the same posts twice and verify `skipped` count
2. **Check Prisma Studio**: View data in GUI
3. **Integrate Chrome Extension**: Point extension to `http://localhost:3000/posts/batch`
4. **Add AI Processing**: Use `GET /posts/unprocessed` endpoint
5. **Setup Email Automation**: Use PostsService in EmailModule

---

## Project Structure

```
src/
├── prisma/
│   ├── prisma.module.ts       ✅ Created
│   └── prisma.service.ts      ✅ Created
├── posts/
│   ├── dto/
│   │   ├── create-post.dto.ts           ✅ Created
│   │   ├── create-posts-batch.dto.ts    ✅ Created
│   │   └── query-posts.dto.ts           ✅ Created
│   ├── posts.controller.ts    ✅ Created
│   ├── posts.service.ts       ✅ Created
│   └── posts.module.ts        ✅ Created
├── email/                     ✅ Created (previously)
├── app.module.ts              ✅ Updated
└── main.ts                    ✅ Updated

prisma/
└── schema.prisma              ✅ Created

.env.example                   ✅ Updated
```

---

## API Endpoints Summary

| Method | Endpoint                  | Description                      |
|--------|---------------------------|----------------------------------|
| POST   | /posts/batch              | 🔥 Batch insert with dedup      |
| POST   | /posts                    | Create single post               |
| GET    | /posts                    | Get all posts (paginated)        |
| GET    | /posts/stats              | Get statistics                   |
| GET    | /posts/unprocessed        | Get unprocessed posts            |
| GET    | /posts/:id                | Get single post                  |
| PATCH  | /posts/:id/processed      | Update processed status          |
| DELETE | /posts/:id                | Delete post                      |

---

## Chrome Extension Integration

Your extension should send data to:
```
POST http://localhost:3000/posts/batch
```

The backend will:
1. ✅ Validate all posts
2. ✅ Check for duplicates in database
3. ✅ Remove duplicates in the batch itself
4. ✅ Insert only new posts
5. ✅ Return counts of inserted/skipped

---

## Production Checklist

Before deploying:
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Run migrations: `pnpm run prisma:deploy`
- [ ] Add authentication/authorization
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Setup monitoring/logging
- [ ] Configure environment variables in hosting platform
- [ ] Test database backups

---

## Support

See `POSTS_MODULE_README.md` for detailed documentation.

Common issues:
1. TypeScript errors → Run `pnpm run prisma:generate`
2. Database errors → Check `DATABASE_URL` in `.env`
3. Migration errors → Run `pnpm run prisma:push` for quick fix
