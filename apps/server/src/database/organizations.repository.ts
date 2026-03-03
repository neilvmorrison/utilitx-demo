import { Inject, Injectable } from '@nestjs/common';
import { isNull } from 'drizzle-orm';
import { organizations } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../organizations/dto/update-organization.dto';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrganizationsRepository extends BaseRepository<
  typeof organizations,
  typeof organizations.$inferSelect,
  CreateOrganizationDto,
  UpdateOrganizationDto
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, organizations, 'Organization');
  }

  /** Returns the first active org, or creates a default one. */
  async findFirstOrCreateDefault() {
    const [existing] = await this.db
      .select()
      .from(organizations)
      .where(isNull(organizations.deletedAt))
      .limit(1);
    if (existing) return existing;
    const [created] = await this.db
      .insert(organizations)
      .values({ name: 'Default Organization' })
      .returning();
    return created;
  }
}
