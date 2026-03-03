import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { pathNodes } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreatePathNodeDto } from './dto/create-path-node.dto';
import { UpdatePathNodeDto } from './dto/update-path-node.dto';
import { BatchUpdateNodeDto } from './dto/batch-update-path-nodes.dto';
import { PathNodesRepository } from '../database/path-nodes.repository';

@Injectable()
export class PathNodesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly repo: PathNodesRepository,
  ) {}

  async findAll(pathId?: string) {
    if (pathId) {
      return this.db
        .select()
        .from(pathNodes)
        .where(
          and(isNull(pathNodes.deletedAt), eq(pathNodes.pathId, pathId)),
        );
    }
    return this.repo.findAll();
  }

  async findByPathIds(pathIds: string[]) {
    if (pathIds.length === 0) return [];
    return this.db
      .select()
      .from(pathNodes)
      .where(
        and(isNull(pathNodes.deletedAt), inArray(pathNodes.pathId, pathIds)),
      );
  }

  async batchCreate(nodes: CreatePathNodeDto[]) {
    return this.db.insert(pathNodes).values(nodes).returning();
  }

  async batchUpdate(nodes: BatchUpdateNodeDto[]) {
    return Promise.all(
      nodes.map((n) =>
        this.db
          .update(pathNodes)
          .set({ point: n.point, updatedAt: new Date() })
          .where(eq(pathNodes.id, n.id))
          .returning()
          .then(([row]) => row),
      ),
    );
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(dto: CreatePathNodeDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdatePathNodeDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }
}
