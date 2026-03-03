import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { CognitoJwtPayload } from '@nestjs-cognito/core';
import { UserProfilesService } from '../../user-profiles/user-profiles.service';

const COGNITO_JWT_PAYLOAD_KEY = 'cognito_jwt_payload';
export const USER_PROFILE_KEY = 'userProfile';

@Injectable()
export class EnsureProfileGuard implements CanActivate {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const req = request as unknown as Record<string, unknown>;
    const payload = req[COGNITO_JWT_PAYLOAD_KEY] as
      | CognitoJwtPayload
      | undefined;

    if (!payload) return true;

    req[USER_PROFILE_KEY] =
      await this.userProfilesService.findOrCreateFromAuth(payload);

    return true;
  }
}
