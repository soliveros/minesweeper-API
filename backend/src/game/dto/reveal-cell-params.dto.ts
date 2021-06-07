import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Max, Min } from 'class-validator';

export class RevealCellParams {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  //@Max(49)
  //@Min(0)
  row: number;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  //@Max(49)
  //@Min(0)
  col: number;
}
