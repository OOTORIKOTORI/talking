-- AddColumn: staffRollSpeedPreset to game_projects
ALTER TABLE "game_projects" ADD COLUMN IF NOT EXISTS "staffRollSpeedPreset" TEXT NOT NULL DEFAULT 'normal';
