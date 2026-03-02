import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Downtown Pipeline Survey' })
  name: string;

  @ApiProperty({ description: 'User profile UUID of the project owner', format: 'uuid' })
  ownerId: string;

  @ApiProperty({ description: 'Organization this project belongs to', format: 'uuid' })
  organizationId: string;
}
