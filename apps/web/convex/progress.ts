import { v } from 'convex/values';
import { mutation, query, type MutationCtx } from './_generated/server';

async function findOrCreate(ctx: MutationCtx, lessonId: string, userId: string) {
  const id = ctx.db.normalizeId('lessons', lessonId);
  if (!id) throw new Error('Lesson not found');
  const existing = await ctx.db
    .query('lessonProgress')
    .withIndex('by_lesson_user', (q) => q.eq('lessonId', id).eq('userId', userId))
    .unique();
  if (existing) return existing;
  const progressId = await ctx.db.insert('lessonProgress', {
    lessonId: id,
    userId,
    lastPosition: 0,
    isCompleted: false,
    bookmarks: [],
    notes: [],
  });
  return (await ctx.db.get(progressId))!;
}

export const get = query({
  args: { lessonId: v.string(), userId: v.string() },
  handler: async (ctx, { lessonId, userId }) => {
    const id = ctx.db.normalizeId('lessons', lessonId);
    const progress = id
      ? await ctx.db
          .query('lessonProgress')
          .withIndex('by_lesson_user', (q) => q.eq('lessonId', id).eq('userId', userId))
          .unique()
      : null;
    return {
      lessonId,
      userId,
      lastPosition: progress?.lastPosition ?? 0,
      isCompleted: progress?.isCompleted ?? false,
      bookmarks: progress?.bookmarks ?? [],
      notes: progress?.notes ?? [],
    };
  },
});

export const savePosition = mutation({
  args: { lessonId: v.string(), userId: v.string(), lastPosition: v.number() },
  handler: async (ctx, { lessonId, userId, lastPosition }) => {
    const progress = await findOrCreate(ctx, lessonId, userId);
    await ctx.db.patch(progress._id, { lastPosition });
  },
});

export const addNote = mutation({
  args: { lessonId: v.string(), userId: v.string(), position: v.number(), content: v.string() },
  handler: async (ctx, { lessonId, userId, position, content }) => {
    const progress = await findOrCreate(ctx, lessonId, userId);
    const note = { id: `note_${progress.notes.length + 1}_${Date.now()}`, position, content };
    await ctx.db.patch(progress._id, { notes: [...progress.notes, note] });
    return note;
  },
});

export const addBookmark = mutation({
  args: { lessonId: v.string(), userId: v.string(), position: v.number(), label: v.string() },
  handler: async (ctx, { lessonId, userId, position, label }) => {
    const progress = await findOrCreate(ctx, lessonId, userId);
    const bookmark = { id: `bm_${progress.bookmarks.length + 1}_${Date.now()}`, position, label };
    await ctx.db.patch(progress._id, { bookmarks: [...progress.bookmarks, bookmark] });
    return bookmark;
  },
});
