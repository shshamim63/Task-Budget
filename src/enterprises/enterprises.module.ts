import { Module } from '@nestjs/common';
import { EnterpriseController } from './enterprises.controller';
import { EnterpriseService } from './exterprises.service';

import { EnterpriseRepository } from './enterprise.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

import { RedisService } from '../redis/redis.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseService,
    EnterpriseRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    RedisService,
  ],
})
export class EnterpriseModule {}
