-- AlterTable: Add usageTerms and creditRequired to Asset
ALTER TABLE "assets" ADD COLUMN "usageTerms" TEXT;
ALTER TABLE "assets" ADD COLUMN "creditRequired" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Add usageTerms and creditRequired to Character
ALTER TABLE "characters" ADD COLUMN "usageTerms" TEXT;
ALTER TABLE "characters" ADD COLUMN "creditRequired" BOOLEAN NOT NULL DEFAULT true;
