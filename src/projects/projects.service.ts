import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { PROJECTS_REPOSITORY } from './ports/projects-repository.port.js';
import type { ProjectsRepositoryPort } from './ports/projects-repository.port.js';
import { ProjectResponseDto } from './dto/project-response.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectListQueryDto } from './dto/project-list-query.dto.js';
import { PaginatedProjectResponseDto } from './dto/paginated-project-response.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: ProjectsRepositoryPort,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    await this.ensureNameIsAvailable(dto.name);
    return this.toResponse(await this.projectsRepository.create(dto));
  }

  async findAll(
    query: ProjectListQueryDto,
  ): Promise<PaginatedProjectResponseDto> {
    const { projects, total } = await this.projectsRepository.findAll(query);
    const totalPages = Math.ceil(total / query.size);

    return {
      data: projects.map((project) => this.toResponse(project)),
      meta: {
        page: query.page,
        size: query.size,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne(id);
    if (!project) throw this.projectNotFound(id);
    return this.toResponse(project);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const existing = await this.projectsRepository.findOne(id);
    if (!existing) throw this.projectNotFound(id);

    if (dto.name !== undefined) await this.ensureNameIsAvailable(dto.name, id);
    const updated = await this.projectsRepository.update(id, dto);
    if (!updated) throw this.projectNotFound(id);
    return this.toResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.projectsRepository.remove(id);
    if (!deleted) throw this.projectNotFound(id);
  }

  private async ensureNameIsAvailable(
    name: string,
    excludedProjectId?: number,
  ): Promise<void> {
    const project = await this.projectsRepository.findByName(name);
    if (project && project.id !== excludedProjectId) {
      throw new ConflictException({
        errorCode: 'PROJECT_NAME_CONFLICT',
        message: `Project with name ${name} already exists`,
      });
    }
  }

  private projectNotFound(id: number): NotFoundException {
    return new NotFoundException({
      errorCode: 'PROJECT_NOT_FOUND',
      message: `Project with id ${id} was not found`,
    });
  }

  private toResponse(project: Project): ProjectResponseDto {
    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }
}
