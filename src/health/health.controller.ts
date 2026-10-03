import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({
      summary: 'Return the application health status',
      description: 'Returns the current health indicator and a server timestamp.',
    })
    @ApiOkResponse({
      description: 'Application is healthy.',
      schema: {
        example: { status: 'OK', timestamp: 1791014400000 },
      },
    })
    check() {
        return {
            status: "OK",
            timestamp: Date.now()        
        }
    }
}
