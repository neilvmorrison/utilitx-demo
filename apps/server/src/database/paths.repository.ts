import { Inject, Injectable } from '@nestjs/common';
import { paths } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { CreatePathDto } from '../paths/dto/create-path.dto';
import { UpdatePathDto } from '../paths/dto/update-path.dto';
import { BaseRepository } from './base.repository';

@Injectable()
export class PathsRepository extends BaseRepository<
  typeof paths,
  typeof paths.$inferSelect,
  CreatePathDto,
  UpdatePathDto
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, paths, 'Path');
  }
}
