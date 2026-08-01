// Seed script — resets and repopulates the database with demo data.
// Run with: npm run db:seed

import { PrismaClient } from '../src/generated/prisma/client.js';
import { hashPassword } from '../src/lib/password.js';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.student.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@portal.com',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  // Students
  await prisma.user.create({
    data: {
      email: 'alice@college.edu',
      passwordHash: await hashPassword('secret123'),
      role: 'STUDENT',
      student: {
        create: {
          name: 'Alice',
          rollNo: 'CS-001',
          branch: 'CSE',
          batch: 2026,
          cgpa: 8.5,
          backlogs: 0,
          phone: '9876543210',
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: 'bob@college.edu',
      passwordHash: await hashPassword('secret123'),
      role: 'STUDENT',
      student: {
        create: {
          name: 'Bob',
          rollNo: 'IT-002',
          branch: 'IT',
          batch: 2027,
          cgpa: 6.2,
          backlogs: 3,
        },
      },
    },
  });

  // Acme Company first
  const acme = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      industry: 'Software',
      website: 'https://acme.example.com',
      description: 'A fictional software company for demo purposes.',
    },
  });

  // Acme recruiter connected to company
  await prisma.user.create({
    data: {
      email: 'bob@acme.com',
      passwordHash: await hashPassword('secret123'),
      role: 'RECRUITER',
      recruiter: {
        create: {
          fullName: 'Bob Recruiter',
          position: 'HR Manager',
          companyId: acme.id,
        },
      },
    },
  });

  await prisma.job.createMany({
    data: [
      {
        title: 'Software Engineer Intern',
        role: 'Intern',
        ctc: 4.5,
        location: 'Bengaluru',
        description: 'Six-month internship building web applications.',
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'IT'],
        deadline: new Date('2026-12-31'),
        status: 'OPEN',
        companyId: acme.id,
      },
      {
        title: 'Frontend Developer',
        role: 'Fresher',
        ctc: 8,
        location: 'Hyderabad',
        description: 'Entry-level frontend role.',
        minCgpa: 6.5,
        maxBacklogs: 2,
        allowedBranches: [],
        deadline: new Date('2026-11-30'),
        status: 'OPEN',
        companyId: acme.id,
      },
      {
        title: 'Data Analyst',
        role: 'Fresher',
        ctc: 6,
        location: 'Pune',
        description: 'Closed drive.',
        minCgpa: 7,
        maxBacklogs: 1,
        allowedBranches: [],
        deadline: new Date('2026-01-31'),
        status: 'CLOSED',
        companyId: acme.id,
      },
    ],
  });

  // Globex Company
  const globex = await prisma.company.create({
    data: {
      name: 'Globex',
      industry: 'Fintech',
      website: 'https://globex.example.com',
    },
  });

  await prisma.user.create({
    data: {
      email: 'jane@globex.com',
      passwordHash: await hashPassword('secret123'),
      role: 'RECRUITER',
      recruiter: {
        create: {
          fullName: 'Jane Recruiter',
          position: 'Talent Lead',
          companyId: globex.id,
        },
      },
    },
  });

  await prisma.job.create({
    data: {
      title: 'Backend Engineer',
      role: 'Fresher',
      ctc: 9,
      location: 'Mumbai',
      description: 'Entry-level backend role.',
      minCgpa: 8,
      maxBacklogs: 0,
      allowedBranches: ['CSE'],
      deadline: new Date('2026-10-31'),
      status: 'OPEN',
      companyId: globex.id,
    },
  });

  const [users, companies, jobs, applications] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.job.count(),
    prisma.application.count(),
  ]);

  console.log(
    `Seed complete: ${users} users, ${companies} companies, ${jobs} jobs, ${applications} applications.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());