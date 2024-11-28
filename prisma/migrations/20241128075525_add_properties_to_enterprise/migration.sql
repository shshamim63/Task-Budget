/*
  Warnings:

  - A unique constraint covering the columns `[registrationNumber]` on the table `Enterprise` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Enterprise" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "establishedAt" TIMESTAMP(3),
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_registrationNumber_key" ON "Enterprise"("registrationNumber");
