import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';

import { CollaboratorsModule } from './collaborators/collaborators.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TasksModule,
    AuthModule,
    ExpensesModule,
    CollaboratorsModule,
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
