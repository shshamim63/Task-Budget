import { SetMetadata } from '@nestjs/common';

import { UserType } from '@prisma/client';

import { ROLES_KEY } from '../utils/constants';

export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
