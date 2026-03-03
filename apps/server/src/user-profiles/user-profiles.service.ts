import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { userProfiles } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import type { CognitoJwtPayload } from '@nestjs-cognito/core';
import { UserProfilesRepository } from '../database/user-profiles.repository';

type UserProfile = typeof userProfiles.$inferSelect;

@Injectable()
export class UserProfilesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly repo: UserProfilesRepository,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async findByEmail(email: string): Promise<UserProfile | null> {
    const [row] = await this.db
      .select()
      .from(userProfiles)
      .where(
        and(isNull(userProfiles.deletedAt), eq(userProfiles.email, email)),
      );
    return row ?? null;
  }

  /**
   * Finds a user profile by email (from Cognito), or creates one if missing.
   * Uses Cognito username as email when email claim is absent (access token).
   */
  async findOrCreateFromAuth(payload: CognitoJwtPayload): Promise<UserProfile> {
    const email =
      (payload as { email?: string }).email ??
      (payload.username as string) ??
      'unknown@example.com';
    const existing = await this.findByEmail(email);
    if (existing) return existing;

    const org = await this.organizationsService.findFirstOrCreateDefault();
    const name = (payload as { name?: string; given_name?: string; family_name?: string }).name;
    const givenName = (payload as { given_name?: string }).given_name;
    const familyName = (payload as { family_name?: string }).family_name;
    const firstName = givenName ?? (name?.split(' ')[0]) ?? 'User';
    const lastName = familyName ?? (name?.split(' ').slice(1).join(' ') || 'Profile');

    return this.repo.create({
      email,
      firstName,
      lastName,
      organizationId: org.id,
    });
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
    return this.repo.findAll();
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(dto: CreateUserProfileDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateUserProfileDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }
}
