import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { layers } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreateLayerDto } from './dto/create-layer.dto';
import { UpdateLayerDto } from './dto/update-layer.dto';
import { LayersRepository } from '../database/layers.repository';

@Injectable()
export class LayersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly repo: LayersRepository,
  ) {}

  async findAll(projectId?: string) {
    if (projectId) {
      return this.db
        .select()
        .from(layers)
        .where(
          and(isNull(layers.deletedAt), eq(layers.projectId, projectId)),
        );
    }
    return this.repo.findAll();
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(dto: CreateLayerDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateLayerDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }
}
