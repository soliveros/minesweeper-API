import { Test, TestingModule } from '@nestjs/testing';
import { CreateGameDto } from './dto/create-game.dto';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
    let createGameDto: CreateGameDto = new CreateGameDto();
    createGameDto.rowsQuantity = 3;
    createGameDto.columnsQuantity = 3;
    service.create(createGameDto);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
