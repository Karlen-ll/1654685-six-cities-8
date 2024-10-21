import { inject, injectable } from 'inversify';

import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { Config, RestSchema } from '../shared/libs/config/index.js';
import { getMongoUri } from '../shared/helpers/index.js';
import { Logger } from '../shared/libs/logger/index.js';
import { Component } from '../shared/types/index.js';

@injectable()
export class RestApplication {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient)
    private readonly databaseClient: DatabaseClient
  ) {}

  private async initDb() {
    const mongoUri = getMongoUri(
      this.config.get('DB_USER'),
      this.config.get('DB_PASS'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    await this.databaseClient.connect(mongoUri);
  }

  public async init() {
    this.logger.info('Инициализация приложения');
    this.logger.info(`Получить ценность из окружения $PORT: ${this.config.get('PORT')}`);

    this.logger.info('Инициализировать базу данных…');
    await this.initDb();
    this.logger.info('Инициализация базы данных завершена');
  }
}
