# Corridor API Contract

This document defines the request/response contract for the Corridor LMS APIs.

## Part 4: Course & Curriculum Module

### 1. Courses

#### GET /courses
List all courses.
**Response:**
```json
[
  {
    "id": "course_123",
    "title": "Introduction to Web3",
    "programId": "prog_abc",
    "status": "published",
    "lessonCount": 5
  }
]
```

#### GET /courses/:id
Get course details including its lessons.
**Response:**
```json
{
  "id": "course_123",
  "title": "Introduction to Web3",
  "programId": "prog_abc",
  "status": "published",
  "lessons": [
    {
      "id": "lesson_1",
      "title": "What is a Blockchain?",
      "contentType": "video",
      "order": 1
    }
  ]
}
```

#### POST /courses/:id/request-review
Request review for a course (Transitions state from `draft` to `in_review`).
**Response:**
```json
{
  "id": "course_123",
  "status": "in_review"
}
```

### 2. Lessons

#### GET /lessons/:id
Get lesson content and metadata. This exposes a stable lesson ID that can be referenced.
**Response:**
```json
{
  "id": "lesson_1",
  "courseId": "course_1",
  "title": "What is a Blockchain?",
  "contentType": "video",
  "contentUrl": "https://example.com/video.mp4",
  "textContent": "Optional text content for markdown or code snippets",
  "order": 1
}
```

#### POST /lessons
Create a new lesson (Lesson Authoring).
**Body:**
```json
{
  "courseId": "course_123",
  "title": "New Lesson",
  "contentType": "markdown",
  "textContent": "# Content",
  "order": 2
}
```

#### PUT /lessons/:id
Update a lesson's metadata or content.
**Body:**
```json
{
  "title": "Updated Title",
  "textContent": "Updated text"
}
```

### 3. Progress Tracking

#### GET /lessons/:id/progress
Get user's progress for a specific lesson (resume position, bookmarks, notes).
**Response:**
```json
{
  "lessonId": "lesson_1",
  "userId": "user_456",
  "lastPosition": 125, // seconds for video/audio, percentage or section for text
  "isCompleted": false,
  "bookmarks": [
    { "id": "b1", "position": 45, "label": "Key definition" }
  ],
  "notes": [
    { "id": "n1", "position": 120, "content": "Need to research this further." }
  ]
}
```

#### PUT /lessons/:id/progress
Save progress (resume position).
**Body:**
```json
{
  "lastPosition": 130
}
```
**Response:** `200 OK`

#### POST /lessons/:id/bookmarks
Add a bookmark.
**Body:**
```json
{
  "position": 130,
  "label": "Important concept"
}
```
**Response:**
```json
{ "id": "b2", "position": 130, "label": "Important concept" }
```

#### POST /lessons/:id/notes
Add a note.
**Body:**
```json
{
  "position": 130,
  "content": "My private note"
}
```
**Response:**
```json
{ "id": "n2", "position": 130, "content": "My private note" }
```

## Part 8: Admin Panel & Platform Management

### 1. User Management

#### GET /admin/users
List all users.
**Response:** `User[]`

#### PUT /admin/users/:id/role
Update user role.
**Body:** `{ "role": "student" | "instructor" | "admin" }`
**Response:** `User`

#### PUT /admin/users/:id/suspend
Suspend a user.
**Body:** `{ "reason": "Violation of policy" }`
**Response:** `User`

#### PUT /admin/users/:id/reinstate
Reinstate a suspended user.
**Response:** `User`

#### POST /admin/users/bulk-invite
Bulk invite users.
**Body:** `{ "emails": ["user1@mgs.io", "user2@mgs.io"] }`
**Response:** `{ "invited": 2 }`

### 2. Tutor Management

#### GET /admin/tutors/performance
Get instructor performance metrics.
**Response:** `InstructorPerformance[]`

### 3. Course Approval Workflow

#### PUT /admin/courses/:id/approve
Approve a course, changing its status to `published`.
**Response:** `Course`

#### PUT /admin/courses/:id/reject
Reject a course.
**Body:** `{ "reason": "Needs more detail in lesson 2" }`
**Response:** `Course`

### 4. Analytics

#### GET /admin/analytics
Get platform-wide analytics.
**Response:** `PlatformAnalytics`

### 5. AI Agent Configuration

#### GET /admin/agents
List agent configurations.
**Response:** `AgentConfig[]`

#### PUT /admin/agents/:id/toggle
Enable or disable an agent.
**Body:** `{ "enabled": true }`
**Response:** `AgentConfig`

#### PUT /admin/agents/course-autonomy
Set per-course autonomy level for the manager agent.
**Body:** `{ "courseId": "c1", "level": "suggest_only" | "autonomous" }`

### 6. Reporting

#### POST /admin/reports
Generate cohort or program report.
**Body:** `{ "format": "csv" | "pdf", "programId"?: "p1", "cohortId"?: "c1" }`
**Response:** `{ "url": "/downloads/report-1234.pdf" }`

### 7. Moderation Queue

#### GET /admin/moderation
List pending moderation items.
**Response:** `ModerationItem[]`

#### PUT /admin/moderation/:id/resolve
Resolve a moderation item.
**Body:** `{ "action": "dismiss" | "remove" | "warn" | "escalate" }`
**Response:** `ModerationItem`
## Part 2: Auth & Onboarding

### 1. Authentication

#### POST /auth/login
Login with email/password.
**Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "name": "Jane Doe",
    "email": "student@example.com",
    "role": "student"
  }
}
```

#### POST /auth/register
Register a new user.
**Body:**
```json
{
  "email": "new@example.com",
  "password": "password123",
  "name": "New Student"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_124",
    "name": "New Student",
    "email": "new@example.com",
    "role": "student"
  }
}
```

### 2. Invites & Onboarding

#### POST /invites/:code/accept
Accept a cohort invite code.
**Body:** `{}`
**Response:**
```json
{
  "success": true,
  "cohortId": "cohort_07",
  "enrollmentId": "enr_999"
}
```
