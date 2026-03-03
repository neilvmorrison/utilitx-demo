import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { ProjectsRepository } from '../database/projects.repository';

@Module({
  imports: [UserProfilesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
