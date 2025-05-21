/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "completeTaskStatus" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "notification";
