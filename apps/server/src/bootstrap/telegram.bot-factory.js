import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

import { sleep } from '../utils/sleep.js';

const BOTFATHER_USERNAME = 'BotFather';
const TOKEN_REGEX = /(\d+:[A-Za-z0-9_-]{10,})/;

function normaliseUsername(username) {
  if (!username) {
    return '';
  }

  const trimmed = username.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function stripUsername(username) {
  return normaliseUsername(username).replace(/^@/, '');
}

async function getLatestMessage(client, peer) {
  const [latest] = await client.getMessages(peer, { limit: 1 });
  return latest ?? null;
}

async function waitForNewMessage(client, peer, afterId, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let lastMessage = null;

  while (Date.now() < deadline) {
    lastMessage = await getLatestMessage(client, peer);
    if (lastMessage && lastMessage.id > afterId) {
      return lastMessage;
    }

    await sleep(500);
  }

  throw new Error('Timed out waiting for BotFather response');
}

function extractToken(message) {
  if (!message) {
    return null;
  }

  const match = message.match(TOKEN_REGEX);
  return match ? match[1] : null;
}

async function requestExistingToken(client, username) {
  const targetUsername = normaliseUsername(username);
  if (!targetUsername) {
    return null;
  }

  const latest = await getLatestMessage(client, BOTFATHER_USERNAME);
  const baselineId = latest ? latest.id : 0;

  await client.sendMessage(BOTFATHER_USERNAME, { message: `/token ${targetUsername}` });
  const response = await waitForNewMessage(client, BOTFATHER_USERNAME, baselineId);
  const token = extractToken(response.message ?? '');

  if (token) {
    return { botToken: token, created: false, raw: response.message ?? '' };
  }

  const text = (response.message ?? '').toLowerCase();
  if (text.includes("wasn't found") || text.includes('not a bot')) {
    return null;
  }

  throw new Error(`BotFather refused to return a token: ${response.message ?? 'unknown error'}`);
}

async function createBot(client, { botName, botUsername }) {
  const name = botName?.trim();
  const username = stripUsername(botUsername);

  if (!name) {
    throw new Error('A bot name is required to create a Telegram bot');
  }

  if (!username) {
    throw new Error('A bot username is required to create a Telegram bot');
  }

  const latest = await getLatestMessage(client, BOTFATHER_USERNAME);
  let baselineId = latest ? latest.id : 0;

  await client.sendMessage(BOTFATHER_USERNAME, { message: '/newbot' });
  const namePrompt = await waitForNewMessage(client, BOTFATHER_USERNAME, baselineId);
  baselineId = namePrompt.id;

  await client.sendMessage(BOTFATHER_USERNAME, { message: name });
  const usernamePrompt = await waitForNewMessage(client, BOTFATHER_USERNAME, baselineId);
  baselineId = usernamePrompt.id;

  await client.sendMessage(BOTFATHER_USERNAME, { message: username });
  const response = await waitForNewMessage(client, BOTFATHER_USERNAME, baselineId, 30000);
  const token = extractToken(response.message ?? '');

  if (!token) {
    throw new Error(`BotFather did not provide a token after bot creation: ${response.message ?? 'unknown response'}`);
  }

  return { botToken: token, created: true, raw: response.message ?? '' };
}

async function configureBot(client, username, config) {
  const targetUsername = normaliseUsername(username);
  if (!targetUsername) {
    return;
  }

  async function updateSetting(command, value, timeout = 15000) {
    const latest = await getLatestMessage(client, BOTFATHER_USERNAME);
    const baselineId = latest ? latest.id : 0;
    await client.sendMessage(BOTFATHER_USERNAME, { message: command });
    const prompt = await waitForNewMessage(client, BOTFATHER_USERNAME, baselineId, timeout);
    const promptText = prompt.message ?? '';
    if (!promptText.toLowerCase().includes('choose a bot')) {
      return;
    }

    await client.sendMessage(BOTFATHER_USERNAME, { message: targetUsername });
    const configBaseline = prompt.id;
    await client.sendMessage(BOTFATHER_USERNAME, { message: value });
    await waitForNewMessage(client, BOTFATHER_USERNAME, configBaseline, timeout);
  }

  if (config.description) {
    await updateSetting('/setdescription', config.description.slice(0, 512));
  }

  if (config.about) {
    await updateSetting('/setabouttext', config.about.slice(0, 120));
  }

  if (config.commands?.length) {
    const commandsText = config.commands.join('\n').slice(0, 1024);
    await updateSetting('/setcommands', commandsText);
  }
}

export async function ensureBotToken(config) {
  if (!config || typeof config !== 'object') {
    return null;
  }

  const { apiId, apiHash, session } = config;
  if (!apiId || !apiHash || !session) {
    throw new Error('Telegram bot auto-creation requires apiId, apiHash and a session string');
  }

  const client = new TelegramClient(new StringSession(session), apiId, apiHash, { connectionRetries: 5 });
  await client.connect();

  try {
    const existing = await requestExistingToken(client, config.botUsername);
    if (existing) {
      await configureBot(client, config.botUsername, config);
      return existing;
    }

    const created = await createBot(client, config);
    await configureBot(client, config.botUsername, config);
    return created;
  } finally {
    await client.disconnect();
  }
}
