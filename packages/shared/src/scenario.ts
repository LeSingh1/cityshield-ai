export type Recommendation = {
  id: string;
  title: string;
  action: string;
  priority: number;
  confidence: number;
  rationale: string;
  expectedBenefits: string[];
};

export type ImpactSummary = {
  ambulanceEtaReductionPct: number;
  queueLengthReductionPct: number;
  exposureReductionPct: number;
  energyShiftKw: number;
};

