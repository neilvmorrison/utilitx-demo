import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { USER_PROFILE_KEY } from '../guards/ensure-profile.guard';

export const CurrentProfile = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as unknown as Record<string, unknown>)[USER_PROFILE_KEY];
  },
);
