import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from './project-status.enum.js';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Human-readable project name.',
    minLength: 3,
    maxLength: 100,
    example: 'StudyFlow',
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional project description.',
    maxLength: 500,
    example: 'Система керування навчальними проєктами',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.Active })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @ApiProperty({
    description: 'Public UUID of the user who owns the new project.',
    format: 'uuid',
    example: '11111111-1111-4111-8111-111111111111',
  })
  @IsUUID('4')
  ownerId: string;
}
