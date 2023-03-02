/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[line_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `line_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "line_id" TEXT NOT NULL,
ALTER COLUMN "locale" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChatMessageLog" (
    "id" TEXT NOT NULL,
    "user_message" TEXT NOT NULL,
    "assistant_message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ChatMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_line_id_key" ON "User"("line_id");

-- AddForeignKey
ALTER TABLE "ChatMessageLog" ADD CONSTRAINT "ChatMessageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
