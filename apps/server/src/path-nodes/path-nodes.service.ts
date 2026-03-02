import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { pathNodes } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreatePathNodeDto } from './dto/create-path-node.dto';
import { UpdatePathNodeDto } from './dto/update-path-node.dto';

@Injectable()
export class PathNodesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(pathId?: string) {
    if (pathId) {
      return this.db
        .select()
        .from(pathNodes)
        .where(eq(pathNodes.pathId, pathId));
    }
    return this.db
      .select()
      .from(pathNodes)
      .where(isNull(pathNodes.deletedAt));
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(pathNodes)
      .where(eq(pathNodes.id, id));
    if (!row) throw new NotFoundException(`Path node ${id} not found`);
    return row;
  }

  async create(dto: CreatePathNodeDto) {
    const [row] = await this.db
      .insert(pathNodes)
      .values(dto)
      .returning();
    return row;
  }

  async update(id: string, dto: UpdatePathNodeDto) {
    const [row] = await this.db
      .update(pathNodes)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(pathNodes.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Path node ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(pathNodes)
      .set({ deletedAt: new Date() })
      .where(eq(pathNodes.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Path node ${id} not found`);
    return row;
  }
}
