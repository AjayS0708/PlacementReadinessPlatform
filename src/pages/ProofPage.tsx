import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  FinalSubmissionData,
  PRP_STEPS,
  StepCompletionState,
  getFinalSubmissionData,
  getProjectStatusState,
  getStepCompletionState,
  isValidHttpUrl,
  saveFinalSubmissionData,
  saveStepCompletionState,
} from '../lib/prpStatus';
import { TEST_CHECKLIST_ITEMS, countPassedTests, getChecklistState } from '../lib/testChecklist';

function buildSubmissionExport(data: FinalSubmissionData): string {
  return [
    '------------------------------------------',
    'Placement Readiness Platform — Final Submission',
    '',
    `Lovable Project: ${data.lovableProjectLink || 'Not provided'}`,
    `GitHub Repository: ${data.githubRepositoryLink || 'Not provided'}`,
    `Live Deployment: ${data.deployedUrl || 'Not provided'}`,
    '',
    'Core Capabilities:',
    '- JD skill extraction (deterministic)',
    '- Round mapping engine',
    '- 7-day prep plan',
    '- Interactive readiness scoring',
    '- History persistence',
    '------------------------------------------',
  ].join('\n');
}

export function ProofPage() {
  const [stepsState, setStepsState] = useState<StepCompletionState>(() => getStepCompletionState());
  const [submission, setSubmission] = useState<FinalSubmissionData>(() => getFinalSubmissionData());
  const [copyMessage, setCopyMessage] = useState('');

  const status = useMemo(() => getProjectStatusState(), [stepsState, submission]);
  const checklistPassedCount = useMemo(() => countPassedTests(getChecklistState()), [stepsState, submission]);

  const githubValid = useMemo(() => isValidHttpUrl(submission.githubRepositoryLink), [submission.githubRepositoryLink]);
  const deployedValid = useMemo(() => isValidHttpUrl(submission.deployedUrl), [submission.deployedUrl]);
  const lovableValid = useMemo(
    () => !submission.lovableProjectLink.trim() || isValidHttpUrl(submission.lovableProjectLink),
    [submission.lovableProjectLink],
  );

  const handleToggleStep = (id: string) => {
    const next = { ...stepsState, [id]: !stepsState[id] };
    setStepsState(next);
    saveStepCompletionState(next);
  };

  const updateSubmissionField = (field: keyof FinalSubmissionData, value: string) => {
    const next = { ...submission, [field]: value };
    setSubmission(next);
    saveFinalSubmissionData(next);
  };

  const handleCopyFinalSubmission = async () => {
    const text = buildSubmissionExport(submission);
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Final submission copied.');
    } catch {
      setCopyMessage('Copy failed. Please copy manually.');
    }
    window.setTimeout(() => setCopyMessage(''), 1800);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proof + Submission</CardTitle>
          <CardDescription>
            Final shipping gate tracks steps, checklist completion, and deployment proof.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Step status: {status.allStepsCompleted ? '8/8 complete' : 'Pending steps remain'} | Checklist: {checklistPassedCount}/{TEST_CHECKLIST_ITEMS.length} | Proof links: {status.proofLinksProvided ? 'Complete' : 'Missing'}
          </div>
          <div
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              status.isShipped
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {status.isShipped ? 'Status: Shipped' : 'Status: In Progress'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step Completion Overview</CardTitle>
          <CardDescription>Mark each product step as completed or pending.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {PRP_STEPS.map((step) => (
              <li key={step.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="text-xs text-slate-600">{stepsState[step.id] ? 'Completed' : 'Pending'}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={stepsState[step.id] || false}
                    onChange={() => handleToggleStep(step.id)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artifact Inputs</CardTitle>
          <CardDescription>Provide final proof links. GitHub and deployed URL are required. Lovable is optional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Lovable Project Link (optional)
            <input
              value={submission.lovableProjectLink}
              onChange={(e) => updateSubmissionField('lovableProjectLink', e.target.value)}
              placeholder="https://..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
            />
            {!lovableValid && <span className="text-xs text-rose-600">Enter a valid URL or leave empty.</span>}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            GitHub Repository Link
            <input
              value={submission.githubRepositoryLink}
              onChange={(e) => updateSubmissionField('githubRepositoryLink', e.target.value)}
              placeholder="https://github.com/..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
            />
            {!githubValid && <span className="text-xs text-rose-600">Valid URL is required.</span>}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Deployed URL
            <input
              value={submission.deployedUrl}
              onChange={(e) => updateSubmissionField('deployedUrl', e.target.value)}
              placeholder="https://..."
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
            />
            {!deployedValid && <span className="text-xs text-rose-600">Valid URL is required.</span>}
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyFinalSubmission}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              Copy Final Submission
            </button>
            {copyMessage && <span className="text-xs text-emerald-700">{copyMessage}</span>}
          </div>
        </CardContent>
      </Card>

      {status.isShipped && (
        <Card>
          <CardContent className="pt-6">
            <p className="whitespace-pre-line rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              {'You built a real product.\nNot a tutorial. Not a clone.\nA structured tool that solves a real problem.\n\nThis is your proof of work.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
