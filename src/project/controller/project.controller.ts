import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { ProjectListResponse } from '../dto/project-list-response.dto';
import { Project } from '@prisma/client';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@UseGuards(AuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async list(
    @Request() req,
    @Query('limit') limit: number = 4,
    @Query('offset') offset: number = 0,
    @Query('search') search?: string,
  ): Promise<ProjectListResponse> {
    const userId = req.user.sub as number;

    const { projects, total }: { projects: Project[]; total: number } =
      await this.projectService.findMany({
        userId,
        search,
        offset,
        limit,
      });

    return {
      data: projects,
      total,
      size: projects.length,
      offset,
      limit,
    };
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    const userId = Number(req.user.sub);
    return this.projectService.create(createProjectDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.delete(id);
  }
}
