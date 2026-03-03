import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PathNodesService } from './path-nodes.service';
import { CreatePathNodeDto } from './dto/create-path-node.dto';
import { UpdatePathNodeDto } from './dto/update-path-node.dto';
import { BatchCreatePathNodesDto } from './dto/batch-create-path-nodes.dto';
import { BatchUpdatePathNodesDto } from './dto/batch-update-path-nodes.dto';

@ApiTags('path-nodes')
@Controller('path-nodes')
export class PathNodesController {
  constructor(private readonly service: PathNodesService) {}

  @Get()
  @ApiOperation({ summary: 'List path nodes, optionally filtered by path' })
  @ApiQuery({ name: 'pathId', required: false, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of path nodes ordered by position' })
  findAll(@Query('pathId') pathId?: string) {
    return this.service.findAll(pathId);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch-create multiple path nodes in one request' })
  @ApiResponse({ status: 201, description: 'Array of created path nodes' })
  batchCreate(@Body() dto: BatchCreatePathNodesDto) {
    return this.service.batchCreate(dto.nodes);
  }

  @Patch('batch')
  @ApiOperation({ summary: 'Batch-update node positions (used after drag-end)' })
  @ApiResponse({ status: 200, description: 'Array of updated path nodes' })
  batchUpdate(@Body() dto: BatchUpdatePathNodesDto) {
    return this.service.batchUpdate(dto.nodes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single path node by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Path node record' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a path node (stores a PostGIS PointZ geometry)' })
  @ApiResponse({ status: 201, description: 'Created path node' })
  create(@Body() dto: CreatePathNodeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a path node' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Updated path node' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePathNodeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a path node' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Deleted path node' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
