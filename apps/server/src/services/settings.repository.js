import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, isAbsolute, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const FALLBACK_FILE_URL = new URL('../../var/telegram-settings.json', import.meta.url);

const DEFAULT_SETTINGS = {
  botToken: null,
  phoneNumber: null,
  chatId: null,
  lastSyncedAt: null
};

function resolveSettingsFileUrl(explicitUrl) {
  if (explicitUrl) {
    return explicitUrl;
  }

  const envPath = process.env.TELEGRAM_SETTINGS_FILE;
  if (envPath) {
    const absolutePath = isAbsolute(envPath) ? envPath : resolve(process.cwd(), envPath);
    return pathToFileURL(absolutePath);
  }

  return FALLBACK_FILE_URL;
}

export class SettingsRepository {
  constructor(fileUrl) {
    this.fileUrl = resolveSettingsFileUrl(fileUrl);
  }

  async getTelegramSettings() {
    const data = await this.readFile();
    return {
      phoneNumber: data.phoneNumber ?? null,
      chatId: data.chatId ?? null,
      lastSyncedAt: data.lastSyncedAt ?? null,
      botTokenConfigured: Boolean(data.botToken ?? process.env.TELEGRAM_BOT_TOKEN ?? null)
    };
  }

  async updateTelegramSettings({ phoneNumber = null, chatId = null, lastSyncedAt = null }) {
    const current = await this.readFile();
    const payload = {
      ...current,
      phoneNumber,
      chatId,
      lastSyncedAt
    };
    await this.writeFile(payload);
    return {
      phoneNumber: payload.phoneNumber,
      chatId: payload.chatId,
      lastSyncedAt: payload.lastSyncedAt,
      botTokenConfigured: Boolean(payload.botToken ?? process.env.TELEGRAM_BOT_TOKEN ?? null)
    };
  }

  async persistBotToken(botToken) {
    const current = await this.readFile();
    const payload = {
      ...current,
      botToken: botToken ?? null
    };
    await this.writeFile(payload);
    return payload.botToken;
  }

  async getBotToken() {
    const data = await this.readFile();
    return data.botToken ?? null;
  }

  async readFile() {
    try {
      const file = await readFile(this.fileUrl, 'utf-8');
      const data = JSON.parse(file);
      return { ...structuredClone(DEFAULT_SETTINGS), ...data };
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.ensureDirectory();
        await this.writeFile(DEFAULT_SETTINGS);
        return structuredClone(DEFAULT_SETTINGS);
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
