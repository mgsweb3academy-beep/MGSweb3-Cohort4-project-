import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Seed Users
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
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
