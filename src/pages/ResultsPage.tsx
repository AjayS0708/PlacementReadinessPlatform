import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  getAnalysisById,
  getSelectedOrLatestAnalysis,
  setSelectedAnalysisId,
  updateAnalysisEntry,
} from '../lib/storage';
import { AnalysisEntry, CATEGORY_ORDER, SkillConfidence, SkillConfidenceMap } from '../types/analysis';

function flattenDetectedSkills(entry: AnalysisEntry): string[] {
  return CATEGORY_ORDER.flatMap((category) => entry.extractedSkills[category]);
}

function buildInitialConfidenceMap(entry: AnalysisEntry): SkillConfidenceMap {
  const map: SkillConfidenceMap = {};
  flattenDetectedSkills(entry).forEach((skill) => {
    map[skill] = entry.skillConfidenceMap?.[skill] ?? 'practice';
  });
  return map;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function calculateLiveScore(baseScore: number, confidenceMap: SkillConfidenceMap): number {
  const adjustment = Object.values(confidenceMap).reduce((sum, value) => sum + (value === 'know' ? 2 : -2), 0);
  return clampScore(baseScore + adjustment);
}

function normalizeEntry(entry: AnalysisEntry): AnalysisEntry {
  const confidenceMap = buildInitialConfidenceMap(entry);
  const baseReadinessScore = entry.baseReadinessScore ?? entry.readinessScore;
  const readinessScore = calculateLiveScore(baseReadinessScore, confidenceMap);

  return {
    ...entry,
    baseReadinessScore,
    skillConfidenceMap: confidenceMap,
    readinessScore,
  };
}

function buildChecklistText(entry: AnalysisEntry): string {
  return entry.checklist
    .map((round) => {
      const lines = round.items.map((item) => `- ${item}`).join('\n');
      return `${round.title}\n${lines}`;
    })
    .join('\n\n');
}

function buildPlanText(entry: AnalysisEntry): string {
  return entry.plan
    .map((day) => {
      const lines = day.items.map((item) => `- ${item}`).join('\n');
      return `${day.day}: ${day.focus}\n${lines}`;
    })
    .join('\n\n');
}

function buildQuestionsText(entry: AnalysisEntry): string {
  return entry.questions.map((question, index) => `${index + 1}. ${question}`).join('\n');
}

function buildExportText(entry: AnalysisEntry, liveScore: number, confidenceMap: SkillConfidenceMap): string {
  const skillsSection = CATEGORY_ORDER.map((category) => {
    const values = entry.extractedSkills[category].map((skill) => `${skill} [${confidenceMap[skill] || 'practice'}]`).join(', ');
    return `${category}: ${values || 'No explicit matches'}`;
  }).join('\n');

  const generalNote = entry.extractedSkills.General.length > 0 ? `\n\nGeneral: ${entry.extractedSkills.General[0]}` : '';

  return [
    'Placement Readiness Platform - Analysis Export',
    `Date: ${new Date(entry.createdAt).toLocaleString()}`,
    `Company: ${entry.company || 'Not specified'}`,
    `Role: ${entry.role || 'Not specified'}`,
    `Readiness Score: ${liveScore}/100`,
    '',
    'Key Skills Extracted',
    skillsSection + generalNote,
    '',
    'Round-wise Preparation Checklist',
    buildChecklistText(entry),
    '',
    '7-Day Plan',
    buildPlanText(entry),
    '',
    '10 Likely Interview Questions',
    buildQuestionsText(entry),
  ].join('\n');
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const [entry, setEntry] = useState<AnalysisEntry | null>(null);
  const [confidenceMap, setConfidenceMap] = useState<SkillConfidenceMap>({});
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    let selected: AnalysisEntry | null = null;

    if (id) {
      selected = getAnalysisById(id);
      if (selected) {
        setSelectedAnalysisId(id);
      }
    }

    const resolved = selected || getSelectedOrLatestAnalysis();
    if (!resolved) {
      setEntry(null);
      return;
    }

    const normalized = normalizeEntry(resolved);
    setEntry(normalized);
    setConfidenceMap(normalized.skillConfidenceMap || {});
    updateAnalysisEntry(normalized);
  }, [searchParams]);

  const baseScore = entry ? entry.baseReadinessScore ?? entry.readinessScore : 0;

  const liveScore = useMemo(() => {
    if (!entry) return 0;
    return calculateLiveScore(baseScore, confidenceMap);
  }, [entry, baseScore, confidenceMap]);

  const weakSkills = useMemo(() => {
    return Object.entries(confidenceMap)
      .filter(([, value]) => value === 'practice')
      .map(([skill]) => skill)
      .slice(0, 3);
  }, [confidenceMap]);

  const setSkillConfidence = (skill: string, nextValue: SkillConfidence) => {
    if (!entry) return;

    const nextMap: SkillConfidenceMap = { ...confidenceMap, [skill]: nextValue };
    const nextScore = calculateLiveScore(baseScore, nextMap);
    const nextEntry: AnalysisEntry = {
      ...entry,
      baseReadinessScore: baseScore,
      readinessScore: nextScore,
      skillConfidenceMap: nextMap,
    };

    setConfidenceMap(nextMap);
    setEntry(nextEntry);
    updateAnalysisEntry(nextEntry);
  };

  const handleCopy = async (section: 'plan' | 'checklist' | 'questions') => {
    if (!entry) return;

    const text =
      section === 'plan'
        ? buildPlanText(entry)
        : section === 'checklist'
          ? buildChecklistText(entry)
          : buildQuestionsText(entry);

    const ok = await copyTextToClipboard(text);
    setCopyMessage(ok ? 'Copied to clipboard.' : 'Copy failed. Please copy manually.');
    window.setTimeout(() => setCopyMessage(''), 1800);
  };

  const handleDownloadTxt = () => {
    if (!entry) return;

    const content = buildExportText(entry, liveScore, confidenceMap);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placement-analysis-${entry.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
            {entry.company || 'Company not specified'} | {entry.role || 'Role not specified'} | Live Score: {liveScore}/100
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleCopy('plan')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            Copy 7-day plan
          </button>
          <button type="button" onClick={() => handleCopy('checklist')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            Copy round checklist
          </button>
          <button type="button" onClick={() => handleCopy('questions')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            Copy 10 questions
          </button>
          <button type="button" onClick={handleDownloadTxt} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600">
            Download as TXT
          </button>
          {copyMessage && <span className="self-center text-xs text-emerald-700">{copyMessage}</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Skills Extracted</CardTitle>
          <CardDescription>Detected from JD text by category. Mark each skill as know or need practice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORY_ORDER.map((category) => (
            <div key={category}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{category}</p>
              <div className="flex flex-wrap gap-3">
                {entry.extractedSkills[category].length > 0 ? (
                  entry.extractedSkills[category].map((skill) => {
                    const value = confidenceMap[skill] || 'practice';
                    return (
                      <div key={`${category}-${skill}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-primary">{skill}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSkillConfidence(skill, 'know')}
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                              value === 'know' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'
                            }`}
                          >
                            I know this
                          </button>
                          <button
                            type="button"
                            onClick={() => setSkillConfidence(skill, 'practice')}
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                              value === 'practice' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'
                            }`}
                          >
                            Need practice
                          </button>
                        </div>
                      </div>
                    );
                  })
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

      <Card>
        <CardHeader>
          <CardTitle>Action Next</CardTitle>
          <CardDescription>Focus on weak areas first and move into execution.</CardDescription>
        </CardHeader>
        <CardContent>
          {weakSkills.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Top 3 weak skills</p>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm font-medium text-indigo-800">
                Start Day 1 plan now.
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              Great progress. You marked all tracked skills as known. Start Day 1 plan now.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
