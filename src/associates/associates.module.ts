import { Module } from '@nestjs/common';

import { AssociateController } from './associates.controller';

import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { TokenService } from '../token/token.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AssociateService } from './associates.service';

import { UserRepository } from '../auth/user.repository';
import { AssociateRepository } from './associate.repository';

import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [AssociateController],
  providers: [
    AssociateService,
    AssociateRepository,
    PrismaService,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    TokenService,
    RedisService,
  ],
})
export class AssociateModule {}
