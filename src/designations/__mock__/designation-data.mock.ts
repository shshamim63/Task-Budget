import { faker } from '@faker-js/faker/.';

export const DesignationMock = () => {
  return {
    id: faker.number.int({ min: 1 }),
    name: faker.lorem.word(),
    description: faker.lorem.sentence(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.soon(),
    department: {
      id: faker.number.int({ min: 1 }),
      name: faker.lorem.word(),
    },
  };
};
