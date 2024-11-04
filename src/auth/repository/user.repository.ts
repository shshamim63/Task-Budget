import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorHandlerService } from '../../helpers/error.helper.service';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async findMany(query) {
    try {
      return this.prismaService.user.findMany(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }
}
