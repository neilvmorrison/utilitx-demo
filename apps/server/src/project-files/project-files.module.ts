import { Module } from '@nestjs/common';
import { ProjectFilesController } from './project-files.controller';
import { ProjectFilesService } from './project-files.service';
import { ProjectFilesRepository } from '../database/project-files.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProjectFilesController],
  providers: [ProjectFilesService, ProjectFilesRepository],
})
export class ProjectFilesModule {}
