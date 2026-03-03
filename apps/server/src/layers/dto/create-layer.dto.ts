import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLayerDto {
  @ApiProperty({ example: 'Water Mains' })
  name: string;

  @ApiProperty({ description: 'Project this layer belongs to', format: 'uuid' })
  projectId: string;

  @ApiPropertyOptional({ default: true })
  isVisible?: boolean;
}
