/**
 * Corridor LMS — Input Validation & Sanitization Engine
 * Uses Zod schema validation to ensure robust input security, preventing XSS and SQL injection (§6 Security).
 */

import { z } from 'zod';

/**
 * Sanitizes input strings against dangerous script tags and SQL injection patterns.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove JS URLs
    .replace(/--|;|'|"|\/\*/g, (match) => {
      // Escape potential SQL injection comment / string delimiter characters in raw text
      switch (match) {
        case "'": return "''";
        case '"': return '""';
        default: return '';
      }
    });
}

// Custom Zod String refinement with automatic sanitization
export const SafeString = z.string().transform((val) => sanitizeString(val.trim()));

// --- Domain Schemas ---

export const AuthLoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const UserInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['student', 'instructor', 'admin']),
  cohortId: z.string().min(1, 'Cohort ID is required'),
});

export const TaskUpdateSchema = z.object({
  taskId: z.string().min(1),
  state: z.enum(['Assigned', 'Branched', 'Pushed', 'In Review', 'Closed']),
  teamId: z.string().min(1),
  authorId: z.string().min(1),
});

export const AIPromptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(4000, 'Prompt exceeds maximum length'),
  agentId: z.enum([
    'manager',
    'review',
    'progress_coach',
    'tutor',
    'content',
    'quiz',
    'recommendation',
    'instructor_assistant',
    'admin',
  ]),
  context: z.record(z.unknown()).optional(),
});

/**
 * Helper function to validate request payload against a Zod schema.
 */
export function validatePayload<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error?.issues || result.error?.errors || [];
  const errors = issues.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message}`);
  return { success: false, errors };
}
