import { ApiProperty } from '@nestjs/swagger';

export class PointZDto {
  @ApiProperty({ description: 'Longitude (WGS-84)', example: -79.3832 })
  lng: number;

  @ApiProperty({ description: 'Latitude (WGS-84)', example: 43.6532 })
  lat: number;

  @ApiProperty({ description: 'Elevation in meters', example: 85.4 })
  z: number;
}

export class CreatePathNodeDto {
  @ApiProperty({ example: 'Node A' })
  name: string;

  @ApiProperty({ description: '0-based position index within the path', example: 0 })
  position: number;

  @ApiProperty({ description: 'Path this node belongs to', format: 'uuid' })
  pathId: string;

  @ApiProperty({ type: PointZDto })
  point: PointZDto;
}
