import { Module } from '@nestjs/common';

import { AssociateController } from './associates.controller';

import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { TokenService } from '../token/token.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AssociateService } from './associates.service';

import { AssociateRepository } from './associate.repository';

import { RedisService } from '../redis/redis.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AssociateController],
  providers: [
    AssociateService,
    AssociateRepository,
    PrismaService,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    TokenService,
    RedisService,
  ],
  exports: [AssociateService],
})
export class AssociateModule {}
