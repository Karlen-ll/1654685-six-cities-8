import { Container } from 'inversify';
import { Component } from '../shared/types/index.js';
import { RestApplication } from './rest.application.js';
import { Logger, PinoLogger } from '../shared/libs/index.js';
import { Config, RestConfig, RestSchema } from '../shared/libs/index.js';
import { DatabaseClient, MongoDatabaseClient } from '../shared/libs/index.js';
import { AppExceptionFilter, ExceptionFilter } from '../shared/libs/index.js';

export function createRestApplicationContainer() {
  const restApplicationContainer = new Container();

  restApplicationContainer
    .bind<RestApplication>(Component.RestApplication)
    .to(RestApplication)
    .inSingletonScope();

  restApplicationContainer.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();

  restApplicationContainer
    .bind<Config<RestSchema>>(Component.Config)
    .to(RestConfig)
    .inSingletonScope();

  restApplicationContainer
    .bind<DatabaseClient>(Component.DatabaseClient)
    .to(MongoDatabaseClient)
    .inSingletonScope();

  restApplicationContainer
    .bind<ExceptionFilter>(Component.ExceptionFilter)
    .to(AppExceptionFilter)
    .inSingletonScope();

  return restApplicationContainer;
}
