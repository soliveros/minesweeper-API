import {
    HttpStatus,
    HttpException
} from '@nestjs/common';

export class HttpCustomException extends HttpException {
    errorCode: string;
    message: string
    data: any;

    constructor(errorCode, message, data) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
        this.errorCode = errorCode;
        this.message = message,
        this.data = data;
    }

    getErrorCode() {
        return this.errorCode;
    }

    getMessage() {
        return  this.message;
    }

    getData() {
        return this.data;
    }
}