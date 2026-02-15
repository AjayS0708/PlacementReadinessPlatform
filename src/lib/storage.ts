import { enrichAnalysisEntry } from './analysis';
import { AnalysisEntry, ExtractedSkills, SkillConfidenceMap } from '../types/analysis';

const HISTORY_KEY = 'placement_readiness_history_v1';
const LATEST_KEY = 'placement_readiness_latest_v1';
const SELECTED_ID_KEY = 'placement_readiness_selected_id_v1';

interface HistoryLoadResult {
  entries: AnalysisEntry[];
  hadCorrupted: boolean;
}

function safeParseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeExtractedSkills(raw: Record<string, unknown>): ExtractedSkills {
  const legacy = isObject(raw.extractedSkills) ? raw.extractedSkills : {};

  return {
    coreCS: toStringArray(legacy.coreCS ?? legacy['Core CS']),
    languages: toStringArray(legacy.languages ?? legacy.Languages),
    web: toStringArray(legacy.web ?? legacy.Web),
    data: toStringArray(legacy.data ?? legacy.Data),
    cloud: toStringArray(legacy.cloud ?? legacy['Cloud/DevOps']),
    testing: toStringArray(legacy.testing ?? legacy.Testing),
    other: toStringArray(legacy.other ?? legacy.General),
  };
}

function normalizeSkillConfidenceMap(raw: Record<string, unknown>, extractedSkills: ExtractedSkills): SkillConfidenceMap {
  const mapSource = isObject(raw.skillConfidenceMap) ? raw.skillConfidenceMap : {};
  const map: SkillConfidenceMap = {};

  [...extractedSkills.coreCS, ...extractedSkills.languages, ...extractedSkills.web, ...extractedSkills.data, ...extractedSkills.cloud, ...extractedSkills.testing, ...extractedSkills.other].forEach((skill) => {
    const value = mapSource[skill];
    map[skill] = value === 'know' ? 'know' : 'practice';
  });

  return map;
}

function normalizeEntry(raw: unknown): AnalysisEntry | null {
  if (!isObject(raw)) return null;

  const id = typeof raw.id === 'string' && raw.id ? raw.id : '';
  const createdAt = typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : '';
  const jdText = typeof raw.jdText === 'string' ? raw.jdText.trim() : '';
  if (!id || !createdAt || !jdText) return null;

  const extractedSkills = normalizeExtractedSkills(raw);
  const checklistRaw = Array.isArray(raw.checklist) ? raw.checklist : [];
  const checklist = checklistRaw
    .map((item) => {
      if (!isObject(item)) return null;
      const roundTitle = typeof item.roundTitle === 'string' ? item.roundTitle : typeof item.title === 'string' ? item.title : '';
      if (!roundTitle) return null;
      return { roundTitle, items: toStringArray(item.items) };
    })
    .filter((item): item is { roundTitle: string; items: string[] } => Boolean(item));

  const planRaw = Array.isArray(raw.plan7Days) ? raw.plan7Days : Array.isArray(raw.plan) ? raw.plan : [];
  const plan7Days = planRaw
    .map((item) => {
      if (!isObject(item)) return null;
      const day = typeof item.day === 'string' ? item.day : '';
      const focus = typeof item.focus === 'string' ? item.focus : '';
      const tasks = toStringArray(item.tasks ?? item.items);
      if (!day || !focus) return null;
      return { day, focus, tasks };
    })
    .filter((item): item is { day: string; focus: string; tasks: string[] } => Boolean(item));

  const roundRaw = Array.isArray(raw.roundMapping) ? raw.roundMapping : [];
  const roundMapping = roundRaw
    .map((item) => {
      if (!isObject(item)) return null;
      const roundTitle = typeof item.roundTitle === 'string'
        ? item.roundTitle
        : typeof item.round === 'string' && typeof item.title === 'string'
          ? `${item.round}: ${item.title}`
          : '';
      const focusAreas = toStringArray(item.focusAreas ?? (typeof item.focus === 'string' ? [item.focus] : []));
      const whyItMatters = typeof item.whyItMatters === 'string'
        ? item.whyItMatters
        : typeof item.whyThisMatters === 'string'
          ? item.whyThisMatters
          : '';
      if (!roundTitle) return null;
      return { roundTitle, focusAreas, whyItMatters };
    })
    .filter((item): item is { roundTitle: string; focusAreas: string[]; whyItMatters: string } => Boolean(item));

  const baseScore = typeof raw.baseScore === 'number'
    ? raw.baseScore
    : typeof raw.baseReadinessScore === 'number'
      ? raw.baseReadinessScore
      : typeof raw.readinessScore === 'number'
        ? raw.readinessScore
        : 35;

  const finalScore = typeof raw.finalScore === 'number'
    ? raw.finalScore
    : typeof raw.readinessScore === 'number'
      ? raw.readinessScore
      : baseScore;

  const normalized: AnalysisEntry = {
    id,
    createdAt,
    company: typeof raw.company === 'string' ? raw.company : '',
    role: typeof raw.role === 'string' ? raw.role : '',
    jdText,
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions: toStringArray(raw.questions),
    baseScore,
    skillConfidenceMap: normalizeSkillConfidenceMap(raw, extractedSkills),
    finalScore,
    updatedAt: typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : createdAt,
    companyIntel: isObject(raw.companyIntel)
      ? {
          companyName: typeof raw.companyIntel.companyName === 'string' ? raw.companyIntel.companyName : '',
          industry: typeof raw.companyIntel.industry === 'string' ? raw.companyIntel.industry : 'Technology Services',
          sizeCategory:
            raw.companyIntel.sizeCategory === 'Enterprise' ||
            raw.companyIntel.sizeCategory === 'Mid-size' ||
            raw.companyIntel.sizeCategory === 'Startup'
              ? raw.companyIntel.sizeCategory
              : 'Startup',
          hiringFocus: typeof raw.companyIntel.hiringFocus === 'string' ? raw.companyIntel.hiringFocus : '',
          demoNote: typeof raw.companyIntel.demoNote === 'string' ? raw.companyIntel.demoNote : 'Demo Mode: Company intel generated heuristically.',
        }
      : undefined,
  };

  return enrichAnalysisEntry(normalized);
}

function loadHistoryState(): HistoryLoadResult {
  const parsed = safeParseJson(localStorage.getItem(HISTORY_KEY));
  if (!Array.isArray(parsed)) {
    return { entries: [], hadCorrupted: parsed !== null };
  }

  let hadCorrupted = false;
  const entries: AnalysisEntry[] = [];

  parsed.forEach((item) => {
    const normalized = normalizeEntry(item);
    if (!normalized) {
      hadCorrupted = true;
      return;
    }
    entries.push(normalized);
  });

  return { entries, hadCorrupted };
}

export function getHistory(): AnalysisEntry[] {
  return loadHistoryState().entries;
}

export function getHistoryWithStatus(): HistoryLoadResult {
  return loadHistoryState();
}

export function saveHistory(entries: AnalysisEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function saveAnalysisEntry(entry: AnalysisEntry): void {
  const normalized = normalizeEntry(entry) || entry;
  const current = getHistory();
  const next = [normalized, ...current.filter((item) => item.id !== normalized.id)];
  saveHistory(next);
  localStorage.setItem(LATEST_KEY, JSON.stringify(normalized));
  setSelectedAnalysisId(normalized.id);
}

export function updateAnalysisEntry(entry: AnalysisEntry): void {
  const normalized = normalizeEntry(entry) || entry;
  const current = getHistory();
  const exists = current.some((item) => item.id === normalized.id);
  const next = exists
    ? current.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...current];

  saveHistory(next);
  localStorage.setItem(LATEST_KEY, JSON.stringify(normalized));
}

export function getLatestAnalysis(): AnalysisEntry | null {
  const normalized = normalizeEntry(safeParseJson(localStorage.getItem(LATEST_KEY)));
  return normalized;
}

export function setSelectedAnalysisId(id: string): void {
  localStorage.setItem(SELECTED_ID_KEY, id);
}

export function getSelectedAnalysisId(): string | null {
  return localStorage.getItem(SELECTED_ID_KEY);
}

export function clearSelectedAnalysisId(): void {
  localStorage.removeItem(SELECTED_ID_KEY);
}

export function getAnalysisById(id: string): AnalysisEntry | null {
  return getHistory().find((item) => item.id === id) || null;
}

export function getSelectedOrLatestAnalysis(): AnalysisEntry | null {
  const selectedId = getSelectedAnalysisId();
  if (selectedId) {
    const selected = getAnalysisById(selectedId);
    if (selected) return selected;
  }

  return getLatestAnalysis();
}