import {
    Prop,
    Schema,
    SchemaFactory
} from "@nestjs/mongoose";

export type GameDocument = Game & Document;

@Schema({
    collection: 'game'
})
export class Game {
    _id: string;

    @Prop({
        required: true
    })
    username: string;

    @Prop({
        required: true
    })
    rowsQuantity: number;

    @Prop({
        required: true
    })
    columnsQuantity: number;

    @Prop({
        required: true,
        enum: ['running', 'paused', 'won', 'lost']
    })
    status: string;

    @Prop({
        required: true
    })
    hideBoard: number[][] ;

    @Prop({
        required: true
    })
    visibleBoard: boolean[][] ;

    @Prop({
        required: true,
        default: new Date()
    })
    creationDate: Date

    @Prop()
    flaggedCell: {
        row: number,
        col: number
    }[]
}

export const GameSchema = SchemaFactory.createForClass(Game);