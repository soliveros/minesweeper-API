export class GameResponseDto {
    gameId: string;
    creationDate: Date;
    status: string;
    minesQuantity: number;
    board: string[];
    username: string;
}