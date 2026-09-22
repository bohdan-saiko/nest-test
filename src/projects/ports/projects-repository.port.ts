import { CreateProjectDto } from '../dto/create-project.dto.js';
import { UpdateProjectDto } from '../dto/update-project.dto.js';
import { Project } from '../entities/project.entity.js';

/**
 * Injection token for the persistence boundary of the projects feature.
 *
 * A symbol is used because TypeScript interfaces do not exist at runtime.
 */
export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');

export interface ProjectsRepositoryPort {
  create(dto: CreateProjectDto): Project;
  findAll(): Project[];
  findOne(id: string): Project | null;
  update(id: string, dto: UpdateProjectDto): Project | null;
  remove(id: string): boolean;
}
