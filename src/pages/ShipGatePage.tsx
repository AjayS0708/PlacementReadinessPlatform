import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TEST_CHECKLIST_ITEMS, countPassedTests, getChecklistState, isShipUnlocked } from '../lib/testChecklist';

export function ShipGatePage() {
  const state = useMemo(() => getChecklistState(), []);
  const passed = useMemo(() => countPassedTests(state), [state]);
  const unlocked = useMemo(() => isShipUnlocked(state), [state]);

  if (!unlocked) {
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
          <Link
            to="/prp/07-test"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Open Test Checklist
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
