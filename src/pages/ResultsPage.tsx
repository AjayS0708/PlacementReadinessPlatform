import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { calculateFinalScore, enrichAnalysisEntry } from '../lib/analysis';
import {
  getAnalysisById,
  getSelectedOrLatestAnalysis,
  setSelectedAnalysisId,
  updateAnalysisEntry,
} from '../lib/storage';
import { AnalysisEntry, SKILL_SECTION_CONFIG, SkillConfidence, SkillConfidenceMap } from '../types/analysis';

function flattenDetectedSkills(entry: AnalysisEntry): string[] {
  return SKILL_SECTION_CONFIG.flatMap((section) => entry.extractedSkills[section.key]);
}

function buildInitialConfidenceMap(entry: AnalysisEntry): SkillConfidenceMap {
  const map: SkillConfidenceMap = {};
  [...flattenDetectedSkills(entry), ...entry.extractedSkills.other].forEach((skill) => {
    map[skill] = entry.skillConfidenceMap?.[skill] ?? 'practice';
  });
  return map;
}

function normalizeEntry(entry: AnalysisEntry): AnalysisEntry {
  const enriched = enrichAnalysisEntry(entry);
  const confidenceMap = buildInitialConfidenceMap(enriched);
  const baseScore = enriched.baseScore;
  const finalScore = calculateFinalScore(baseScore, confidenceMap);

  return {
    ...enriched,
    baseScore,
    skillConfidenceMap: confidenceMap,
    finalScore,
    updatedAt: enriched.updatedAt || new Date().toISOString(),
  };
}

function buildChecklistText(entry: AnalysisEntry): string {
  return entry.checklist
    .map((round) => `${round.roundTitle}\n${round.items.map((item) => `- ${item}`).join('\n')}`)
    .join('\n\n');
}

function buildPlanText(entry: AnalysisEntry): string {
  return entry.plan7Days
    .map((day) => `${day.day}: ${day.focus}\n${day.tasks.map((task) => `- ${task}`).join('\n')}`)
    .join('\n\n');
}

function buildQuestionsText(entry: AnalysisEntry): string {
  return entry.questions.map((question, index) => `${index + 1}. ${question}`).join('\n');
}

function buildExportText(entry: AnalysisEntry, finalScore: number, confidenceMap: SkillConfidenceMap): string {
  const skillsSection = SKILL_SECTION_CONFIG.map((section) => {
    const values = entry.extractedSkills[section.key].map((skill) => `${skill} [${confidenceMap[skill] || 'practice'}]`).join(', ');
    return `${section.label}: ${values || 'No explicit matches'}`;
  }).join('\n');

  const otherSection = entry.extractedSkills.other.length > 0
    ? `\nOther: ${entry.extractedSkills.other.join(', ')}`
    : '';

  const intelSection = entry.companyIntel
    ? [
        '',
        'Company Intel',
        `Company: ${entry.companyIntel.companyName}`,
        `Industry: ${entry.companyIntel.industry}`,
        `Estimated Size: ${entry.companyIntel.sizeCategory}`,
        `Typical Hiring Focus: ${entry.companyIntel.hiringFocus}`,
        entry.companyIntel.demoNote,
      ].join('\n')
    : '';

  const roundSection = [
    '',
    'Round Mapping',
    ...entry.roundMapping.map(
      (round) => `${round.roundTitle}\nFocus: ${round.focusAreas.join(', ')}\nWhy this round matters: ${round.whyItMatters}`,
    ),
  ].join('\n\n');

  return [
    'Placement Readiness Platform - Analysis Export',
    `Date: ${new Date(entry.createdAt).toLocaleString()}`,
    `Updated: ${new Date(entry.updatedAt).toLocaleString()}`,
    `Company: ${entry.company || 'Not specified'}`,
    `Role: ${entry.role || 'Not specified'}`,
    `Base Score: ${entry.baseScore}/100`,
    `Final Score: ${finalScore}/100`,
    '',
    'Key Skills Extracted',
    skillsSection + otherSection,
    intelSection,
    roundSection,
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
      if (selected) setSelectedAnalysisId(id);
    }

    const resolved = selected || getSelectedOrLatestAnalysis();
    if (!resolved) {
      setEntry(null);
      return;
    }

    const normalized = normalizeEntry(resolved);
    setEntry(normalized);
    setConfidenceMap(normalized.skillConfidenceMap);
    updateAnalysisEntry(normalized);
  }, [searchParams]);

  const finalScore = useMemo(() => {
    if (!entry) return 0;
    return calculateFinalScore(entry.baseScore, confidenceMap);
  }, [entry, confidenceMap]);

  const weakSkills = useMemo(
    () => Object.entries(confidenceMap).filter(([, status]) => status === 'practice').map(([skill]) => skill).slice(0, 3),
    [confidenceMap],
  );

  const setSkillConfidence = (skill: string, nextValue: SkillConfidence) => {
    if (!entry) return;

    const nextMap = { ...confidenceMap, [skill]: nextValue };
    const nextFinal = calculateFinalScore(entry.baseScore, nextMap);
    const nextEntry: AnalysisEntry = {
      ...entry,
      skillConfidenceMap: nextMap,
      finalScore: nextFinal,
      updatedAt: new Date().toISOString(),
    };

    setConfidenceMap(nextMap);
    setEntry(nextEntry);
    updateAnalysisEntry(nextEntry);
  };

  const handleCopy = async (section: 'plan' | 'checklist' | 'questions') => {
    if (!entry) return;

    const text = section === 'plan' ? buildPlanText(entry) : section === 'checklist' ? buildChecklistText(entry) : buildQuestionsText(entry);
    const ok = await copyTextToClipboard(text);
    setCopyMessage(ok ? 'Copied to clipboard.' : 'Copy failed. Please copy manually.');
    window.setTimeout(() => setCopyMessage(''), 1800);
  };

  const handleDownloadTxt = () => {
    if (!entry) return;

    const content = buildExportText(entry, finalScore, confidenceMap);
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
            {entry.company || 'Company not specified'} | {entry.role || 'Role not specified'} | Base: {entry.baseScore}/100 | Final: {finalScore}/100
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleCopy('plan')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Copy 7-day plan</button>
          <button type="button" onClick={() => handleCopy('checklist')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Copy round checklist</button>
          <button type="button" onClick={() => handleCopy('questions')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Copy 10 questions</button>
          <button type="button" onClick={handleDownloadTxt} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600">Download as TXT</button>
          {copyMessage && <span className="self-center text-xs text-emerald-700">{copyMessage}</span>}
        </CardContent>
      </Card>

      {entry.companyIntel && (
        <Card>
          <CardHeader>
            <CardTitle>Company Intel</CardTitle>
            <CardDescription>Context generated from company and JD inputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{entry.companyIntel.companyName}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Industry</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{entry.companyIntel.industry}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Size</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{entry.companyIntel.sizeCategory}</p>
              </div>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Typical Hiring Focus</p>
              <p className="mt-1 text-sm text-indigo-900">{entry.companyIntel.hiringFocus}</p>
            </div>
            <p className="text-xs text-slate-500">{entry.companyIntel.demoNote}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Round Mapping</CardTitle>
          <CardDescription>Dynamic interview flow inferred from company type and detected skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entry.roundMapping.map((item, index) => (
              <div key={item.roundTitle} className="relative pl-8">
                {index !== entry.roundMapping.length - 1 && (
                  <span className="absolute left-[11px] top-7 h-[calc(100%-8px)] w-[2px] bg-slate-200" />
                )}
                <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-2 border-primary bg-white text-center text-xs font-bold leading-[20px] text-primary">{index + 1}</span>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.roundTitle}</p>
                  <p className="mt-1 text-sm text-slate-700">Focus: {item.focusAreas.join(', ')}</p>
                  <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">Why this round matters: {item.whyItMatters}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Skills Extracted</CardTitle>
          <CardDescription>Detected from JD text by category. Mark each skill as know or need practice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SKILL_SECTION_CONFIG.map((section) => (
            <div key={section.key}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{section.label}</p>
              <div className="flex flex-wrap gap-3">
                {entry.extractedSkills[section.key].length > 0 ? (
                  entry.extractedSkills[section.key].map((skill) => {
                    const value = confidenceMap[skill] || 'practice';
                    return (
                      <div key={`${section.key}-${skill}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs font-semibold text-primary">{skill}</p>
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={() => setSkillConfidence(skill, 'know')} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${value === 'know' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}>
                            I know this
                          </button>
                          <button type="button" onClick={() => setSkillConfidence(skill, 'practice')} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${value === 'practice' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}>
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

          {entry.extractedSkills.other.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Other</p>
              <div className="flex flex-wrap gap-3">
                {entry.extractedSkills.other.map((skill) => {
                  const value = confidenceMap[skill] || 'practice';
                  return (
                    <div key={`other-${skill}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold text-primary">{skill}</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => setSkillConfidence(skill, 'know')} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${value === 'know' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}>
                          I know this
                        </button>
                        <button type="button" onClick={() => setSkillConfidence(skill, 'practice')} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${value === 'practice' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}>
                          Need practice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            <div key={round.roundTitle} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">{round.roundTitle}</h3>
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
          {entry.plan7Days.map((day) => (
            <div key={day.day} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{day.day}: {day.focus}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {day.tasks.map((task) => (
                  <li key={`${day.day}-${task}`}>{task}</li>
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
                  <span key={skill} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{skill}</span>
                ))}
              </div>
              <p className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm font-medium text-indigo-800">Start Day 1 plan now.</p>
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