import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authentication } from '@nestjs-cognito/auth';
import { userProfiles } from '@utilitix/db';
import { ProjectFilesService } from './project-files.service';
import { EnsureProfileGuard } from '../auth/guards/ensure-profile.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { PresignUploadDto } from './dto/presign-upload.dto';

type UserProfile = typeof userProfiles.$inferSelect;

@ApiTags('project-files')
@UseGuards(EnsureProfileGuard)
@Authentication()
@Controller('projects/:projectId/files')
export class ProjectFilesController {
  constructor(private readonly service: ProjectFilesService) {}

  @Post('presign-upload')
  @ApiOperation({ summary: 'Get a presigned S3 upload URL for a project file' })
  @ApiParam({ name: 'projectId', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Presigned upload URL and file record' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  presignUpload(
    @Param('projectId') projectId: string,
    @Body() dto: PresignUploadDto,
    @CurrentProfile() profile: UserProfile,
  ) {
    return this.service.presignUpload(projectId, profile.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all files for a project' })
  @ApiParam({ name: 'projectId', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of project file records' })
  listFiles(@Param('projectId') projectId: string) {
    return this.service.listFiles(projectId);
  }

  @Get(':fileId/presign-download')
  @ApiOperation({ summary: 'Get a presigned S3 download URL for a file' })
  @ApiParam({ name: 'projectId', format: 'uuid' })
  @ApiParam({ name: 'fileId', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Presigned download URL and file record' })
  @ApiResponse({ status: 404, description: 'File not found' })
  presignDownload(@Param('fileId') fileId: string) {
    return this.service.presignDownload(fileId);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Soft-delete a project file record' })
  @ApiParam({ name: 'projectId', format: 'uuid' })
  @ApiParam({ name: 'fileId', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Deleted file record' })
  @ApiResponse({ status: 404, description: 'File not found' })
  remove(@Param('fileId') fileId: string) {
    return this.service.remove(fileId);
  }
}
