import { IsNotEmpty, IsNumberString, IsString, Max, Min } from 'class-validator';

export class RevealCellParams {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumberString()
  @IsNotEmpty()
  @Max(50)
  @Min(5)
  row: number;

  @IsNumberString()
  @IsNotEmpty()
  @Max(50)
  @Min(5)
  col: number;
}
