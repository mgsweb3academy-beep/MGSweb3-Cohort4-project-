// apps/web/lib/mock-data.ts
// Mock data for Part 12 (Admin Panel). Seeded with the same example data
// as the landing page: Cohort 07, 41 learners, Team 4 at 82%.
// All frontend parts build against these shapes until Part 14 ships real endpoints.

import type {
  User, Course, Cohort, Program, Team, RosterMember, AgentConfig, ModerationItem,
  PlatformAnalytics, InstructorPerformance, AuditLogEntry,
} from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Adaeze O.', email: 'adaeze@mgs.io', role: 'student', status: 'active', githubUsername: 'adaeze-o', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '' },
  { id: 'u2', name: 'Marcus B.', email: 'marcus@mgs.io', role: 'student', status: 'active', githubUsername: 'marcus-b', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '' },
  { id: 'u3', name: 'Priya N.', email: 'priya@mgs.io', role: 'student', status: 'active', githubUsername: 'priya-n', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '' },
  { id: 'u4', name: 'Tobi A.', email: 'tobi@mgs.io', role: 'student', status: 'active', githubUsername: 'tobi-a', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '' },
  { id: 'u5', name: 'Ini E.', email: 'ini@mgs.io', role: 'student', status: 'active', githubUsername: 'ini-e', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '' },
  { id: 'u6', name: 'Sam K.', email: 'sam@mgs.io', role: 'student', status: 'suspended', githubUsername: 'sam-k', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '', suspendedAt: '2025-03-01', suspendedBy: 'admin-1', suspensionReason: 'Academic integrity violation' },
  { id: 'u7', name: 'Zainab M.', email: 'zainab@mgs.io', role: 'student', status: 'active', githubUsername: 'zainab-m', joinedAt: '2025-01-10', cohortIds: ['c07'], avatarUrl: '' },
  { id: 'u8', name: 'Dr. Yemi F.', email: 'yemi@mgs.io', role: 'instructor', status: 'active', joinedAt: '2024-09-01', cohortIds: ['c07', 'c06'], avatarUrl: '' },
  { id: 'u9', name: 'Bayo L.', email: 'bayo@mgs.io', role: 'instructor', status: 'active', joinedAt: '2024-09-01', cohortIds: ['c05'], avatarUrl: '' },
  { id: 'admin-1', name: 'Admin User', email: 'admin@mgs.io', role: 'admin', status: 'active', joinedAt: '2024-01-01', cohortIds: [], avatarUrl: '' },
  // remaining 31 learners collapsed for brevity — in production these come from the API
  ...Array.from({ length: 31 }, (_, i) => ({
    id: `u${10 + i}`,
    name: `Learner ${i + 10}`,
    email: `learner${i + 10}@mgs.io`,
    role: 'student' as const,
    status: 'active' as const,
    joinedAt: '2025-01-10',
    cohortIds: ['c07'],
    avatarUrl: '',
  })),
];

export const MOCK_COURSES: Course[] = [
  { id: 'crs1', title: 'Solidity Fundamentals', programId: 'p1', programName: 'Backend Engineering', instructorId: 'u8', instructorName: 'Dr. Yemi F.', status: 'published', submittedAt: '2025-01-05', reviewedAt: '2025-01-08', reviewedBy: 'admin-1', publishedAt: '2025-01-08', lessonCount: 12, enrollmentCount: 41 },
  { id: 'crs2', title: 'Smart Contract Security', programId: 'p1', programName: 'Backend Engineering', instructorId: 'u8', instructorName: 'Dr. Yemi F.', status: 'in_review', submittedAt: '2025-03-10', lessonCount: 8, enrollmentCount: 0 },
  { id: 'crs3', title: 'DApp Architecture', programId: 'p2', programName: 'Web3 Foundations', instructorId: 'u9', instructorName: 'Bayo L.', status: 'draft', lessonCount: 5, enrollmentCount: 0 },
  { id: 'crs4', title: 'EVM Internals', programId: 'p1', programName: 'Backend Engineering', instructorId: 'u8', instructorName: 'Dr. Yemi F.', status: 'rejected', submittedAt: '2025-02-20', reviewedAt: '2025-02-22', reviewedBy: 'admin-1', rejectionReason: 'Lesson 3 references deprecated API. Please update before resubmitting.', lessonCount: 6, enrollmentCount: 0 },
];

export const MOCK_COHORTS: Cohort[] = [
  { id: 'c07', name: 'Backend Engineering — Cohort 07', programId: 'p1', programName: 'Backend Engineering', instructorId: 'u8', instructorName: 'Dr. Yemi F.', startDate: '2025-01-13', weekCount: 8, learnerCount: 41, teamCount: 9, status: 'active', completionRate: 62 },
  { id: 'c06', name: 'Backend Engineering — Cohort 06', programId: 'p1', programName: 'Backend Engineering', instructorId: 'u8', instructorName: 'Dr. Yemi F.', startDate: '2024-09-09', weekCount: 8, learnerCount: 38, teamCount: 8, status: 'completed', completionRate: 89 },
  { id: 'c05', name: 'Web3 Foundations — Cohort 05', programId: 'p2', programName: 'Web3 Foundations', instructorId: 'u9', instructorName: 'Bayo L.', startDate: '2024-06-03', weekCount: 6, learnerCount: 29, teamCount: 6, status: 'completed', completionRate: 93 },
];

export const MOCK_PROGRAMS: Program[] = [
  { id: 'p1', name: 'Backend Engineering', code: 'BE-101', description: 'Smart contract development and on-chain architecture.', weekCount: 8, courseIds: ['crs1', 'crs2', 'crs4'], cohortIds: ['c05', 'c06', 'c07'], createdAt: '2024-01-01' },
  { id: 'p2', name: 'Web3 Foundations', code: 'W3F-100', description: 'DApps, wallets, and the EVM for non-engineers.', weekCount: 6, courseIds: ['crs3'], cohortIds: ['c05'], createdAt: '2024-01-01' },
];

export const MOCK_TEAMS: Team[] = [
  { id: 't1', cohortId: 'c07', name: 'Team 1', memberIds: ['u10', 'u11', 'u12', 'u13'], memberNames: ['Learner 10', 'Learner 11', 'Learner 12', 'Learner 13'], createdAt: '2025-01-13' },
  { id: 't2', cohortId: 'c07', name: 'Team 2', memberIds: ['u14', 'u15', 'u16', 'u17'], memberNames: ['Learner 14', 'Learner 15', 'Learner 16', 'Learner 17'], createdAt: '2025-01-13' },
  { id: 't3', cohortId: 'c07', name: 'Team 3', memberIds: ['u18', 'u19', 'u20', 'u21'], memberNames: ['Learner 18', 'Learner 19', 'Learner 20', 'Learner 21'], createdAt: '2025-01-13' },
  { id: 't4', cohortId: 'c07', name: 'Team 4', memberIds: ['u1', 'u2', 'u3', 'u4'], memberNames: ['Adaeze O.', 'Marcus B.', 'Priya N.', 'Tobi A.'], createdAt: '2025-01-13' },
  { id: 't5', cohortId: 'c07', name: 'Team 5', memberIds: ['u5', 'u7', 'u22', 'u23'], memberNames: ['Ini E.', 'Zainab M.', 'Learner 22', 'Learner 23'], createdAt: '2025-01-13' },
  { id: 't6', cohortId: 'c07', name: 'Team 6', memberIds: ['u24', 'u25', 'u26', 'u27'], memberNames: ['Learner 24', 'Learner 25', 'Learner 26', 'Learner 27'], createdAt: '2025-01-13' },
  { id: 't7', cohortId: 'c07', name: 'Team 7', memberIds: ['u28', 'u29', 'u30', 'u31'], memberNames: ['Learner 28', 'Learner 29', 'Learner 30', 'Learner 31'], createdAt: '2025-01-13' },
  { id: 't8', cohortId: 'c07', name: 'Team 8', memberIds: ['u32', 'u33', 'u34', 'u35'], memberNames: ['Learner 32', 'Learner 33', 'Learner 34', 'Learner 35'], createdAt: '2025-01-13' },
  { id: 't9', cohortId: 'c07', name: 'Team 9', memberIds: ['u36', 'u37', 'u38', 'u39', 'u40'], memberNames: ['Learner 36', 'Learner 37', 'Learner 38', 'Learner 39', 'Learner 40'], createdAt: '2025-01-13' },
];

export const MOCK_ROSTER: RosterMember[] = [
  { id: 'r1', cohortId: 'c07', userId: 'u1', userName: 'Adaeze O.', userEmail: 'adaeze@mgs.io', githubUsername: 'adaeze-o', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
  { id: 'r2', cohortId: 'c07', userId: 'u2', userName: 'Marcus B.', userEmail: 'marcus@mgs.io', githubUsername: 'marcus-b', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
  { id: 'r3', cohortId: 'c07', userId: 'u3', userName: 'Priya N.', userEmail: 'priya@mgs.io', githubUsername: 'priya-n', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
  { id: 'r4', cohortId: 'c07', userId: 'u4', userName: 'Tobi A.', userEmail: 'tobi@mgs.io', githubUsername: 'tobi-a', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
  { id: 'r5', cohortId: 'c07', userId: 'u5', userName: 'Ini E.', userEmail: 'ini@mgs.io', githubUsername: 'ini-e', teamId: 't5', teamName: 'Team 5', joinedAt: '2025-01-13', status: 'active' },
  { id: 'r6', cohortId: 'c07', userId: 'u6', userName: 'Sam K.', userEmail: 'sam@mgs.io', githubUsername: 'sam-k', teamId: undefined, teamName: undefined, joinedAt: '2025-01-13', status: 'removed', removedAt: '2025-03-01' },
  { id: 'r7', cohortId: 'c07', userId: 'u7', userName: 'Zainab M.', userEmail: 'zainab@mgs.io', githubUsername: 'zainab-m', teamId: 't5', teamName: 'Team 5', joinedAt: '2025-01-13', status: 'active' },
  ...Array.from({ length: 34 }, (_, i) => ({
    id: `r${8 + i}`,
    cohortId: 'c07',
    userId: `u${10 + i}`,
    userName: `Learner ${10 + i}`,
    userEmail: `learner${10 + i}@mgs.io`,
    githubUsername: `learner-${10 + i}`,
    teamId: `t${1 + (i % 9)}`,
    teamName: `Team ${1 + (i % 9)}`,
    joinedAt: '2025-01-13',
    status: 'active' as const,
  })),
];


export const MOCK_AGENT_CONFIGS: AgentConfig[] = [
  { agentId: 'manager', name: 'Manager', description: 'Owns task lifecycle: assigns, advances, flags, escalates.', enabled: true, autonomyLevel: 'autonomous', updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'review', name: 'Review', description: 'First-pass code feedback before peer review.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'progress-coach', name: 'Progress coach', description: 'Tracks pace, flags falling-behind learners, drafts nudges.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'tutor', name: 'Tutor', description: 'Answers questions, explains concepts, gives examples.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'content', name: 'Content', description: 'Generates lesson summaries and study notes.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'quiz', name: 'Quiz', description: 'Generates quizzes and flashcards, grades short answers.', enabled: false, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'recommendation', name: 'Recommendation', description: 'Suggests next lesson or task from progress and interest.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'instructor-assistant', name: 'Instructor assistant', description: 'Drafts announcements, rubrics, course material suggestions.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
  { agentId: 'admin', name: 'Admin agent', description: 'Generates platform reports and health summaries.', enabled: true, updatedAt: '2025-03-01T09:00:00Z', updatedBy: 'admin-1' },
];

export const MOCK_MODERATION_ITEMS: ModerationItem[] = [
  { id: 'm1', type: 'discussion_post', flaggedAt: '2025-03-12T14:22:00Z', flaggedBy: 'u3', flagReason: 'Inappropriate language', content: 'This assignment is impossible and whoever wrote it clearly doesn\'t know what they\'re doing.', authorId: 'u2', authorName: 'Marcus B.', contextLabel: 'Solidity Fundamentals · Week 3 Discussion', status: 'pending' },
  { id: 'm2', type: 'ai_flagged_submission', flaggedAt: '2025-03-13T08:11:00Z', flaggedBy: 'system', flagReason: 'Near-identical code pattern detected in two team submissions — possible integrity issue.', content: 'PR #47: Auth service implementation — Team 4 and Team 7 share 91% similar code structure.', authorId: 'u4', authorName: 'Tobi A.', contextLabel: 'Auth service task · Team 4 vs Team 7', status: 'pending' },
  { id: 'm3', type: 'discussion_post', flaggedAt: '2025-03-11T19:45:00Z', flaggedBy: 'system', flagReason: 'AI content moderation: potential misinformation', content: 'You can bypass gas fees entirely by calling the function off-chain — no gas needed at all.', authorId: 'u7', authorName: 'Zainab M.', contextLabel: 'EVM Internals · General Q&A', status: 'pending' },
  { id: 'm4', type: 'discussion_post', flaggedAt: '2025-03-09T11:30:00Z', flaggedBy: 'u1', flagReason: 'Off-topic / spam', content: 'Check out my NFT project here: [link removed]', authorId: `u10`, authorName: 'Learner 10', contextLabel: 'Web3 Foundations · Announcements', status: 'resolved', resolution: 'remove', resolvedAt: '2025-03-09T12:00:00Z', resolvedBy: 'admin-1' },
];

export const MOCK_ANALYTICS: PlatformAnalytics = {
  activeCohorts: 1,
  totalLearners: 41,
  avgCompletionRate: 62,
  aiActionsThisWeek: 47,
  loginSuccessRate: 97,
  uptimePercent: 99.4,
  cohortsByProgram: [
    { programName: 'Backend Engineering', count: 2 },
    { programName: 'Web3 Foundations', count: 1 },
  ],
  completionTrend: [
    { week: 'w1', rate: 100 },
    { week: 'w2', rate: 95 },
    { week: 'w3', rate: 88 },
    { week: 'w4', rate: 79 },
    { week: 'w5', rate: 62 },
  ],
};

export const MOCK_INSTRUCTOR_PERFORMANCE: InstructorPerformance[] = [
  { instructorId: 'u8', instructorName: 'Dr. Yemi F.', cohortsRun: 2, avgTimeToReviewHours: 18, assignedCohorts: [{ id: 'c06', name: 'Cohort 06' }, { id: 'c07', name: 'Cohort 07' }] },
  { instructorId: 'u9', instructorName: 'Bayo L.', cohortsRun: 1, avgTimeToReviewHours: 11, assignedCohorts: [{ id: 'c05', name: 'Cohort 05' }] },
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'al1', action: 'user.suspended', targetId: 'u6', targetType: 'user', performedBy: 'admin-1', performedByName: 'Admin User', timestamp: '2025-03-01T10:05:00Z', detail: 'Academic integrity violation' },
  { id: 'al2', action: 'course.rejected', targetId: 'crs4', targetType: 'course', performedBy: 'admin-1', performedByName: 'Admin User', timestamp: '2025-02-22T14:30:00Z', detail: 'Lesson 3 references deprecated API.' },
  { id: 'al3', action: 'agent.toggled', targetId: 'quiz', targetType: 'agent', performedBy: 'admin-1', performedByName: 'Admin User', timestamp: '2025-03-01T09:00:00Z', detail: 'Quiz agent disabled.' },
  { id: 'al4', action: 'moderation.remove', targetId: 'm4', targetType: 'moderation', performedBy: 'admin-1', performedByName: 'Admin User', timestamp: '2025-03-09T12:00:00Z', detail: 'Post removed: off-topic/spam.' },
  { id: 'al5', action: 'course.published', targetId: 'crs1', targetType: 'course', performedBy: 'admin-1', performedByName: 'Admin User', timestamp: '2025-01-08T11:00:00Z', detail: 'Solidity Fundamentals approved and published.' },
];
