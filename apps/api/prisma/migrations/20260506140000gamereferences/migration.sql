-- CreateTable
CREATE TABLE "game_asset_references" (
    "gameId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "fields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_asset_references_pkey" PRIMARY KEY ("gameId","assetId")
);

-- CreateTable
CREATE TABLE "game_character_references" (
    "gameId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "fields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_character_references_pkey" PRIMARY KEY ("gameId","characterId")
);

-- CreateIndex
CREATE INDEX "game_asset_references_assetId_idx" ON "game_asset_references"("assetId");

-- CreateIndex
CREATE INDEX "game_character_references_characterId_idx" ON "game_character_references"("characterId");

-- AddForeignKey
ALTER TABLE "game_asset_references" ADD CONSTRAINT "game_asset_references_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_character_references" ADD CONSTRAINT "game_character_references_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
