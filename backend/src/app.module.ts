import {
  APP_FILTER
} from '@nestjs/core';
import {
  Module
} from '@nestjs/common';
import {
  UserModule
} from './user/user.module';
import {
  GameModule
} from './game/game.module';
import {
  MongooseModule
} from '@nestjs/mongoose';
import {
  ConfigModule,
  ConfigService
} from '@nestjs/config';
import dbConfig from 'src/config/db.configuration';
import {
  HttpExceptionFilter
} from './exceptions/http-exception.filter';
import {
  LoggerModule
} from './logger.module';

@Module({
  providers: [{
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  }],
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [
        dbConfig,
      ],
    }),
    LoggerModule,
    //UserModule - Not implemented yet,
    GameModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('database.host')}/${configService.get('database.name')}`,
        useFindAndModify: false
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
})
export class AppModule {}