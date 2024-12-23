import { Module } from '@nestjs/common';
import { EnterpriseController } from './enterprises.controller';
import { EnterpriseService } from './exterprises.service';

import { EnterpriseRepository } from './enterprise.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { UserRepository } from '../auth/user.repository';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [EnterpriseController],
  providers: [
    EnterpriseService,
    EnterpriseRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    UserRepository,
    RedisService,
  ],
})
export class EnterpriseModule {}
