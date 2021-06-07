import { ApiProperty } from '@nestjs/swagger';
import { Max, Min, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty({ example: 10, description: 'Number of rows for Minesweeper board.' })
    @Max(50)
    @Min(5)
    rowsQuantity: number;

    @ApiProperty({ example: 10, description: 'Number of columns for Minesweeper board.' })
    @Max(50)
    @Min(5)
    columnsQuantity: number;

    @ApiProperty({ example: 'soliveros', description: 'Username for player.' })
    @IsString()
    username: string;
    
    status: string;
    hideBoard: number[][];
    visibleBoard: boolean[][];    
}
