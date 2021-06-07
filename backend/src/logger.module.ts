import {
    Module
}
from '@nestjs/common';
import {
    utilities as nestWinstonModuleUtilities,
    WinstonModule
} from 'nest-winston';
import * as winston from 'winston';

@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        nestWinstonModuleUtilities.format.nestLike(),
                    ),
                }),
                new winston.transports.File({
                    level: 'info',
                    filename: 'log/backend-info.log',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    ),
                    maxsize: 10000000,
                    maxFiles: 10
                }),
                new winston.transports.File({
                    level: 'error',
                    filename: 'log/backend-error.log',
                    format: winston.format.combine(
                        winston.format.timestamp(), 
                        winston.format.json()
                    ),
                    maxsize: 10000000,
                    maxFiles: 10
                }),
            ],
        })
    ]
}) export class LoggerModule {}