import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { PROJECTS_REPOSITORY } from './ports/projects-repository.port.js';
import type { ProjectsRepositoryPort } from './ports/projects-repository.port.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: ProjectsRepositoryPort,
  ) {}

  create(dto: CreateProjectDto) {
    return this.projectsRepository.create(dto);
  }

  findAll() {
    return this.projectsRepository.findAll();
  }

  findOne(id: string) {
    const project = this.projectsRepository.findOne(id);
    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  update(id: string, dto: UpdateProjectDto) {
    const updated = this.projectsRepository.update(id, dto);
    if (!updated)
      throw new NotFoundException(`Project with ID ${id} not found`);
    return updated;
  }

  remove(id: string) {
    const deleted = this.projectsRepository.remove(id);
    if (!deleted)
      throw new NotFoundException(`Project with ID ${id} not found`);
    return { success: true };
  }
}
