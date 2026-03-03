import { Inject, Injectable } from '@nestjs/common';
import { layers } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { CreateLayerDto } from '../layers/dto/create-layer.dto';
import { UpdateLayerDto } from '../layers/dto/update-layer.dto';
import { BaseRepository } from './base.repository';

@Injectable()
export class LayersRepository extends BaseRepository<
  typeof layers,
  typeof layers.$inferSelect,
  CreateLayerDto,
  UpdateLayerDto
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, layers, 'Layer');
  }
}
