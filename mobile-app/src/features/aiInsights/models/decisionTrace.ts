export type DecisionTraceItem = {
  step?: string | null;
  title?: string | null;
  status?: string | null;
  summary?: string | null;
  details: string[];
};
