-- DropIndex
DROP INDEX "Users_name_key";

-- AlterTable
ALTER TABLE "DsaSubmissions" ALTER COLUMN "submitted_at" SET DEFAULT CURRENT_TIMESTAMP;
