import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { CollaboratorRepository } from './collaborator.repository';
import { TaskRepository } from '../tasks/task.repository';
import { UserRepository } from '../auth/user.repository';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [CollaboratorsController],
  providers: [
    CollaboratorsService,
    TaskPermissionService,
    CollaboratorRepository,
    TaskRepository,
    UserRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
  ],
})
export class CollaboratorsModule {}
