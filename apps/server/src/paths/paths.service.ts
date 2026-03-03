import { Inject, Injectable } from '@nestjs/common';
import { and, eq, getTableColumns, isNull } from 'drizzle-orm';
import { layers, paths } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreatePathDto } from './dto/create-path.dto';
import { UpdatePathDto } from './dto/update-path.dto';
import { PathsRepository } from '../database/paths.repository';

@Injectable()
export class PathsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly repo: PathsRepository,
  ) {}

  async findAll(layerId?: string, projectId?: string) {
    if (projectId) {
      return this.db
        .select(getTableColumns(paths))
        .from(paths)
        .innerJoin(layers, eq(paths.layerId, layers.id))
        .where(and(eq(layers.projectId, projectId), isNull(paths.deletedAt)));
    }
    if (layerId) {
      return this.db
        .select()
        .from(paths)
        .where(and(eq(paths.layerId, layerId), isNull(paths.deletedAt)));
    }
    return this.repo.findAll();
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(dto: CreatePathDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdatePathDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }
}
