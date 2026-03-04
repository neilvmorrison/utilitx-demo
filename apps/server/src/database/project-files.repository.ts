import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { projectFiles } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { BaseRepository } from './base.repository';

export type CreateProjectFileInput = {
  projectId: string;
  uploadedById: string;
  fileName: string;
  s3Key: string;
  mimeType: string;
  fileSize: number;
};

export type UpdateProjectFileInput = {
  fileName?: string;
};

@Injectable()
export class ProjectFilesRepository extends BaseRepository<
  typeof projectFiles,
  typeof projectFiles.$inferSelect,
  CreateProjectFileInput,
  UpdateProjectFileInput
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, projectFiles, 'ProjectFile');
  }

  async findByProject(projectId: string) {
    return this.db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.projectId, projectId),
          isNull(projectFiles.deletedAt),
        ),
      );
  }
}
