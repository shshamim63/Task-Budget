import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  entry(): string {
    return 'Server is running successfully';
  }
}
