import { ApiPropertyOptional } from '@nestjs/swagger';
import { PointZDto } from './create-path-node.dto';

export class UpdatePathNodeDto {
  @ApiPropertyOptional({ example: 'Node A' })
  name?: string;

  @ApiPropertyOptional({ description: '0-based position index within the path', example: 1 })
  position?: number;

  @ApiPropertyOptional({ type: PointZDto })
  point?: PointZDto;
}
