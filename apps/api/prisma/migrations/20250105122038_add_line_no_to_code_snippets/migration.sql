/*
  Warnings:

  - Added the required column `lineNo` to the `CodeSnippet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeSnippet" ADD COLUMN     "lineNo" INTEGER NOT NULL;
