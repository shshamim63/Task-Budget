import { PrismaClient, TaskStatus, UserType } from '@prisma/client';

import { faker } from '@faker-js/faker';

import * as bcrypt from 'bcrypt';

const SALTROUND = Number(process.env.SALTROUND);

const prisma = new PrismaClient();

async function main() {
  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'adminUser',
      password_hash: await bcrypt.hash('admin', SALTROUND),
      userType: UserType.ADMIN,
    },
  });

  //Create regular users
  const regularUser1 = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password_hash: await bcrypt.hash('demouser', SALTROUND),
      userType: UserType.USER,
    },
  });
  const regularUser2 = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password_hash: await bcrypt.hash('demouser', SALTROUND),
      userType: UserType.USER,
    },
  });

  const regularUser3 = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password_hash: await bcrypt.hash('demouser', SALTROUND),
      userType: UserType.USER,
    },
  });

  const task1 = await prisma.task.create({
    data: {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      creatorId: adminUser.id,
      status: TaskStatus.OPEN,
      budget: 100.0,
      members: {
        create: [{ memberId: regularUser1.id }, { memberId: regularUser2.id }],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      creatorId: adminUser.id,
      status: TaskStatus.IN_PROGRESS,
      budget: 50.0,
      members: {
        create: [{ memberId: regularUser2.id }, { memberId: regularUser3.id }],
      },
    },
  });

  // Create expenses
  await prisma.expense.create({
    data: {
      description: faker.lorem.words(),
      amount: 30.0,
      taskId: task1.id,
      contributorId: regularUser1.id,
    },
  });

  await prisma.expense.create({
    data: {
      description: faker.lorem.words(),
      amount: 70.0,
      taskId: task2.id,
      contributorId: regularUser2.id,
    },
  });
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
