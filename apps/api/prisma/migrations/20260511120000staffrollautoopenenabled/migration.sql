-- Add staff-roll auto-open toggle setting (default OFF to keep existing behavior)
ALTER TABLE "game_projects"
ADD COLUMN "staffRollAutoOpenEnabled" BOOLEAN NOT NULL DEFAULT false;
