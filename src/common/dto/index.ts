import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

/**
 * 分页DTO
 */
export class PagingDto {
  @ApiProperty({ required: true, example: 1 })
  @Transform(({ value }) => (Number(value) === 0 ? 1 : Number(value)))
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  current: number

  @ApiProperty({ required: true, maximum: 50, minimum: 1, example: 10 })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(500)
  size: number
}
