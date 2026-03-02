import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { layers } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreateLayerDto } from './dto/create-layer.dto';
import { UpdateLayerDto } from './dto/update-layer.dto';

@Injectable()
export class LayersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(projectId?: string) {
    if (projectId) {
      return this.db
        .select()
        .from(layers)
        .where(eq(layers.projectId, projectId));
    }
    return this.db
      .select()
      .from(layers)
      .where(isNull(layers.deletedAt));
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(layers)
      .where(eq(layers.id, id));
    if (!row) throw new NotFoundException(`Layer ${id} not found`);
    return row;
  }

  async create(dto: CreateLayerDto) {
    const [row] = await this.db
      .insert(layers)
      .values(dto)
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateLayerDto) {
    const [row] = await this.db
      .update(layers)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(layers.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Layer ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(layers)
      .set({ deletedAt: new Date() })
      .where(eq(layers.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Layer ${id} not found`);
    return row;
  }
}
