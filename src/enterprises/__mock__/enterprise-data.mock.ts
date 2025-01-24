import { faker } from '@faker-js/faker/.';
import { Enterprise } from '@prisma/client';
import { CreateEnterpriseDto } from '../dto/create-enterprise.dto';

export const enterpriseRequestBodyMock = (): CreateEnterpriseDto => {
  return {
    name: faker.company.name(),
    logo: faker.image.url(),
    registrationNumber: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric({ length: 6 })}`,
    establishedAt: faker.date.past(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    website: faker.internet.domainName(),
    address: faker.location.streetAddress(),
  };
};

export const EnterpriseMock = ({
  payload = {} as CreateEnterpriseDto,
}: {
  payload: CreateEnterpriseDto;
}): Enterprise => {
  return {
    id: faker.number.int({ min: 1 }),
    name: payload.name ?? faker.company.name(),
    logo: payload.logo ?? faker.image.url(),
    registrationNumber:
      payload.registrationNumber ??
      `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric({ length: 6 })}`,
    establishedAt: payload.establishedAt ?? faker.date.past(),
    phone: payload.phone ?? faker.phone.number(),
    email: payload.email ?? faker.internet.email(),
    website: payload.website ?? faker.internet.domainName(),
    address: payload.address ?? faker.location.streetAddress(),
    createdAt: faker.date.soon(),
    updatedAt: faker.date.recent(),
  };
};
