import { HttpStatus } from '@nestjs/common';

export const PRISMA_ERROR_CODE = {
  P2025: {
    response: 'Record does not exist',
    status: HttpStatus.NOT_FOUND,
  },
};
