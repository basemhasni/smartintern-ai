-- CreateTable
CREATE TABLE "MatchingResult" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "matchedSkillsJson" JSONB,
    "missingSkillsJson" JSONB,
    "optionalMatchedSkillsJson" JSONB,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchingResult_studentId_offerId_key" ON "MatchingResult"("studentId", "offerId");

-- AddForeignKey
ALTER TABLE "MatchingResult" ADD CONSTRAINT "MatchingResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingResult" ADD CONSTRAINT "MatchingResult_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "InternshipOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
