import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { TaskModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expenses/expenses.module';
import { CollaboratorModule } from './collaborators/collaborators.module';
import { DesignationModule } from './designations/designations.module';
import { DepartmentModule } from './departments/departments.module';
import { EnterpriseModule } from './enterprises/enterprises.module';
import { AssociateModule } from './associates/associates.module';
import { RedisModule } from './redis/redis.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TaskModule,
    AuthModule,
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
