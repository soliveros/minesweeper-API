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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [
        dbConfig,
      ],
    }),
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
  providers: [],
})
export class AppModule {}