export const CATEGORY_ORDER = [
  'Core CS',
  'Languages',
  'Web',
  'Data',
  'Cloud/DevOps',
  'Testing',
] as const;

export type SkillCategory = (typeof CATEGORY_ORDER)[number] | 'General';

export type ExtractedSkills = Record<SkillCategory, string[]>;
export type SkillConfidence = 'know' | 'practice';
export type SkillConfidenceMap = Record<string, SkillConfidence>;
export type CompanySizeCategory = 'Startup' | 'Mid-size' | 'Enterprise';

export interface CompanyIntel {
  companyName: string;
  industry: string;
  sizeCategory: CompanySizeCategory;
  hiringFocus: string;
  demoNote: string;
}

export interface RoundMapItem {
  round: string;
  title: string;
  focus: string;
  whyThisMatters: string;
}

export interface ChecklistRound {
  title: string;
  items: string[];
}

export interface DayPlan {
  day: string;
  focus: string;
  items: string[];
}

export interface AnalysisEntry {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkills;
  plan: DayPlan[];
  checklist: ChecklistRound[];
  questions: string[];
  baseReadinessScore?: number;
  readinessScore: number;
  skillConfidenceMap?: SkillConfidenceMap;
  companyIntel?: CompanyIntel;
  roundMapping?: RoundMapItem[];
}

export interface AnalyzeInput {
  company: string;
  role: string;
  jdText: string;
}
