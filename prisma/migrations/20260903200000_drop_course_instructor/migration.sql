-- AlterTable
-- A plataforma tem um professor só: os dados dele passaram pra
-- src/lib/site.ts (TEACHER), então a coluna por curso saiu.
ALTER TABLE "courses" DROP COLUMN "instructor";
