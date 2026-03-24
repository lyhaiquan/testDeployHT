-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "author" TEXT,
    "keywords" TEXT[],
    "isJob" BOOLEAN NOT NULL DEFAULT false,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_link_key" ON "posts"("link");

-- CreateIndex
CREATE INDEX "posts_link_idx" ON "posts"("link");

-- CreateIndex
CREATE INDEX "posts_processed_idx" ON "posts"("processed");

-- CreateIndex
CREATE INDEX "posts_isJob_idx" ON "posts"("isJob");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt");
