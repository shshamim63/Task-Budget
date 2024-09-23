import { Prisma, TaskStatus, UserType } from '@prisma/client';
import { TaskResponseDto } from '../../tasks/dto/task.dto';

export class TaskCollaborators {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  budget: number;
  creator: {
    id: number;
    username: string;
    email: string;
    userType: UserType;
  };
  members: {
    id: number;
    username: string;
    email: string;
  }[];
  constructor(
    partial: Partial<
      Omit<TaskResponseDto, 'budget'> & { budget?: Prisma.Decimal }
    >,
  ) {
    Object.assign(this, {
      ...partial,
      budget: partial.budget ? partial.budget.toNumber() : 0,
    });
  }
}
