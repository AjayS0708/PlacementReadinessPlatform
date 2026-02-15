import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { getAnalysisById, getSelectedOrLatestAnalysis, setSelectedAnalysisId } from '../lib/storage';
import { CATEGORY_ORDER } from '../types/analysis';

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const entry = useMemo(() => {
    const id = searchParams.get('id');
    if (id) {
      const selected = getAnalysisById(id);
      if (selected) {
        setSelectedAnalysisId(id);
        return selected;
      }
    }

    return getSelectedOrLatestAnalysis();
  }, [searchParams]);

  if (!entry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No analysis found</CardTitle>
          <CardDescription>Analyze a job description first or open one from history.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link to="/app/practice" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
            Go to Practice
          </Link>
          <Link to="/app/resources" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Open History
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            {entry.company || 'Company not specified'} | {entry.role || 'Role not specified'} | Score: {entry.readinessScore}/100
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Skills Extracted</CardTitle>
          <CardDescription>Detected from JD text by category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORY_ORDER.map((category) => (
            <div key={category}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{category}</p>
              <div className="flex flex-wrap gap-2">
                {entry.extractedSkills[category].length > 0 ? (
                  entry.extractedSkills[category].map((skill) => (
                    <span key={`${category}-${skill}`} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No explicit matches</span>
                )}
              </div>
            </div>
          ))}

          {entry.extractedSkills.General.length > 0 && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm font-medium text-indigo-700">
              {entry.extractedSkills.General[0]}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round-wise Preparation Checklist</CardTitle>
          <CardDescription>Template-based checklist adapted from detected skills.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {entry.checklist.map((round) => (
            <div key={round.title} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">{round.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                {round.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Plan</CardTitle>
          <CardDescription>Action plan adapted based on extracted skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {entry.plan.map((day) => (
            <div key={day.day} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{day.day}: {day.focus}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {day.items.map((item) => (
                  <li key={`${day.day}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10 Likely Interview Questions</CardTitle>
          <CardDescription>Skill-specific questions generated from detected stack.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            {entry.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}