/*
  Warnings:

  - You are about to drop the `UserTasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_memberId_fkey";

-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_taskId_fkey";

-- DropTable
DROP TABLE "UserTasks";

-- CreateTable
CREATE TABLE "UserTask" (
    "memberId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserTask_pkey" PRIMARY KEY ("memberId","taskId")
);

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
