/*
  Warnings:

  - A unique constraint covering the columns `[pesapalOrderId]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "pesapalOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_pesapalOrderId_key" ON "Donation"("pesapalOrderId");
