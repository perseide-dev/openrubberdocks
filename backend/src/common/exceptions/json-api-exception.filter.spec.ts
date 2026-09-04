import { JsonApiExceptionFilter } from './json-api-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('JsonApiExceptionFilter', () => {
  let filter: JsonApiExceptionFilter;

  beforeEach(() => {
    filter = new JsonApiExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle standard HttpExceptions', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockHttpHost = {
      getResponse: mockGetResponse,
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpHost),
    } as any;

    const exception = new HttpException('Custom Error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      errors: [
        {
          status: '400',
          title: 'HttpException',
          detail: 'Custom Error',
        },
      ],
    });
  });

  it('should handle class-validator HttpExceptions (array of messages)', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockHttpHost = {
      getResponse: mockGetResponse,
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpHost),
    } as any;

    // Simulate NestJS ValidationPipe BadRequestException response
    const exceptionResponse = { message: ['age must be a number', 'name must be a string'] };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      errors: [
        {
          status: '400',
          title: 'Validation Error',
          detail: 'age must be a number',
        },
        {
          status: '400',
          title: 'Validation Error',
          detail: 'name must be a string',
        },
      ],
    });
  });

  it('should handle non-HttpExceptions as Internal Server Errors', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockHttpHost = {
      getResponse: mockGetResponse,
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpHost),
    } as any;

    const exception = new Error('Some unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      errors: [
        {
          status: '500',
          title: 'Internal Server Error',
          detail: 'An unexpected error occurred.',
        },
      ],
    });
  });
});
