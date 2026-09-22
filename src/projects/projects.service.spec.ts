import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service.js';
import {
  PROJECTS_REPOSITORY,
  ProjectsRepositoryPort,
} from './ports/projects-repository.port.js';
import { Project } from './entities/project.entity.js';

const createRepository = (): ProjectsRepositoryPort => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: ProjectsRepositoryPort;

  beforeEach(async () => {
    repository = createRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PROJECTS_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('delegates project creation to the repository port', () => {
    const project: Project = {
      id: 'project-1',
      name: 'Website',
      description: 'Redesign',
      createdAt: new Date(),
    };
    vi.mocked(repository.create).mockReturnValue(project);

    expect(service.create({ name: 'Website', description: 'Redesign' })).toBe(
      project,
    );
    expect(repository.create).toHaveBeenCalledWith({
      name: 'Website',
      description: 'Redesign',
    });
  });

  it('throws when a project is not found', () => {
    vi.mocked(repository.findOne).mockReturnValue(null);

    expect(() => service.findOne('missing')).toThrow(
      'Project with ID missing not found',
    );
  });
});
