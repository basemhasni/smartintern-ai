-- CreateEnum
CREATE TYPE "VectorOwnerType" AS ENUM ('CV', 'OFFER', 'CAREER_ADVICE', 'MOTIVATION_LETTER');

-- CreateTable
CREATE TABLE "VectorDocument" (
    "id" TEXT NOT NULL,
    "ownerType" "VectorOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "embeddingJson" JSONB NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VectorDocument_pkey" PRIMARY KEY ("id")
);
