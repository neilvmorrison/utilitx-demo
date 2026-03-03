import { Inject, Injectable } from '@nestjs/common';
import { userProfiles } from '@utilitix/db';
import { DRIZZLE, type DrizzleDB } from '../drizzle';
import { CreateUserProfileDto } from '../user-profiles/dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../user-profiles/dto/update-user-profile.dto';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserProfilesRepository extends BaseRepository<
  typeof userProfiles,
  typeof userProfiles.$inferSelect,
  CreateUserProfileDto,
  UpdateUserProfileDto
> {
  constructor(@Inject(DRIZZLE) db: DrizzleDB) {
    super(db, userProfiles, 'User profile');
  }
}
