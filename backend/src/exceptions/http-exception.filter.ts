import {
  Inject,
  ExceptionFilter,
  Catch,
  ArgumentsHost
} from '@nestjs/common';
import {
  Request,
  Response
} from 'express';
import {
  HttpCustomException
} from './http-custom.exception';
import {
  WINSTON_MODULE_PROVIDER
} from 'nest-winston';
import {
  Logger
} from 'winston';

@Catch(HttpCustomException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  catch (exception: HttpCustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse < Response > ();
    // const request = ctx.getRequest<Request>();
    // const status = exception.getStatus();
    const status = 200;
    const errorCode = exception.getErrorCode();
    const message = exception.getMessage();
    const data = exception.getData();

    this.logger.error(errorCode + ': ' + message, {data:data})

    response
      .status(status)
      .json({
        success: false,
        errorCode: errorCode,
        message: message,
        data: data
      });
  }
}