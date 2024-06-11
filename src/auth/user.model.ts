import { TaskResponseDto } from 'src/tasks/dto/task.dto';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  tasks: TaskResponseDto[];
}
