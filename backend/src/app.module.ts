import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [UserModule, GameModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
