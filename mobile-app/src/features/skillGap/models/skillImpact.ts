export type SkillImpact = {
    skill: string;
    gapType?: string | null;
    currentEvidenceLevel?: string | null;
    targetEvidenceLevel?: string | null;
    currentCoverage?: number;
    estimatedScoreGain?: number;
    priority?: string | null;
    reason?: string | null;
    category?: string | null;
};
