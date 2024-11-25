import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { TaskModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expenses/expenses.module';

import { CollaboratorModule } from './collaborators/collaborators.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TaskModule,
    AuthModule,
    ExpenseModule,
    CollaboratorModule,
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
