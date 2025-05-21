-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('teacher', 'student');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRoleEnum" DEFAULT 'student',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completeTaks" (
    "id" SERIAL NOT NULL,
    "completedTaskId" INTEGER NOT NULL,
    "assignTold" INTEGER NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "completeTaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completeTaks" ADD CONSTRAINT "completeTaks_completedTaskId_fkey" FOREIGN KEY ("completedTaskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completeTaks" ADD CONSTRAINT "completeTaks_assignTold_fkey" FOREIGN KEY ("assignTold") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
