import { Expose, Transform } from 'class-transformer';
import { ProjectStatus } from './project-status.enum.js';

/** The public representation of a project returned by the HTTP API. */
export class ProjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  status: ProjectStatus;

  @Expose()
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: string;
}
