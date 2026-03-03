import { Controller, Get } from '@nestjs/common';
import { Authentication, CognitoUser } from '@nestjs-cognito/auth';
import type { CognitoJwtPayload } from '@nestjs-cognito/core';

@Controller('example')
@Authentication()
export class ExampleController {
  @Get('protected')
  getProtected(@CognitoUser() user: CognitoJwtPayload): {
    message: string;
    username: string;
  } {
    return {
      message: 'Authorized',
      username: user.username as string,
    };
  }
}
