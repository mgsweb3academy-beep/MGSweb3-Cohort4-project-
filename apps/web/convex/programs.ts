import { query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const programs = await ctx.db.query('programs').collect();
    return programs.map((program) => ({
      id: program._id as string,
      name: program.name,
      description: program.description,
      weekCount: program.weekCount,
    }));
  },
});
