import { UserType } from '@prisma/client';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { PrismaService } from '../prisma/prisma.service';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TaskCollaborators } from './dto/task-collaborators.dto';

@Injectable()
export class CollaboratorsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCollaborators(user: JWTPayload, task: TaskResponseDto) {
    const isAuthorized = this.hasPermission(user, task);

    if (!isAuthorized)
      throw new UnauthorizedException(
        'User does not have information access permission',
      );

    const taskWithMembers = await this.prismaService.task.findUnique({
      where: { id: task.id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        budget: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            email: true,
            username: true,
            userType: true,
          },
        },
        members: {
          select: {
            member: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const taskWithCollaborators = {
      ...taskWithMembers,
      members: taskWithMembers.members.map((data) => data.member),
    };

    return new TaskCollaborators(taskWithCollaborators);
  }

  async assignMember(
    createContributors: CreateCollaboratorsDto,
    user: JWTPayload,
    task: TaskResponseDto,
  ): Promise<string> {
    const isAuthorized = this.hasPermission(user, task);

    if (!isAuthorized)
      throw new UnauthorizedException('User cannot assign members to the task');

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
  }

  async removeCollaborator(
    user: JWTPayload,
    task: TaskResponseDto,
    contributorId: number,
  ): Promise<string> {
    const isAuthorized = this.hasPermission(user, task);

    if (!isAuthorized)
      throw new UnauthorizedException('User cannot assign members to the task');

    await this.prismaService.userTasks.delete({
      where: {
        memberId_taskId: {
          memberId: contributorId,
          taskId: task.id,
        },
      },
    });

    return `Removed member with id: ${contributorId} from task with id: ${task.id}`;
  }

  private hasPermission(user: JWTPayload, task: TaskResponseDto): boolean {
    const isSuperUser = user.userType === UserType.SUPER;
    const isAdminUser = user.userType === UserType.ADMIN;
    const isTaskCreator = user.id === task.creatorId;

    if (isSuperUser || (isAdminUser && isTaskCreator)) return true;

    return false;
  }
}
