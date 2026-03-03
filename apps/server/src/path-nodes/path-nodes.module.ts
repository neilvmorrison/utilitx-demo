import { Module } from '@nestjs/common';
import { PathNodesController } from './path-nodes.controller';
import { PathNodesService } from './path-nodes.service';
import { PathNodesRepository } from '../database/path-nodes.repository';

@Module({
  controllers: [PathNodesController],
  providers: [PathNodesService, PathNodesRepository],
})
export class PathNodesModule {}
