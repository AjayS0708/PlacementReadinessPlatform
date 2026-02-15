import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { getHistory, setSelectedAnalysisId } from '../lib/storage';

export function ResourcesPage() {
  const navigate = useNavigate();
  const history = useMemo(() => getHistory(), []);

  const openResult = (id: string) => {
    setSelectedAnalysisId(id);
    navigate(`/results?id=${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>Saved analyses persist in localStorage and are available after refresh.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-slate-600">No history yet. Analyze a JD from Practice to populate this list.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => openResult(entry.id)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.company || 'Unknown Company'} | {entry.role || 'Unknown Role'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Score {entry.readinessScore}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}