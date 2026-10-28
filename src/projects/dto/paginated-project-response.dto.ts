import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';

export class PaginationMetaDto {
  @ApiProperty({ example: 2 })
  page: number;

  @ApiProperty({ example: 10 })
  size: number;

  @ApiProperty({ example: 35 })
  total: number;

  @ApiProperty({ example: 4 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: true })
  hasPreviousPage: boolean;
}

export class PaginatedProjectResponseDto {
  @ApiProperty({ type: ProjectResponseDto, isArray: true })
  data: ProjectResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
