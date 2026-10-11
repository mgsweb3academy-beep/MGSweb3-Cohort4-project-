import { query } from './_generated/server';
export const check = query({ args: {}, handler: async ctx => { await ctx.db.query('programs').take(1); return { ok: true }; } });
