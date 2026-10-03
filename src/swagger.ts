import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

const swaggerConfig = new DocumentBuilder()
  .setTitle('Projects API')
  .setDescription(
    'CRUD API for projects. All errors use the standard ApiErrorResponseDto envelope.',
  )
  .setVersion('1.0.0')
  .setContact(
    'Projects API maintainers',
    'https://github.com/bohdan-saiko/nest-test',
    'maintainers@example.com',
  )
  .setLicense('UNLICENSED', 'https://unlicense.org')
  .addServer('http://localhost:3000', 'Local development server')
  .addTag('Projects', 'Create, read, update, and delete projects.')
  .addTag('System', 'Application and health endpoints.')
  .setExternalDoc('Practical work repository', 'https://github.com/bohdan-saiko/nest-test')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'bearer',
  )
  .build();

export const createOpenApiDocument = (app: INestApplication) =>
  SwaggerModule.createDocument(app, swaggerConfig);

export const setupSwagger = (app: INestApplication): void => {
  SwaggerModule.setup('docs', app, createOpenApiDocument(app), {
    jsonDocumentUrl: 'docs-json',
    yamlDocumentUrl: 'docs-yaml',
    customSiteTitle: 'Projects API documentation',
  });
};
