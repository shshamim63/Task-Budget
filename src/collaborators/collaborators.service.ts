import { JWTPayload } from '../auth/interfaces/auth.interface';
import { PrismaService } from '../prisma/prisma.service';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskCollaborators } from './dto/task-collaborators.dto';
import { TaskPermissionService } from '../helpers/task-permission-helper.service';

@Injectable()
export class CollaboratorsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly taskPermissionService: TaskPermissionService,
  ) {}

  async getCollaborators(user: JWTPayload, task: TaskResponseDto) {
    this.taskPermissionService.hasOperationPermission(user, task);

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
    this.taskPermissionService.hasOperationPermission(user, task);

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
    this.taskPermissionService.hasOperationPermission(user, task);

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
}
