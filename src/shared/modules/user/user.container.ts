import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';

import { DefaultUserService } from './default-user.service.js';
import { UserService } from './user-service.interface.js';
import { UserEntity, UserModel } from './user.entity.js';
import { UserController } from './user.controller.js';
import { Component } from '../../types/index.js';
import { Controller } from '../../libs/index.js';

export function createUserContainer() {
  const userContainer = new Container();

  userContainer.bind<UserService>(Component.UserService).to(DefaultUserService).inSingletonScope();
  userContainer.bind<types.ModelType<UserEntity>>(Component.UserModel).toConstantValue(UserModel);
  userContainer.bind<Controller>(Component.UserController).to(UserController).inSingletonScope();

  return userContainer;
}
