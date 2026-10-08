import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

// Demo student account password: "corridor-dev". Admin and instructor passwords are passed in at
// seed time so they never live in the repo. Hash format matches authNode.ts.
const STUDENT_PASSWORD_HASH =
  'pbkdf2_sha256$310000$bddf7af89420006c9a4e471fac6859a8$0fd5c18a7a31bf175b710b9c5e22d47eb089d2c16f476d35328e4cf17baf8440';

// MarkdownViewer only renders "# ", "## ", "- " and plain paragraphs, so lesson text sticks to those.
const text = (...lines: string[]) => lines.join('\n');

type SeedCourse = {
  title: string;
  program: 'backend' | 'frontend';
  instructorName: string;
  status: 'draft' | 'in_review' | 'published';
  lessons: { title: string; contentType: 'markdown' | 'code'; textContent: string }[];
};

// Listed in display order. courses.list returns newest first, so these are inserted in reverse.
const COURSES: SeedCourse[] = [
  {
    title: 'Introduction to Web3',
    program: 'backend',
    instructorName: 'Dr. Yemi F.',
    status: 'published',
    lessons: [
      {
        title: 'What is a Blockchain?',
        contentType: 'markdown',
        textContent: text(
          '# What is a blockchain?',
          'A blockchain is a shared record that many computers keep in sync. No single company owns the copy.',
          '',
          '## How it works',
          '- Transactions are grouped into blocks.',
          '- Each block includes the hash of the block before it, which links them into a chain.',
          '- Changing an old block changes its hash and breaks every link after it.',
          '- Nodes agree on the next block through a consensus rule, such as proof of stake.',
          '',
          '## Why it matters',
          'Anyone can check the record, and nobody can quietly rewrite it.',
        ),
      },
      {
        title: 'Wallets, Keys and Addresses',
        contentType: 'markdown',
        textContent: text(
          '# Wallets, keys and addresses',
          'A wallet does not hold coins. It holds a private key.',
          '- The private key signs your transactions.',
          '- The public key is derived from the private key.',
          '- On Ethereum, your address is the last 20 bytes of the Keccak-256 hash of the public key.',
          '',
          '## Seed phrases',
          'A seed phrase is a human-readable backup of your keys. Whoever has it controls the wallet, so never share it or type it into a website.',
        ),
      },
      {
        title: 'Gas and Transactions',
        contentType: 'markdown',
        textContent: text(
          '# Gas and transactions',
          'Every transaction pays gas: a fee for the computation it uses.',
          '',
          '## What happens when you send one',
          '- You sign it with a gas limit and a maximum fee.',
          '- Validators include it in a block.',
          '- You pay only for the gas actually used, never the whole limit.',
          '',
          '## Good to know',
          '- A plain ETH transfer uses 21,000 gas.',
          '- Writing to storage costs far more than reading it.',
        ),
      },
    ],
  },
  {
    title: 'Solidity Fundamentals',
    program: 'backend',
    instructorName: 'Dr. Yemi F.',
    status: 'published',
    lessons: [
      {
        title: 'Your First Contract',
        contentType: 'code',
        textContent: text(
          '// SPDX-License-Identifier: MIT',
          'pragma solidity ^0.8.24;',
          '',
          'contract Counter {',
          '    uint256 public count;',
          '',
          '    function increment() external {',
          '        count += 1;',
          '    }',
          '}',
        ),
      },
      {
        title: 'Storage, Memory and Calldata',
        contentType: 'markdown',
        textContent: text(
          '# Storage, memory and calldata',
          'Solidity keeps data in three places. Picking the right one changes what you pay in gas.',
          '- storage lives on-chain and persists between calls. It is the most expensive.',
          '- memory exists only while a function runs.',
          '- calldata is read-only input data, and the cheapest choice for external function arguments.',
          '',
          '## Rule of thumb',
          'Use calldata for arrays and strings you only read, memory for values you build inside a function, and storage only for state that must survive.',
        ),
      },
      {
        title: 'Events and Custom Errors',
        contentType: 'code',
        textContent: text(
          '// SPDX-License-Identifier: MIT',
          'pragma solidity ^0.8.24;',
          '',
          'contract TipJar {',
          '    address public immutable owner;',
          '',
          '    event Tipped(address indexed from, uint256 amount);',
          '',
          '    error NotOwner(address caller);',
          '    error TransferFailed();',
          '',
          '    constructor() {',
          '        owner = msg.sender;',
          '    }',
          '',
          '    // Events are cheap logs that frontends can listen to.',
          '    function tip() external payable {',
          '        emit Tipped(msg.sender, msg.value);',
          '    }',
          '',
          '    // Custom errors cost less gas than revert strings.',
          '    function withdraw() external {',
          '        if (msg.sender != owner) revert NotOwner(msg.sender);',
          '        (bool ok, ) = owner.call{value: address(this).balance}("");',
          '        if (!ok) revert TransferFailed();',
          '    }',
          '}',
        ),
      },
    ],
  },
  {
    title: 'Shipping as a Team',
    program: 'backend',
    instructorName: 'Dr. Yemi F.',
    status: 'published',
    lessons: [
      {
        title: 'One Branch per Task',
        contentType: 'markdown',
        textContent: text(
          '# One branch per task',
          'In Corridor, turning in work is a push. Every task gets its own branch.',
          '',
          '## Starting a task',
          '- git checkout main',
          '- git pull',
          '- git checkout -b task-12-tip-events',
          '',
          '## Why one task per branch',
          'Small branches mean small reviews, and small reviews get approved faster.',
        ),
      },
      {
        title: 'Writing a Pull Request',
        contentType: 'markdown',
        textContent: text(
          '# Writing a pull request',
          'A pull request asks your team to review and merge your branch.',
          '',
          '## A good description answers three questions',
          '- What changed?',
          '- Why was it needed? Link the task.',
          '- How can a reviewer test it?',
          '',
          '## Keep it small',
          'Aim for a change a teammate can review in 15 minutes. Split bigger work into more tasks.',
        ),
      },
      {
        title: 'Reviewing a Teammate’s Code',
        contentType: 'markdown',
        textContent: text(
          '# Reviewing a teammate’s code',
          'Every task needs two approvals before it closes.',
          '',
          '## What to check',
          '- Does it do what the task asked?',
          '- Is anything unsafe, such as an unchecked external call?',
          '- Would you understand this code a month from now?',
          '',
          '## How to comment',
          '- Ask questions instead of giving orders.',
          '- Point to the exact line.',
          '- Approve when it is good enough. Polish can come in the next task.',
        ),
      },
    ],
  },
  {
    title: 'Building dApp Interfaces',
    program: 'frontend',
    instructorName: 'Ada N.',
    status: 'in_review',
    lessons: [
      {
        title: 'Connecting a Wallet',
        contentType: 'markdown',
        textContent: text(
          '# Connecting a wallet',
          'Ask the wallet for accounts, listen for changes, and never assume the user stays on one network.',
          '',
          '## The three events that matter',
          '- eth_requestAccounts opens the wallet and asks the user to connect.',
          '- accountsChanged fires when the user switches accounts.',
          '- chainChanged fires when the user switches networks.',
          '',
          '## Rules for the UI',
          '- Show a clear Connect button until an account is available.',
          '- Show the connected address in short form, like 0x12ab…89cd.',
          '- If the network is wrong, name the one to switch to.',
        ),
      },
      {
        title: 'Reading Contract State',
        contentType: 'code',
        textContent: text(
          'import { createPublicClient, http, parseAbi } from "viem";',
          'import { sepolia } from "viem/chains";',
          '',
          'const client = createPublicClient({ chain: sepolia, transport: http() });',
          '',
          '// Replace with the address of your deployed Counter contract.',
          'const COUNTER_ADDRESS = "0x0000000000000000000000000000000000000000";',
          '',
          'const count = await client.readContract({',
          '  address: COUNTER_ADDRESS,',
          '  abi: parseAbi(["function count() view returns (uint256)"]),',
          '  functionName: "count",',
          '});',
          '',
          'console.log(`Counter is at ${count}`);',
        ),
      },
      {
        title: 'Handling Transactions in the UI',
        contentType: 'markdown',
        textContent: text(
          '# Handling transactions in the UI',
          'A transaction moves through several states. The interface should show every one.',
          '',
          '## The states',
          '- Waiting for signature: the wallet popup is open.',
          '- Pending: the transaction was sent and is waiting for a block.',
          '- Confirmed: it is in a block. Link to the block explorer.',
          '- Failed: say why in plain words, and offer to try again.',
          '',
          '## One rule',
          'Disable the button while a transaction is pending. A double click can send two transactions.',
        ),
      },
    ],
  },
  {
    title: 'Web3 UX Basics',
    program: 'frontend',
    instructorName: 'Ada N.',
    status: 'draft',
    lessons: [
      {
        title: 'Designing the Signing Moment',
        contentType: 'markdown',
        textContent: text(
          '# Designing the signing moment',
          'The wallet popup is the scariest screen in a dApp. Prepare the user before it opens.',
          '',
          '## Before the popup',
          '- Say what they are about to sign, in plain words.',
          '- Show the amount and the network fee.',
          '- Tell them the wallet is about to open.',
          '',
          '## After the popup',
          'If they reject, return to the previous screen quietly. Rejecting is a choice, not an error.',
        ),
      },
      {
        title: 'Writing Error Messages',
        contentType: 'markdown',
        textContent: text(
          '# Writing error messages',
          'Raw errors like "execution reverted" mean nothing to most people.',
          '',
          '## Translate them',
          '- Insufficient funds: say how much more they need.',
          '- Wrong network: name the network and offer a switch button.',
          '- Contract revert: say which rule blocked it, like "Only the owner can withdraw."',
        ),
      },
    ],
  },
];

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
    const programs = { backend, frontend };

    for (const course of [...COURSES].reverse()) {
      const courseId = await ctx.db.insert('courses', {
        title: course.title,
        programId: programs[course.program],
        instructorName: course.instructorName,
        status: course.status,
      });
      for (const [index, lesson] of course.lessons.entries()) {
        await ctx.db.insert('lessons', { courseId, order: index + 1, ...lesson });
      }
    }

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
