/*
  Warnings:

  - You are about to drop the column `language` on the `File` table. All the data in the column will be lost.
  - Added the required column `language` to the `CodeSnippet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeSnippet" ADD COLUMN     "language" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "language";
