import {
    Injectable
} from "@nestjs/common";
import {
    InjectModel
} from "@nestjs/mongoose";
import {
    Model
} from "mongoose";
import {
    CreateGameDto
} from "./dto/create-game.dto";
import {
    UpdateGameDto
} from "./dto/update-game.dto";
import {
    GameModule
} from "./game.module";
import {
    Game,
    GameDocument
} from "./schema/game.schema";

@Injectable()

export class GameRepository {

    constructor(@InjectModel(Game.name) private gameModel: Model < GameDocument > ) {}

    async create(createGameDto: CreateGameDto): Promise < GameDocument > {
        const createdGame = new this.gameModel(createGameDto);
        return createdGame.save();
    }

    async findOne(id: string): Promise < GameDocument > {
        return this.gameModel.findOne({
            _id: id
        }).exec();
    }

    async findAll(): Promise < GameDocument[] > {
        return this.gameModel.find().exec();
    }


    async update(id: string, updateGameDto: UpdateGameDto): Promise < GameDocument > {
        return this.gameModel.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    status: updateGameDto.status,
                    hideBoard: updateGameDto.hideBoard,
                    visibleBoard: updateGameDto.visibleBoard,
                    flaggedCell: updateGameDto.flaggedCell
                }
            }, {
                new: true
            })
            .exec();
    }

    async remove(id: string): Promise < GameDocument > {
        return this.gameModel.remove({
            _id: id
        }).exec();
    }
}