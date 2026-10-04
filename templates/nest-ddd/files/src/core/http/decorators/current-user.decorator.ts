import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
  id: string;
  role: string;
  /** Session the access token belongs to. */
  sid?: string;
}

/**
 * Reads `request.user`, which an auth guard (JwtAuthGuard) is expected to populate.
 * The auth guard itself is intentionally not part of the boilerplate.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
