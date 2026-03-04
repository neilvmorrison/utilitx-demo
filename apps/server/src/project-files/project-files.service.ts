import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { S3Service } from '../s3';
import { ProjectFilesRepository } from '../database/project-files.repository';
import { PresignUploadDto } from './dto/presign-upload.dto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@Injectable()
export class ProjectFilesService {
  constructor(
    private readonly s3: S3Service,
    private readonly repo: ProjectFilesRepository,
  ) {}

  async presignUpload(
    projectId: string,
    uploadedById: string,
    dto: PresignUploadDto,
  ) {
    if (!ALLOWED_MIME_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException(`Unsupported file type: ${dto.mimeType}`);
    }
    if (dto.fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File exceeds max size of ${MAX_FILE_SIZE} bytes`,
      );
    }

    const ext = dto.fileName.split('.').pop() ?? '';
    const s3Key = `projects/${projectId}/${randomUUID()}.${ext}`;

    const uploadUrl = await this.s3.getPresignedUploadUrl(
      s3Key,
      dto.mimeType,
    );

    const file = await this.repo.create({
      projectId,
      uploadedById,
      fileName: dto.fileName,
      s3Key,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    });

    return { uploadUrl, file };
  }

  async listFiles(projectId: string) {
    return this.repo.findByProject(projectId);
  }

  async presignDownload(fileId: string) {
    const file = await this.repo.findOne(fileId);
    const downloadUrl = await this.s3.getPresignedDownloadUrl(file.s3Key);
    return { downloadUrl, file };
  }

  async remove(fileId: string) {
    return this.repo.remove(fileId);
  }
}
