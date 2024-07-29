import { TaskResponseDto } from '../tasks/dto/task.dto';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  tasks: TaskResponseDto[];
}
