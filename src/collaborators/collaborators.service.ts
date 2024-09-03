import { UserType } from '@prisma/client';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { PrismaService } from '../prisma/prisma.service';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateCollaborators } from './dto/create-collaborators.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CollaboratorsService {
  constructor(private readonly prismaService: PrismaService) {}

  async assignMember(
    createContributors: CreateCollaborators,
    user: JWTPayload,
    task: TaskResponseDto,
  ): Promise<string> {
    try {
      const isAuthorized = this.hasPermission(user, task);

      if (!isAuthorized)
        throw new UnauthorizedException(
          'User cannot assign members to the task',
        );

      const { collaborators } = createContributors;

      const existingCollaborators = await this.prismaService.user.findMany({
        where: { id: { in: collaborators } },
        select: { id: true },
      });

      const existingCollaboratorsIds = existingCollaborators.map(
        (contributor) => contributor.id,
      );

      const missingContributors = collaborators.filter(
        (id) => !existingCollaboratorsIds.includes(id),
      );

      if (missingContributors.length > 0) {
        throw new NotFoundException(
          `Contributor(s) with ID(s) ${missingContributors.join(', ')} not found`,
        );
      }

      const currentTime = new Date();

      const data = collaborators.map((candidate) => {
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
      throw error;
    }
  }

  async removeCollaborator(
    user: JWTPayload,
    task: TaskResponseDto,
    contributorId: number,
  ): Promise<string> {
    try {
      const isAuthorized = this.hasPermission(user, task);

      if (!isAuthorized)
        throw new UnauthorizedException(
          'User cannot assign members to the task',
        );

      await this.prismaService.userTasks.delete({
        where: {
          memberId_taskId: {
            memberId: contributorId,
            taskId: task.id,
          },
        },
      });

      return `Removed member with id: ${contributorId} from task with id: ${task.id}`;
    } catch (error) {
      throw error;
    }
  }

  private hasPermission(user: JWTPayload, task: TaskResponseDto): boolean {
    const isSuperUser = user.userType === UserType.SUPER;
    const isAdminUser = user.userType === UserType.ADMIN;
    const isTaskCreator = user.id === task.creatorId;

    if (isSuperUser || (isAdminUser && isTaskCreator)) return true;

    return false;
  }
}
