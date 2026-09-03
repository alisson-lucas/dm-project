-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "last_lesson_id" TEXT,
ADD COLUMN     "last_watched_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "enrollments_user_id_last_watched_at_idx" ON "enrollments"("user_id", "last_watched_at");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_last_lesson_id_fkey" FOREIGN KEY ("last_lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
