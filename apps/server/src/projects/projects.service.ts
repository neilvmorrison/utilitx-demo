import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { projects } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsRepository } from '../database/projects.repository';

type CreateProjectInput = { name: string; ownerId: string; organizationId: string };

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly repo: ProjectsRepository,
  ) {}

  async findAll(organizationId?: string) {
    if (organizationId) {
      return this.db
        .select()
        .from(projects)
        .where(
          and(
            isNull(projects.deletedAt),
            eq(projects.organizationId, organizationId),
          ),
        );
    }
    return this.repo.findAll();
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(dto: CreateProjectInput) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateProjectDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }
}
