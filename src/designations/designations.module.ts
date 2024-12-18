import { Module } from '@nestjs/common';
import { DesignationController } from './designations.controller';
import { DesignationService } from './designations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DesignationRepository } from './designations.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TokenModule } from '../token/token.module';
import { UserRepository } from '../auth/user.repository';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [PrismaModule, TokenModule, RedisModule],
  controllers: [DesignationController],
  providers: [
    DesignationService,
    DesignationRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    UserRepository,
    RedisService,
  ],
})
export class DesignationModule {}
