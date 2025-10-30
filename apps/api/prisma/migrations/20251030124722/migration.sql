-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
