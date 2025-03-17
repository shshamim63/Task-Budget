import { Prisma } from '@prisma/client';

export type DesignationWithSeletedPayload = Prisma.DesignationGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    department: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
