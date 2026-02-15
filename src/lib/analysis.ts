import {
  AnalysisEntry,
  AnalyzeInput,
  ChecklistRound,
  CompanyIntel,
  CompanySizeCategory,
  DayPlan,
  ExtractedSkills,
  RoundMapItem,
  SkillConfidenceMap,
  SkillSectionKey,
} from '../types/analysis';

interface SkillPattern {
  skill: string;
  patterns: RegExp[];
}

const SKILL_PATTERNS: Record<SkillSectionKey, SkillPattern[]> = {
  coreCS: [
    { skill: 'DSA', patterns: [/\bdsa\b/i, /data\s*structures?\s*(and|&)\s*algorithms?/i] },
    { skill: 'OOP', patterns: [/\boop\b/i, /object\s*oriented/i] },
    { skill: 'DBMS', patterns: [/\bdbms\b/i, /database\s*management/i] },
    { skill: 'OS', patterns: [/\bos\b/i, /operating\s*systems?/i] },
    { skill: 'Networks', patterns: [/\bnetworks?\b/i, /computer\s*networking/i, /tcp\/?ip/i] },
  ],
  languages: [
    { skill: 'Java', patterns: [/\bjava\b/i] },
    { skill: 'Python', patterns: [/\bpython\b/i] },
    { skill: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
    { skill: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
    { skill: 'C', patterns: [/\bc\s*language\b/i, /\blanguage\s*[:\-]\s*c\b/i, /\bc,\s*c\+\+\b/i] },
    { skill: 'C++', patterns: [/\bc\+\+\b/i] },
    { skill: 'C#', patterns: [/\bc#\b/i, /csharp/i] },
    { skill: 'Go', patterns: [/\bgolang\b/i, /\bgo\s*language\b/i, /\blanguage\s*[:\-]\s*go\b/i] },
  ],
  web: [
    { skill: 'React', patterns: [/\breact\b/i] },
    { skill: 'Next.js', patterns: [/\bnext\.?js\b/i, /\bnextjs\b/i] },
    { skill: 'Node.js', patterns: [/\bnode\.?js\b/i, /\bnodejs\b/i] },
    { skill: 'Express', patterns: [/\bexpress\b/i] },
    { skill: 'REST', patterns: [/\brest\b/i, /restful/i, /rest\s*api/i] },
    { skill: 'GraphQL', patterns: [/\bgraphql\b/i] },
  ],
  data: [
    { skill: 'SQL', patterns: [/\bsql\b/i] },
    { skill: 'MongoDB', patterns: [/\bmongodb\b/i] },
    { skill: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
    { skill: 'MySQL', patterns: [/\bmysql\b/i] },
    { skill: 'Redis', patterns: [/\bredis\b/i] },
  ],
  cloud: [
    { skill: 'AWS', patterns: [/\baws\b/i, /amazon\s*web\s*services/i] },
    { skill: 'Azure', patterns: [/\bazure\b/i] },
    { skill: 'GCP', patterns: [/\bgcp\b/i, /google\s*cloud/i] },
    { skill: 'Docker', patterns: [/\bdocker\b/i] },
    { skill: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { skill: 'CI/CD', patterns: [/\bci\s*\/\s*cd\b/i, /continuous\s*integration/i, /continuous\s*deployment/i] },
    { skill: 'Linux', patterns: [/\blinux\b/i] },
  ],
  testing: [
    { skill: 'Selenium', patterns: [/\bselenium\b/i] },
    { skill: 'Cypress', patterns: [/\bcypress\b/i] },
    { skill: 'Playwright', patterns: [/\bplaywright\b/i] },
    { skill: 'JUnit', patterns: [/\bjunit\b/i] },
    { skill: 'PyTest', patterns: [/\bpytest\b/i] },
  ],
};

const SECTION_KEYS: SkillSectionKey[] = ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing'];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `analysis-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

function emptySkills(): ExtractedSkills {
  return {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  };
}

export function extractSkills(jdText: string): ExtractedSkills {
  const extracted = emptySkills();

  SECTION_KEYS.forEach((section) => {
    SKILL_PATTERNS[section].forEach(({ skill, patterns }) => {
      if (patterns.some((pattern) => pattern.test(jdText))) {
        extracted[section].push(skill);
      }
    });

    extracted[section] = dedupe(extracted[section]);
  });

  const totalDetected = SECTION_KEYS.reduce((acc, section) => acc + extracted[section].length, 0);
  if (totalDetected === 0) {
    extracted.other = ['Communication', 'Problem solving', 'Basic coding', 'Projects'];
  }

  return extracted;
}

function flattenDetectedSkills(extracted: ExtractedSkills): string[] {
  return dedupe(SECTION_KEYS.flatMap((section) => extracted[section]));
}

function hasSkill(extracted: ExtractedSkills, skill: string): boolean {
  return flattenDetectedSkills(extracted).includes(skill);
}

function hasAnySkill(extracted: ExtractedSkills, skills: string[]): boolean {
  return skills.some((skill) => hasSkill(extracted, skill));
}

function buildDefaultSkillConfidenceMap(extracted: ExtractedSkills): SkillConfidenceMap {
  const map: SkillConfidenceMap = {};
  [...flattenDetectedSkills(extracted), ...extracted.other].forEach((skill) => {
    map[skill] = 'practice';
  });
  return map;
}

function ensureCount(seed: string[], fallback: string[], min = 5, max = 8): string[] {
  const merged = dedupe([...seed, ...fallback]);
  return merged.slice(0, Math.max(min, Math.min(max, merged.length)));
}

export function buildChecklist(extracted: ExtractedSkills): ChecklistRound[] {
  const noHardSkills = flattenDetectedSkills(extracted).length === 0;

  const round1 = [
    'Revise quantitative aptitude topics (percentages, ratios, time-work).',
    'Practice 20 logical reasoning questions with timer.',
    'Prepare a one-minute self-introduction for screening rounds.',
    'Revise language syntax for your primary coding language.',
    'Solve one sectional aptitude test and review mistakes.',
  ];

  const round2 = [
    'Solve 2 easy and 2 medium DSA problems under time constraints.',
    'Revise OS, DBMS, and networking core concepts.',
    'Practice dry-run explanations while solving coding questions.',
    'Revise complexity analysis (time and space) for common patterns.',
    'Practice writing clean pseudocode before coding.',
  ];

  const round3 = [
    'Prepare one project deep-dive: architecture, decisions, and tradeoffs.',
    'Map your project features to technologies in the JD.',
    'Practice explaining one challenging bug and how you fixed it.',
    'Prepare STAR-format examples for ownership and collaboration.',
    'Do one technical mock interview with 45-minute structure.',
  ];

  const round4 = [
    'Prepare concise answers for Why this company and Why this role.',
    'Prepare salary expectation and location flexibility response.',
    'Draft examples for conflict resolution and teamwork situations.',
    'Prepare questions to ask interviewer about role expectations.',
    'Practice confident communication with mock HR Q&A.',
  ];

  if (hasSkill(extracted, 'SQL') || hasSkill(extracted, 'DBMS')) {
    round2.push('Practice SQL joins, indexing, and query optimization scenarios.');
  }

  if (hasSkill(extracted, 'React') || hasSkill(extracted, 'Next.js')) {
    round3.push('Review frontend state management and rendering optimization.');
  }

  if (hasAnySkill(extracted, ['Node.js', 'Express', 'REST', 'GraphQL'])) {
    round3.push('Explain API middleware flow, validation, and error handling patterns.');
  }

  if (noHardSkills) {
    round2.push('Revise communication-driven problem framing for interview case questions.');
    round3.push('Prepare one end-to-end project walkthrough with measurable outcomes.');
  }

  return [
    {
      roundTitle: 'Round 1: Aptitude / Basics',
      items: ensureCount(round1, ['Revise quick arithmetic shortcuts for timed rounds.']),
    },
    {
      roundTitle: 'Round 2: DSA + Core CS',
      items: ensureCount(round2, ['Review request lifecycle from browser to backend and back.']),
    },
    {
      roundTitle: 'Round 3: Tech interview (projects + stack)',
      items: ensureCount(round3, ['Prepare tradeoff-based answers for architecture decisions.']),
    },
    {
      roundTitle: 'Round 4: Managerial / HR',
      items: ensureCount(round4, ['Prepare a concise career roadmap for the next 2 years.']),
    },
  ];
}

export function buildSevenDayPlan(extracted: ExtractedSkills): DayPlan[] {
  const noHardSkills = flattenDetectedSkills(extracted).length === 0;

  const plan: DayPlan[] = [
    {
      day: 'Day 1',
      focus: 'Basics + Core CS',
      tasks: [
        'Revise OOP, DBMS, OS, and Networking core definitions.',
        'Build concise notes for frequently asked fundamentals.',
      ],
    },
    {
      day: 'Day 2',
      focus: 'Basics + Core CS',
      tasks: [
        'Practice concept-to-example explanations for core CS topics.',
        'Attempt one fundamentals quiz and analyze weak areas.',
      ],
    },
    {
      day: 'Day 3',
      focus: 'DSA + coding practice',
      tasks: [
        'Solve array, string, and hashing questions with constraints.',
        'Practice writing optimal and brute-force solutions.',
      ],
    },
    {
      day: 'Day 4',
      focus: 'DSA + coding practice',
      tasks: [
        'Solve tree/graph or DP questions based on current level.',
        'Do one timed coding set and review complexity decisions.',
      ],
    },
    {
      day: 'Day 5',
      focus: 'Project + resume alignment',
      tasks: [
        'Align resume bullets with measurable project impact.',
        'Prepare one deep project narrative with architecture choices.',
      ],
    },
    {
      day: 'Day 6',
      focus: 'Mock interview questions',
      tasks: [
        'Run one technical mock interview (45-60 min).',
        'Run one HR/managerial mock focusing clarity and confidence.',
      ],
    },
    {
      day: 'Day 7',
      focus: 'Revision + weak areas',
      tasks: [
        'Revisit mistakes from coding and aptitude practice.',
        'Summarize final revision sheet for interview day.',
      ],
    },
  ];

  if (hasSkill(extracted, 'React') || hasSkill(extracted, 'Next.js')) {
    plan[4].tasks.push('Revise frontend state management, routing, and rendering lifecycle.');
  }

  if (hasAnySkill(extracted, ['Node.js', 'Express', 'REST', 'GraphQL'])) {
    plan[4].tasks.push('Review backend API design, auth strategy, and error handling choices.');
  }

  if (hasAnySkill(extracted, ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB'])) {
    plan[6].tasks.push('Revise indexing, joins, and query tuning for data-heavy scenarios.');
  }

  if (noHardSkills) {
    plan[0].tasks = ['Revise communication and structured thinking patterns.', 'List 5 project wins with measurable outcomes.'];
    plan[2].tasks = ['Solve basic coding problems from strings/arrays.', 'Practice explaining your approach before writing code.'];
    plan[4].tasks.push('Refresh one full-stack project and highlight end-to-end ownership.');
  }

  return plan;
}

const QUESTION_BANK: Record<string, string[]> = {
  DSA: ['How would you optimize search in sorted data for repeated queries?'],
  OOP: ['How do you apply polymorphism in a real-world project class design?'],
  DBMS: ['Explain normalization up to 3NF and when denormalization is justified.'],
  React: ['Explain state management options in React and when you would choose each.'],
  'Node.js': ['How would you prevent blocking operations in a Node.js API server?'],
  SQL: ['Explain indexing and when it helps versus when it hurts write performance.'],
  AWS: ['How would you design a cost-effective AWS deployment for a student-scale product?'],
  Selenium: ['How do you prevent flaky Selenium tests in CI pipelines?'],
};

const FALLBACK_QUESTIONS = [
  'How do you break down an unfamiliar problem in the first 10 minutes?',
  'Which project in your resume best matches this role, and why?',
  'How do you prioritize correctness vs optimization under interview time limits?',
  'What metrics would you track to measure the success of your feature?',
  'How do you communicate tradeoffs to non-technical stakeholders?',
  'How do you validate assumptions before implementing a feature?',
  'Describe one technical mistake you made and what changed after that.',
  'What makes code production-ready beyond passing unit tests?',
  'How would you identify your weakest interview area and improve it quickly?',
  'How do you prepare for unknown interview questions under time pressure?',
];

export function buildLikelyQuestions(extracted: ExtractedSkills): string[] {
  const skills = [...flattenDetectedSkills(extracted), ...extracted.other];
  const questions: string[] = [];

  skills.forEach((skill) => {
    (QUESTION_BANK[skill] || []).forEach((q) => {
      if (!questions.includes(q) && questions.length < 10) questions.push(q);
    });
  });

  FALLBACK_QUESTIONS.forEach((q) => {
    if (!questions.includes(q) && questions.length < 10) questions.push(q);
  });

  return questions.slice(0, 10);
}

export function calculateBaseScore(input: AnalyzeInput, extracted: ExtractedSkills): number {
  let score = 35;
  const categoryCount = SECTION_KEYS.filter((section) => extracted[section].length > 0).length;
  score += Math.min(categoryCount * 5, 30);
  if (input.company.trim()) score += 10;
  if (input.role.trim()) score += 10;
  if (input.jdText.trim().length > 800) score += 10;
  return Math.min(score, 100);
}

const ENTERPRISE_COMPANIES = new Set([
  'amazon',
  'infosys',
  'tcs',
  'wipro',
  'accenture',
  'microsoft',
  'google',
  'meta',
  'ibm',
  'oracle',
  'cognizant',
  'capgemini',
  'deloitte',
  'hcl',
  'tech mahindra',
]);

const COMPANY_ALIASES: Record<string, string> = {
  infosis: 'infosys',
  infoys: 'infosys',
  amzon: 'amazon',
  amazone: 'amazon',
  googl: 'google',
};

function inferIndustry(company: string, role: string, jdText: string): string {
  const source = `${company} ${role} ${jdText}`.toLowerCase();
  if (/bank|finance|fintech|payments|insurance/.test(source)) return 'Fintech / BFSI';
  if (/health|hospital|medic|pharma/.test(source)) return 'Healthcare Technology';
  if (/e-?commerce|retail|marketplace/.test(source)) return 'E-commerce';
  if (/saas|cloud|platform|software/.test(source)) return 'Software / SaaS';
  return 'Technology Services';
}

function inferSizeCategory(company: string): CompanySizeCategory {
  const raw = company.trim().toLowerCase();
  const key = COMPANY_ALIASES[raw] || raw;
  if (!key) return 'Startup';
  if (ENTERPRISE_COMPANIES.has(key)) return 'Enterprise';
  return 'Startup';
}

function inferHiringFocus(sizeCategory: CompanySizeCategory): string {
  if (sizeCategory === 'Enterprise') {
    return 'Structured DSA + core fundamentals with process-oriented interview rounds.';
  }
  if (sizeCategory === 'Mid-size') {
    return 'Balanced focus on coding strength, execution, and communication.';
  }
  return 'Practical problem solving + stack depth with ownership mindset.';
}

export function generateCompanyIntel(input: AnalyzeInput): CompanyIntel | undefined {
  const companyName = input.company.trim();
  if (!companyName) return undefined;

  const sizeCategory = inferSizeCategory(companyName);
  return {
    companyName,
    industry: inferIndustry(companyName, input.role, input.jdText),
    sizeCategory,
    hiringFocus: inferHiringFocus(sizeCategory),
    demoNote: 'Demo Mode: Company intel generated heuristically.',
  };
}

export function generateRoundMapping(extracted: ExtractedSkills, companyIntel?: CompanyIntel): RoundMapItem[] {
  const size = companyIntel?.sizeCategory;
  const hasDSA = hasSkill(extracted, 'DSA');
  const hasWebStack = hasAnySkill(extracted, ['React', 'Next.js', 'Node.js', 'Express']);

  if (size === 'Enterprise' && hasDSA) {
    return [
      {
        roundTitle: 'Round 1: Online Test',
        focusAreas: ['DSA', 'Aptitude'],
        whyItMatters: 'Screens for speed, accuracy, and baseline fundamentals at scale.',
      },
      {
        roundTitle: 'Round 2: Technical',
        focusAreas: ['DSA', 'Core CS'],
        whyItMatters: 'Validates depth in problem solving and core engineering concepts.',
      },
      {
        roundTitle: 'Round 3: Tech + Projects',
        focusAreas: ['Project architecture', 'Implementation tradeoffs'],
        whyItMatters: 'Checks applied engineering ability beyond textbook answers.',
      },
      {
        roundTitle: 'Round 4: HR',
        focusAreas: ['Communication', 'Role alignment'],
        whyItMatters: 'Ensures team fit and long-term motivation.',
      },
    ];
  }

  if (size === 'Startup' && hasWebStack) {
    return [
      {
        roundTitle: 'Round 1: Practical coding',
        focusAreas: ['Feature implementation', 'Debugging'],
        whyItMatters: 'Startups optimize for immediate execution quality.',
      },
      {
        roundTitle: 'Round 2: System discussion',
        focusAreas: ['Architecture', 'Scaling basics'],
        whyItMatters: 'Assesses product-minded technical decisions under constraints.',
      },
      {
        roundTitle: 'Round 3: Culture fit',
        focusAreas: ['Ownership', 'Collaboration'],
        whyItMatters: 'Small teams need high trust and adaptability.',
      },
    ];
  }

  return [
    {
      roundTitle: 'Round 1: Screening',
      focusAreas: ['Aptitude', 'Coding basics'],
      whyItMatters: 'Establishes interview readiness baseline.',
    },
    {
      roundTitle: 'Round 2: Technical interview',
      focusAreas: ['Core concepts', 'Problem solving'],
      whyItMatters: 'Measures technical depth and reasoning clarity.',
    },
    {
      roundTitle: 'Round 3: Project deep dive',
      focusAreas: ['Project impact', 'Design decisions'],
      whyItMatters: 'Validates practical ownership and execution maturity.',
    },
    {
      roundTitle: 'Round 4: HR / Managerial',
      focusAreas: ['Behavioral fit', 'Career alignment'],
      whyItMatters: 'Confirms communication fit and role commitment.',
    },
  ];
}

export function calculateFinalScore(baseScore: number, confidenceMap: SkillConfidenceMap): number {
  const delta = Object.values(confidenceMap).reduce((sum, value) => sum + (value === 'know' ? 2 : -2), 0);
  return Math.max(0, Math.min(100, baseScore + delta));
}

export function analyzeJobDescription(input: AnalyzeInput): AnalysisEntry {
  const extractedSkills = extractSkills(input.jdText);
  const checklist = buildChecklist(extractedSkills);
  const plan7Days = buildSevenDayPlan(extractedSkills);
  const questions = buildLikelyQuestions(extractedSkills);
  const baseScore = calculateBaseScore(input, extractedSkills);
  const skillConfidenceMap = buildDefaultSkillConfidenceMap(extractedSkills);
  const finalScore = calculateFinalScore(baseScore, skillConfidenceMap);
  const companyIntel = generateCompanyIntel(input);
  const roundMapping = generateRoundMapping(extractedSkills, companyIntel);
  const timestamp = nowIso();

  return {
    id: createId(),
    createdAt: timestamp,
    company: input.company.trim() || '',
    role: input.role.trim() || '',
    jdText: input.jdText.trim(),
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions,
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt: timestamp,
    companyIntel,
  };
}

export function enrichAnalysisEntry(entry: AnalysisEntry): AnalysisEntry {
  const companyIntel = entry.companyIntel || generateCompanyIntel({
    company: entry.company,
    role: entry.role,
    jdText: entry.jdText,
  });

  const roundMapping = entry.roundMapping?.length
    ? entry.roundMapping
    : generateRoundMapping(entry.extractedSkills, companyIntel);

  const baseScore = Number.isFinite(entry.baseScore) ? entry.baseScore : 35;
  const confidenceMap = entry.skillConfidenceMap || buildDefaultSkillConfidenceMap(entry.extractedSkills);
  const finalScore = calculateFinalScore(baseScore, confidenceMap);

  return {
    ...entry,
    companyIntel,
    roundMapping,
    baseScore,
    skillConfidenceMap: confidenceMap,
    finalScore,
    updatedAt: entry.updatedAt || nowIso(),
  };
}