import { ApiProperty } from '@nestjs/swagger';
import { CreatePathNodeDto } from './create-path-node.dto';

export class BatchCreatePathNodesDto {
  @ApiProperty({ type: [CreatePathNodeDto] })
  nodes: CreatePathNodeDto[];
}
