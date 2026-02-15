export interface TestChecklistItem {
  id: string;
  label: string;
  hint?: string;
}

export const TEST_CHECKLIST_ITEMS: TestChecklistItem[] = [
  {
    id: 'jd_required_validation',
    label: 'JD required validation works',
    hint: 'Try Analyze with empty JD and confirm validation blocks submission.',
  },
  {
    id: 'short_jd_warning',
    label: 'Short JD warning shows for <200 chars',
    hint: 'Paste 1-199 characters and check for the calm warning message.',
  },
  {
    id: 'skill_grouping',
    label: 'Skills extraction groups correctly',
    hint: 'Use a mixed-stack JD and verify skills appear in the right category buckets.',
  },
  {
    id: 'round_mapping_dynamic',
    label: 'Round mapping changes based on company + skills',
    hint: 'Compare one Enterprise+DSA JD vs one Startup+React/Node JD.',
  },
  {
    id: 'deterministic_score',
    label: 'Score calculation is deterministic',
    hint: 'Analyze same JD twice and verify base score remains identical.',
  },
  {
    id: 'toggle_live_score',
    label: 'Skill toggles update score live',
    hint: 'Toggle one skill from Need practice to I know this and observe immediate score change.',
  },
  {
    id: 'refresh_persistence',
    label: 'Changes persist after refresh',
    hint: 'Refresh /results and verify confidence toggles and score remain.',
  },
  {
    id: 'history_save_load',
    label: 'History saves and loads correctly',
    hint: 'Open /app/resources and ensure entries can be reopened.',
  },
  {
    id: 'export_correctness',
    label: 'Export buttons copy the correct content',
    hint: 'Use copy/download actions and verify content sections are complete and accurate.',
  },
  {
    id: 'console_clean',
    label: 'No console errors on core pages',
    hint: 'Open browser console on /, /app/dashboard, /results, /app/resources.',
  },
];

const TEST_CHECKLIST_STORAGE_KEY = 'placement_prp_test_checklist_v1';
export const PRP_STATUS_EVENT = 'prp-status-changed';

export type ChecklistState = Record<string, boolean>;

function buildDefaultState(): ChecklistState {
  return TEST_CHECKLIST_ITEMS.reduce<ChecklistState>((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});
}

export function getChecklistState(): ChecklistState {
  const defaults = buildDefaultState();
  const raw = localStorage.getItem(TEST_CHECKLIST_STORAGE_KEY);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const merged = { ...defaults };

    TEST_CHECKLIST_ITEMS.forEach((item) => {
      merged[item.id] = parsed[item.id] === true;
    });

    return merged;
  } catch {
    return defaults;
  }
}

export function saveChecklistState(state: ChecklistState): void {
  localStorage.setItem(TEST_CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PRP_STATUS_EVENT));
}

export function resetChecklistState(): ChecklistState {
  const defaults = buildDefaultState();
  saveChecklistState(defaults);
  return defaults;
}

export function countPassedTests(state: ChecklistState): number {
  return TEST_CHECKLIST_ITEMS.reduce((count, item) => count + (state[item.id] ? 1 : 0), 0);
}

export function isShipUnlocked(state: ChecklistState): boolean {
  return countPassedTests(state) === TEST_CHECKLIST_ITEMS.length;
}
