import { Injectable } from '@nestjs/common';
import type {
  Project as PrismaProject,
  ProjectStatus as PrismaProjectStatus,
  Prisma,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectStatus } from './dto/project-status.enum.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { Project } from './entities/project.entity.js';
import { ProjectsRepositoryPort } from './ports/projects-repository.port.js';
import {
  ProjectListQueryDto,
} from './dto/project-list-query.dto.js';
import type { ProjectListResult } from './ports/projects-repository.port.js';

@Injectable()
export class PrismaProjectRepository implements ProjectsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = await this.prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          status: dto.status as PrismaProjectStatus,
        },
      });

      await tx.projectMembership.create({
        data: {
          role: 'owner',
          project: { connect: { id: createdProject.id } },
          user: { connect: { externalId: dto.ownerId } },
        },
      });

      return createdProject;
    });
    return this.toDomain(project);
  }

  async findAll(query: ProjectListQueryDto): Promise<ProjectListResult> {
    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status as PrismaProjectStatus } : {}),
      ...(query.assigneeId
        ? { memberships: { some: { user: { externalId: query.assigneeId } } } }
        : {}),
    };
    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
      { [query.sort]: query.order },
      { id: query.order },
    ];
    const skip = (query.page - 1) * query.size;

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({ where, orderBy, skip, take: query.size }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects: projects.map((project) => this.toDomain(project)),
      total,
    };
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
