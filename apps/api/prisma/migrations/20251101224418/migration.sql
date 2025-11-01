-- CreateTable
CREATE TABLE "favorite_characters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_characters_userId_createdAt_idx" ON "favorite_characters"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_characters_userId_characterId_key" ON "favorite_characters"("userId", "characterId");

-- AddForeignKey
ALTER TABLE "favorite_characters" ADD CONSTRAINT "favorite_characters_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
