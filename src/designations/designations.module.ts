import { Module } from '@nestjs/common';
import { DesignationController } from './designations.controller';
import { DesignationService } from './designations.service';

import { DesignationRepository } from './designations.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

import { UserRepository } from '../auth/user.repository';
import { RedisService } from '../redis/redis.service';

@Module({
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
