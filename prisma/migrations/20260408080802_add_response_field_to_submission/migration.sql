-- AlterTable
ALTER TABLE "ContactSubmission" ADD COLUMN     "response" TEXT,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
