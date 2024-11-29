import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CollaboratorController } from './collaborators.controller';
import { CollaboratorService } from './collaborators.service';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { CollaboratorRepository } from './collaborator.repository';
import { TaskRepository } from '../tasks/tasks.repository';
import { UserRepository } from '../auth/user.repository';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [CollaboratorController],
  providers: [
    CollaboratorService,
    TaskPermissionService,
    CollaboratorRepository,
    TaskRepository,
    UserRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
  ],
})
export class CollaboratorModule {}
