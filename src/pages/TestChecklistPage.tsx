import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  ChecklistState,
  TEST_CHECKLIST_ITEMS,
  countPassedTests,
  getChecklistState,
  isShipUnlocked,
  resetChecklistState,
  saveChecklistState,
} from '../lib/testChecklist';

export function TestChecklistPage() {
  const [state, setState] = useState<ChecklistState>(() => getChecklistState());
  const passed = useMemo(() => countPassedTests(state), [state]);
  const allPassed = useMemo(() => isShipUnlocked(state), [state]);

  const handleToggle = (id: string) => {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    saveChecklistState(next);
  };

  const handleReset = () => {
    const defaults = resetChecklistState();
    setState(defaults);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PRP Test Checklist</CardTitle>
          <CardDescription>Tests Passed: {passed} / 10</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!allPassed && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              Fix issues before shipping.
            </p>
          )}

          {allPassed && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              All tests passed. Shipping is unlocked.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              to="/prp/08-ship"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              Go to Ship Gate
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Reset checklist
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Items</CardTitle>
          <CardDescription>Mark each test after validating behavior in the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {TEST_CHECKLIST_ITEMS.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={state[item.id] || false}
                    onChange={() => handleToggle(item.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    {item.hint && <p className="mt-1 text-xs text-slate-600">How to test: {item.hint}</p>}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
