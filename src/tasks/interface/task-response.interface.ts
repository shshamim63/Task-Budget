import { Task, User } from '@prisma/client'; // Import types from Prisma if necessary

export interface TaskResponse extends Task {
  members?: {
    member: User;
  }[];
}
