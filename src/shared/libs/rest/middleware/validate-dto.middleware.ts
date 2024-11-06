import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StatusCodes } from 'http-status-codes';

import { Middleware } from './middleware.interface.js';

export class ValidateDtoMiddleware implements Middleware {
  constructor(
    private dto: ClassConstructor<object>,
    private type: 'body' | 'query' | 'params' = 'body'
  ) {}

  public async execute(request: Request, response: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dto, request[this.type], {
      excludeExtraneousValues: true,
    });

    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      response.status(StatusCodes.BAD_REQUEST).send(errors);
      return;
    }

    request[this.type] = dtoInstance;

    next();
  }
}
