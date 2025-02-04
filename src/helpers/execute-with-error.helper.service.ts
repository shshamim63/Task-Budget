import { Injectable } from '@nestjs/common';
import { ErrorHandlerService } from './error.helper.service';

@Injectable()
export class AsyncErrorHandlerService {
  constructor(private readonly errorHandlerService: ErrorHandlerService) {}

  async execute<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      console.log(error);
      this.errorHandlerService.handle(error);
    }
  }
}
