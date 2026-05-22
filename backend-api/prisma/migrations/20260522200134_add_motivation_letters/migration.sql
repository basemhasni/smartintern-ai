-- CreateTable
CREATE TABLE "MotivationLetter" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "content" TEXT NOT NULL,
    "generatedByAI" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotivationLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MotivationLetter_applicationId_key" ON "MotivationLetter"("applicationId");

-- AddForeignKey
ALTER TABLE "MotivationLetter" ADD CONSTRAINT "MotivationLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotivationLetter" ADD CONSTRAINT "MotivationLetter_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotivationLetter" ADD CONSTRAINT "MotivationLetter_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "InternshipOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
