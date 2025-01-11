/*
  Warnings:

  - You are about to drop the column `language` on the `CodeSnippet` table. All the data in the column will be lost.
  - Added the required column `language` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeSnippet" DROP COLUMN "language";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "language" TEXT NOT NULL;
