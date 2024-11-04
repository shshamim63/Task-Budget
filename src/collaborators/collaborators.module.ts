import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { CollaboratorRepository } from './repositories/collaborator.repository';
import { TaskRepository } from '../tasks/repositories/task.repository';
import { UserRepository } from '../auth/repository/user.repository';
import { ErrorHandlerService } from '../helpers/error.helper.service';

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
  ],
})
export class CollaboratorsModule {}
