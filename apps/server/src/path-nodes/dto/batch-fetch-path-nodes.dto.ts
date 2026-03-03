import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class BatchFetchPathNodesDto {
  @ApiProperty({ type: [String], description: 'Array of path UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  pathIds: string[];
}
