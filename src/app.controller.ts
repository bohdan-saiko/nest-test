import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Return the application greeting',
    description: 'Provides a simple response to verify that the application is running.',
  })
  @ApiOkResponse({ description: 'Greeting returned.', schema: { example: 'Hello World!' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
