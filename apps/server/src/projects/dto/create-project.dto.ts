import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Downtown Pipeline Survey' })
  name: string;

  @ApiPropertyOptional({ description: 'Populated server-side from the authenticated user', format: 'uuid' })
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Populated server-side from the authenticated user profile', format: 'uuid' })
  organizationId?: string;
}
