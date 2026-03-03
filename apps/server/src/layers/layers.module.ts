import { Module } from '@nestjs/common';
import { LayersController } from './layers.controller';
import { LayersService } from './layers.service';
import { LayersRepository } from '../database/layers.repository';

@Module({
  controllers: [LayersController],
  providers: [LayersService, LayersRepository],
})
export class LayersModule {}
