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
      name: faker.person.jobTitle(),
    },
    enterprise: {
      id: faker.number.int({ min: 1 }),
      name: faker.company.name(),
    },
    affiliate: {
      id: faker.number.int({ min: 1 }),
      email: faker.internet.email(),
    },
  };
};

export const generateUserAffiliatedTo = ({
  userId,
  numOfRecords = 0,
}: {
  userId: number;
  numOfRecords: number;
}) => {
  return Array(numOfRecords)
    .fill(null)
    .map(() => ({
      id: faker.number.int(),
      departmentId: faker.number.int(),
      designationId: faker.number.int(),
      enterpriseId: faker.number.int(),
      affiliateId: userId,
      createdAt: faker.date.anytime(),
      updatedAt: faker.date.anytime(),
    }));
};
