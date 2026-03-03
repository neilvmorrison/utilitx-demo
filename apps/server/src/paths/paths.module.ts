import { Module } from '@nestjs/common';
import { PathsController } from './paths.controller';
import { PathsService } from './paths.service';
import { PathsRepository } from '../database/paths.repository';

@Module({
  controllers: [PathsController],
  providers: [PathsService, PathsRepository],
})
export class PathsModule {}
