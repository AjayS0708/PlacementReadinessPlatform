import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeJobDescription } from '../lib/analysis';
import { saveAnalysisEntry } from '../lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function PracticePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState('');
  const isShortJd = useMemo(() => jdText.trim().length > 0 && jdText.trim().length < 200, [jdText]);

  const handleAnalyze = (event: FormEvent) => {
    event.preventDefault();

    if (!jdText.trim()) {
      setError('Please paste a job description to analyze.');
      return;
    }

    const entry = analyzeJobDescription({ company, role, jdText });
    saveAnalysisEntry(entry);
    navigate(`/results?id=${entry.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>JD Analyzer</CardTitle>
        <CardDescription>
          Paste the job description and generate skills, readiness score, checklist, plan, and interview questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleAnalyze}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Company (optional)
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
                placeholder="Example: Infosys"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Role (optional)
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
                placeholder="Example: Software Engineer Intern"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Job Description
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="min-h-[260px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
              placeholder="Paste full JD here..."
            />
          </label>

          {isShortJd && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This JD is too short to analyze deeply. Paste full JD for better output.
            </p>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Analyze JD
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
