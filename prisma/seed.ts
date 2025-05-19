import { PrismaClient, TaskStatus, UserType } from '@prisma/client';

import { faker } from '@faker-js/faker';

import * as bcrypt from 'bcrypt';

const SALTROUND = Number(process.env.SALTROUND);

const prisma = new PrismaClient();

async function main() {
  // Create users
  const [adminUser, _superUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'adminUser',
        password_hash: await bcrypt.hash('admin', SALTROUND),
        userType: UserType.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: 'super@example.com',
        username: 'superUser',
        password_hash: await bcrypt.hash('super', SALTROUND),
        userType: UserType.SUPER,
      },
    }),
  ]);

  const [user1, user2, user3] = await Promise.all([
    prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password_hash: await bcrypt.hash('demouser', SALTROUND),
        userType: UserType.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password_hash: await bcrypt.hash('demouser', SALTROUND),
        userType: UserType.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password_hash: await bcrypt.hash('demouser', SALTROUND),
        userType: UserType.USER,
      },
    }),
  ]);

  const [task1, task2] = await Promise.all([
    prisma.task.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        creatorId: adminUser.id,
        status: TaskStatus.OPEN,
        budget: 100.0,
        members: {
          create: [{ memberId: user1.id }, { memberId: user2.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        creatorId: adminUser.id,
        status: TaskStatus.IN_PROGRESS,
        budget: 50.0,
        members: {
          create: [{ memberId: user2.id }, { memberId: user3.id }],
        },
      },
    }),
  ]);

  // Create expenses
  await Promise.all([
    prisma.expense.create({
      data: {
        description: faker.lorem.words(),
        amount: 30.0,
        taskId: task1.id,
        contributorId: user1.id,
      },
    }),
    prisma.expense.create({
      data: {
        description: faker.lorem.words(),
        amount: 70.0,
        taskId: task2.id,
        contributorId: user2.id,
      },
    }),
  ]);
}

if (process.env.NODE_ENV === 'development') {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
} else {
  console.error('Blocked the seed generation process');
}
