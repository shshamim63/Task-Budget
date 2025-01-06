import { Injectable } from '@nestjs/common';

import { Associate, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { RedisService } from '../redis/redis.service';
import { REDIS_TTL_IN_MILISECONDS } from '../utils/redis-keys';

@Injectable()
export class AssociateRepository {
  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create({
    data,
    query = {},
  }: {
    data: Prisma.AssociateCreateInput;
    query?: Prisma.AssociateSelect;
  }): Promise<Associate> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.associate.create({
        data,
        ...(!!Object.keys(query).length && { select: query }),
      }),
    );
  }

  async findMany({
    redisKey = '',
    query,
  }: {
    redisKey: string;
    query: Prisma.AssociateWhereInput;
  }) {
    const redisAssociate = redisKey
      ? await this.redisService.get(redisKey)
      : null;

    if (redisAssociate) return JSON.parse(redisAssociate);

    const data = await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.associate.findMany({
        where: query,
      }),
    );

    if (redisKey)
      await this.redisService.set(
        redisKey,
        JSON.stringify(data),
        REDIS_TTL_IN_MILISECONDS,
      );

    return data;
  }
}
