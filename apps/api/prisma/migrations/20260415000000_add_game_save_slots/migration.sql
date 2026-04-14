-- CreateEnum
CREATE TYPE "GameSaveSlotType" AS ENUM ('MANUAL', 'AUTO', 'QUICK');

-- CreateTable
CREATE TABLE "game_saves" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slotType" "GameSaveSlotType" NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "title" TEXT,
    "payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_saves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_saves_gameId_userId_slotType_slotIndex_key" ON "game_saves"("gameId", "userId", "slotType", "slotIndex");

-- CreateIndex
CREATE INDEX "game_saves_userId_gameId_updatedAt_idx" ON "game_saves"("userId", "gameId", "updatedAt");

-- CreateIndex
CREATE INDEX "game_saves_gameId_slotType_updatedAt_idx" ON "game_saves"("gameId", "slotType", "updatedAt");

-- AddForeignKey
ALTER TABLE "game_saves" ADD CONSTRAINT "game_saves_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
