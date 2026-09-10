import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

// Demo student account password: "corridor-dev". Admin and instructor passwords are passed in at
// seed time so they never live in the repo. Hash format matches authNode.ts.
const STUDENT_PASSWORD_HASH =
  'pbkdf2_sha256$310000$bddf7af89420006c9a4e471fac6859a8$0fd5c18a7a31bf175b710b9c5e22d47eb089d2c16f476d35328e4cf17baf8440';

export const run = internalMutation({
  args: { staffPasswordHash: v.string() },
  handler: async (ctx, { staffPasswordHash }) => {
    if (await ctx.db.query('programs').first()) return 'Already seeded';

    await ctx.db.insert('users', { email: 'admin@example.com', name: 'Admin User', role: 'admin', status: 'active', passwordHash: staffPasswordHash });
    await ctx.db.insert('users', { email: 'instructor@example.com', name: 'Dr. Yemi F.', role: 'instructor', status: 'active', passwordHash: staffPasswordHash });
    await ctx.db.insert('users', { email: 'test@example.com', name: 'Test Student', role: 'student', status: 'active', passwordHash: STUDENT_PASSWORD_HASH });

    const backend = await ctx.db.insert('programs', {
      name: 'Backend Engineering',
      description: 'Smart contract development and on-chain architecture.',
      weekCount: 8,
    });
    const frontend = await ctx.db.insert('programs', {
      name: 'Web3 Frontend',
      description: 'Wallet-connected interfaces and dApp UX.',
      weekCount: 6,
    });

    const intro = await ctx.db.insert('courses', { title: 'Introduction to Web3', programId: backend, instructorName: 'Dr. Yemi F.', status: 'published' });
    const solidity = await ctx.db.insert('courses', { title: 'Solidity Fundamentals', programId: backend, instructorName: 'Dr. Yemi F.', status: 'published' });
    const dapp = await ctx.db.insert('courses', { title: 'Building dApp Interfaces', programId: frontend, instructorName: 'Ada N.', status: 'in_review' });

    await ctx.db.insert('lessons', {
      courseId: intro,
      order: 1,
      title: 'What is a Blockchain?',
      contentType: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=bBC-nXj3Ng4',
    });
    await ctx.db.insert('lessons', {
      courseId: intro,
      order: 2,
      title: 'Wallets, Keys and Addresses',
      contentType: 'markdown',
      textContent:
        '# Wallets, keys and addresses\n\nA wallet does not hold coins. It holds a **private key**.\n\n- The private key signs your transactions.\n- The public key is derived from the private key.\n- Your address is a short hash of the public key.\n\n> Never share a seed phrase. Whoever has it controls the wallet.',
    });
    await ctx.db.insert('lessons', {
      courseId: intro,
      order: 3,
      title: 'Gas and Transactions',
      contentType: 'markdown',
      textContent:
        '# Gas and transactions\n\nEvery transaction pays **gas**: a fee for the computation it uses.\n\n1. You sign a transaction with a gas limit and a max fee.\n2. Validators include it in a block.\n3. Unused gas is refunded.',
    });
    await ctx.db.insert('lessons', {
      courseId: solidity,
      order: 1,
      title: 'Your First Contract',
      contentType: 'code',
      textContent:
        '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n\ncontract Counter {\n    uint256 public count;\n\n    function increment() external {\n        count += 1;\n    }\n}',
    });
    await ctx.db.insert('lessons', {
      courseId: solidity,
      order: 2,
      title: 'Storage, Memory and Calldata',
      contentType: 'markdown',
      textContent:
        '# Storage, memory and calldata\n\n- **storage** lives on-chain and persists between calls. It is the most expensive.\n- **memory** exists only while a function runs.\n- **calldata** is read-only input data, and the cheapest for external function arguments.',
    });
    await ctx.db.insert('lessons', {
      courseId: dapp,
      order: 1,
      title: 'Connecting a Wallet',
      contentType: 'markdown',
      textContent: '# Connecting a wallet\n\nAsk the wallet for accounts, listen for account and chain changes, and never assume the user stays on one network.',
    });

    await ctx.db.insert('cohorts', {
      name: 'Backend Engineering — Cohort 07',
      programId: backend,
      startDate: '2026-08-17',
      weekCount: 8,
      instructorName: 'Dr. Yemi F.',
      learnerCount: 41,
      teamCount: 8,
    });
    await ctx.db.insert('cohorts', {
      name: 'Web3 Frontend — Cohort 03',
      programId: frontend,
      startDate: '2026-10-05',
      weekCount: 6,
      instructorName: 'Ada N.',
      learnerCount: 18,
      teamCount: 4,
    });

    return 'Seeded';
  },
});
