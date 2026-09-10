import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Local development only: both seeded accounts sign in with the password "corridor-dev".
// Hash produced by hashPassword() in apps/web/lib/security/encryption.ts.
const DEV_PASSWORD_HASH =
  'pbkdf2_sha256$310000$bddf7af89420006c9a4e471fac6859a8$0fd5c18a7a31bf175b710b9c5e22d47eb089d2c16f476d35328e4cf17baf8440';

async function main() {
  console.log('Seeding database...');

  // Seed Users
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash: DEV_PASSWORD_HASH },
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
      passwordHash: DEV_PASSWORD_HASH,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: DEV_PASSWORD_HASH },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash: DEV_PASSWORD_HASH,
    },
  });

  // Seed Program
  const program = await prisma.program.create({
    data: {
      name: 'Backend Engineering',
      description: 'Smart contract development and on-chain architecture.',
    }
  });

  // Seed Course
  const course = await prisma.course.create({
    data: {
      title: 'Introduction to Web3',
      status: 'published',
      programId: program.id,
    }
  });

  // Seed Cohort
  const cohort = await prisma.cohort.create({
    data: {
      name: 'Backend Engineering — Cohort 07',
      programId: program.id,
      startDate: new Date(),
      weekCount: 8,
    }
  });

  // Enroll User
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      cohortId: cohort.id,
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
