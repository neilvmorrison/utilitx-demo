import { Module } from '@nestjs/common';
import { PathNodesController } from './path-nodes.controller';
import { PathNodesService } from './path-nodes.service';

@Module({
  controllers: [PathNodesController],
  providers: [PathNodesService],
})
export class PathNodesModule {}
