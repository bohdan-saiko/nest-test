import { Injectable } from '@nestjs/common';
import { Project } from './entities/project.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsRepositoryPort } from './ports/projects-repository.port.js';

@Injectable()
export class InMemoryProjectsRepository implements ProjectsRepositoryPort {
  private projects: Project[] = [];

  create(dto: CreateProjectDto): Project {
    const newProject: Project = {
      id: Date.now().toString(),
      name: dto.name,
      description: dto.description,
      createdAt: new Date(),
    };
    this.projects.push(newProject);
    return newProject;
  }

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: string): Project | null {
    return this.projects.find((p) => p.id === id) || null;
  }

  update(id: string, dto: UpdateProjectDto): Project | null {
    const project = this.findOne(id);
    if (!project) return null;

    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;

    return project;
  }

  remove(id: string): boolean {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    return true;
  }
}
