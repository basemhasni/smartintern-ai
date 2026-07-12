export type SingleSkillSimulation = {
    skill: string;
    beforeScore?: number;
    afterScore?: number;
    gain?: number;
    beforeEvidenceLevel?: string | null;
    afterEvidenceLevel?: string | null;
    assumption?: string | null;
    impactExplanation?: string | null;
    confidence?: string | null;
    scoreCapsApplied: ScoreCap[];
};
export type CombinationSimulation = {
    skills: string[];
    beforeScore?: number;
    afterScore?: number;
    gain?: number;
    decisionLabelAfter?: string | null;
    reason?: string | null;
    confidence?: string | null;
    scoreCapsApplied: ScoreCap[];
};
export type ScoreCap = {
    cap?: number;
    reason?: string | null;
};
