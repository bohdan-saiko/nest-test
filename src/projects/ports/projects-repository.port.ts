import { CreateProjectDto } from '../dto/create-project.dto.js';
import { UpdateProjectDto } from '../dto/update-project.dto.js';
import { Project } from '../entities/project.entity.js';
import { ProjectListQueryDto } from '../dto/project-list-query.dto.js';

export type ProjectListResult = {
  projects: Project[];
  total: number;
};

/**
 * Injection token for the persistence boundary of the projects feature.
 *
 * A symbol is used because TypeScript interfaces do not exist at runtime.
 */
export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');

export interface ProjectsRepositoryPort {
  create(dto: CreateProjectDto): Promise<Project>;
  findAll(query: ProjectListQueryDto): Promise<ProjectListResult>;
  findOne(id: number): Promise<Project | null>;
  findByName(name: string): Promise<Project | null>;
  update(id: number, dto: UpdateProjectDto): Promise<Project | null>;
  remove(id: number): Promise<boolean>;
}
