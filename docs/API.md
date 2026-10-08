# Corridor LMS — Complete API Contract (`/api/v1/*`)

This document defines the official API specification for the Corridor LMS backend (`apps/api`). All endpoints enforce RBAC per §6 of the PRD and return JSON responses adhering to shared contracts in `packages/types`.

---

## 1. Conventions & Error Handling

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication:** Bearer token in HTTP `Authorization` header (`Authorization: Bearer <jwt_token>`).
- **Pagination:** Cursor-based pagination using `?cursor=<id>&limit=20`.

### Standard Error Response Format
All errors across all routes return HTTP status codes >= 400 with the following JSON envelope:
```json
{
  "error": {
    "code": "UNAUTHORIZED | FORBIDDEN | NOT_FOUND | BAD_REQUEST | STATE_TRANSITION_INVALID | AI_SERVICE_DEGRADED",
    "message": "Human readable error description",
    "details": null
  }
}
```

---

## 2. Authentication & User Management

### POST `/api/v1/auth/register`
Register a new user account.
- **Access:** Public
- **Body:** `{ "name": "Alice Smith", "email": "alice@example.com", "password": "SecurePassword123!", "role": "student" }`
- **Response (201):** `{ "user": User, "token": "jwt_token_string" }`

### POST `/api/v1/auth/login`
Authenticate with email and password.
- **Access:** Public
- **Body:** `{ "email": "alice@example.com", "password": "SecurePassword123!" }`
- **Response (200):** `{ "user": User, "token": "jwt_token_string" }`

### GET `/api/v1/auth/me`
Get the authenticated user session profile.
- **Access:** Authenticated (`student`, `instructor`, `admin`)
- **Response (200):** `User` object

### POST `/api/v1/auth/github`
Link or login with GitHub OAuth code.
- **Access:** Public / Authenticated
- **Body:** `{ "code": "github_oauth_code" }`
- **Response (200):** `{ "user": User, "token": "jwt_token_string" }`

### POST `/api/v1/auth/wallet/link`
Link a Web3 wallet address to the authenticated session (Part 15).
- **Access:** Authenticated
- **Body:** `{ "address": "0x1234...abcd", "signature": "0x...", "chainId": 1 }`
- **Response (200):** `{ "user": User }`

---

## 3. Programs, Cohorts & Teams

### GET `/api/v1/programs`
List all curriculum programs.
- **Access:** Authenticated
- **Response (200):** `Program[]`

### POST `/api/v1/programs`
Create a new program shell.
- **Access:** `admin`
- **Body:** `{ "name": "Web3 Core", "description": "Solidity and Smart Contracts", "weekCount": 8 }`
- **Response (201):** `Program`

### GET `/api/v1/cohorts`
List scheduled cohorts.
- **Access:** Authenticated
- **Response (200):** `Cohort[]`

### POST `/api/v1/cohorts`
Schedule a new cohort run for a program.
- **Access:** `admin`
- **Body:** `{ "name": "Cohort 07", "programId": "prog_1", "instructorId": "usr_inst_1", "startDate": "2026-09-01T00:00:00Z", "weekCount": 8 }`
- **Response (201):** `Cohort`

### GET `/api/v1/cohorts/:id/teams`
List teams within a cohort.
- **Access:** Authenticated
- **Response (200):** `Team[]`

### POST `/api/v1/cohorts/:id/teams`
Create a 3–5 learner team inside a cohort.
- **Access:** `instructor`, `admin`
- **Body:** `{ "name": "Team 4", "memberUserIds": ["usr_1", "usr_2", "usr_3"] }`
- **Response (201):** `Team`

---

## 4. Course & Curriculum Module

### GET `/api/v1/courses`
List courses.
- **Access:** Authenticated
- **Response (200):** `Course[]`

### GET `/api/v1/courses/:id`
Get course details including lessons.
- **Access:** Authenticated
- **Response (200):** `Course & { lessons: Lesson[] }`

### POST `/api/v1/courses`
Create a course in `draft` state.
- **Access:** `instructor`, `admin`
- **Body:** `{ "title": "Advanced Smart Contracts", "programId": "prog_1" }`
- **Response (201):** `Course`

### POST `/api/v1/courses/:id/request-review`
Transition course state from `draft` → `in_review`.
- **Access:** `instructor`
- **Response (200):** `{ "id": "crs_1", "status": "in_review" }`

### POST `/api/v1/courses/:id/approve`
Approve course: `in_review` → `published`.
- **Access:** `admin`
- **Response (200):** `{ "id": "crs_1", "status": "published", "publishedAt": "..." }`

### POST `/api/v1/courses/:id/reject`
Reject course submission: `in_review` → `rejected`.
- **Access:** `admin`
- **Body:** `{ "rejectionReason": "Needs clearer lesson objectives" }`
- **Response (200):** `{ "id": "crs_1", "status": "rejected", "rejectionReason": "..." }`

### GET `/api/v1/lessons/:id`
Get lesson content.
- **Access:** Authenticated
- **Response (200):** `Lesson`

### POST `/api/v1/lessons`
Create a lesson inside a course.
- **Access:** `instructor`, `admin`
- **Body:** `{ "courseId": "crs_1", "title": "EVM Opcodes", "contentType": "markdown", "textContent": "# EVM...", "order": 1 }`
- **Response (201):** `Lesson`

### GET `/api/v1/lessons/:id/progress`
Get learner lesson progress.
- **Access:** Authenticated
- **Response (200):** `LessonProgress`

### PUT `/api/v1/lessons/:id/progress`
Save progress position.
- **Access:** Authenticated
- **Body:** `{ "lastPosition": 125, "isCompleted": false }`
- **Response (200):** `LessonProgress`

---

## 5. Task Board & 5-State Machine

Task states follow the exact PRD flow strip:
`Assigned → Branched → Pushed → In Review → Closed`

### GET `/api/v1/tasks`
List tasks filterable by `cohortId`, `teamId`, or `state`.
- **Access:** Authenticated
- **Response (200):** `Task[]`

### POST `/api/v1/tasks`
Create a task assigned to a team (`Assigned` state).
- **Access:** `instructor`, `admin`
- **Body:** `{ "title": "Build ERC-20 Token Vault", "teamId": "team_4", "cohortId": "ch_7" }`
- **Response (201):** `Task`

### PATCH `/api/v1/tasks/:id/state`
Advance or transition task state.
- **Access:** Authenticated (Student for workflow actions / Instructor / AI Manager)
- **Body:** `{ "state": "Branched" | "Pushed" | "In Review" | "Closed" }`
- **Response (200):** `Task`

---

## 6. Git Webhooks & Contribution Scoring

### POST `/api/v1/webhooks/github`
GitHub Webhook receiver for push, pull_request, and pull_request_review events.
- **Access:** Public (verifies `X-Hub-Signature-256`)
- **Headers:** `X-GitHub-Event`, `X-Hub-Signature-256`
- **Body:** GitHub Event Payload
- **Response (200):** `{ "received": true, "processedEvent": "push" }`

### GET `/api/v1/contributions`
Fetch contribution metrics for a cohort or learner.
- **Access:** Authenticated
- **Query Params:** `?cohortId=ch_7&learnerId=usr_1`
- **Response (200):** `Contribution[]`

---

## 7. AI Service Proxy Layer

Proxies calls to Python AI agent microservice with fallback & graceful degradation.

### POST `/api/v1/ai/tutor`
Ask tutor agent a contextual question.
- **Access:** Authenticated
- **Body:** `{ "question": "Explain gas optimization in assembly", "lessonId": "les_1" }`
- **Response (200):** `{ "answer": "...", "confidenceDisclaimer": "..." }`
- **Fallback on AI outage (503):** `{ "error": { "code": "AI_SERVICE_DEGRADED", "message": "AI features are currently unavailable. Core LMS features remain active." } }`

### POST `/api/v1/ai/review`
Trigger AI code review agent on a task push/PR.
- **Access:** Authenticated / Internal
- **Body:** `{ "taskId": "tsk_1", "pullRequestUrl": "https://github.com/..." }`
- **Response (200):** `{ "feedback": "...", "suggestedState": "In Review" }`

---

## 8. Admin Suite & Moderation

### GET `/api/v1/admin/users`
List all users with filtering.
- **Access:** `admin`
- **Response (200):** `User[]`

### PATCH `/api/v1/admin/users/:id/suspend`
Suspend a user account. Revokes active sessions immediately.
- **Access:** `admin`
- **Body:** `{ "reason": "Policy violation" }`
- **Response (200):** `User`

### PATCH `/api/v1/admin/users/:id/reinstate`
Reinstate a suspended user account.
- **Access:** `admin`
- **Response (200):** `User`

### GET `/api/v1/admin/analytics`
Platform-wide analytics aggregation.
- **Access:** `admin`
- **Response (200):** `PlatformAnalytics`

### GET `/api/v1/admin/agent-config`
Get AI agent configuration & course autonomy levels.
- **Access:** `admin`
- **Response (200):** `AgentConfig[]`

### PUT `/api/v1/admin/agent-config/:agentId`
Toggle agent status or autonomy level (`suggest_only` vs `autonomous`).
- **Access:** `admin`
- **Body:** `{ "enabled": true, "autonomyLevel": "autonomous" }`
- **Response (200):** `AgentConfig`

### GET `/api/v1/admin/moderation`
Get flagged posts & AI-flagged submissions queue.
- **Access:** `admin`
- **Response (200):** `ModerationItem[]`

### POST `/api/v1/admin/moderation/:id/action`
Resolve moderation queue item.
- **Access:** `admin`
- **Body:** `{ "action": "dismiss" | "remove" | "warn" | "escalate" }`
- **Response (200):** `ModerationItem`

---

## 9. Notifications & Discussions

### GET `/api/v1/notifications`
Get notifications for the logged in user.
- **Access:** Authenticated
- **Response (200):** `Notification[]`

### GET `/api/v1/discussions`
List discussion posts scoped to course or cohort.
- **Access:** Authenticated
- **Query Params:** `?courseId=crs_1`
- **Response (200):** `DiscussionPost[]`

### POST `/api/v1/discussions/:id/flag`
Flag a discussion post for moderation.
- **Access:** Authenticated
- **Body:** `{ "reason": "Inappropriate content" }`
- **Response (200):** `{ "flagged": true }`

---

## 10. Health Checks & Resiliency

### GET `/api/v1/health`
Overall LMS core health check.
- **Access:** Public
- **Response (200):** `HealthStatus`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-08-03T12:00:00Z",
    "services": {
      "database": "up",
      "redis": "up",
      "aiService": "up"
    }
  }
  ```

### GET `/api/v1/health/ai`
Check Python AI service status specifically.
- **Access:** Public
- **Response (200 / 503):** `{ "aiAvailable": false, "message": "AI service unreachable" }`
