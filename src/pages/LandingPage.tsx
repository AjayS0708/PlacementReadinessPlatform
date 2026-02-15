import { BarChart3, Code2, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

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