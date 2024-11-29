/*
  Warnings:

  - Added the required column `departmentId` to the `Designation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Designation" ADD COLUMN     "departmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
