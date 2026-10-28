CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'archived';

ALTER TABLE "User" ADD COLUMN "externalId" UUID;
UPDATE "User" SET "externalId" = gen_random_uuid() WHERE "externalId" IS NULL;
ALTER TABLE "User"
  ALTER COLUMN "externalId" SET NOT NULL,
  ALTER COLUMN "externalId" SET DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

ALTER TABLE "Membership" RENAME TO "ProjectMembership";

CREATE INDEX "Project_status_createdAt_id_idx"
  ON "Project"("status", "createdAt", "id");
