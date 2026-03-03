import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type InferSelectModel, eq, isNull, and } from 'drizzle-orm';
import { userProfiles } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

type UserProfile = InferSelectModel<typeof userProfiles>;

@Injectable()
export class UserProfilesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByEmail(email: string): Promise<UserProfile | null> {
    const [row] = await this.db
      .select()
      .from(userProfiles)
      .where(
        and(isNull(userProfiles.deletedAt), eq(userProfiles.email, email)),
      );
    return row ?? null;
  }

  async findAll(organizationId?: string) {
    if (organizationId) {
      return this.db
        .select()
        .from(userProfiles)
        .where(
          and(
            isNull(userProfiles.deletedAt),
            eq(userProfiles.organizationId, organizationId),
          ),
        );
    }
    return this.db
      .select()
      .from(userProfiles)
      .where(isNull(userProfiles.deletedAt));
  }

  async findOne(id: string) {
    const [row] = await this.db
      .select()
      .from(userProfiles)
      .where(and(isNull(userProfiles.deletedAt), eq(userProfiles.id, id)));
    if (!row) throw new NotFoundException(`Project ${id} not found`);
    return row;
  }

  async create(dto: CreateUserProfileDto) {
    const [row] = await this.db.insert(userProfiles).values(dto).returning();
    return row;
  }

  async update(id: string, dto: UpdateUserProfileDto) {
    const [row] = await this.db
      .update(userProfiles)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Project ${id} not found`);
    return row;
  }

  async remove(id: string) {
    const [row] = await this.db
      .update(userProfiles)
      .set({ deletedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    if (!row) throw new NotFoundException(`Project ${id} not found`);
    return row;
  }
}
