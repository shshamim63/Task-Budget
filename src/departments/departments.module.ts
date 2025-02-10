import { Module } from '@nestjs/common';
import { DepartmentController } from './departments.controller';
import { DepartmentService } from './departments.service';

import { DepartmentRepository } from './departments.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

import { UserRepository } from '../users/user.repository';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [DepartmentController],
  providers: [
    DepartmentService,
    DepartmentRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    UserRepository,
    RedisService,
  ],
})
export class DepartmentModule {}
