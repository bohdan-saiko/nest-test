import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  MembershipRole,
  PrismaClient,
  ProjectStatus,
  TaskStatus,
} from '../src/generated/prisma/client.js';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://projects:projects@localhost:5433/projects?schema=public';
const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const [olena, taras] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'olena@example.com' },
      update: { displayName: 'Olena Koval' },
      create: { email: 'olena@example.com', displayName: 'Olena Koval' },
    }),
    prisma.user.upsert({
      where: { email: 'taras@example.com' },
      update: { displayName: 'Taras Melnyk' },
      create: { email: 'taras@example.com', displayName: 'Taras Melnyk' },
    }),
  ]);

  const project = await prisma.project.upsert({
    where: { name: 'StudyFlow' },
    update: {
      description: 'Система керування навчальними проєктами',
      status: ProjectStatus.active,
    },
    create: {
      name: 'StudyFlow',
      description: 'Система керування навчальними проєктами',
      status: ProjectStatus.active,
      internalNote: 'Seed data — never returned by the API.',
    },
  });

  await Promise.all([
    prisma.membership.upsert({
      where: { projectId_userId: { projectId: project.id, userId: olena.id } },
      update: { role: MembershipRole.owner },
      create: {
        projectId: project.id,
        userId: olena.id,
        role: MembershipRole.owner,
      },
    }),
    prisma.membership.upsert({
      where: { projectId_userId: { projectId: project.id, userId: taras.id } },
      update: { role: MembershipRole.member },
      create: {
        projectId: project.id,
        userId: taras.id,
        role: MembershipRole.member,
      },
    }),
    prisma.task.upsert({
      where: {
        projectId_title: { projectId: project.id, title: 'Document the API' },
      },
      update: { status: TaskStatus.in_progress, assigneeId: taras.id },
      create: {
        projectId: project.id,
        title: 'Document the API',
        status: TaskStatus.in_progress,
        assigneeId: taras.id,
      },
    }),
  ]);
}

main()
  .then(() => console.log('Seed data created.'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
