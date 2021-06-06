import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
    @ApiProperty({ example: 10, description: 'Number of rows for Minesweeper board.' })
    rowsQuantity: number;

    @ApiProperty({ example: 10, description: 'Number of columns for Minesweeper board.' })
    columnsQuantity: number;

    @ApiProperty({ example: 'soliveros', description: 'Username for player.' })
    username: string;
    
    status: string;
    hideBoard: number[][];
    visibleBoard: boolean[][];    
}
