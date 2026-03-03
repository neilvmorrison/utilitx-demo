import { ApiProperty } from '@nestjs/swagger';
import { PointZDto } from './create-path-node.dto';

export class BatchUpdateNodeDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: PointZDto })
  point: PointZDto;
}

export class BatchUpdatePathNodesDto {
  @ApiProperty({ type: [BatchUpdateNodeDto] })
  nodes: BatchUpdateNodeDto[];
}
