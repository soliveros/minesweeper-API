import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UsePipes
} from '@nestjs/common';
import {
  GameService
} from './game.service';
import {
  CreateGameDto
} from './dto/create-game.dto';
import {
  HttpCustomException
} from 'src/exceptions/http-custom.exception';
import {
  ResponseInterceptor
} from 'src/interceptors/response.interceptor';
import {
  ValidationPipe
} from 'src/validators/validation.pipe';

@Controller('game')
@UseInterceptors(new ResponseInterceptor())
@UsePipes(new ValidationPipe())
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/new')
  async create(@Body() createGameDto: CreateGameDto) {
    try {
      const createdGame = await this.gameService.create(createGameDto);
      const message = "Game created successfully.";
      return {
        message: message,
        data: createdGame
      }
    } catch (e) {
      throw new HttpCustomException('GC-001', 'Error creating game. ' + e.stack, {});
    }
  }

  @Get()
  async findAll() {
    try {
      const games = await this.gameService.findAll();
      const message = "Games found successfully.";
      return {
        message: message,
        data: games
      }
    } catch (e) {
      throw new HttpCustomException('GC-002', 'Error finding games. ' + e.stack, {});
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const findGame = await this.gameService.findOne(id);
      const message = "Game found successfully.";
      return {
        message: message,
        data: findGame
      }
    } catch (e) {
      throw new HttpCustomException('GC-003', 'Error finding one game. ' + e.stack, {});
    }
  }

  @Patch(':id/reveal/row/:row/col/:col')
  async revealCell(@Param('id') id: string, @Param('row') row: number, @Param('col') col: number) {
    try {
      const updatedGame = await this.gameService.revealCell(id, row, col);
      const message = "Cell revealed successfully.";
      return {
        message: message,
        data: updatedGame
      }
    } catch (e) {
      throw new HttpCustomException('GC-004', 'Error finding one game. ' + e.stack, {});
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const removedGame = await this.gameService.remove(id);
      const message = "Game removed successfully.";
      return {
        message: message,
        data: removedGame
      }
    } catch (e) {
      throw new HttpCustomException('GC-005', 'Error finding one game. ' + e.stack, {});
    }
  }
}