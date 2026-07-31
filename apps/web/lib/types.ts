// packages/types/index.ts
// Shared types for the Corridor monorepo.
// Part 12 (Admin) reads and writes against these shapes.

export type UserRole = 'student' | 'instructor' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  githubUsername?: string;
  avatarUrl?: string;
  joinedAt: string; // ISO date string
  cohortIds: string[];
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
}

export type CourseStatus = 'draft' | 'in_review' | 'published' | 'rejected';

export interface Course {
  id: string;
  title: string;
  programId: string;
  programName: string;
  instructorId: string;
  instructorName: string;
  status: CourseStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  publishedAt?: string;
  lessonCount: number;
  enrollmentCount: number;
}

export interface Program {
  id: string;
  name: string;
  code?: string;
  description: string;
  weekCount: number;
  courseIds: string[];
  cohortIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Cohort {
  id: string;
  name: string;
  programId: string;
  programName: string;
  instructorId: string;
  instructorName: string;
  startDate: string;
  weekCount: number;
  currentWeek?: number;
  learnerCount: number;
  teamCount: number;
  status: 'upcoming' | 'active' | 'completed';
  completionRate: number; // 0-100
}

export interface Team {
  id: string;
  cohortId: string;
  name: string;
  memberIds: string[];
  memberNames: string[];
  createdAt: string;
}

export type RosterStatus = 'active' | 'removed';

export interface RosterMember {
  id: string;
  cohortId: string;
  userId: string;
  userName: string;
  userEmail: string;
  githubUsername?: string;
  teamId?: string;
  teamName?: string;
  joinedAt: string;
  status: RosterStatus;
  removedAt?: string;
}


export type TaskState = 'Assigned' | 'Branched' | 'Pushed' | 'In Review' | 'Closed';

export interface Task {
  id: string;
  title: string;
  teamId: string;
  teamName: string;
  cohortId: string;
  state: TaskState;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Contribution {
  learnerId: string;
  learnerName: string;
  taskId: string;
  cohortId: string;
  compositeScore: number;
  rawCommitCount: number;
  filesDistinct: number;
  linesApproved: number;
  reviewsGiven: number;
  weekBreakdown: number[]; // per week
}

export type AgentId =
  | 'manager'
  | 'review'
  | 'progress-coach'
  | 'tutor'
  | 'content'
  | 'quiz'
  | 'recommendation'
  | 'instructor-assistant'
  | 'admin';

export type AutonomyLevel = 'suggest_only' | 'autonomous';

export interface AgentConfig {
  agentId: AgentId;
  name: string;
  description: string;
  enabled: boolean;
  autonomyLevel?: AutonomyLevel; // only for manager
  updatedAt: string;
  updatedBy: string;
}

export interface CourseAgentConfig {
  courseId: string;
  autonomyLevel: AutonomyLevel;
  updatedAt: string;
}

export type ModerationItemType = 'discussion_post' | 'ai_flagged_submission';
export type ModerationAction = 'dismiss' | 'remove' | 'warn' | 'escalate';
export type ModerationStatus = 'pending' | 'resolved';

export interface ModerationItem {
  id: string;
  type: ModerationItemType;
  flaggedAt: string;
  flaggedBy: string; // 'system' | user id
  flagReason: string;
  content: string;
  authorId: string;
  authorName: string;
  contextLabel: string; // e.g. "Web3 Foundations · Week 3 Discussion"
  status: ModerationStatus;
  resolution?: ModerationAction;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface PlatformAnalytics {
  activeCohorts: number;
  totalLearners: number;
  avgCompletionRate: number; // 0-100
  aiActionsThisWeek: number;
  loginSuccessRate: number; // 0-100
  uptimePercent: number; // 0-100
  // by program/date — simplified
  cohortsByProgram: { programName: string; count: number }[];
  completionTrend: { week: string; rate: number }[];
}

export interface InstructorPerformance {
  instructorId: string;
  instructorName: string;
  cohortsRun: number;
  avgTimeToReviewHours: number;
  assignedCohorts: { id: string; name: string }[];
}

export interface ReportRequest {
  cohortId?: string;
  programId?: string;
  format: 'csv' | 'pdf';
  requestedAt: string;
  requestedBy: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  targetId: string;
  targetType: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  detail?: string;
}
