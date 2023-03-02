/*
  Warnings:

  - You are about to drop the column `line_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ChatMessageLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `locale` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChatMessageLog" DROP CONSTRAINT "ChatMessageLog_userId_fkey";

-- DropIndex
DROP INDEX "User_line_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "line_id",
ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "locale" SET NOT NULL;

-- DropTable
DROP TABLE "ChatMessageLog";

-- CreateTable
CREATE TABLE "LineUser" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "picture" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ja',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LineUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineChatMessageLog" (
    "id" TEXT NOT NULL,
    "user_message" TEXT NOT NULL,
    "assistant_message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LineChatMessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LineUser_line_id_key" ON "LineUser"("line_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "LineChatMessageLog" ADD CONSTRAINT "LineChatMessageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "LineUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
