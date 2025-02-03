import { Task, User } from '@prisma/client';
export interface TaskResponse extends Task {
  members?: {
    member: User;
  }[];
}
