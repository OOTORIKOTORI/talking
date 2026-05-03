-- Add public game engagement counters (MVP)
ALTER TABLE "game_projects"
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "playCount" INTEGER NOT NULL DEFAULT 0;
