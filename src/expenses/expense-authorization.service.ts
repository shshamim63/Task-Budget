import { Injectable } from '@nestjs/common';
import { CollaboratorRepository } from '../collaborators/collaborator.repository';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { Expense, UserType } from '@prisma/client';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpenseAuthorizationService {
  constructor(
    private readonly collaboratorRepository: CollaboratorRepository,
  ) {}

  async canCreateExpense(user: JWTPayload, task: TaskResponseDto) {
    return await this.hasPermission(user, task);
  }

  async canViewExpense(user: JWTPayload, task: TaskResponseDto) {
    return await this.hasPermission(user, task);
  }

  canUpdateExpence(
    user: JWTPayload,
    task: TaskResponseDto,
    currentExpense: Expense,
    updateExpenseDto: Partial<UpdateExpenseDto>,
  ) {
    const { id: userId, userType } = user;
    const { creatorId } = task;
    const { contributorId } = currentExpense;
    const { contributorId: modifiedContributorid } = updateExpenseDto;

    const isSuperUser = userType === UserType.SUPER;
    const isTaskCreator = creatorId === userId;
    const isTaskContributor = userId === contributorId;
    const shouldNotUpdateContributorId =
      modifiedContributorid && (!isSuperUser || !isTaskCreator);

    if (shouldNotUpdateContributorId) return false;

    return isSuperUser || isTaskCreator || isTaskContributor;
  }

  isExpenseExceedingBudget(
    currentTaskBudget: number,
    totalExpense: Decimal,
    newExpenseAmount: number,
  ) {
    const isExceedingBudget = new Decimal(newExpenseAmount)
      .plus(totalExpense)
      .greaterThan(new Decimal(currentTaskBudget));
    return isExceedingBudget;
  }

  private async hasPermission(user: JWTPayload, task: TaskResponseDto) {
    const { id: userId, userType } = user;
    const { id: taskId, creatorId } = task;

    const isSuperUser = userType === UserType.SUPER;
    const isTaskCreator = userId === creatorId;

    if (isSuperUser || isTaskCreator) return true;

    const query = {
      where: {
        memberId_taskId: {
          memberId: userId,
          taskId: taskId,
        },
      },
    };

    const isMember = await this.collaboratorRepository.findUnique(query);

    return !!isMember;
  }
}
