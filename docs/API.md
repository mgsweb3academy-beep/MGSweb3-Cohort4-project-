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
