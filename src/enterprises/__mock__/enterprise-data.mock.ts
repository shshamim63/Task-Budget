import { faker } from '@faker-js/faker/.';
import { Enterprise } from '@prisma/client';

export const EnterpriseMock = (): Enterprise => {
  return {
    id: faker.number.int({ min: 1 }),
    name: faker.company.name(),
    logo: faker.image.url(),
    registrationNumber: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric({ length: 6 })}`,
    establishedAt: faker.date.past(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    website: faker.internet.domainName(),
    address: faker.location.streetAddress(),
    createdAt: faker.date.soon(),
    updatedAt: faker.date.recent(),
  };
};
