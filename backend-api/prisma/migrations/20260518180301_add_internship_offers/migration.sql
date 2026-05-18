-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'CLOSED');

-- CreateTable
CREATE TABLE "InternshipOffer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "duration" TEXT,
    "startDate" TIMESTAMP(3),
    "requiredSkillsJson" JSONB,
    "optionalSkillsJson" JSONB,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipOffer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InternshipOffer" ADD CONSTRAINT "InternshipOffer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
