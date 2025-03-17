import { Associate, Prisma } from '@prisma/client';

export type CreateAssociateResult =
  | Prisma.AssociateGetPayload<{
      select: {
        id: true;
        department: { select: { id: true; name: true } };
        designation: { select: { id: true; name: true } };
        enterprise: { select: { id: true; name: true } };
        affiliate: { select: { id: true; email: true } };
      };
    }>
  | Associate;
