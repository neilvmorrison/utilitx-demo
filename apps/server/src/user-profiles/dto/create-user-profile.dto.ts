import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserProfileDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: 'Marie' })
  middleName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/jane.png' })
  avatarUrl?: string;

  @ApiProperty({ description: 'Organization this user belongs to', format: 'uuid' })
  organizationId: string;
}
