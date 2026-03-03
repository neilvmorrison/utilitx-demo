import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authentication } from '@nestjs-cognito/auth';
import { userProfiles } from '@utilitix/db';
import { ProjectsService } from './projects.service';
import { EnsureProfileGuard } from '../auth/guards/ensure-profile.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

type UserProfile = typeof userProfiles.$inferSelect;

@ApiTags('projects')
@UseGuards(EnsureProfileGuard)
@Authentication()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'List projects, optionally filtered by organization',
  })
  @ApiQuery({ name: 'organizationId', required: false, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Array of projects' })
  findAll(@Query('organizationId') organizationId?: string) {
    return this.service.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Project record' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiResponse({ status: 201, description: 'Created project' })
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentProfile() profile: UserProfile,
  ) {
    return this.service.create({
      ...dto,
      ownerId: profile.id,
      organizationId: profile.organizationId,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Updated project' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a project' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Deleted project' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
