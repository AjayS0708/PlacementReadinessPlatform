import { useEffect, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

const skillData = [
  { skill: 'DSA', score: 75 },
  { skill: 'System Design', score: 60 },
  { skill: 'Communication', score: 80 },
  { skill: 'Resume', score: 85 },
  { skill: 'Aptitude', score: 70 },
];

const weeklyActivity = [
  { day: 'Mon', active: true },
  { day: 'Tue', active: true },
  { day: 'Wed', active: false },
  { day: 'Thu', active: true },
  { day: 'Fri', active: true },
  { day: 'Sat', active: false },
  { day: 'Sun', active: true },
];

const assessments = [
  { title: 'DSA Mock Test', time: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', time: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', time: 'Friday, 11:00 AM' },
];

export function DashboardPage() {
  const readinessScore = 72;
  const readinessMax = 100;
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const progress = readinessScore / readinessMax;
  const targetOffset = circumference * (1 - progress);
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimatedOffset(targetOffset), 50);
    return () => window.clearTimeout(timer);
  }, [targetOffset]);

  const dpCompleted = 3;
  const dpTotal = 10;
  const dpProgress = (dpCompleted / dpTotal) * 100;

  const problemsSolved = 12;
  const weeklyTarget = 20;
  const weeklyProgress = (problemsSolved / weeklyTarget) * 100;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Overall Readiness</CardTitle>
          <CardDescription>Current benchmark across all prep areas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="relative h-56 w-56">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-label="Readiness score">
                <circle cx="100" cy="100" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="hsl(245 58% 51%)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={animatedOffset}
                  style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-slate-900">{readinessScore}/100</p>
                <p className="mt-1 text-sm text-slate-600">Readiness Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Breakdown</CardTitle>
          <CardDescription>Radar view of current strengths and weak spots.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="mx-auto h-64 min-w-[320px] sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={skillData}
                  cx="50%"
                  cy="52%"
                  outerRadius="62%"
                  margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                >
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#334155', fontSize: 11 }} />
                <Radar
                  dataKey="score"
                  stroke="hsl(245 58% 51%)"
                  fill="hsl(245 58% 51%)"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Continue Practice</CardTitle>
          <CardDescription>Pick up where you left off.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Last topic</p>
          <p className="mt-1 text-xl font-semibold">Dynamic Programming</p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>{dpCompleted}/{dpTotal} completed</span>
              <span>{Math.round(dpProgress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${dpProgress}%` }} />
            </div>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            Continue
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
          <CardDescription>Problems Solved: {problemsSolved}/{weeklyTarget} this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${weeklyProgress}%` }} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            {weeklyActivity.map((entry) => (
              <div key={entry.day} className="flex flex-col items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full border ${
                    entry.active ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
                  }`}
                  aria-label={`${entry.day} activity ${entry.active ? 'completed' : 'not completed'}`}
                />
                <span className="text-xs text-slate-600">{entry.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Upcoming Assessments</CardTitle>
          <CardDescription>Your scheduled sessions for this week.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {assessments.map((item) => (
              <li
                key={item.title}
                className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.time}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
