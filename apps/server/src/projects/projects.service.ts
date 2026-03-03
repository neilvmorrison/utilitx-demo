import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { projects } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { UpdateProjectDto } from './dto/update-project.dto';

type CreateProjectInput = { name: string; ownerId: string; organizationId: string };

@Injectable()
export class ProjectsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(organizationId?: string) {
    if (organizationId) {
      return this.db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, organizationId));
    }
    return this.db
      .select()
      .from(projects)
      .where(isNull(projects.deletedAt));
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    if (!row) throw new NotFoundException(`Project ${id} not found`);
    return row;
  }

  async create(dto: CreateProjectInput) {
    const [row] = await this.db
      .insert(projects)
      .values(dto)
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const [row] = await this.db
      .update(projects)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Project ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Project ${id} not found`);
    return row;
  }
}
