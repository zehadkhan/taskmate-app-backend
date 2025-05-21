/*
  Warnings:

  - You are about to drop the `completeTaks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assignUser` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "completeTaks" DROP CONSTRAINT "completeTaks_assignTold_fkey";

-- DropForeignKey
ALTER TABLE "completeTaks" DROP CONSTRAINT "completeTaks_completedTaskId_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assignUser" INTEGER NOT NULL;

-- DropTable
DROP TABLE "completeTaks";

-- CreateTable
CREATE TABLE "completeTasks" (
    "id" SERIAL NOT NULL,
    "completedTaskId" INTEGER NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,

    CONSTRAINT "completeTasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignUser_fkey" FOREIGN KEY ("assignUser") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completeTasks" ADD CONSTRAINT "completeTasks_completedTaskId_fkey" FOREIGN KEY ("completedTaskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completeTasks" ADD CONSTRAINT "completeTasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
