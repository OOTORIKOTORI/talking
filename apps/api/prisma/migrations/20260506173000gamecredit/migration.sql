-- CreateEnum
CREATE TYPE "GameCreditKind" AS ENUM ('ASSET', 'CHARACTER', 'MANUAL');

-- CreateTable
CREATE TABLE "game_credits" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "kind" "GameCreditKind" NOT NULL,
    "assetId" TEXT,
    "characterId" TEXT,
    "label" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "ownerDisplayNameSnapshot" TEXT,
    "sourceNameSnapshot" TEXT,
    "usageTermsSnapshot" TEXT,
    "creditRequiredSnapshot" BOOLEAN,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_credits_gameId_kind_sortOrder_idx" ON "game_credits"("gameId", "kind", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "game_credits_gameId_kind_assetId_key" ON "game_credits"("gameId", "kind", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "game_credits_gameId_kind_characterId_key" ON "game_credits"("gameId", "kind", "characterId");

-- AddForeignKey
ALTER TABLE "game_credits" ADD CONSTRAINT "game_credits_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
