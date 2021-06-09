import {
  Injectable
} from '@nestjs/common';
import {
  InjectModel
} from '@nestjs/mongoose';
import {
  Model
} from 'mongoose';
import {
  CreateGameDto
} from './dto/create-game.dto';
import {
  UpdateGameDto
} from './dto/update-game.dto';
import {
  Game,
  GameDocument
} from './schema/game.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class GameService {
  private stoppedStatus = ['won', 'lost', 'pause']
  private visibleBoard: boolean[][] = [];
  private hideBoard: number[][] = [];

  constructor(@InjectModel(Game.name) private gameModel: Model < GameDocument > ) {}

  async create(createGameDto: CreateGameDto): Promise < any > {
    if (createGameDto.minesQuantity &&
      createGameDto.minesQuantity > (createGameDto.rowsQuantity * createGameDto.columnsQuantity) - 1) {
      throw new Error('Mines quantity cannot be equal or greater than cell numbers');
    }
    if (!createGameDto.minesQuantity) {
      createGameDto.minesQuantity = this.calculateMines(createGameDto.rowsQuantity, createGameDto.columnsQuantity);
    }
    createGameDto.hideBoard = this.generateHideBoard(createGameDto.rowsQuantity, createGameDto.rowsQuantity, createGameDto.minesQuantity);
    createGameDto.visibleBoard = this.generateVisibleBoard(createGameDto.rowsQuantity, createGameDto.rowsQuantity);
    createGameDto.status = 'running'
    const createdGame = new this.gameModel(createGameDto);
    await createdGame.save();
    return {
      gameId: createdGame._id,
      creationDate: createdGame.creationDate,
      status: createdGame.status,
      minesQuantity: createdGame.minesQuantity,
      board: this.getDisplayedBoard(createdGame.hideBoard, createdGame.visibleBoard, createdGame.flaggedCell).map(String),
      username: createdGame.username,
      //hideBoard: createdGame.hideBoard.map(String),
      //visibleBoard: createdGame.visibleBoard.map(String)
    };
  }

  async revealCell(id: string, row: number, col: number): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    let game: GameDocument = await this.gameModel.findOne({
      _id: id
    }).exec();
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
    const updatedGame = await this.update(game._id, game);
    return {
      gameId: updatedGame._id,
      creationDate: updatedGame.creationDate,
      status: updatedGame.status,
      minesQuantity: updatedGame.minesQuantity,
      board: this.getDisplayedBoard(updatedGame.hideBoard, updatedGame.visibleBoard, game.flaggedCell).map(String),
      //hideBoard: updatedGame.hideBoard.map(String),
      //visibleBoard: updatedGame.visibleBoard.map(String)
    };
  }

  async flagCell(id: string, row: number, col: number) {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    let game: GameDocument = await this.gameModel.findOne({
      _id: id
    }).exec();
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
      game.flaggedCell = game.flaggedCell.filter(({
        row,
        col
      }) => (row != cell.row && col != cell.col));
    } else {
      game.flaggedCell.push(cell);
    }
    const updatedGame = await this.gameModel.findOneAndUpdate({
        _id: id
      }, {
        $set: {
          flaggedCell: game.flaggedCell,
        }
      }, {
        new: true
      })
      .exec();

    return {
      gameId: updatedGame._id,
      creationDate: updatedGame.creationDate,
      status: updatedGame.status,
      minesQuantity: updatedGame.minesQuantity,
      board: this.getDisplayedBoard(updatedGame.hideBoard, updatedGame.visibleBoard, updatedGame.flaggedCell).map(String),
      //hideBoard: updatedGame.hideBoard.map(String),
      //visibleBoard: updatedGame.visibleBoard.map(String)
    };
  }

  async findAll(): Promise < any[] > {
    const findGames = await this.gameModel.find().exec();
    const games = findGames.map((game) => {
      return {
        gameId: game._id,
        creationDate: game.creationDate,
        status: game.status,
        minesQuantity: game.minesQuantity,
        board: this.getDisplayedBoard(game.hideBoard, game.visibleBoard, game.flaggedCell).map(String)
      }
    });
    return games
  }

  async findOne(id: string): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    const game = await this.gameModel.findOne({
      _id: id
    }).exec();
    if (game) {
      return {
        gameId: game._id,
        creationDate: game.creationDate,
        status: game.status,
        minesQuantity: game.minesQuantity,
        board: this.getDisplayedBoard(game.hideBoard, game.visibleBoard, game.flaggedCell).map(String)
      }
    } else {
      let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
      if (!idValid) throw new Error('Game not found!.')
    }
  }

  async update(id: string, updateGame: UpdateGameDto | GameDocument): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    return this.gameModel.findOneAndUpdate({
        _id: id
      }, {
        $set: {
          status: updateGame.status,
          hideBoard: updateGame.hideBoard,
          visibleBoard: updateGame.visibleBoard
        }
      }, {
        new: true
      })
      .exec();
  }

  async remove(id: string) {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!.')
    return this.gameModel.remove({
      _id: id
    }).exec();

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
}