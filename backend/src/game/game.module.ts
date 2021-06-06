import {
  Module
} from '@nestjs/common';
import {
  GameService
} from './game.service';
import {
  GameController
} from './game.controller';
import {
  MongooseModule
} from '@nestjs/mongoose';
import {
  Game,
  GameSchema
} from './schema/game.schema';

@Module({
  controllers: [GameController],
  providers: [GameService],
  imports: [
    MongooseModule.forFeature([{
      name: Game.name,
      schema: GameSchema
    }])
  ]
})
export class GameModule {}