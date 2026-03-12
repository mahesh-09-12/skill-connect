/*
  Warnings:

  - The primary key for the `CommunityMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CommunityMember` table. All the data in the column will be lost.
  - The `role` column on the `CommunityMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Enrollment` table. All the data in the column will be lost.
  - Changed the type of `type` on the `CoinTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EARN', 'SPEND');

-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('MEMBER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "Discussion" DROP CONSTRAINT "Discussion_communityId_fkey";

-- DropIndex
DROP INDEX "CommunityMember_userId_communityId_key";

-- DropIndex
DROP INDEX "Enrollment_userId_courseId_key";

-- AlterTable
ALTER TABLE "CoinTransaction" DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CommunityMember" DROP CONSTRAINT "CommunityMember_pkey",
DROP COLUMN "id",
DROP COLUMN "role",
ADD COLUMN     "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
ADD CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("userId", "communityId");

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "priceInCoins" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Discussion" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
DROP COLUMN "id",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("userId", "courseId");

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "coinBalance" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
