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
  findByName: vi.fn(),
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
      id: 1,
      name: 'Website',
      description: 'Redesign',
      status: 'active',
      createdAt: new Date(),
    };
    vi.mocked(repository.create).mockReturnValue(project);

    expect(
      service.create({
        name: 'Website',
        description: 'Redesign',
        status: 'active',
      }),
    ).toMatchObject({
      id: 1,
      name: 'Website',
      description: 'Redesign',
      status: 'active',
    });
    expect(repository.create).toHaveBeenCalledWith({
      name: 'Website',
      description: 'Redesign',
      status: 'active',
    });
  });

  it('throws when a project is not found', () => {
    vi.mocked(repository.findOne).mockReturnValue(null);

    expect(() => service.findOne(99)).toThrow(
      'Project with id 99 was not found',
    );
  });

  it('rejects a duplicate project name', () => {
    vi.mocked(repository.findByName).mockReturnValue({
      id: 1,
      name: 'Website',
      status: 'active',
      createdAt: new Date(),
    });

    expect(() => service.create({ name: 'Website', status: 'active' })).toThrow(
      'Project with name Website already exists',
    );
  });
});
