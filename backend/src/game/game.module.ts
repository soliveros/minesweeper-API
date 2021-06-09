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
import {
  GameRepository
} from './game.repository';

@Module({
  controllers: [GameController],
  providers: [GameService, GameRepository],
  imports: [
    MongooseModule.forFeature([{
      name: Game.name,
      schema: GameSchema
    }])
  ]
})
export class GameModule {}