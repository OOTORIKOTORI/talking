-- Add manual credit columns to game_credits
ALTER TABLE "game_credits"
  ADD COLUMN "manualRole" TEXT,
  ADD COLUMN "manualUrl" TEXT,
  ADD COLUMN "manualNote" TEXT;
