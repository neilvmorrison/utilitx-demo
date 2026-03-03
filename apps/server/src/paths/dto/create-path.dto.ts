import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePathDto {
  @ApiProperty({ example: 'Main trunk line' })
  name: string;

  @ApiProperty({ description: 'Layer this path belongs to', format: 'uuid' })
  layerId: string;

  @ApiPropertyOptional({ description: 'Hex color code', example: '#FF5733', default: '#000000' })
  color?: string;

  @ApiPropertyOptional({ description: 'Stroke width in pixels', example: 2, default: 2 })
  width?: number;

  @ApiPropertyOptional({ description: 'Whether the path forms a closed polygon', default: false })
  isClosed?: boolean;

  @ApiPropertyOptional({ description: 'Whether the path is hidden on the map', default: false })
  isHidden?: boolean;
}
