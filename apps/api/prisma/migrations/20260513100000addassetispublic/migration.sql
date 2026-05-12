-- Add Asset public/private flag (MVP)
ALTER TABLE "assets"
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "assets_ownerId_isPublic_idx"
ON "assets"("ownerId", "isPublic");
