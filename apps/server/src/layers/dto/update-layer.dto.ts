import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLayerDto {
  @ApiPropertyOptional({ example: 'Gas Lines' })
  name?: string;

  @ApiPropertyOptional()
  isVisible?: boolean;
}
