import {
  Injectable
} from '@nestjs/common';
import {
  CreateGameDto
} from './dto/create-game.dto';
import {
  UpdateGameDto
} from './dto/update-game.dto';
import {
  GameDocument
} from './schema/game.schema';
import * as mongoose from 'mongoose';
import {
  GameRepository
} from './game.repository';
import {
  GameResponseDto
} from './dto/game-response.dto';

@Injectable()
export class GameService {
  private stoppedStatus = ['won', 'lost', 'pause']
  private visibleBoard: boolean[][] = [];
  private hideBoard: number[][] = [];

  constructor(private readonly gameRepository: GameRepository) {}

  async create(createGameDto: CreateGameDto): Promise < GameResponseDto > {
    if (createGameDto.minesQuantity &&
      createGameDto.minesQuantity > (createGameDto.rowsQuantity * createGameDto.columnsQuantity) - 1) {
      throw new Error('Mines quantity cannot be equal or greater than cell numbers');
    }
    if (!createGameDto.minesQuantity) {
      createGameDto.minesQuantity = this.calculateMines(createGameDto.rowsQuantity, createGameDto.columnsQuantity);
    }
    createGameDto.hideBoard = this.generateHideBoard(createGameDto.rowsQuantity, createGameDto.rowsQuantity,
      createGameDto.minesQuantity);
    createGameDto.visibleBoard = this.generateVisibleBoard(createGameDto.rowsQuantity, createGameDto.rowsQuantity);
    createGameDto.status = 'running'
    const createdGame = await this.gameRepository.create(createGameDto);
    return this.getGameResponse(createdGame);
  }

  async revealCell(id: string, row: number, col: number): Promise < GameResponseDto > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    let game: GameDocument = await this.gameRepository.findOne(id);
    if (!game) throw new Error('Game not found!.')
    if (this.stoppedStatus.includes(game.status)) {
      throw new Error('You cannot play a game in ' + game.status + ' status.')
    }
    if (row > (game.rowsQuantity - 1)) {
      throw new Error('Max. value for row in this game is ' + (game.rowsQuantity - 1).toString())
    }
    if (col > (game.columnsQuantity - 1)) {
      throw new Error('Max. value for col in this game is ' + (game.columnsQuantity - 1).toString())
    }
    this.visibleBoard = game.visibleBoard;
    this.hideBoard = game.hideBoard;
    this.recursiveRevealCell(row, col)

    let gameResult: number = this.checkBoards(row, col)
    if (gameResult == -1) {
      game.status = 'lost';
    } else if (gameResult == ((game.rowsQuantity * game.columnsQuantity) -
        this.calculateMines(game.rowsQuantity, game.columnsQuantity))) {
      game.status = 'won';
    }
    const updatedGame = await this.gameRepository.update(game._id, game);
    return this.getGameResponse(updatedGame);
  }

  async flagCell(id: string, row: number, col: number): Promise<GameResponseDto> {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    let game: GameDocument = await this.gameRepository.findOne(id);
    if (!game) throw new Error('Game not found!.')
    if (this.stoppedStatus.includes(game.status)) {
      throw new Error('You cannot play a game in ' + game.status + ' status.')
    }
    if (row > (game.rowsQuantity - 1))
      throw new Error('Max. value for row in this game is ' + (game.rowsQuantity - 1).toString())

    if (col > (game.columnsQuantity - 1))
      throw new Error('Max. value for col in this game is ' + (game.columnsQuantity - 1).toString())
    const cell = {
      row: row,
      col: col
    };
    let includeFlaggedCell: boolean = false;
    for (const flagedCell of game.flaggedCell) {
      if (flagedCell.row == cell.row && flagedCell.col == cell.col) {
        includeFlaggedCell = true;
      }
    }
    if (includeFlaggedCell) {
      game.flaggedCell.forEach((x, index) => {
        if(x.row == cell.row && x.col == cell.col) {
          game.flaggedCell.splice(index, 1);
        }
      })
    } else {
      game.flaggedCell.push(cell);
    }
    const updatedGame = await this.gameRepository.update(id, game);
    return this.getGameResponse(updatedGame);
  }

  async findAll(): Promise < GameResponseDto[] > {
    const findGames = await this.gameRepository.findAll();
    const games = findGames.map((game) => {
      return this.getGameResponse(game);
    });
    return games
  }

  async findOne(id: string): Promise < GameResponseDto > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    const game = await this.gameRepository.findOne(id);
    if (!game) {
      throw new Error('Game not found!')
    }
    return this.getGameResponse(game);
  }

  async update(id: string, updateGame: UpdateGameDto | GameDocument): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    return this.gameRepository.update(id, updateGame);
  }

  async remove(id: string) {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    return this.gameRepository.remove(id);
  }

  generateHideBoard(rows: number, columns: number, minesQuantity: number): number[][] {
    let hideBoard: number[][] = [];
    for (let i = 0; i < rows; i++) {
      hideBoard[i] = [];
      for (let j = 0; j < columns; j++) {
        hideBoard[i][j] = 0;
      }
    }
    return this.addMines(hideBoard, minesQuantity);
  }

  generateVisibleBoard(rows: number, columns: number): boolean[][] {
    let visibleBoard: boolean[][] = [];
    for (let i = 0; i < rows; i++) {
      visibleBoard[i] = [];
      for (let j = 0; j < columns; j++) {
        visibleBoard[i][j] = false;
      }
    }
    return visibleBoard;
  }

  addMines(hideBoard: number[][], minesQuantity: number): number[][] {
    let addedMines: number = 0;
    while (addedMines < minesQuantity) {
      var row = Math.floor(Math.random() * hideBoard.length);
      var col = Math.floor(Math.random() * hideBoard[0].length);
      if (hideBoard[row][col] != 9) {
        hideBoard[row][col] = 9;
        for (let i = Math.max(0, row - 1); i <= Math.min(hideBoard.length - 1, row + 1); i++) {
          for (let j = Math.max(0, col - 1); j <= Math.min(hideBoard[0].length - 1, col + 1); j++) {
            if (hideBoard[i][j] != 9) {
              hideBoard[i][j] = hideBoard[i][j] + 1
            }
          }
        }
        addedMines++;
      }
    }
    return hideBoard;
  }

  calculateMines(x: number, y: number): number {
    return Math.trunc((x * y) / 10);
  }

  recursiveRevealCell(row: number, col: number) {
    if (this.visibleBoard[row][col] == false) {
      this.visibleBoard[row][col] = true;
      if (this.hideBoard[row][col] == 0) {
        for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, this.hideBoard.length - 1); i++) {
          for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, this.hideBoard[0].length - 1); j++) {
            if (this.hideBoard[i][j] != 9) {
              this.recursiveRevealCell(i, j);
            }
          }
        }
      }
    }
  }

  countRevealedCells(): number {
    let countVisibleCell = 0;
    for (let i = 0; i < this.visibleBoard.length; i++) {
      for (let j = 0; j < this.visibleBoard[0].length; j++) {
        if (this.visibleBoard[i][j] == true) {
          countVisibleCell++;
        }
      }
    }
    return countVisibleCell;
  }

  checkBoards(row, col): number {
    if (this.hideBoard[row][col] == 9) {
      this.visibleBoard[row][col] = true
      return -1
    } else {
      return this.countRevealedCells();
    }
  }

  getDisplayedBoard(hideBoard: number[][], visibleBoard: boolean[][], flaggedCell: {
    row: number,
    col: number
  } []): string[][] {
    let displayedBoard: string[][] = [];
    for (let i = 0; i < visibleBoard.length; i++) {
      displayedBoard[i] = []
      for (let j = 0; j < visibleBoard[0].length; j++) {
        if (visibleBoard[i][j] == false) {
          displayedBoard[i][j] = "#";
        } else if (hideBoard[i][j] == 9) {
          displayedBoard[i][j] = "*";
        } else {
          displayedBoard[i][j] = hideBoard[i][j].toString();
        }
      }
    }
    if (flaggedCell) {
      flaggedCell.forEach(cell => {
        displayedBoard[cell.row][cell.col] = '?'
      });
    }
    return displayedBoard;
  }

  getGameResponse(gameDocument: GameDocument) {
    const gameResponse: GameResponseDto = new GameResponseDto();
    gameResponse.gameId = gameDocument._id;
    gameResponse.creationDate = gameDocument.creationDate;
    gameResponse.status = gameDocument.status
    gameResponse.minesQuantity = gameDocument.minesQuantity;
    gameResponse.board = this.getDisplayedBoard(gameDocument.hideBoard, gameDocument.visibleBoard,
      gameDocument.flaggedCell).map(String);
    gameResponse.username = gameDocument.username;
    return gameResponse;
  }
}