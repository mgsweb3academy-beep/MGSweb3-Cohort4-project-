import { Controller, Get, Put, Post, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import type { UserRole, ModerationAction } from 'types';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 8.1 User Management
  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.updateUserRole(id, role);
  }

  @Put('users/:id/suspend')
  suspendUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.suspendUser(id, reason);
  }

  @Put('users/:id/reinstate')
  reinstateUser(@Param('id') id: string) {
    return this.adminService.reinstateUser(id);
  }

  @Post('users/bulk-invite')
  bulkInvite(@Body('emails') emails: string[]) {
    return this.adminService.bulkInvite(emails);
  }

  // 8.2 Tutor Management
  @Get('tutors/performance')
  getInstructorPerformance() {
    return this.adminService.getInstructorPerformance();
  }

  // 8.3 Course Approval Workflow
  @Get('courses')
  getCourses() {
    return this.adminService.getCourses();
  }

  @Put('courses/:id/approve')
  approveCourse(@Param('id') id: string) {
    return this.adminService.approveCourse(id);
  }

  @Put('courses/:id/reject')
  rejectCourse(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectCourse(id, reason);
  }

  // 8.4 Analytics
  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // 8.5 Agent Configuration
  @Get('agents')
  getAgents() {
    return this.adminService.getAgents();
  }

  @Put('agents/:id/toggle')
  toggleAgent(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.adminService.toggleAgent(id, enabled);
  }

  @Put('agents/course-autonomy')
  setCourseAutonomy(
    @Body('courseId') courseId: string, 
    @Body('level') level: 'suggest_only' | 'autonomous'
  ) {
    return this.adminService.setCourseAutonomy(courseId, level);
  }

  // 8.6 Reporting
  @Post('reports')
  generateReport(
    @Body('format') format: 'csv' | 'pdf',
    @Body('programId') programId?: string,
    @Body('cohortId') cohortId?: string
  ) {
    return this.adminService.generateReport(format, programId, cohortId);
  }

  // 8.7 Moderation Queue
  @Get('moderation')
  getModerationQueue() {
    return this.adminService.getModerationQueue();
  }

  @Put('moderation/:id/resolve')
  resolveModerationItem(
    @Param('id') id: string, 
    @Body('action') action: ModerationAction
  ) {
    return this.adminService.resolveModerationItem(id, action);
  }
}
