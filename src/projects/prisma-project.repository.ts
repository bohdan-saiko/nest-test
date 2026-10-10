import { Injectable } from '@nestjs/common';
import {
  Project as PrismaProject,
  ProjectStatus as PrismaProjectStatus,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectStatus } from './dto/project-status.enum.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectsRepositoryPort } from './ports/projects-repository.port.js';

@Injectable()
export class PrismaProjectRepository implements ProjectsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status as PrismaProjectStatus,
      },
    });
    return this.toDomain(project);
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'asc' },
    });
    return projects.map((project) => this.toDomain(project));
  }

  async findOne(id: number): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    return project ? this.toDomain(project) : null;
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: { name, deletedAt: null },
    });
    return project ? this.toDomain(project) : null;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project | null> {
    const project = await this.prisma.project.updateManyAndReturn({
      where: { id, deletedAt: null },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.status !== undefined
          ? { status: dto.status as PrismaProjectStatus }
          : {}),
      },
    });
    return project[0] ? this.toDomain(project[0]) : null;
  }

  async remove(id: number): Promise<boolean> {
    const { count } = await this.prisma.project.deleteMany({
      where: { id, deletedAt: null },
    });
    return count === 1;
  }

  private toDomain(project: PrismaProject): Project {
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? undefined,
      status: project.status as ProjectStatus,
      createdAt: project.createdAt,
    };
  }
}
