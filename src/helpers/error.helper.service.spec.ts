import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { ErrorHandlerService } from './error.helper.service';

import { PRISMA_ERROR_CODE } from '../prisma/prisma-error-code';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorHandlerService],
    }).compile();

    service = module.get<ErrorHandlerService>(ErrorHandlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should throw custom HttpException for PrismaClientKnownRequestError', () => {
      const meta = { target: ['email'], modelName: 'User' };
      const mockError = new PrismaClientKnownRequestError('Error message', {
        code: 'P2002',
        meta,
        clientVersion: '4.0.0',
      });
      const { error: info, status, messagePrefix } = PRISMA_ERROR_CODE['P2002'];

      try {
        service.handle(mockError);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(status);
        expect(error.getResponse()).toEqual({
          error: info,
          details: {
            message: `${messagePrefix}: ${meta.target}`,
            model: meta.modelName,
          },
        });
      }
    });

    it('should rethrow the given HttpException', () => {
      const mockHttpException = new HttpException('Custom error', 403);

      try {
        service.handle(mockHttpException);
      } catch (error) {
        expect(error).toBe(mockHttpException);
      }
    });
  });
});
