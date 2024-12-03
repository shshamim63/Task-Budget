import { faker } from '@faker-js/faker/.';

export const AssociateMock = () => {
  return {
    id: faker.number.int({ min: 1 }),
    department: {
      id: faker.number.int({ min: 1 }),
      name: faker.word.noun(),
    },
    designation: {
      id: faker.number.int({ min: 1 }),
      name: faker.person.jobTitle,
    },
    enterprise: {
      id: faker.number.int({ min: 1 }),
      name: faker.company.name(),
    },
    affiliate: {
      id: faker.number.int({ min: 1 }),
      email: faker.internet.email,
    },
  };
};
