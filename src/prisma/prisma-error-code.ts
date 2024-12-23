import { HttpStatus } from '@nestjs/common';

export const PRISMA_ERROR_CODE = {
  P2025: {
    error: 'Record does not exist',
    status: HttpStatus.NOT_FOUND,
    messagePrefix: 'Missing record',
  },
  P2002: {
    error: 'Record exist with simalar property',
    status: HttpStatus.CONFLICT,
    messagePrefix: 'A duplicate value was found for the following fileds',
  },
};
