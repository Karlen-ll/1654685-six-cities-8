import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { Component } from '../../types/index.js';
import { fillDTO } from '../../helpers/common.js';

import { BaseController, HttpError, HttpMethod } from '../../libs/rest/index.js';
import { CreateUserRequest } from './create-user-request.type.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { LoginUserRequest } from './login-user-request.type.js';
import { UserService } from './user-service.interface.js';
import { Logger } from '../../libs/logger/index.js';
import { UserRdo } from './rdo/user.rdo.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config)
    private readonly configService: Config<RestSchema>
  ) {
    super(logger);

    this.logger.info('Регистрация маршрутов для UserController…');

    this.addRoute({ path: '/register', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/login', method: HttpMethod.Post, handler: this.login });
  }

  public async create({ body }: CreateUserRequest, res: Response): Promise<void> {
    const existingUser = await this.userService.findByEmail(body.email);

    if (existingUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Пользователь с e-mail «${body.email}» существует.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));

    this.created(res, fillDTO(UserRdo, result));
  }

  public async login({ body }: LoginUserRequest, _res: Response) {
    const user = await this.userService.findByEmail(body.email);

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `Пользователь с электронной почтой ${body.email} не найдено.`,
        'UserController'
      );
    }

    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'Не реализовано', 'UserController');
  }
}