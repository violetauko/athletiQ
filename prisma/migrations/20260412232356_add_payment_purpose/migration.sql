-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('MARKETPLACE_PURCHASE', 'REGISTRATION_FEE');

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "purpose" "PaymentPurpose" NOT NULL DEFAULT 'REGISTRATION_FEE';

-- CreateIndex
CREATE INDEX "Payment_purpose_idx" ON "Payment"("purpose");
