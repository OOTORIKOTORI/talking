-- AddColumn snapshotLockedAt to game_credits
ALTER TABLE "game_credits" ADD COLUMN "snapshotLockedAt" TIMESTAMP(3);

-- Add index for common queries
CREATE INDEX "game_credits_gameId_snapshotLockedAt_idx" ON "game_credits"("gameId", "snapshotLockedAt");
