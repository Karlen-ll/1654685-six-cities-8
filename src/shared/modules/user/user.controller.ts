import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { Component } from '../../types/index.js';
import { fillDTO } from '../../helpers/common.js';

import {
  HttpError,
  HttpMethod,
  BaseController,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { CreateUserRequest } from './type/create-user-request.type.js';
import { LoginUserRequest } from './type/login-user-request.type.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { UserService } from './user-service.interface.js';
import { Logger } from '../../libs/logger/index.js';
import { UserRdo } from './rdo/user.rdo.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

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

    this.addRoutes([
      {
        path: '/register',
        method: HttpMethod.post,
        handler: this.create,
        middlewares: [new ValidateDtoMiddleware(CreateUserDto)],
      },
      {
        path: '/login',
        method: HttpMethod.post,
        handler: this.login,
        middlewares: [new ValidateDtoMiddleware(LoginUserDto)],
      },
      {
        path: '/:userId/avatar',
        method: HttpMethod.post,
        handler: this.uploadAvatar,
        middlewares: [
          new ValidateObjectIdMiddleware('userId'),
          new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
        ],
      },
    ]);
  }

  public async create({ body }: CreateUserRequest, response: Response): Promise<void> {
    const existingUser = await this.userService.findByEmail(body.email);

    if (existingUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Пользователь с e-mail «${body.email}» существует.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));

    this.created(response, fillDTO(UserRdo, result));
  }

  public async login({ body }: LoginUserRequest, _response: Response) {
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

  public async uploadAvatar(request: Request, response: Response) {
    this.created(response, { filepath: request.file?.path });
  }
}
