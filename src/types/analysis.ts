export const CATEGORY_ORDER = [
  'Core CS',
  'Languages',
  'Web',
  'Data',
  'Cloud/DevOps',
  'Testing',
] as const;

export type SkillCategory = (typeof CATEGORY_ORDER)[number];
export type SkillConfidence = 'know' | 'practice';
export type SkillConfidenceMap = Record<string, SkillConfidence>;
export type CompanySizeCategory = 'Startup' | 'Mid-size' | 'Enterprise';

export interface ExtractedSkills {
  coreCS: string[];
  languages: string[];
  web: string[];
  data: string[];
  cloud: string[];
  testing: string[];
  other: string[];
}

export interface CompanyIntel {
  companyName: string;
  industry: string;
  sizeCategory: CompanySizeCategory;
  hiringFocus: string;
  demoNote: string;
}

export interface RoundMapItem {
  roundTitle: string;
  focusAreas: string[];
  whyItMatters: string;
}

export interface ChecklistRound {
  roundTitle: string;
  items: string[];
}

export interface DayPlan {
  day: string;
  focus: string;
  tasks: string[];
}

export interface AnalysisEntry {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkills;
  roundMapping: RoundMapItem[];
  checklist: ChecklistRound[];
  plan7Days: DayPlan[];
  questions: string[];
  baseScore: number;
  skillConfidenceMap: SkillConfidenceMap;
  finalScore: number;
  updatedAt: string;
  companyIntel?: CompanyIntel;
}

export interface AnalyzeInput {
  company: string;
  role: string;
  jdText: string;
}

export const SKILL_SECTION_CONFIG = [
  { key: 'coreCS', label: 'Core CS' },
  { key: 'languages', label: 'Languages' },
  { key: 'web', label: 'Web' },
  { key: 'data', label: 'Data' },
  { key: 'cloud', label: 'Cloud/DevOps' },
  { key: 'testing', label: 'Testing' },
] as const;

export type SkillSectionKey = (typeof SKILL_SECTION_CONFIG)[number]['key'];