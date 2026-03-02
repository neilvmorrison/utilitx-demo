import { Module } from '@nestjs/common';
import { CognitoAuthModule } from '@nestjs-cognito/auth';

@Module({
  imports: [
    CognitoAuthModule.register({
      jwtVerifier: {
        userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
        clientId: process.env.COGNITO_CLIENT_ID ?? '',
        tokenUse: 'access',
      },
    }),
  ],
})
export class AuthModule {}
