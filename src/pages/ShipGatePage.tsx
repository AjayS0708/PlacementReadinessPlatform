import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { PRP_STATUS_EVENT, TEST_CHECKLIST_ITEMS, countPassedTests, getChecklistState, isShipUnlocked } from '../lib/testChecklist';
import { PRP_STEPS, getProjectStatusState } from '../lib/prpStatus';

export function ShipGatePage() {
  const [tick, setTick] = useState(0);
  const state = useMemo(() => getChecklistState(), [tick]);
  const passed = useMemo(() => countPassedTests(state), [state]);
  const checklistUnlocked = useMemo(() => isShipUnlocked(state), [state]);
  const projectStatus = useMemo(() => getProjectStatusState(), [state, tick]);

  useEffect(() => {
    const handler = () => setTick((prev) => prev + 1);
    window.addEventListener(PRP_STATUS_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(PRP_STATUS_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (!projectStatus.isShipped) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Locked</CardTitle>
          <CardDescription>
            Tests Passed: {passed} / {TEST_CHECKLIST_ITEMS.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Fix issues before shipping.
          </p>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>{checklistUnlocked ? 'Checklist: Passed' : 'Checklist: Pending'}</li>
            <li>{projectStatus.allStepsCompleted ? `Steps: ${PRP_STEPS.length}/${PRP_STEPS.length} complete` : 'Steps: Pending completion'}</li>
            <li>{projectStatus.proofLinksProvided ? 'Proof links: Complete' : 'Proof links: Missing required URLs'}</li>
          </ul>
          <Link
            to="/prp/07-test"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Open Test Checklist
          </Link>
          <Link
            to="/prp/proof"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open Proof Page
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ready to Ship</CardTitle>
        <CardDescription>
          Tests Passed: {passed} / {TEST_CHECKLIST_ITEMS.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          All checklist tests are complete. Ship gate is unlocked.
        </p>
      </CardContent>
    </Card>
  );
}
