/*
  Warnings:

  - A unique constraint covering the columns `[gmailId]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gmailId` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedAt` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "gmailId" TEXT NOT NULL,
ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Email_gmailId_key" ON "Email"("gmailId");
