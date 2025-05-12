/*
  Warnings:

  - A unique constraint covering the columns `[affiliateId]` on the table `Associate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[enterpriseId,affiliateId]` on the table `Associate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Associate_affiliateId_key" ON "Associate"("affiliateId");

-- CreateIndex
CREATE UNIQUE INDEX "Associate_enterpriseId_affiliateId_key" ON "Associate"("enterpriseId", "affiliateId");
