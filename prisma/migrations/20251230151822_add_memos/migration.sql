-- CreateTable
CREATE TABLE "memos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memos_userId_createdAt_idx" ON "memos"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
