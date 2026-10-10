import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { PROJECTS_REPOSITORY } from '../src/projects/ports/projects-repository.port.js';
import type { ProjectsRepositoryPort } from '../src/projects/ports/projects-repository.port.js';
import type { Project } from '../src/projects/entities/project.entity.js';

const createTestRepository = (): ProjectsRepositoryPort => {
  const projects: Project[] = [];
  let nextId = 1;

  return {
    create: async (dto) => {
      const project: Project = { id: nextId++, ...dto, createdAt: new Date() };
      projects.push(project);
      return project;
    },
    findAll: async () => projects,
    findOne: async (id) =>
      projects.find((project) => project.id === id) ?? null,
    findByName: async (name) =>
      projects.find((project) => project.name === name) ?? null,
    update: async (id, dto) => {
      const project = projects.find((item) => item.id === id);
      return project ? Object.assign(project, dto) : null;
    },
    remove: async (id) => {
      const index = projects.findIndex((project) => project.id === id);
      if (index < 0) return false;
      projects.splice(index, 1);
      return true;
    },
  };
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PROJECTS_REPOSITORY)
      .useValue(createTestRepository())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('validates, serializes, and standardizes the Projects API', async () => {
    const created = await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: 'StudyFlow',
        description: 'Система керування навчальними проєктами',
        status: 'active',
        internalNote: 'must not be accepted',
      })
      .expect(400);

    expect(created.body).toMatchObject({
      statusCode: 400,
      errorCode: 'VALIDATION_FAILED',
      path: '/projects',
    });
    expect(created.body.traceId).toEqual(expect.any(String));

    const project = await request(app.getHttpServer())
      .post('/projects')
      .send({
        name: 'StudyFlow',
        description: 'Система керування навчальними проєктами',
        status: 'active',
      })
      .expect(201);

    expect(project.body).toMatchObject({
      id: 1,
      name: 'StudyFlow',
      description: 'Система керування навчальними проєктами',
      status: 'active',
    });
    expect(project.body.createdAt).toEqual(expect.any(String));
    expect(project.body.internalNote).toBeUndefined();

    await request(app.getHttpServer())
      .get('/projects/1')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: 1, name: 'StudyFlow' });
      });

    await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'StudyFlow', status: 'draft' })
      .expect(409)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          statusCode: 409,
          errorCode: 'PROJECT_NAME_CONFLICT',
          message: 'Project with name StudyFlow already exists',
          path: '/projects',
        });
      });

    await request(app.getHttpServer())
      .get('/projects/abc')
      .expect(400)
      .expect(({ body }) => {
        expect(body.errorCode).toBe('BAD_REQUEST');
        expect(body.path).toBe('/projects/abc');
      });

    await request(app.getHttpServer())
      .get('/projects/10')
      .set('x-trace-id', 'client-trace-id')
      .expect(404)
      .expect(({ body, headers }) => {
        expect(body).toMatchObject({
          statusCode: 404,
          errorCode: 'PROJECT_NOT_FOUND',
          message: 'Project with id 10 was not found',
          path: '/projects/10',
          traceId: 'client-trace-id',
        });
        expect(headers['x-trace-id']).toBe('client-trace-id');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
