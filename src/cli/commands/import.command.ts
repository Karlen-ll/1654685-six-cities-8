import path from 'node:path';
import chalk from 'chalk';
import { existsSync } from 'node:fs';
import { declination, getFileName } from '@/shared/helpers/index.js';
import { END_EVENT_NAME, LINE_END_EVENT_NAME } from '@/constants/index.js';
import { TSVOfferFileReader } from '@/shared/libs/index.js';
import { Command, Logger } from '@/cli/index.js';
import { Offer } from '@/shared/types/index.js';

const LINE_WORDS = ['строка', 'строки', 'строк'];

export class ImportCommand implements Command {
  readonly name = '--import';
  readonly alias = '-i';
  readonly description = 'Импортирует данные из TSV файла';
  readonly params = ['path'];

  private onReadLine(offer: Offer, index: number) {
    Logger.data(`\nИмпортирована ${chalk.bold.magenta(`${index}-ая`)} строка:`, offer);
  }

  private onReadFile(count: number) {
    Logger.info(`\nИмпортировано **${count} ${declination(count, LINE_WORDS)}**`);
  }

  private import(filePath: string) {
    const fullPath = path.join(process.cwd(), filePath.trim());
    const isFileExists = existsSync(fullPath);

    if (!isFileExists) {
      throw new Error(`Файл **${getFileName(filePath)}** — не существует!`);
    }

    const fileReader = new TSVOfferFileReader(fullPath);

    fileReader.on(LINE_END_EVENT_NAME, this.onReadLine);
    fileReader.on(END_EVENT_NAME, this.onReadFile);

    fileReader.read();
  }

  public async execute([filePath]: string[]) {
    if (!filePath) {
      Logger.error('⚠️ Укажите путь к файлу!');
      return;
    }

    try {
      this.import(filePath);
    } catch (error: unknown) {
      Logger.error(error, `Не удалось загрузить файл с указанием пути: ${filePath}`);
    }
  }
}
