import { NestFactory } from '@nestjs/core';
import { writeFile } from 'node:fs/promises';
import { AppModule } from './app.module.js';
import { createOpenApiDocument } from './swagger.js';

const app = await NestFactory.create(AppModule, { logger: false });
const document = createOpenApiDocument(app);
await writeFile('openapi.json', `${JSON.stringify(document, null, 2)}\n`);
await app.close();
