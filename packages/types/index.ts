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

/** Canonical ordering. Used to validate forward-only transitions. */
export const TASK_STATES: TaskState[] = [
  'Assigned',
  'Branched',
  'Pushed',
  'In Review',
  'Closed',
];

export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * A single state change on a Task.
 * by: 'system' | 'manager' | userId
 * Parts 6, 7, and 8 write transitions; Part 5 owns the model.
 */
export interface TaskTransition {
  from: TaskState | null; // null on creation
  to: TaskState;
  at: string;      // ISO timestamp
  by: string;      // 'system' | 'manager' | userId
  byName: string;  // 'System' | 'Manager' | user display name
}

export type ReviewStatus = 'approved' | 'changes_requested';

export interface TaskReview {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewerName: string;
  status: ReviewStatus;
  comment: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  teamId: string;
  teamName: string;
  cohortId: string;
  /** Optional reference to a Lesson (Part 4). */
  lessonId?: string;
  lessonTitle?: string;
  state: TaskState;
  priority?: TaskPriority;
  dueDate?: string;        // ISO date string
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  /** Full transition history. Append-only; never mutate past entries. */
  transitions: TaskTransition[];
  /** Peer reviews given for this task */
  reviews?: TaskReview[];
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

export interface TutorEvidence {
  lessonId: string;
  lessonTitle: string;
  excerpt: string;
}

export interface TutorAnswer {
  id: string;
  lessonId: string;
  lessonTitle: string;
  question: string;
  answer: string;
  evidence: TutorEvidence[];
  confidence: number;
  createdAt: string;
}

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface QuizQuestion {
  id: string;
  lessonId: string;
  type: QuizQuestionType;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
}

export interface QuizAttemptAnswer {
  questionId: string;
  prompt: string;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface QuizAttempt {
  id: string;
  lessonId: string;
  score: number;
  maxScore: number;
  completedAt: string;
  answers: QuizAttemptAnswer[];
}

export interface Recommendation {
  lessonId: string;
  lessonTitle: string;
  reason: string;
  confidence: number;
}

export interface InstructorDraft {
  id: string;
  courseId: string;
  type: 'announcement' | 'rubric' | 'content_suggestion';
  title: string;
  content: string;
  requiresApproval: boolean;
  createdAt: string;
  status: 'draft' | 'approved' | 'discarded';
}

export type LessonContentType = 'video' | 'pdf' | 'markdown' | 'audio' | 'code';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  contentType: LessonContentType;
  contentUrl?: string; // For video, pdf, audio
  textContent?: string; // For markdown, code
  order: number;
}

export interface Bookmark {
  id: string;
  position: number;
  label: string;
}

export interface Note {
  id: string;
  position: number;
  content: string;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  lastPosition: number; // seconds for media, percentage/scroll for text
  isCompleted: boolean;
  bookmarks: Bookmark[];
  notes: Note[];
}

export interface LoginRequest {
  email: string;
  password?: string;
  provider?: 'credentials' | 'github' | 'google';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  name: string;
  provider?: 'credentials' | 'github' | 'google';
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

export interface InviteAcceptRequest {
  code: string;
}

export interface InviteAcceptResponse {
  success: boolean;
  cohortId: string;
  enrollmentId: string;
}

// --- Part 13: Notifications, Discussion & Communication ---

export type NotificationTrigger = 'task_state_change' | 'review_received' | 'deadline_approaching' | 'certificate_issued' | 'announcement_posted';

export interface Notification {
  id: string;
  userId: string;
  trigger: NotificationTrigger;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export type ThreadScope = 'course' | 'cohort';

export interface Thread {
  id: string;
  scopeType: ThreadScope;
  scopeId: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  isAiAnswer: boolean;
  isFlagged: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  courseId?: string;
  cohortId?: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
}

