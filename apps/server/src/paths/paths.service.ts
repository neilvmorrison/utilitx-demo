import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, getTableColumns, isNull } from 'drizzle-orm';
import { layers, paths } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreatePathDto } from './dto/create-path.dto';
import { UpdatePathDto } from './dto/update-path.dto';

@Injectable()
export class PathsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

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
    return this.db
      .select()
      .from(paths)
      .where(isNull(paths.deletedAt));
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(paths)
      .where(and(isNull(paths.deletedAt), eq(paths.id, id)));
    if (!row) throw new NotFoundException(`Path ${id} not found`);
    return row;
  }

  async create(dto: CreatePathDto) {
    const [row] = await this.db
      .insert(paths)
      .values(dto)
      .returning();
    return row;
  }

  async update(id: string, dto: UpdatePathDto) {
    const [row] = await this.db
      .update(paths)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(paths.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Path ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(paths)
      .set({ deletedAt: new Date() })
      .where(eq(paths.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Path ${id} not found`);
    return row;
  }
}
