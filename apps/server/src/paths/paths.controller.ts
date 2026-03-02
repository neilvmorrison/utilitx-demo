import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PathsService } from './paths.service';
import { CreatePathDto } from './dto/create-path.dto';
import { UpdatePathDto } from './dto/update-path.dto';

@ApiTags('paths')
@Controller('paths')
export class PathsController {
  constructor(private readonly service: PathsService) {}

  @Get()
  @ApiOperation({ summary: 'List paths, optionally filtered by layer' })
  @ApiQuery({ name: 'layerId', required: false, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of paths' })
  findAll(@Query('layerId') layerId?: string) {
    return this.service.findAll(layerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single path by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Path record' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a path' })
  @ApiResponse({ status: 201, description: 'Created path' })
  create(@Body() dto: CreatePathDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a path (also used to write cached PostGIS geometry)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Updated path' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePathDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a path' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Deleted path' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
