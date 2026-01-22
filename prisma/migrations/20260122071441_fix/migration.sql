/*
  Warnings:

  - Made the column `points` on table `McqQuestions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "McqQuestions" ALTER COLUMN "points" SET NOT NULL;
