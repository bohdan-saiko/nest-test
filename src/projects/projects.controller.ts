import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';

const projectExample = {
  id: 1,
  name: 'StudyFlow',
  description: 'Система керування навчальними проєктами',
  status: 'active',
  createdAt: '2026-10-03T10:00:00.000Z',
};

const validationErrorExample = {
  statusCode: 400,
  errorCode: 'VALIDATION_FAILED',
  message: 'name must be longer than or equal to 3 characters',
  path: '/projects',
  timestamp: '2026-10-03T10:00:00.000Z',
  traceId: '550e8400-e29b-41d4-a716-446655440000',
};

@ApiTags('Projects')
@ApiInternalServerErrorResponse({
  description: 'Unexpected server error in the standard error envelope.',
  type: ApiErrorResponseDto,
  content: {
    'application/json': {
      example: {
        statusCode: 500,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        path: '/projects',
        timestamp: '2026-10-03T10:00:00.000Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  },
})
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a project',
    description: 'Creates a project after validating its name, description, and status.',
  })
  @ApiBody({
    type: CreateProjectDto,
    examples: {
      activeProject: {
        summary: 'Active study-management project',
        value: {
          name: 'StudyFlow',
          description: 'Система керування навчальними проєктами',
          status: 'active',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Project created.',
    type: ProjectResponseDto,
    content: { 'application/json': { example: projectExample } },
  })
  @ApiBadRequestResponse({
    description: 'Request body fails validation.',
    type: ApiErrorResponseDto,
    content: { 'application/json': { example: validationErrorExample } },
  })
  @ApiConflictResponse({
    description: 'A project with this name already exists.',
    type: ApiErrorResponseDto,
    content: {
      'application/json': {
        example: {
          ...validationErrorExample,
          statusCode: 409,
          errorCode: 'PROJECT_NAME_CONFLICT',
          message: 'Project with name StudyFlow already exists',
        },
      },
    },
  })
  create(@Body() dto: CreateProjectDto): ProjectResponseDto {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all projects',
    description: 'Returns every project in the public response format.',
  })
  @ApiOkResponse({
    description: 'Projects returned.',
    type: ProjectResponseDto,
    isArray: true,
    content: { 'application/json': { example: [projectExample] } },
  })
  findAll(): ProjectResponseDto[] {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by numeric ID',
    description: 'Returns one project when the numeric ID exists.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Project returned.',
    type: ProjectResponseDto,
    content: { 'application/json': { example: projectExample } },
  })
  @ApiBadRequestResponse({
    description: 'The ID is not a number.',
    type: ApiErrorResponseDto,
    content: { 'application/json': { example: validationErrorExample } },
  })
  @ApiNotFoundResponse({
    description: 'No project exists for this ID.',
    type: ApiErrorResponseDto,
    content: {
      'application/json': {
        example: {
          ...validationErrorExample,
          statusCode: 404,
          errorCode: 'PROJECT_NOT_FOUND',
          message: 'Project with id 10 was not found',
          path: '/projects/10',
        },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number): ProjectResponseDto {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project by numeric ID',
    description: 'Updates one or more project fields after validation.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({
    type: UpdateProjectDto,
    examples: {
      renameProject: { summary: 'Change only the name', value: { name: 'StudyFlow 2' } },
    },
  })
  @ApiOkResponse({
    description: 'Project updated.',
    type: ProjectResponseDto,
    content: {
      'application/json': {
        example: { ...projectExample, name: 'StudyFlow 2' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'The ID or request body is invalid.',
    type: ApiErrorResponseDto,
    content: { 'application/json': { example: validationErrorExample } },
  })
  @ApiNotFoundResponse({ description: 'No project exists for this ID.', type: ApiErrorResponseDto })
  @ApiConflictResponse({ description: 'A project with this name already exists.', type: ApiErrorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): ProjectResponseDto {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project by numeric ID',
    description: 'Permanently removes the project if its numeric ID exists.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Project deleted.' })
  @ApiBadRequestResponse({ description: 'The ID is not a number.', type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ description: 'No project exists for this ID.', type: ApiErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.projectsService.remove(id);
  }
}
