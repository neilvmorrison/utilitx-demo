import { ApiProperty } from '@nestjs/swagger';

export class PresignUploadDto {
  @ApiProperty({ example: 'site-survey.pdf' })
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 2048000, description: 'File size in bytes' })
  fileSize: number;
}
