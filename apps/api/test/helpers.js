'use strict';
// Shared test helpers. Tests run against the compiled output in ../dist (see the "test" script),
// with Prisma and HTTP dependencies replaced by in-memory fakes, so no database is needed.

// Builds a fake PrismaService. `impl` maps "model.method" to a return value or a function of the call args.
// Calling any method that is not in `impl` throws, so a test fails loudly on unexpected queries.
function mockPrisma(impl = {}) {
  const calls = [];
  const prisma = new Proxy({}, {
    get(_, model) {
      return new Proxy({}, {
        get(__, method) {
          const key = `${String(model)}.${String(method)}`;
          return async (args) => {
            calls.push({ key, args });
            if (!(key in impl)) throw new Error(`Unexpected prisma call: ${key}`);
            const handler = impl[key];
            return typeof handler === 'function' ? handler(args) : handler;
          };
        },
      });
    },
  });
  return {
    prisma,
    calls,
    argsOf: (key) => calls.filter((c) => c.key === key).map((c) => c.args),
    lastArgs: (key) => calls.filter((c) => c.key === key).at(-1)?.args,
  };
}

const now = new Date('2026-10-10T12:00:00Z');
const student = { id: 'student-1', role: 'student', name: 'Student' };
const instructor = { id: 'instructor-1', role: 'instructor', name: 'Instructor' };
const otherInstructor = { id: 'instructor-2', role: 'instructor', name: 'Other' };
const admin = { id: 'admin-1', role: 'admin', name: 'Admin' };

module.exports = { mockPrisma, now, student, instructor, otherInstructor, admin };
