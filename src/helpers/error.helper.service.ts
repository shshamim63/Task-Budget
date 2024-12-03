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
      const { errorResponse, status } = this.generatePrismaErrorDetails(error);
      throw new HttpException(errorResponse, status);
    } else if (error instanceof HttpException) {
      throw error;
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }

  private generatePrismaErrorDetails(error) {
    const {
      error: info,
      status,
      messagePrefix,
    } = PRISMA_ERROR_CODE[error.code];
    const { meta } = error;
    const target = meta.target ? meta.target.join(', ') : meta.cause;

    return {
      errorResponse: {
        error: info,
        details: {
          message: `${messagePrefix}: ${target}`,
          models: meta.modelName,
        },
      },
      status,
    };
  }
}
