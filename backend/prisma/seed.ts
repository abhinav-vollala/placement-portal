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
      logoUrl: 'https://ui-avatars.com/api/?name=Acme+Corp&background=4f46e5&color=fff&size=128',
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
        description: 'A six-month internship where you build real features on our web platform alongside a supportive engineering team.',
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: ['CSE', 'IT'],
        deadline: new Date('2026-12-31'),
        status: 'OPEN',
        companyId: acme.id,
        employmentType: 'INTERNSHIP',
        openings: 5,
        eligibleBatch: '2026, 2027',
        responsibilities:
          'Build and ship features on our web platform.\nCollaborate with designers and backend engineers.\nWrite clean, well-tested code.',
        requirements:
          'Pursuing a B.Tech in CSE or IT.\nStrong problem-solving skills.\nFamiliarity with JavaScript.',
        preferredSkills: 'React, TypeScript, Git, REST APIs',
        experience: 'Fresher (internship)',
        duration: '6 months',
        workMode: 'HYBRID',
      },
      {
        title: 'Frontend Developer',
        role: 'Fresher',
        ctc: 8,
        location: 'Hyderabad',
        description: 'An entry-level frontend role building fast, accessible interfaces used by thousands of students.',
        minCgpa: 6.5,
        maxBacklogs: 2,
        allowedBranches: [],
        deadline: new Date('2026-11-30'),
        status: 'OPEN',
        companyId: acme.id,
        employmentType: 'FULL_TIME',
        openings: 3,
        eligibleBatch: '2026',
        responsibilities:
          'Develop responsive, accessible UI components.\nOwn features end-to-end in a React codebase.\nWork closely with product and design.',
        requirements:
          'B.Tech in any branch.\nGood grasp of HTML, CSS and JavaScript.\nA portfolio or projects you can walk us through.',
        preferredSkills: 'React, Tailwind CSS, Figma',
        experience: 'Fresher',
        duration: 'Full-time',
        workMode: 'ONSITE',
      },
      {
        title: 'Data Analyst',
        role: 'Fresher',
        ctc: 6,
        location: 'Pune',
        description: 'Closed drive for the analyst cohort.',
        minCgpa: 7,
        maxBacklogs: 1,
        allowedBranches: [],
        deadline: new Date('2026-01-31'),
        status: 'CLOSED',
        companyId: acme.id,
        employmentType: 'FULL_TIME',
        openings: 2,
        eligibleBatch: '2025, 2026',
        responsibilities:
          'Analyze datasets and surface actionable insights.\nBuild dashboards for stakeholders.',
        requirements: 'Proficiency in SQL and Excel.\nBasic statistics.',
        preferredSkills: 'Python, Power BI',
        experience: '0-1 years',
        duration: 'Full-time',
        workMode: 'ONSITE',
      },
    ],
  });

  // Globex Company
  const globex = await prisma.company.create({
    data: {
      name: 'Globex',
      industry: 'Fintech',
      website: 'https://globex.example.com',
      logoUrl: 'https://ui-avatars.com/api/?name=Globex&background=0ea5e9&color=fff&size=128',
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
      employmentType: 'FULL_TIME',
      openings: 4,
      eligibleBatch: '2026',
      responsibilities: 'Design and maintain backend services.\nWrite APIs used across products.',
      requirements: 'B.Tech in CSE.\nStrong fundamentals in data structures.',
      preferredSkills: 'Node.js, PostgreSQL, Docker',
      experience: 'Fresher',
      duration: 'Full-time',
      workMode: 'REMOTE',
    },
  });

  // Demo applications so every recruiter view has live data.
  const aliceStudent = await prisma.student.findUnique({ where: { rollNo: 'CS-001' } });
  const bobStudent = await prisma.student.findUnique({ where: { rollNo: 'IT-002' } });
  const acmeJobs = await prisma.job.findMany({ where: { companyId: acme.id } });
  const internJob = acmeJobs.find((j) => j.title === 'Software Engineer Intern');
  const frontendJob = acmeJobs.find((j) => j.title === 'Frontend Developer');

  if (aliceStudent && internJob) {
    await prisma.application.create({
      data: { studentId: aliceStudent.id, jobId: internJob.id, status: 'SHORTLISTED' },
    });
  }
  if (bobStudent && frontendJob) {
    await prisma.application.create({
      data: { studentId: bobStudent.id, jobId: frontendJob.id, status: 'APPLIED' },
    });
  }

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