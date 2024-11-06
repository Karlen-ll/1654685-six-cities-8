import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { StatusCodes } from 'http-status-codes';
import { createSecretKey } from 'node:crypto';
import { ENCODING } from '../../../../constants/index.js';

import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/index.js';
import { TokenPayload } from '../../../modules/auth/index.js';

function isTokenPayload(payload: unknown): payload is TokenPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'email' in payload &&
    typeof payload.email === 'string' &&
    'name' in payload &&
    typeof payload.name === 'string' &&
    'id' in payload &&
    typeof payload.id === 'string'
  );
}

export class ParseTokenMiddleware implements Middleware {
  constructor(private readonly jwtSecret: string) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = request.headers?.authorization?.split(' ');
    if (!authorizationHeader) {
      return next();
    }

    const [, token] = authorizationHeader;

    try {
      const { payload } = await jwtVerify(token, createSecretKey(this.jwtSecret, ENCODING));

      if (!isTokenPayload(payload)) {
        throw new Error('Не корректный токен');
      }

      request.tokenPayload = { ...payload };
      return next();
    } catch {
      return next(
        new HttpError(StatusCodes.UNAUTHORIZED, 'Неверный токен', 'AuthenticateMiddleware')
      );
    }
  }
}
