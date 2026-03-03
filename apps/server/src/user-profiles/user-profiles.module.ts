import { Module } from '@nestjs/common';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfilesService } from './user-profiles.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UserProfilesRepository } from '../database/user-profiles.repository';

@Module({
  imports: [OrganizationsModule],
  controllers: [UserProfilesController],
  providers: [UserProfilesService, UserProfilesRepository],
  exports: [UserProfilesService, UserProfilesRepository],
})
export class UserProfilesModule {}
