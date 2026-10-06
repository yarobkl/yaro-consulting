export type PriorityLevel = 'chaud' | 'tiede' | 'froid';

export type RecommendedOffer =
  | 'presence_digitale_premium'
  | 'systeme_business_digital'
  | 'agent_ia_sur_mesure'
  | 'maintenance_optimisation'
  | 'diagnostic';

export type Lead = {
  firstName?: string;
  lastName?: string;
  company?: string;
  sector?: string;
  mainNeed?: string;
  currentProblem?: string;
  businessGoal?: string;
  currentTools?: string;
  repetitiveTasks?: string;
  recommendedSolution?: string;
  recommendedOffer?: RecommendedOffer;
  budget?: string;
  timeline?: string;
  decisionMaker?: string;
  preferredContact?: string;
  email?: string;
  phone?: string;
  consentToContact?: boolean;
  priorityLevel?: PriorityLevel;
  teamSummary?: string;
  nextAction?: string;
  rawSummary?: string;
  createdAt?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
