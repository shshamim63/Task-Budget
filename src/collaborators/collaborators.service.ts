import { Injectable, NotFoundException } from '@nestjs/common';

import { JWTPayload } from '../auth/interfaces/auth.interface';
import { CreateCollaborator } from './interface/collaborator.interface';

import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';
import { TaskCollaborators } from './dto/task-collaborators.dto';

import { TaskPermissionService } from '../helpers/task-permission.helper.service';

import { CollaboratorRepository } from './repositories/collaborator.repository';
import { TaskRepository } from '../tasks/repositories/task.repository';
import { UserRepository } from '../auth/repository/user.repository';

@Injectable()
export class CollaboratorsService {
  constructor(
    private readonly collaboratorRepository: CollaboratorRepository,
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
    private readonly taskPermissionService: TaskPermissionService,
  ) {}

  async getCollaborators(user: JWTPayload, task: TaskResponseDto) {
    this.taskPermissionService.hasOperationPermission(user, task);

    const baseCondition = {
      where: { id: task.id },
    };
    const selector = this.generateGetCollaboratorSelector();

    const query = { ...baseCondition, ...selector };

    const taskCollaboratorInfo = await this.taskRepository.findUnique(query);

    const taskWithCollaborators = {
      ...taskCollaboratorInfo,
      members: taskCollaboratorInfo.members.map((data) => data.member),
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

    const whereClause = { where: { id: { in: collaborators } } };
    const slelector = { select: { id: true } };

    const existingCollaborators = await this.userRepository.findMany({
      whereClause,
      slelector,
    });

    this.validAssignableContributors(existingCollaborators, collaborators);

    const currentTime = new Date();

    const data: CreateCollaborator[] = collaborators.map((candidate) => {
      return {
        taskId: task.id,
        memberId: candidate,
        createdAt: currentTime,
        updatedAt: currentTime,
      };
    });

    await this.collaboratorRepository.createMany(data);

    return `Assigned members to the task with id: ${task.id}`;
  }

  async removeCollaborator(
    user: JWTPayload,
    task: TaskResponseDto,
    contributorId: number,
  ): Promise<string> {
    this.taskPermissionService.hasOperationPermission(user, task);
    const query = {
      where: {
        memberId_taskId: {
          memberId: contributorId,
          taskId: task.id,
        },
      },
    };

    await this.collaboratorRepository.delete(query);

    return `Removed member with id: ${contributorId} from task with id: ${task.id}`;
  }

  private validAssignableContributors(existingCollaborators, collaborators) {
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
  }

  private generateGetCollaboratorSelector() {
    return {
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
    };
  }
}
