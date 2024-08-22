import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContributorsService } from './contributors.service';
import { ContributorsController } from './contributors.controller';
import { TokenModule } from '../token/token.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [PrismaModule, TokenModule, RolesModule],
  controllers: [ContributorsController],
  providers: [ContributorsService],
})
export class ContributorsModule {}
