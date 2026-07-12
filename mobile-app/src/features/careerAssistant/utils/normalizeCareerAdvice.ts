import type { CareerAdviceResult, CareerPriority, CareerProject, CareerRagSource, InterviewPreparationTip, LearningRoadmapStep } from '../models/careerAdvice';

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;
const texts = (value: unknown): string[] => list(value).map(text).filter((item): item is string => Boolean(item));
const number = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const priority = (value: unknown): CareerPriority => {
  const item = record(value);
  return { skill: text(item.skill), priority: text(item.priority), gapType: text(item.gapType), reason: text(item.reason), impactOnMatching: text(item.impactOnMatching), currentEvidence: texts(item.currentEvidence), suggestedActions: texts(item.suggestedActions ?? item.actions) };
};

const roadmap = (value: unknown): LearningRoadmapStep => {
  const item = record(value);
  return { period: text(item.period), objective: text(item.objective), actions: texts(item.actions), targetSkills: texts(item.targetSkills ?? item.skills), expectedOutcome: text(item.expectedOutcome) };
};

const project = (value: unknown): CareerProject => {
  const item = record(value);
  return { title: text(item.title), skillsCovered: texts(item.skillsCovered ?? item.skills), difficulty: text(item.difficulty), estimatedTime: text(item.estimatedTime ?? item.duration), description: text(item.description ?? item.objective), deliverables: texts(item.deliverables), portfolioValue: text(item.portfolioValue ?? item.evidenceExpected) };
};

const interviewTip = (value: unknown): InterviewPreparationTip => {
  const item = record(value);
  return { topic: text(item.topic ?? item.category), tip: text(item.tip ?? item.preparation ?? item.question), basedOn: text(item.basedOn ?? item.reason ?? item.expectedEvidence) };
};

const source = (value: unknown): CareerRagSource => {
  const item = record(value);
  return { title: text(item.title), sourceType: text(item.sourceType), ownerType: text(item.ownerType), score: number(item.score), snippet: text(item.snippet) };
};

export function normalizeCareerAdvice(value: unknown): CareerAdviceResult {
  const root = record(value);
  const advice = record(root.careerAdvice ?? root.data ?? value);
  const v2 = record(advice.v2);
  const ragContext = record(root.ragContext);
  const priorities = list(v2.priorityFocus).length ? list(v2.priorityFocus) : list(advice.skillsToImprove);
  const roadmapItems = list(v2.learningRoadmap).length ? list(v2.learningRoadmap) : list(advice.actionPlan);
  const citations = list(v2.ragCitations).length ? list(v2.ragCitations) : list(ragContext.documents);

  return {
    profileSummary: text(advice.profileSummary),
    matchingScore: number(advice.matchingScore),
    strengths: texts(advice.strengths),
    finalAdvice: text(advice.finalAdvice),
    readinessLevel: text(v2.readinessLevel),
    confidence: text(v2.confidence),
    decisionLabel: text(v2.decisionLabel),
    questionIntent: text(v2.questionIntent),
    answeredQuestion: text(v2.answeredQuestion),
    directAnswer: text(v2.directAnswer),
    priorityFocus: priorities.map(priority),
    criticalGaps: list(v2.criticalGaps).map(priority),
    learningRoadmap: roadmapItems.map(roadmap),
    cvImprovementTips: texts(v2.cvImprovementTips),
    recommendedProjects: list(v2.recommendedProjects).map(project),
    interviewPreparationTips: list(v2.interviewPreparationTips).map(interviewTip),
    warnings: texts(v2.warnings),
    ragWarnings: texts(v2.ragWarnings),
    sources: citations.map(source).filter((item) => item.title),
    ragContextUsed: Boolean(v2.ragContextUsed ?? ragContext.used),
  };
}
