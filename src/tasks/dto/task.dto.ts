import { Exclude, Expose } from 'class-transformer';

export class TaskResponseDto {
  id: number;
  title: string;
  description: string;

  @Exclude()
  creator_id: number;

  status: string;

  @Expose({ name: 'creatorId' })
  transformCreatorId() {
    return this.creator_id;
  }

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }
}
