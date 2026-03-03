import { Module } from '@nestjs/common';
import { CognitoAuthModule } from '@nestjs-cognito/auth';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { EnsureProfileGuard } from './guards/ensure-profile.guard';

@Module({
  imports: [
    CognitoAuthModule.register({
      jwtVerifier: {
        userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
        clientId: process.env.COGNITO_CLIENT_ID ?? '',
        tokenUse: 'access',
      },
    }),
    UserProfilesModule,
  ],
  providers: [EnsureProfileGuard],
  exports: [EnsureProfileGuard, UserProfilesModule],
})
export class AuthModule {}
