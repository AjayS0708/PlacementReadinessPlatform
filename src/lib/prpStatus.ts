import { getChecklistState, isShipUnlocked, PRP_STATUS_EVENT } from './testChecklist';

export interface PrpStep {
  id: string;
  title: string;
}

export interface FinalSubmissionData {
  lovableProjectLink: string;
  githubRepositoryLink: string;
  deployedUrl: string;
}

export interface ProjectStatusState {
  isShipped: boolean;
  allStepsCompleted: boolean;
  checklistPassed: boolean;
  proofLinksProvided: boolean;
}

const PRP_STEPS_KEY = 'prp_step_completion_v1';
const PRP_FINAL_SUBMISSION_KEY = 'prp_final_submission';

export const PRP_STEPS: PrpStep[] = [
  { id: 'step_01', title: 'Landing + Dashboard Foundation' },
  { id: 'step_02', title: 'Dashboard Widgets Implementation' },
  { id: 'step_03', title: 'Analysis Engine Core' },
  { id: 'step_04', title: 'Interactive Results + Exports' },
  { id: 'step_05', title: 'Company Intel + Round Mapping' },
  { id: 'step_06', title: 'Schema + Validation Hardening' },
  { id: 'step_07', title: 'Test Checklist Completion' },
  { id: 'step_08', title: 'Proof + Submission Readiness' },
];

export type StepCompletionState = Record<string, boolean>;

function buildDefaultStepsState(): StepCompletionState {
  return PRP_STEPS.reduce<StepCompletionState>((acc, step) => {
    acc[step.id] = false;
    return acc;
  }, {});
}

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return false;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getStepCompletionState(): StepCompletionState {
  const defaults = buildDefaultStepsState();
  const raw = localStorage.getItem(PRP_STEPS_KEY);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const merged = { ...defaults };

    PRP_STEPS.forEach((step) => {
      merged[step.id] = parsed[step.id] === true;
    });

    return merged;
  } catch {
    return defaults;
  }
}

export function saveStepCompletionState(state: StepCompletionState): void {
  localStorage.setItem(PRP_STEPS_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PRP_STATUS_EVENT));
}

export function getFinalSubmissionData(): FinalSubmissionData {
  const defaults: FinalSubmissionData = {
    lovableProjectLink: '',
    githubRepositoryLink: '',
    deployedUrl: '',
  };

  const raw = localStorage.getItem(PRP_FINAL_SUBMISSION_KEY);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      lovableProjectLink: typeof parsed.lovableProjectLink === 'string' ? parsed.lovableProjectLink : '',
      githubRepositoryLink: typeof parsed.githubRepositoryLink === 'string' ? parsed.githubRepositoryLink : '',
      deployedUrl: typeof parsed.deployedUrl === 'string' ? parsed.deployedUrl : '',
    };
  } catch {
    return defaults;
  }
}

export function saveFinalSubmissionData(data: FinalSubmissionData): void {
  localStorage.setItem(PRP_FINAL_SUBMISSION_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(PRP_STATUS_EVENT));
}

function areAllStepsCompleted(state: StepCompletionState): boolean {
  return PRP_STEPS.every((step) => state[step.id] === true);
}

function areRequiredProofLinksProvided(data: FinalSubmissionData): boolean {
  return isValidHttpUrl(data.githubRepositoryLink) && isValidHttpUrl(data.deployedUrl);
}

export function getProjectStatusState(): ProjectStatusState {
  const allStepsCompleted = areAllStepsCompleted(getStepCompletionState());
  const checklistPassed = isShipUnlocked(getChecklistState());
  const proofLinksProvided = areRequiredProofLinksProvided(getFinalSubmissionData());

  return {
    allStepsCompleted,
    checklistPassed,
    proofLinksProvided,
    isShipped: allStepsCompleted && checklistPassed && proofLinksProvided,
  };
}

