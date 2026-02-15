import {
  AnalysisEntry,
  AnalyzeInput,
  CATEGORY_ORDER,
  ChecklistRound,
  DayPlan,
  ExtractedSkills,
  SkillCategory,
} from '../types/analysis';

interface SkillPattern {
  skill: string;
  patterns: RegExp[];
}

const SKILL_PATTERNS: Record<Exclude<SkillCategory, 'General'>, SkillPattern[]> = {
  'Core CS': [
    { skill: 'DSA', patterns: [/\bdsa\b/i, /data\s*structures?\s*(and|&)\s*algorithms?/i] },
    { skill: 'OOP', patterns: [/\boop\b/i, /object\s*oriented/i] },
    { skill: 'DBMS', patterns: [/\bdbms\b/i, /database\s*management/i] },
    { skill: 'OS', patterns: [/\bos\b/i, /operating\s*systems?/i] },
    { skill: 'Networks', patterns: [/\bnetworks?\b/i, /computer\s*networking/i, /tcp\/?ip/i] },
  ],
  Languages: [
    { skill: 'Java', patterns: [/\bjava\b/i] },
    { skill: 'Python', patterns: [/\bpython\b/i] },
    { skill: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
    { skill: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
    { skill: 'C', patterns: [/\bc\s*language\b/i, /\blanguage\s*[:\-]\s*c\b/i, /\bc,\s*c\+\+\b/i] },
    { skill: 'C++', patterns: [/\bc\+\+\b/i] },
    { skill: 'C#', patterns: [/\bc#\b/i, /csharp/i] },
    { skill: 'Go', patterns: [/\bgolang\b/i, /\bgo\s*language\b/i, /\blanguage\s*[:\-]\s*go\b/i] },
  ],
  Web: [
    { skill: 'React', patterns: [/\breact\b/i] },
    { skill: 'Next.js', patterns: [/\bnext\.?js\b/i, /\bnextjs\b/i] },
    { skill: 'Node.js', patterns: [/\bnode\.?js\b/i, /\bnodejs\b/i] },
    { skill: 'Express', patterns: [/\bexpress\b/i] },
    { skill: 'REST', patterns: [/\brest\b/i, /restful/i, /rest\s*api/i] },
    { skill: 'GraphQL', patterns: [/\bgraphql\b/i] },
  ],
  Data: [
    { skill: 'SQL', patterns: [/\bsql\b/i] },
    { skill: 'MongoDB', patterns: [/\bmongodb\b/i] },
    { skill: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
    { skill: 'MySQL', patterns: [/\bmysql\b/i] },
    { skill: 'Redis', patterns: [/\bredis\b/i] },
  ],
  'Cloud/DevOps': [
    { skill: 'AWS', patterns: [/\baws\b/i, /amazon\s*web\s*services/i] },
    { skill: 'Azure', patterns: [/\bazure\b/i] },
    { skill: 'GCP', patterns: [/\bgcp\b/i, /google\s*cloud/i] },
    { skill: 'Docker', patterns: [/\bdocker\b/i] },
    { skill: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { skill: 'CI/CD', patterns: [/\bci\s*\/\s*cd\b/i, /continuous\s*integration/i, /continuous\s*deployment/i] },
    { skill: 'Linux', patterns: [/\blinux\b/i] },
  ],
  Testing: [
    { skill: 'Selenium', patterns: [/\bselenium\b/i] },
    { skill: 'Cypress', patterns: [/\bcypress\b/i] },
    { skill: 'Playwright', patterns: [/\bplaywright\b/i] },
    { skill: 'JUnit', patterns: [/\bjunit\b/i] },
    { skill: 'PyTest', patterns: [/\bpytest\b/i] },
  ],
};

function createEmptySkills(): ExtractedSkills {
  return {
    'Core CS': [],
    Languages: [],
    Web: [],
    Data: [],
    'Cloud/DevOps': [],
    Testing: [],
    General: [],
  };
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

export function extractSkills(jdText: string): ExtractedSkills {
  const extracted = createEmptySkills();

  CATEGORY_ORDER.forEach((category) => {
    SKILL_PATTERNS[category].forEach(({ skill, patterns }) => {
      if (patterns.some((pattern) => pattern.test(jdText))) {
        extracted[category].push(skill);
      }
    });

    extracted[category] = dedupe(extracted[category]);
  });

  const detectedCount = CATEGORY_ORDER.reduce((acc, category) => acc + extracted[category].length, 0);
  if (detectedCount === 0) {
    extracted.General = ['General fresher stack'];
  }

  return extracted;
}

function ensureCount(seedItems: string[], fillers: string[], min = 5, max = 8): string[] {
  const merged = dedupe([...seedItems, ...fillers]);
  return merged.slice(0, Math.max(min, Math.min(max, merged.length)));
}

function hasSkill(extracted: ExtractedSkills, skill: string): boolean {
  return CATEGORY_ORDER.some((category) => extracted[category].includes(skill));
}

function flattenDetectedSkills(extracted: ExtractedSkills): string[] {
  return dedupe(CATEGORY_ORDER.flatMap((category) => extracted[category]));
}

export function buildChecklist(extracted: ExtractedSkills): ChecklistRound[] {
  const detected = flattenDetectedSkills(extracted);

  const round1Base = [
    'Revise quantitative aptitude topics (percentages, ratios, time-work).',
    'Practice 20 logical reasoning questions with timer.',
    'Review CS fundamentals vocabulary and common definitions.',
    'Prepare a one-minute self-introduction for screening rounds.',
    'Revise language basics and syntax for your primary coding language.',
  ];

  const round2Base = [
    'Solve 2 easy and 2 medium DSA problems under time constraints.',
    'Revise OS concepts: process vs thread, scheduling, and deadlocks.',
    'Revise DBMS normalization, ACID properties, and transaction basics.',
    'Review networking basics: HTTP/HTTPS, TCP vs UDP, DNS flow.',
    'Practice writing clean pseudocode before coding.',
  ];

  const round3Base = [
    'Prepare one project deep-dive: architecture, decisions, and tradeoffs.',
    'Map your project features to technologies in the job description.',
    'Practice explaining one challenging bug and how you fixed it.',
    'Prepare STAR-format examples for ownership and collaboration.',
    'Do one technical mock interview with 45-minute structure.',
  ];

  const round4Base = [
    'Prepare concise answers for Why this company and Why this role.',
    'Prepare salary expectation and location flexibility response.',
    'Draft examples for conflict resolution and teamwork situations.',
    'Prepare questions to ask interviewer about role expectations.',
    'Review your resume line by line for consistency.',
  ];

  const round2SkillItems: string[] = [];
  if (hasSkill(extracted, 'DSA')) round2SkillItems.push('Practice binary search, sliding window, and DP pattern recognition.');
  if (hasSkill(extracted, 'OOP')) round2SkillItems.push('Revise OOP pillars with practical examples from your projects.');
  if (hasSkill(extracted, 'DBMS') || hasSkill(extracted, 'SQL')) round2SkillItems.push('Practice SQL joins, indexing, and query optimization scenarios.');
  if (hasSkill(extracted, 'OS')) round2SkillItems.push('Revise memory management and process synchronization use cases.');
  if (hasSkill(extracted, 'Networks')) round2SkillItems.push('Explain request lifecycle from browser to backend and back.');

  const round3SkillItems: string[] = [];
  if (hasSkill(extracted, 'React')) round3SkillItems.push('Review React state management and component rendering optimization.');
  if (hasSkill(extracted, 'Next.js')) round3SkillItems.push('Revise SSR vs SSG and routing strategy in Next.js.');
  if (hasSkill(extracted, 'Node.js') || hasSkill(extracted, 'Express')) round3SkillItems.push('Explain API middleware flow, validation, and error handling patterns.');
  if (hasSkill(extracted, 'GraphQL')) round3SkillItems.push('Practice designing GraphQL schema and resolver-level authorization.');
  if (hasSkill(extracted, 'Docker') || hasSkill(extracted, 'Kubernetes')) round3SkillItems.push('Discuss containerization workflow and deployment rollout basics.');
  if (hasSkill(extracted, 'AWS') || hasSkill(extracted, 'Azure') || hasSkill(extracted, 'GCP')) {
    round3SkillItems.push('Prepare cloud service mapping for your project deployment setup.');
  }
  if (extracted.Testing.length > 0) round3SkillItems.push('Prepare testing strategy: unit, integration, and E2E coverage highlights.');
  if (detected.length === 0) round3SkillItems.push('Prepare one end-to-end project walkthrough with measurable outcomes.');

  return [
    {
      title: 'Round 1: Aptitude / Basics',
      items: ensureCount(round1Base, [
        'Solve one sectional aptitude test and review mistakes.',
        'Revise quick arithmetic shortcuts for timed rounds.',
      ]),
    },
    {
      title: 'Round 2: DSA + Core CS',
      items: ensureCount([...round2Base, ...round2SkillItems], [
        'Practice dry-run explanations while solving coding questions.',
        'Revise complexity analysis (time and space) for common patterns.',
      ]),
    },
    {
      title: 'Round 3: Tech interview (projects + stack)',
      items: ensureCount([...round3Base, ...round3SkillItems], [
        'Prepare tradeoff-based answers for architecture decisions.',
        'Practice discussing performance bottlenecks and optimization steps.',
      ]),
    },
    {
      title: 'Round 4: Managerial / HR',
      items: ensureCount(round4Base, [
        'Prepare a concise career roadmap for the next 2 years.',
        'Practice confident communication with mock HR Q&A.',
      ]),
    },
  ];
}

export function buildSevenDayPlan(extracted: ExtractedSkills): DayPlan[] {
  const detected = flattenDetectedSkills(extracted);

  const plan: DayPlan[] = [
    {
      day: 'Day 1',
      focus: 'Basics + Core CS',
      items: [
        'Revise OOP, DBMS, OS, and Networking core definitions.',
        'Build concise notes for frequently asked fundamentals.',
      ],
    },
    {
      day: 'Day 2',
      focus: 'Basics + Core CS',
      items: [
        'Practice concept-to-example explanations for core CS topics.',
        'Attempt one fundamentals quiz and analyze weak areas.',
      ],
    },
    {
      day: 'Day 3',
      focus: 'DSA + coding practice',
      items: [
        'Solve array, string, and hashing questions with constraints.',
        'Practice writing optimal and brute-force solutions.',
      ],
    },
    {
      day: 'Day 4',
      focus: 'DSA + coding practice',
      items: [
        'Solve tree/graph or DP questions based on current level.',
        'Do one timed coding set and review complexity decisions.',
      ],
    },
    {
      day: 'Day 5',
      focus: 'Project + resume alignment',
      items: [
        'Align resume bullets with measurable project impact.',
        'Prepare one deep project narrative with architecture choices.',
      ],
    },
    {
      day: 'Day 6',
      focus: 'Mock interview questions',
      items: [
        'Run one technical mock interview (45-60 min).',
        'Run one HR/managerial mock focusing clarity and confidence.',
      ],
    },
    {
      day: 'Day 7',
      focus: 'Revision + weak areas',
      items: [
        'Revisit mistakes from coding and aptitude practice.',
        'Summarize final revision sheet for interview day.',
      ],
    },
  ];

  if (hasSkill(extracted, 'React') || hasSkill(extracted, 'Next.js')) {
    plan[4].items.push('Revise frontend state management, routing, and rendering lifecycle.');
    plan[6].items.push('Do a focused frontend revision pass (React/Next.js patterns).');
  }

  if (hasSkill(extracted, 'Node.js') || hasSkill(extracted, 'Express') || hasSkill(extracted, 'REST') || hasSkill(extracted, 'GraphQL')) {
    plan[4].items.push('Review backend API design, auth strategy, and error handling choices.');
  }

  if (hasSkill(extracted, 'SQL') || hasSkill(extracted, 'PostgreSQL') || hasSkill(extracted, 'MySQL') || hasSkill(extracted, 'MongoDB')) {
    plan[1].items.push('Practice database schema discussion and query optimization examples.');
    plan[6].items.push('Revise indexing, joins, and query tuning for data-heavy scenarios.');
  }

  if (hasSkill(extracted, 'AWS') || hasSkill(extracted, 'Azure') || hasSkill(extracted, 'GCP') || hasSkill(extracted, 'Docker')) {
    plan[5].items.push('Explain deployment pipeline, environments, and rollback strategy.');
  }

  if (detected.length === 0) {
    plan[4].items.push('Refresh one full-stack project and highlight end-to-end ownership.');
  }

  return plan;
}

const QUESTION_BANK: Record<string, string[]> = {
  DSA: [
    'How would you optimize search in sorted data for repeated queries?',
    'When would you choose a heap over a balanced BST in interview problems?',
  ],
  OOP: [
    'How do you apply polymorphism in a real-world project class design?',
  ],
  DBMS: [
    'Explain normalization up to 3NF and when denormalization is justified.',
  ],
  OS: [
    'How do threads differ from processes, and where can race conditions appear?',
  ],
  Networks: [
    'Walk through what happens when you type a URL and press Enter.',
  ],
  Java: [
    'What are the practical differences between HashMap and ConcurrentHashMap?',
  ],
  Python: [
    'How do Python generators help optimize memory for large data processing?',
  ],
  JavaScript: [
    'How does the event loop handle async tasks and microtasks in JavaScript?',
  ],
  TypeScript: [
    'How do union types and type guards improve API contract safety?',
  ],
  'C++': [
    'When would you use move semantics and how does it improve performance?',
  ],
  'C#': [
    'How do async/await and Task differ from traditional threading in C#?',
  ],
  Go: [
    'How do goroutines and channels simplify concurrent service design?',
  ],
  React: [
    'Explain state management options in React and when you would choose each.',
  ],
  'Next.js': [
    'When do you pick SSR, SSG, or ISR in Next.js for a product page?',
  ],
  'Node.js': [
    'How would you prevent blocking operations in a Node.js API server?',
  ],
  Express: [
    'How do you structure Express middleware for validation, auth, and errors?',
  ],
  REST: [
    'How do you version REST APIs without breaking existing clients?',
  ],
  GraphQL: [
    'How would you avoid over-fetching and N+1 issues in GraphQL resolvers?',
  ],
  SQL: [
    'Explain indexing and when it helps versus when it hurts write performance.',
  ],
  MongoDB: [
    'When would you model data in embedded documents vs references in MongoDB?',
  ],
  PostgreSQL: [
    'How would you use PostgreSQL indexing strategies for mixed read/write workloads?',
  ],
  MySQL: [
    'How do transactions and isolation levels impact consistency in MySQL?',
  ],
  Redis: [
    'What data structures in Redis are best for rate limiting and why?',
  ],
  AWS: [
    'How would you design a cost-effective AWS deployment for a student-scale product?',
  ],
  Azure: [
    'How do you secure application secrets and environment config in Azure deployments?',
  ],
  GCP: [
    'How would you monitor service reliability and errors in GCP?',
  ],
  Docker: [
    'How do you optimize Docker image size and startup time for faster delivery?',
  ],
  Kubernetes: [
    'What is the role of readiness and liveness probes in Kubernetes?',
  ],
  'CI/CD': [
    'How would you structure CI/CD stages for tests, build, and safe release?',
  ],
  Linux: [
    'Which Linux commands do you rely on most while debugging production issues?',
  ],
  Selenium: [
    'How do you prevent flaky Selenium tests in CI pipelines?',
  ],
  Cypress: [
    'When is Cypress preferred over Selenium for frontend E2E testing?',
  ],
  Playwright: [
    'How do you use Playwright fixtures to keep test suites maintainable?',
  ],
  JUnit: [
    'How do you design JUnit tests to isolate logic from external dependencies?',
  ],
  PyTest: [
    'How do PyTest fixtures improve readability and reusability in tests?',
  ],
};

const FALLBACK_QUESTIONS = [
  'How would you design your interview preparation strategy for a 2-week timeline?',
  'Which project in your resume best matches this role, and why?',
  'How do you prioritize correctness vs optimization under interview time limits?',
  'Describe one technical mistake you made and what changed after that.',
  'How do you validate assumptions before implementing a feature?',
  'How do you communicate tradeoffs to non-technical stakeholders?',
  'What metrics would you track to measure the success of your feature?',
  'How do you break down an unfamiliar problem in the first 10 minutes?',
  'What makes code production-ready beyond passing unit tests?',
  'How would you identify your weakest interview area and improve it quickly?',
];

export function buildLikelyQuestions(extracted: ExtractedSkills): string[] {
  const skills = flattenDetectedSkills(extracted);
  const questions: string[] = [];

  skills.forEach((skill) => {
    const fromBank = QUESTION_BANK[skill] || [];
    fromBank.forEach((q) => {
      if (questions.length < 10 && !questions.includes(q)) {
        questions.push(q);
      }
    });
  });

  FALLBACK_QUESTIONS.forEach((q) => {
    if (questions.length < 10 && !questions.includes(q)) {
      questions.push(q);
    }
  });

  return questions.slice(0, 10);
}

export function calculateReadinessScore(input: AnalyzeInput, extracted: ExtractedSkills): number {
  let score = 35;

  const categoriesPresent = CATEGORY_ORDER.filter((category) => extracted[category].length > 0).length;
  score += Math.min(categoriesPresent * 5, 30);

  if (input.company.trim()) score += 10;
  if (input.role.trim()) score += 10;
  if (input.jdText.trim().length > 800) score += 10;

  return Math.min(score, 100);
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `analysis-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function analyzeJobDescription(input: AnalyzeInput): AnalysisEntry {
  const extractedSkills = extractSkills(input.jdText);
  const checklist = buildChecklist(extractedSkills);
  const plan = buildSevenDayPlan(extractedSkills);
  const questions = buildLikelyQuestions(extractedSkills);
  const readinessScore = calculateReadinessScore(input, extractedSkills);

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    company: input.company.trim(),
    role: input.role.trim(),
    jdText: input.jdText.trim(),
    extractedSkills,
    plan,
    checklist,
    questions,
    readinessScore,
  };
}