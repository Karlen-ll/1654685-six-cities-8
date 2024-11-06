import { config } from 'dotenv';
import { Logger } from '../logger/index.js';
import { Config } from './config.interface.js';
import { configRestSchema, RestSchema } from './rest.schema.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';

@injectable()
export class RestConfig implements Config<RestSchema> {
  private readonly config: RestSchema;

  constructor(@inject(Component.Logger) private readonly logger: Logger) {
    const parsedOutput = config();

    if (parsedOutput.error) {
      throw new Error("Can't read .env file. Perhaps the file does not exist.");
    }

    configRestSchema.load({});
    configRestSchema.validate({ allowed: 'strict', output: this.logger.info });

    this.config = configRestSchema.getProperties();

    this.logger.info('.env file was found and successfully parsed!');
  }

  public get<T extends keyof RestSchema>(key: T): RestSchema[T] {
    return this.config[key];
  }

  public get mongoUri() {
    return `mongodb://${this.get('DB_USER')}:${this.get('DB_PASS')}@${this.get('DB_HOST')}:${this.get('DB_PORT')}/${this.get('DB_NAME')}?authSource=admin`;
  }
}
