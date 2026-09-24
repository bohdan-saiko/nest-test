import { ProjectStatus } from '../dto/project-status.enum.js';

export class Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
}
