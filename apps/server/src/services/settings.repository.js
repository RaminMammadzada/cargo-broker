import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const SETTINGS_FILE_URL = new URL('../data/settings.json', import.meta.url);

export class SettingsRepository {
  constructor(fileUrl = SETTINGS_FILE_URL) {
    this.fileUrl = fileUrl;
  }

  async getTelegramSettings() {
    const data = await this.readFile();
    return { chatId: data.chatId ?? null };
  }

  async updateTelegramSettings(chatId) {
    const payload = { chatId: chatId ?? null };
    await this.writeFile(payload);
    return payload;
  }

  async readFile() {
    try {
      const file = await readFile(this.fileUrl, 'utf-8');
      return JSON.parse(file);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.ensureDirectory();
        const defaults = { chatId: null };
        await this.writeFile(defaults);
        return defaults;
      }
      throw error;
    }
  }

  async writeFile(data) {
    await this.ensureDirectory();
    await writeFile(this.fileUrl, JSON.stringify(data, null, 2), 'utf-8');
  }

  async ensureDirectory() {
    const dir = dirname(fileURLToPath(this.fileUrl));
    await mkdir(dir, { recursive: true });
  }
}

export function createSettingsRepository() {
  return new SettingsRepository();
}
