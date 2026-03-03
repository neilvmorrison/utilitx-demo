import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LayersService } from './layers.service';
import { CreateLayerDto } from './dto/create-layer.dto';
import { UpdateLayerDto } from './dto/update-layer.dto';

@ApiTags('layers')
@Controller('layers')
export class LayersController {
  constructor(private readonly service: LayersService) {}

  @Get()
  @ApiOperation({ summary: 'List layers, optionally filtered by project' })
  @ApiQuery({ name: 'projectId', required: false, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of layers' })
  findAll(@Query('projectId') projectId?: string) {
    return this.service.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single layer by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Layer record' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a layer' })
  @ApiResponse({ status: 201, description: 'Created layer' })
  create(@Body() dto: CreateLayerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a layer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Updated layer' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdateLayerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a layer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Deleted layer' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
