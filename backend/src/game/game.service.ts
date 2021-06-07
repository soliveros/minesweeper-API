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
  constructor(@InjectModel(Game.name) private gameModel: Model < GameDocument > ) {}

  async create(createGameDto: CreateGameDto): Promise < any > {
    createGameDto.hideBoard = this.generateHideBoard(createGameDto.rowsQuantity, createGameDto.rowsQuantity);
    createGameDto.visibleBoard = this.generateVisibleBoard(createGameDto.rowsQuantity, createGameDto.rowsQuantity);
    createGameDto.status = 'running'
    const createdGame = new this.gameModel(createGameDto);
    await createdGame.save();
    return {
      gameId: createdGame._id,
      creationDate: createdGame.creationDate,
      status: createdGame.status,
      board: this.getDisplayedBoard(createdGame.hideBoard, createdGame.visibleBoard).map(String),
      username: createdGame.username,
      //hideBoard: createdGame.hideBoard.map(String),
      //visibleBoard: createdGame.visibleBoard.map(String)
    };
  }

  async revealCell(id: string, row: number, col: number): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!')
    let game: GameDocument = await this.gameModel.findOne({
      _id: id
    }).exec();
    const boards = this.recursiveRevealCell(game.hideBoard, game.visibleBoard, row, col)
    game.hideBoard = boards.hideBoard;
    game.visibleBoard = boards.visibleBoard;

    let gameResult: number = this.checkBoards(game.hideBoard, game.visibleBoard, row, col)
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
      board: this.getDisplayedBoard(updatedGame.hideBoard, updatedGame.visibleBoard).map(String),
      //hideBoard: updatedGame.hideBoard.map(String),
      //visibleBoard: updatedGame.visibleBoard.map(String)
    };
  }

  async flagCell(id: string, row: number, col: number) {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!')
    let game: GameDocument = await this.gameModel.findOne({
      _id: id
    }).exec();
    if (!game) return 'Game not found!'
    const cell = {
      row: row,
      col: col
    };
    
    let includeFlaggedCell: boolean = false;
    for (const flagedCell of game.flaggedCell) {
      if(flagedCell.row == cell.row && flagedCell.col == cell.col) {
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
        board: this.getDisplayedBoard(game.hideBoard, game.visibleBoard).map(String)
      }
    });
    return games
  }

  async findOne(id: string): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!')
    const game = await this.gameModel.findOne({
      _id: id
    }).exec();
    if (game) {
      return {
        gameId: game._id,
        creationDate: game.creationDate,
        board: this.getDisplayedBoard(game.hideBoard, game.visibleBoard).map(String)
      }
    } else {
      let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
      if (!idValid) throw new Error('Game not found!')
    }
  }

  async update(id: string, updateGame: UpdateGameDto | GameDocument): Promise < any > {
    let idValid: boolean = mongoose.Types.ObjectId.isValid(id);
    if (!idValid) throw new Error('Game not found!')
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
    if (!idValid) throw new Error('Game not found!')
    return this.gameModel.remove({
      _id: id
    }).exec();

  }

  generateHideBoard(rows: number, columns: number): number[][] {
    let hideBoard: number[][] = [];
    for (let i = 0; i < rows; i++) {
      hideBoard[i] = [];
      for (let j = 0; j < columns; j++) {
        hideBoard[i][j] = 0;
      }
    }
    return this.addMines(hideBoard);
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

  addMines(hideBoard: number[][]): number[][] {
    let addedMines: number = 0;
    let totalMines: number = this.calculateMines(hideBoard.length, hideBoard[0].length);
    while (addedMines < totalMines) {
      var row = Math.floor(Math.random() * hideBoard.length);
      var col = Math.floor(Math.random() * hideBoard[0].length);
      if (hideBoard[row][col] != 9) {
        hideBoard[row][col] = 9;
        for (let i = this.max(0, row - 1); i <= this.min(hideBoard.length - 1, row + 1); i++) {
          for (let j = this.max(0, col - 1); j <= this.min(hideBoard[0].length - 1, col + 1); j++) {
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

  recursiveRevealCell(hideBoard: number[][], visibleBoard: boolean[][], row: number, col: number) {
    if (visibleBoard[row][col] == false) {
      visibleBoard[row][col] = true;
      if (hideBoard[row][col] == 0) {
        for (let i = this.max(0, row - 1); i <= this.min(hideBoard.length - 1, row + 1); i++) {
          for (let j = this.max(0, col - 1); j <= this.min(hideBoard[0].length - 1, col + 1); j++) {
            if (hideBoard[i][j] != 9) {
              this.recursiveRevealCell(hideBoard, visibleBoard, i, j);
            }
          }
        }
      }
    }
    return {
      hideBoard: hideBoard,
      visibleBoard: visibleBoard
    }
  }

  countRevealedCells(visibleBoard: boolean[][]): number {
    let countVisibleCell = 0;
    for (let i = 0; i < visibleBoard.length; i++) {
      for (let j = 0; j < visibleBoard[0].length; j++) {
        if (visibleBoard[i][j] == true) {
          countVisibleCell++;
        }
      }
    }
    return countVisibleCell;
  }

  checkBoards(hideBoard: number[][], visibleBoard: boolean[][], row, col): number {
    if (hideBoard[row][col] == 9) {
      visibleBoard[row][col] = true
      return -1
    } else {
      this.recursiveRevealCell(hideBoard, visibleBoard, row, col);
      return this.countRevealedCells(visibleBoard);
    }
  }

  getDisplayedBoard(hideBoard: number[][], visibleBoard: boolean[][], flaggedCell ? : {
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

  max(num1: number, num2: number): number {
    if (num1 > num2) return num1;
    if (num2 > num1) return num2;
    if (num1 == num2) return num1;
  }

  min(num1: number, num2: number): number {
    if (num1 < num2) return num1;
    if (num2 < num1) return num2;
    if (num1 == num2) return num1;
  }



}