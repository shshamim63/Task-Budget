import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CacheModule, CacheStore } from '@nestjs/cache-manager';

import * as redisStore from 'cache-manager-redis-store';

import { TaskModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expenses/expenses.module';
import { CollaboratorModule } from './collaborators/collaborators.module';
import { DesignationModule } from './designations/designations.module';
import { DepartmentModule } from './departments/departments.module';
import { EnterpriseModule } from './enterprises/enterprises.module';
import { AssociateModule } from './associates/associates.module';
import { RedisModule } from './redis/redis.module';

import { PrismaModule } from './prisma/prisma.module';
import { TokenModule } from './token/token.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      host: `${process.env.REDIS_HOST || 'localhost'}`,
      port: `${process.env.REDIS_PORT || 6379}`,
      store: redisStore as unknown as CacheStore,
      ttl: 3 * 6000,
      isGlobal: true,
    }),
    TaskModule,
    AuthModule,
    UsersModule,
    ExpenseModule,
    CollaboratorModule,
    EnterpriseModule,
    DepartmentModule,
    DesignationModule,
    AssociateModule,
    RedisModule,
    PrismaModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
