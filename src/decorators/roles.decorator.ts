import { UserType } from '@prisma/client';

import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants';

export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
