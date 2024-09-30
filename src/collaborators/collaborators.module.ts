import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';
import { TaskPermissionService } from '../helpers/task-permission-helper.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService, TaskPermissionService],
})
export class CollaboratorsModule {}
