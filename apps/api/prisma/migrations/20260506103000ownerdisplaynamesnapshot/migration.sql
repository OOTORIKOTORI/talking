-- AlterTable: Add owner display name snapshot columns
ALTER TABLE "assets" ADD COLUMN "ownerDisplayNameSnapshot" TEXT;
ALTER TABLE "characters" ADD COLUMN "ownerDisplayNameSnapshot" TEXT;
ALTER TABLE "game_projects" ADD COLUMN "ownerDisplayNameSnapshot" TEXT;

-- Backfill from current creator profiles (trim empty string to NULL)
UPDATE "assets" AS a
SET "ownerDisplayNameSnapshot" = NULLIF(BTRIM(cp."displayName"), '')
FROM "creator_profiles" AS cp
WHERE a."ownerId" = cp."userId"
  AND a."ownerDisplayNameSnapshot" IS NULL;

UPDATE "characters" AS c
SET "ownerDisplayNameSnapshot" = NULLIF(BTRIM(cp."displayName"), '')
FROM "creator_profiles" AS cp
WHERE c."ownerId" = cp."userId"
  AND c."ownerDisplayNameSnapshot" IS NULL;

UPDATE "game_projects" AS g
SET "ownerDisplayNameSnapshot" = NULLIF(BTRIM(cp."displayName"), '')
FROM "creator_profiles" AS cp
WHERE g."ownerId" = cp."userId"
  AND g."ownerDisplayNameSnapshot" IS NULL;
