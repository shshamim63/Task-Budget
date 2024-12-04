/*
  Warnings:

  - A unique constraint covering the columns `[departmentId,designationId,enterpriseId,affiliateId]` on the table `Associate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Associate_enterpriseId_affiliateId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Associate_departmentId_designationId_enterpriseId_affiliate_key" ON "Associate"("departmentId", "designationId", "enterpriseId", "affiliateId");
