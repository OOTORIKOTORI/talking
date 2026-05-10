-- Add staff roll setting to game projects
ALTER TABLE "game_projects"
  ADD COLUMN "staffRollEnabled" BOOLEAN NOT NULL DEFAULT true;
