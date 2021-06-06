import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import {
  GameService
} from './game.service';
import {
  CreateGameDto
} from './dto/create-game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/new')
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const findGame = await this.gameService.findOne(id);
    return findGame;
  }

  @Patch(':id/reveal/row/:row/col/:col')
  async revealCell(@Param('id') id: string, @Param('row') row: number, @Param('col') col: number) {
    console.log(id, row, col);
    const updatedGame = await this.gameService.revealCell(id, row, col);
    return updatedGame;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameService.remove(id);
  }
}