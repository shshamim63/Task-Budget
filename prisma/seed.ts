import { PrismaClient, UserType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { create } from 'domain';

const prisma = new PrismaClient();

const SALTROUND = process.env.SALTROUND;

const fakeUser = async ({
  role = UserType.USER,
  password = 'demopass',
}: {
  role?: UserType;
  password?: string;
}) => {
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password_hash: await bcrypt.hash(password, SALTROUND),
    userType: role,
  };
};

const createUser = async (data) => {
  return await prisma.user.create({ data });
};

const adminUser = createUser(
  fakeUser({ role: UserType.ADMIN, password: 'admin' }),
);
const superUser = createUser(
  fakeUser({ role: UserType.SUPER, password: 'super' }),
);

let users = [];

for (let i = 0; i < 5; i++) {
  const user = createUser(fakeUser({}));
  users.push(user);
}
