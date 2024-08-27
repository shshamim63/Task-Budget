import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { RolesModule } from '../roles/roles.module';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';

@Module({
  imports: [PrismaModule, TokenModule, RolesModule],
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService],
})
export class CollaboratorsModule {}
