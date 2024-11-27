import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomError } from '../common/exceptions/custom-error.exception';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PRISMA_ERROR_CODE } from '../prisma/prisma-error-code';

@Injectable()
export class ErrorHandlerService {
  handle(error: CustomError): never {
    if (error instanceof PrismaClientKnownRequestError) {
      const { response, status } = PRISMA_ERROR_CODE[error.code];
      const errorInfo = error.meta.cause ?? response;
      throw new HttpException(errorInfo, status);
    } else if (error instanceof HttpException) {
      throw error;
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
}
