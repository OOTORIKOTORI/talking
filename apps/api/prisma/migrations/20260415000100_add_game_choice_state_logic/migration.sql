ALTER TABLE "game_choices"
ADD COLUMN     "condition" JSONB,
ADD COLUMN     "effects" JSONB,
ADD COLUMN     "alternateTargetNodeId" TEXT,
ADD COLUMN     "alternateCondition" JSONB;
