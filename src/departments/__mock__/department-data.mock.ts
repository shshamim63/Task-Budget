import { faker } from '@faker-js/faker/.';

export const DepartmentMock = () => {
  return {
    id: faker.number.int({ min: 1 }),
    name: faker.lorem.word(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.soon(),
  };
};
