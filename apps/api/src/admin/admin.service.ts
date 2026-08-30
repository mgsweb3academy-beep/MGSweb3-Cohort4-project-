import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { 
  User, UserRole, Course, AgentConfig, ModerationItem, 
  PlatformAnalytics, InstructorPerformance, AuditLogEntry, ModerationAction
} from 'types';
import { 
  MOCK_USERS, MOCK_COURSES, MOCK_AGENT_CONFIGS, MOCK_MODERATION_ITEMS, 
  MOCK_ANALYTICS, MOCK_INSTRUCTOR_PERFORMANCE, MOCK_AUDIT_LOG
} from './mock-data';

@Injectable()
export class AdminService {
  private users = [...MOCK_USERS];
  private courses = [...MOCK_COURSES];
  private agentConfigs = [...MOCK_AGENT_CONFIGS];
  private moderationItems = [...MOCK_MODERATION_ITEMS];
  private analytics = { ...MOCK_ANALYTICS };
  private instructorPerformance = [...MOCK_INSTRUCTOR_PERFORMANCE];
  private auditLogs = [...MOCK_AUDIT_LOG];

  // --- Users ---
  getUsers(): User[] {
    return this.users;
  }

  updateUserRole(id: string, role: UserRole): User {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    this.logAction('user.update_role', user.id, 'user', `Changed role to ${role}`);
    return user;
  }

  suspendUser(id: string, reason: string): User {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    user.status = 'suspended';
    user.suspendedAt = new Date().toISOString();
    user.suspendedBy = 'admin-1';
    user.suspensionReason = reason;
    this.logAction('user.suspended', user.id, 'user', reason);
    return user;
  }

  reinstateUser(id: string): User {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    user.status = 'active';
    user.suspendedAt = undefined;
    user.suspendedBy = undefined;
    user.suspensionReason = undefined;
    this.logAction('user.reinstated', user.id, 'user', 'User reinstated');
    return user;
  }

  bulkInvite(emails: string[]): { invited: number } {
    // Mock implementation for bulk invite
    this.logAction('user.bulk_invite', 'multiple', 'user', `Invited ${emails.length} users`);
    return { invited: emails.length };
  }

  // --- Tutors ---
  getInstructorPerformance(): InstructorPerformance[] {
    return this.instructorPerformance;
  }

  // --- Courses ---
  getCourses(): Course[] {
    return this.courses;
  }

  approveCourse(id: string): Course {
    const course = this.courses.find(c => c.id === id);
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'in_review') throw new BadRequestException('Course must be in review to approve');
    
    course.status = 'published';
    course.publishedAt = new Date().toISOString();
    course.reviewedAt = new Date().toISOString();
    course.reviewedBy = 'admin-1';
    
    this.logAction('course.approved', course.id, 'course', 'Course published');
    return course;
  }

  rejectCourse(id: string, reason: string): Course {
    const course = this.courses.find(c => c.id === id);
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'in_review') throw new BadRequestException('Course must be in review to reject');
    
    course.status = 'rejected';
    course.reviewedAt = new Date().toISOString();
    course.reviewedBy = 'admin-1';
    course.rejectionReason = reason;
    
    this.logAction('course.rejected', course.id, 'course', reason);
    return course;
  }

  // --- Analytics ---
  getAnalytics(): PlatformAnalytics {
    return this.analytics;
  }

  // --- Agents ---
  getAgents(): AgentConfig[] {
    return this.agentConfigs;
  }

  toggleAgent(id: string, enabled: boolean): AgentConfig {
    const agent = this.agentConfigs.find(a => a.agentId === id);
    if (!agent) throw new NotFoundException('Agent not found');
    agent.enabled = enabled;
    agent.updatedAt = new Date().toISOString();
    agent.updatedBy = 'admin-1';
    
    this.logAction('agent.toggled', agent.agentId, 'agent', `Agent ${enabled ? 'enabled' : 'disabled'}`);
    return agent;
  }

  setCourseAutonomy(courseId: string, level: 'suggest_only' | 'autonomous') {
    // In a real DB, this would write to a CourseAgentConfig table.
    this.logAction('agent.course_autonomy', courseId, 'course', `Set manager autonomy to ${level}`);
    return { courseId, level };
  }

  // --- Reporting ---
  generateReport(format: 'csv' | 'pdf', programId?: string, cohortId?: string): { url: string } {
    this.logAction('report.generated', 'platform', 'report', `Generated ${format} report`);
    // Return a mock download URL
    return { url: `/downloads/report-${Date.now()}.${format}` };
  }

  // --- Moderation ---
  getModerationQueue(): ModerationItem[] {
    return this.moderationItems.filter(item => item.status === 'pending');
  }

  resolveModerationItem(id: string, action: ModerationAction): ModerationItem {
    const item = this.moderationItems.find(i => i.id === id);
    if (!item) throw new NotFoundException('Moderation item not found');
    if (item.status !== 'pending') throw new BadRequestException('Item is already resolved');
    
    item.status = 'resolved';
    item.resolution = action;
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = 'admin-1';
    
    this.logAction(`moderation.${action}`, item.id, 'moderation', `Action taken: ${action}`);
    return item;
  }

  // --- Helpers ---
  private logAction(action: string, targetId: string, targetType: string, detail: string) {
    this.auditLogs.unshift({
      id: `al${Date.now()}`,
      action,
      targetId,
      targetType,
      performedBy: 'admin-1',
      performedByName: 'Admin User',
      timestamp: new Date().toISOString(),
      detail,
    });
  }
}
