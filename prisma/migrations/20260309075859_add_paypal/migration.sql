/*
  Warnings:

  - A unique constraint covering the columns `[paypalOrderId]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'PAYPAL';

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "paypalOrderId" TEXT,
ALTER COLUMN "stripeSessionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_paypalOrderId_key" ON "Donation"("paypalOrderId");
