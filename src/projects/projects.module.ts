import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { InMemoryProjectsRepository } from './projects.repository.js';
import { PROJECTS_REPOSITORY } from './ports/projects-repository.port.js';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    InMemoryProjectsRepository,
    {
      provide: PROJECTS_REPOSITORY,
      useExisting: InMemoryProjectsRepository,
    },
  ],
})
export class ProjectsModule {}
