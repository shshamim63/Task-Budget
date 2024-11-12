import { Prisma, Task, User } from '@prisma/client'; // Import types from Prisma if necessary

export interface TaskResponse extends Task {
  members?: {
    member: User;
  }[];
}

export interface TaskQuery {
  where: Prisma.TaskWhereInput;
}
