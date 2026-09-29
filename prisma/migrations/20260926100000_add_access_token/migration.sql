-- CreateEnum
CREATE TYPE "AccessTokenPurpose" AS ENUM ('FIRST_ACCESS', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "access_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "purpose" "AccessTokenPurpose" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "access_tokens_token_hash_key" ON "access_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "access_tokens_user_id_idx" ON "access_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "access_tokens" ADD CONSTRAINT "access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
