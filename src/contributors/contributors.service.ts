import { UserType } from '@prisma/client';
import { JWTPayload } from '../interface/auth.interface';
import { PrismaService } from '../prisma/prisma.service';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateContributors } from './dto/create-contributors.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ContributorsService {
  constructor(private readonly prismaService: PrismaService) {}

  async assignMember(
    createContributors: CreateContributors,
    user: JWTPayload,
    task: TaskResponseDto,
  ) {
    try {
      this.hasPermission(user, task);
      const { contributors } = createContributors;
      const existingContributors = await this.prismaService.user.findMany({
        where: { id: { in: contributors } },
        select: { id: true },
      });

      const existingContributorsIds = existingContributors.map(
        (contributor) => contributor.id,
      );

      const missingContributors = contributors.filter(
        (id) => !existingContributorsIds.includes(id),
      );

      if (missingContributors.length > 0) {
        throw new NotFoundException(
          `Contributor(s) with ID(s) ${missingContributors.join(', ')} not found`,
        );
      }

      const currentTime = new Date();

      const data = contributors.map((candidate) => {
        return {
          taskId: task.id,
          memberId: candidate,
          createdAt: currentTime,
          updatedAt: currentTime,
        };
      });

      await this.prismaService.userTasks.createMany({ data });

      return `Assigned members to the task with id: ${task.id}`;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  private hasPermission(
    user: JWTPayload,
    task: TaskResponseDto,
  ): boolean | never {
    if (user.userType === UserType.SUPER) return true;

    if (user.userType === UserType.ADMIN && user.id === task.creatorId)
      return true;

    throw new UnauthorizedException('User cannot assign members to the task');
  }
}
