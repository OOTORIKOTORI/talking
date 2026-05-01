-- Make targetNodeId nullable and migrate legacy empty-string unset values.
ALTER TABLE "game_choices"
ALTER COLUMN "targetNodeId" DROP NOT NULL;

UPDATE "game_choices"
SET "targetNodeId" = NULL
WHERE "targetNodeId" = '';
