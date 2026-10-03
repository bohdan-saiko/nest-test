import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from './project-status.enum.js';

/** The public representation of a project returned by the HTTP API. */
export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'StudyFlow' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Система керування навчальними проєктами' })
  @Expose()
  description?: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.Active })
  @Expose()
  status: ProjectStatus;

  @ApiProperty({
    format: 'date-time',
    example: '2026-10-03T10:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: string;
}
