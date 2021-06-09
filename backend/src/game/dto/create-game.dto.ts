import {
    ApiProperty
} from '@nestjs/swagger';
import {
    Max,
    Min,
    IsString,
    IsNotEmpty
} from 'class-validator';

export class CreateGameDto {
    @ApiProperty({
        example: 10,
        description: 'Number of rows for Minesweeper board. (Min: 5 - Max: 50)'
    })
    @IsNotEmpty()
    @Max(50)
    @Min(5)
    rowsQuantity: number;

    @ApiProperty({
        example: 10,
        description: 'Number of columns for Minesweeper board. (Min: 5 - Max: 50)'
    })
    @IsNotEmpty()
    @Max(50)
    @Min(5)
    columnsQuantity: number;

    @ApiProperty({
        example: 'soliveros',
        description: 'Username for player.'
    })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({
        example: 10,
        description: 'Number of mines (Optional parameter). If it is not provided, it will be auto-generated.'
    })
    minesQuantity: number;
    status: string;
    hideBoard: number[][];
    visibleBoard: boolean[][];
}