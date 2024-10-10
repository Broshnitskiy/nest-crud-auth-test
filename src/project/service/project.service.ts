import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma';
import { Prisma, Project, ProjectStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredProjects() {
    const now = new Date();
    await this.prismaService.project.updateMany({
      where: {
        expiredAt: { lt: now },
        status: { not: ProjectStatus.expired },
      },
      data: {
        status: ProjectStatus.expired,
      },
    });
  }

  async findMany({ userId, search, offset, limit }) {
    const searchCondition = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              url: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const where = {
      userId,
      status: { not: ProjectStatus.deleted },
      ...searchCondition,
    };

    const projects = await this.prismaService.project.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
    });

    const total = await this.prismaService.project.count({
      where,
    });

    return { projects, total };
  }

  async create(data: CreateProjectDto, userId: number): Promise<Project> {
    return this.prismaService.project.create({
      data: { ...data, status: ProjectStatus.active, userId },
    });
  }

  async update(id: number, data: Prisma.ProjectUpdateInput): Promise<Project> {
    const project = await this.prismaService.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return this.prismaService.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Project> {
    const project = await this.prismaService.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return this.prismaService.project.update({
      where: { id },
      data: { status: ProjectStatus.deleted },
    });
  }
}
