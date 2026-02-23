-- AlterTable
ALTER TABLE "AthleteProfile" ADD COLUMN     "profileViews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_SavedOpportunities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SavedOpportunities_AB_unique" ON "_SavedOpportunities"("A", "B");

-- CreateIndex
CREATE INDEX "_SavedOpportunities_B_index" ON "_SavedOpportunities"("B");

-- AddForeignKey
ALTER TABLE "_SavedOpportunities" ADD CONSTRAINT "_SavedOpportunities_A_fkey" FOREIGN KEY ("A") REFERENCES "AthleteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedOpportunities" ADD CONSTRAINT "_SavedOpportunities_B_fkey" FOREIGN KEY ("B") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
