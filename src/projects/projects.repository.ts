import { Injectable } from '@nestjs/common';
import { Project } from './entities/project.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsRepositoryPort } from './ports/projects-repository.port.js';

@Injectable()
export class InMemoryProjectsRepository implements ProjectsRepositoryPort {
  private projects: Project[] = [];
  private nextId = 1;

  create(dto: CreateProjectDto): Project {
    const newProject: Project = {
      id: this.nextId++,
      name: dto.name,
      description: dto.description,
      status: dto.status,
      createdAt: new Date(),
    };
    this.projects.push(newProject);
    return newProject;
  }

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: number): Project | null {
    return this.projects.find((p) => p.id === id) || null;
  }

  findByName(name: string): Project | null {
    return this.projects.find((project) => project.name === name) || null;
  }

  update(id: number, dto: UpdateProjectDto = {}): Project | null {
    const project = this.findOne(id);
    if (!project) return null;

    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;
    if (dto.status !== undefined) project.status = dto.status;

    return project;
  }

  remove(id: number): boolean {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    return true;
  }
}
