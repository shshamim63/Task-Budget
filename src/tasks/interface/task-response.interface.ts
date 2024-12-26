import { Prisma, Task, User } from '@prisma/client';
export interface TaskResponse extends Task {
  members?: {
    member: User;
  }[];
}

export interface TaskQuery {
  where: Prisma.TaskWhereInput;
}
