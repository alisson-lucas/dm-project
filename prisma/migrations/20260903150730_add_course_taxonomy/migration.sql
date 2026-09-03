-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "category" TEXT,
ADD COLUMN     "instructor" TEXT,
ADD COLUMN     "level" "CourseLevel";
