import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { userProfiles } from '@utilitix/db';
import { DRIZZLE, DrizzleDB } from '../drizzle';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfilesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(organizationId?: string) {
    const query = this.db
      .select()
      .from(userProfiles)
      .where(isNull(userProfiles.deletedAt));

    if (organizationId) {
      return this.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.organizationId, organizationId));
    }

    return query;
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, id));
    if (!row) throw new NotFoundException(`User profile ${id} not found`);
    return row;
  }

  async create(dto: CreateUserProfileDto) {
    const [row] = await this.db
      .insert(userProfiles)
      .values(dto)
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateUserProfileDto) {
    const [row] = await this.db
      .update(userProfiles)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    if (!row) throw new NotFoundException(`User profile ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(userProfiles)
      .set({ deletedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    if (!row) throw new NotFoundException(`User profile ${id} not found`);
    return row;
  }
}
