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
  readinessScore: number;
}

export interface AnalyzeInput {
  company: string;
  role: string;
  jdText: string;
}