import { ProjectStatus } from '@prisma/client';

export type ProjectListResponse = {
  data: {
    id: number;
    name: string;
    url: string;
    status: ProjectStatus;
    expiredAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
  }[];
  total: number;
  size: number;
  offset: number;
  limit: number;
};
