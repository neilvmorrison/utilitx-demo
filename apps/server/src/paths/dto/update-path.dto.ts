import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePathDto {
  @ApiPropertyOptional({ example: 'Main trunk line' })
  name?: string;

  @ApiPropertyOptional({ description: 'Hex color code', example: '#FF5733' })
  color?: string;

  @ApiPropertyOptional({ description: 'Stroke width in pixels', example: 3 })
  width?: number;

  @ApiPropertyOptional()
  isClosed?: boolean;

  @ApiPropertyOptional()
  isHidden?: boolean;

  @ApiPropertyOptional({
    description: 'Full EWKT geometry string, e.g. SRID=4326;LINESTRINGZ(...)',
    example: 'SRID=4326;LINESTRINGZ(-79.38 43.65 85, -79.39 43.66 86)',
  })
  cachedGeometry?: string;
}
