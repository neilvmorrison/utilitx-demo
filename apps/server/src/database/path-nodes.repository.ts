import { Inject, Injectable } from '@nestjs/common';
import { pathNodes } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { CreatePathNodeDto } from '../path-nodes/dto/create-path-node.dto';
import { UpdatePathNodeDto } from '../path-nodes/dto/update-path-node.dto';
import { BaseRepository } from './base.repository';

@Injectable()
export class PathNodesRepository extends BaseRepository<
  typeof pathNodes,
  typeof pathNodes.$inferSelect,
  CreatePathNodeDto,
  UpdatePathNodeDto
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, pathNodes, 'Path node');
  }
}
