import { Inject, Injectable } from '@nestjs/common';
import { projects } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { UpdateProjectDto } from '../projects/dto/update-project.dto';
import { BaseRepository } from './base.repository';

export type CreateProjectInput = { name: string; ownerId: string; organizationId: string };

@Injectable()
export class ProjectsRepository extends BaseRepository<
  typeof projects,
  typeof projects.$inferSelect,
  CreateProjectInput,
  UpdateProjectDto
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, projects, 'Project');
  }
}
