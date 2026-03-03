import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Authentication } from '@nestjs-cognito/auth';
import { ProjectsService } from './projects.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

// TODO: replace with real auth-derived lookup once Cognito→profile mapping is wired up
const DEMO_USER_ID = '9879244e-06dc-4140-917d-616f6572ab67';

@ApiTags('projects')
@Controller('projects')
@Authentication()
export class ProjectsController {
  constructor(
    private readonly service: ProjectsService,
    private readonly userProfilesService: UserProfilesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List projects, optionally filtered by organization' })
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
  @ApiResponse({ status: 403, description: 'No user profile found' })
  async create(@Body() dto: CreateProjectDto) {
    const profile = await this.userProfilesService.findOne(DEMO_USER_ID);
    if (!profile) {
      throw new ForbiddenException('No user profile found');
    }
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
