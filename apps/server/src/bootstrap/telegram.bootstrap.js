import { readFile, writeFile } from 'fs/promises';
import { isAbsolute, resolve } from 'path';
import { pathToFileURL } from 'url';

const DEFAULT_CONFIG_URL = new URL('../../config/telegram.config.json', import.meta.url);

function sanitiseCommands(commands) {
  if (!Array.isArray(commands)) {
    return [];
  }

  return commands
    .map((command) => {
      if (typeof command === 'string') {
        return command.trim();
      }

      if (command && typeof command === 'object') {
        const cmd = typeof command.command === 'string' ? command.command.trim() : '';
        const description = typeof command.description === 'string' ? command.description.trim() : '';
        if (!cmd) {
          return null;
        }

        return description ? `${cmd} - ${description}` : cmd;
      }

      return null;
    })
    .filter(Boolean);
}

async function readConfigFile(fileUrl) {
  try {
    const file = await readFile(fileUrl, 'utf-8');
    const data = JSON.parse(file);
    if (data && typeof data === 'object') {
      const autoCreate = data.autoCreate && typeof data.autoCreate === 'object' ? data.autoCreate : {};
      return {
        botToken: typeof data.botToken === 'string' ? data.botToken.trim() : '',
        autoCreate: {
          enabled: Boolean(autoCreate.enabled),
          apiId: typeof autoCreate.apiId === 'number' ? autoCreate.apiId : null,
          apiHash: typeof autoCreate.apiHash === 'string' ? autoCreate.apiHash.trim() : '',
          session: typeof autoCreate.session === 'string' ? autoCreate.session.trim() : '',
          botName: typeof autoCreate.botName === 'string' ? autoCreate.botName.trim() : '',
          botUsername: typeof autoCreate.botUsername === 'string' ? autoCreate.botUsername.trim() : '',
          description: typeof autoCreate.description === 'string' ? autoCreate.description.trim() : '',
          about: typeof autoCreate.about === 'string' ? autoCreate.about.trim() : '',
          commands: sanitiseCommands(autoCreate.commands),
          lastRunAt: typeof autoCreate.lastRunAt === 'string' ? autoCreate.lastRunAt : null,
          lastError: typeof autoCreate.lastError === 'string' ? autoCreate.lastError : null,
          lastStatus: typeof autoCreate.lastStatus === 'string' ? autoCreate.lastStatus : null
        }
      };
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return {
    botToken: '',
    autoCreate: {
      enabled: false,
      apiId: null,
      apiHash: '',
      session: '',
      botName: '',
      botUsername: '',
      description: '',
      about: '',
      commands: [],
      lastRunAt: null,
      lastError: null,
      lastStatus: null
    }
  };
}

async function writeConfigFile(fileUrl, data) {
  await writeFile(fileUrl, JSON.stringify(data, null, 2), 'utf-8');
}

function resolveConfigUrl() {
  const envPath = process.env.TELEGRAM_CONFIG_FILE;
  if (!envPath) {
    return DEFAULT_CONFIG_URL;
  }

  const absolutePath = isAbsolute(envPath) ? envPath : resolve(process.cwd(), envPath);
  return pathToFileURL(absolutePath);
}

export async function bootstrapTelegram(settingsRepository, { autoCreator } = {}) {
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (envToken) {
    await settingsRepository.persistBotToken(envToken);
    return { source: 'env', botToken: envToken };
  }

  const storedToken = await settingsRepository.getBotToken();
  if (storedToken) {
    process.env.TELEGRAM_BOT_TOKEN = storedToken;
    return { source: 'settings', botToken: storedToken };
  }

  const configUrl = resolveConfigUrl();
  const config = await readConfigFile(configUrl);

  if (config.botToken) {
    await settingsRepository.persistBotToken(config.botToken);
    process.env.TELEGRAM_BOT_TOKEN = config.botToken;
    return { source: 'config', botToken: config.botToken };
  }

  if (config.autoCreate?.enabled) {
    const creator = autoCreator ?? (await import('./telegram.bot-factory.js'));
    if (creator && typeof creator.ensureBotToken === 'function') {
      try {
        const result = await creator.ensureBotToken(config.autoCreate);
        if (result?.botToken) {
          await settingsRepository.persistBotToken(result.botToken);
          process.env.TELEGRAM_BOT_TOKEN = result.botToken;
          const updatedConfig = {
            ...config,
            botToken: result.botToken,
            autoCreate: {
              ...config.autoCreate,
              lastRunAt: new Date().toISOString(),
              lastStatus: result.created ? 'created' : 'retrieved',
              lastError: null
            }
          };
          await writeConfigFile(configUrl, updatedConfig);
          return { source: result.created ? 'auto-created' : 'auto-retrieved', botToken: result.botToken };
        }
      } catch (error) {
        const updatedConfig = {
          ...config,
          autoCreate: {
            ...config.autoCreate,
            lastRunAt: new Date().toISOString(),
            lastError: error.message ?? String(error),
            lastStatus: 'failed'
          }
        };
        await writeConfigFile(configUrl, updatedConfig);
        console.error('Failed to automatically provision Telegram bot token', error);
      }
    }
  }

  return { source: 'none', botToken: null };
}
