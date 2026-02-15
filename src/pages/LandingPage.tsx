import { FormEvent, useMemo, useState } from 'react';
import { BarChart3, Code2, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { analyzeJobDescription } from '../lib/analysis';
import { saveAnalysisEntry } from '../lib/storage';

const features = [
  {
    title: 'Practice Problems',
    description: 'Solve curated coding and aptitude questions daily.',
    icon: Code2,
  },
  {
    title: 'Mock Interviews',
    description: 'Simulate interview rounds with structured prompts.',
    icon: Video,
  },
  {
    title: 'Track Progress',
    description: 'Measure growth across skills and assessment performance.',
    icon: BarChart3,
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState('');

  const isShortJd = useMemo(() => jdText.trim().length > 0 && jdText.trim().length < 200, [jdText]);

  const handleAnalyze = (event: FormEvent) => {
    event.preventDefault();

    if (!jdText.trim()) {
      setError('Please paste a job description before analyzing.');
      return;
    }

    setError('');
    const entry = analyzeJobDescription({ company, role, jdText });
    saveAnalysisEntry(entry);
    navigate(`/results?id=${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="rounded-2xl bg-white px-8 py-16 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ace Your Placement</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Practice, assess, and prepare for your dream job
          </p>
          <Link
            to="/app/dashboard"
            className="mt-8 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Get Started
          </Link>
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Quick Analyze</h2>
            <p className="mt-1 text-sm text-slate-600">Paste a JD to generate readiness analysis instantly.</p>
          </div>

          <form className="space-y-4" onSubmit={handleAnalyze}>
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
                  placeholder="Example: Software Engineer"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Job Description
              <textarea
                required
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="min-h-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring"
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
        </section>

        <section className="mt-14">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <Icon className="h-8 w-8 text-primary" />
                  <h2 className="mt-4 text-xl font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
        Copyright {new Date().getFullYear()} Placement Readiness Platform. All rights reserved.
      </footer>
    </div>
  );
}