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

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: ProjectsRepositoryPort,
  ) {}

  create(dto: CreateProjectDto): ProjectResponseDto {
    this.ensureNameIsAvailable(dto.name);
    return this.toResponse(this.projectsRepository.create(dto));
  }

  findAll(): ProjectResponseDto[] {
    return this.projectsRepository
      .findAll()
      .map((project) => this.toResponse(project));
  }

  findOne(id: number): ProjectResponseDto {
    const project = this.projectsRepository.findOne(id);
    if (!project) throw this.projectNotFound(id);
    return this.toResponse(project);
  }

  update(id: number, dto: UpdateProjectDto): ProjectResponseDto {
    const existing = this.projectsRepository.findOne(id);
    if (!existing) throw this.projectNotFound(id);

    if (dto.name !== undefined) this.ensureNameIsAvailable(dto.name, id);
    const updated = this.projectsRepository.update(id, dto);
    if (!updated) throw this.projectNotFound(id);
    return this.toResponse(updated);
  }

  remove(id: number): void {
    const deleted = this.projectsRepository.remove(id);
    if (!deleted) throw this.projectNotFound(id);
  }

  private ensureNameIsAvailable(
    name: string,
    excludedProjectId?: number,
  ): void {
    const project = this.projectsRepository.findByName(name);
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
