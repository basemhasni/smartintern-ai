export type RecommendedProject = {
    title: string;
    description?: string | null;
    skillsCovered: string[];
    difficulty?: string | null;
    estimatedTime?: string | null;
    portfolioValue?: string | null;
    deliverables: string[];
};
