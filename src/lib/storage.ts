import { AnalysisEntry } from '../types/analysis';

const HISTORY_KEY = 'placement_readiness_history_v1';
const LATEST_KEY = 'placement_readiness_latest_v1';
const SELECTED_ID_KEY = 'placement_readiness_selected_id_v1';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getHistory(): AnalysisEntry[] {
  return safeParse<AnalysisEntry[]>(localStorage.getItem(HISTORY_KEY), []);
}

export function saveHistory(entries: AnalysisEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function saveAnalysisEntry(entry: AnalysisEntry): void {
  const current = getHistory();
  const next = [entry, ...current.filter((item) => item.id !== entry.id)];
  saveHistory(next);
  localStorage.setItem(LATEST_KEY, JSON.stringify(entry));
  setSelectedAnalysisId(entry.id);
}

export function updateAnalysisEntry(entry: AnalysisEntry): void {
  const current = getHistory();
  const exists = current.some((item) => item.id === entry.id);
  const next = exists
    ? current.map((item) => (item.id === entry.id ? entry : item))
    : [entry, ...current];

  saveHistory(next);
  localStorage.setItem(LATEST_KEY, JSON.stringify(entry));
}

export function getLatestAnalysis(): AnalysisEntry | null {
  return safeParse<AnalysisEntry | null>(localStorage.getItem(LATEST_KEY), null);
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
