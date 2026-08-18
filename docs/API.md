# Corridor API Documentation (v1)

This document defines the REST API contract for the Corridor LMS backend. All frontend apps must build against this spec, and the NestJS backend must implement it exactly to satisfy the requirements of Part 14.

Base URL: `http://localhost:3000/api/v1` (in dev)

---

## 1. Authentication (Part 2)

### `POST /auth/login`
Authenticates a user and returns a token.
- **Request Body**:
  ```json
  { "email": "student@corridor.local", "password": "password" }
  ```
- **Response** `200 OK`:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "u1",
      "name": "Student Name",
      "email": "student@corridor.local",
      "role": "student",
      "status": "active"
    }
  }
  ```
- **Response** `401 Unauthorized`: Invalid credentials.
- **Response** `403 Forbidden`: Account suspended.

### `POST /auth/register`
Registers a new student user.
- **Request Body**:
  ```json
  { "email": "new@example.com", "name": "New User", "password": "password" }
  ```
- **Response** `200 OK`: Returns the token and user object.
- **Response** `409 Conflict`: Email already exists.

---

## 2. Cohorts & Programs (Part 3)

### `GET /cohorts`
Retrieves cohorts for the logged-in user.
- **Response** `200 OK`:
  ```json
  {
    "cohorts": [
      {
        "id": "c07",
        "name": "Backend Engineering 07",
        "programId": "p1",
        "startDate": "2025-01-10",
        "endDate": "2025-03-07",
        "status": "active"
      }
    ]
  }
  ```

### `POST /invites/:code/accept`
Accepts a cohort invitation code.
- **Response** `200 OK`:
  ```json
  { "success": true, "cohortId": "c07" }
  ```

---

## 3. Courses & Lessons (Part 4)

### `GET /courses`
Retrieves all courses for the user's cohort.
- **Response** `200 OK`:
  ```json
  {
    "courses": [
      {
        "id": "crs1",
        "title": "API Design",
        "status": "published"
      }
    ]
  }
  ```

---

## 4. Tasks & Workflow (Part 5 & 7)

### `GET /tasks`
Retrieves tasks assigned to the user or their team.
- **Response** `200 OK`:
  ```json
  {
    "tasks": [
      {
        "id": "task-01",
        "title": "Build the auth layer",
        "teamId": "t4",
        "state": "Pushed"
      }
    ]
  }
  ```

### `POST /tasks/:id/transition`
Transitions a task to a new state (e.g., from `In Review` to `Closed`).
- **Request Body**:
  ```json
  { "to": "Closed" }
  ```
- **Response** `200 OK`:
  ```json
  { "success": true, "newState": "Closed" }
  ```

### `POST /tasks/:id/reviews`
Submits a peer review for a task.
- **Request Body**:
  ```json
  {
    "status": "approved",
    "comment": "Looks good."
  }
  ```
- **Response** `200 OK`: Returns the created review object.

---

## 5. Git & Contributions (Part 6)

### `POST /git/webhook`
Ingests GitHub webhooks (pushes, pull requests).
- **Request Body**: standard GitHub webhook payload.
- **Response** `200 OK`: `{ "success": true }`

### `GET /teams/:id/contribution`
Gets the contribution score split for a team.
- **Response** `200 OK`:
  ```json
  {
    "teamId": "t4",
    "split": {
      "u1": 82,
      "u2": 11,
      "u3": 5,
      "u4": 2
    }
  }
  ```

---

## 6. AI Manager & Tutor (Part 8 & 9)

### `POST /ai/manager/evaluate`
Triggers the AI manager to evaluate tasks (stalled reviews, imbalanced teams).
- **Response** `200 OK`:
  ```json
  {
    "logs": [
      { "action": "Flagged Team 4...", "status": "applied", "timestamp": "2025-01-01T00:00:00Z" }
    ]
  }
  ```

### `GET /ai/manager/logs`
Retrieves AI manager action history.
- **Response** `200 OK`: Returns an array of `logs`.

### `GET /ai/instructor-drafts`
Retrieves pending AI-generated drafts for the instructor.
- **Query Params**: `courseId`
- **Response** `200 OK`:
  ```json
  {
    "drafts": [
      { "id": "draft-1", "title": "Check-in", "requiresApproval": true }
    ]
  }
  ```

---

## 7. Admin (Part 12)

### `GET /admin/users`
Retrieves all users (Admin only).
- **Response** `200 OK`: List of users.

### `POST /admin/users/:id/suspend`
Suspends a user account (Admin only).
- **Request Body**: `{ "reason": "Violation" }`
- **Response** `200 OK`: `{ "success": true }`

---

## Error Handling
All errors follow a standard shape:
```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable message"
  }
}
```
