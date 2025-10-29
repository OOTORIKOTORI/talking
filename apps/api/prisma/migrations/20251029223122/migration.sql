-- CreateEnum
CREATE TYPE "CharacterEmotion" AS ENUM ('NEUTRAL', 'HAPPY', 'SAD', 'ANGRY', 'SURPRISED', 'FEAR', 'DISGUST', 'SHY', 'SLEEPY', 'THINKING', 'OTHER');

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_images" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "thumbKey" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "contentType" TEXT NOT NULL,
    "size" INTEGER,
    "emotion" "CharacterEmotion" NOT NULL DEFAULT 'NEUTRAL',
    "emotionLabel" TEXT,
    "pattern" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "characters_ownerId_createdAt_idx" ON "characters"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "character_images_characterId_sortOrder_idx" ON "character_images"("characterId", "sortOrder");

-- AddForeignKey
ALTER TABLE "character_images" ADD CONSTRAINT "character_images_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
