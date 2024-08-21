-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_taskId_fkey";

-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_taskId_fkey";

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "UserTasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
