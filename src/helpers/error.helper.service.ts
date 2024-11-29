import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { CustomError } from '../common/exceptions/custom-error.exception';

import { PRISMA_ERROR_CODE } from '../prisma/prisma-error-code';

@Injectable()
export class ErrorHandlerService {
  handle(error: CustomError): never {
    if (error instanceof PrismaClientKnownRequestError) {
      const { error: currentErrorMessage, status } =
        PRISMA_ERROR_CODE[error.code];
      const errorDetails = this.generateDuplicateErrorDetails(
        currentErrorMessage,
        error.meta,
      );
      throw new HttpException(errorDetails, status);
    } else if (error instanceof HttpException) {
      throw error;
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }

  private generateDuplicateErrorDetails(info, meta) {
    return {
      error: info,
      details: {
        message: `A duplicate value was found for the following fileds: ${meta.target.join(', ')}`,
        models: meta.modelName,
      },
    };
  }
}
