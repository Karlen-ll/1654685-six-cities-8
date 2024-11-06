import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BaseController,
  HttpError,
  HttpMethod,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { fillDTO } from '../../helpers/common.js';
import { Component, UserType } from '../../types/index.js';

import { LoginUserRequest } from './type/login-user-request.type.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { UserService } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoggedUserRdo } from './rdo/logged-user.rdo.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { Logger } from '../../libs/logger/index.js';
import { AuthService } from '../auth/index.js';
import { UserRdo } from './rdo/user.rdo.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.AuthService) private readonly authService: AuthService
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
        path: '/login',
        handler: this.checkAuthenticate,
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

  public async create(
    {
      body,
      tokenPayload,
    }: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>,
    response: Response
  ): Promise<void> {
    if (tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `Only anonymous users are allowed to register a new account`,
        'UserController'
      );
    }

    const existingUser = await this.userService.findByEmail(body.email);

    if (existingUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `Пользователь с e-mail «${body.email}» существует.`,
        'UserController'
      );
    }

    body.type = UserType.Regular;

    const result = await this.userService.create(body, this.configService.get('SALT'));

    this.created(response, fillDTO(UserRdo, result));
  }

  public async login({ body }: LoginUserRequest, response: Response) {
    const user = await this.authService.verify(body);
    const token = await this.authService.authenticate(user);
    const responseData = fillDTO(LoggedUserRdo, { email: user.email, token });
    this.ok(response, responseData);
  }

  public async uploadAvatar(request: Request, response: Response) {
    this.created(response, { filepath: request.file?.path });
  }

  public async checkAuthenticate({ tokenPayload }: Request, response: Response) {
    const user = await this.userService.findByEmail(tokenPayload?.email);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UserController');
    }

    this.ok(response, fillDTO(UserRdo, user));
  }
}
