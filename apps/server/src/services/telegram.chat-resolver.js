import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

import { comparePhoneNumbers } from '../utils/phone-number.js';

function buildPhoneCandidates(rawInput, sanitised) {
  const candidates = new Set();
  if (sanitised) {
    candidates.add(sanitised);
    candidates.add(`+${sanitised}`);
  }

  const trimmed = typeof rawInput === 'string' ? rawInput.trim() : '';
  if (trimmed.startsWith('+')) {
    candidates.add(trimmed);
  }

  if (trimmed.startsWith('00')) {
    const international = trimmed.replace(/^00/, '');
    if (international) {
      candidates.add(international);
      candidates.add(`+${international}`);
    }
  }

  return Array.from(candidates);
}

async function importContact(client, phone, offset = 0) {
  const result = await client.invoke(
    new Api.contacts.ImportContacts({
      contacts: [
        new Api.InputPhoneContact({
          client_id: BigInt(Date.now()) + BigInt(offset),
          phone,
          first_name: 'Cargo Broker',
          last_name: 'Admin'
        })
      ],
      replace: false
    })
  );

  const [contact] = result.users ?? [];
  return contact ?? null;
}

export function createAutomationResolver(config) {
  if (!config || typeof config !== 'object' || !config.enabled) {
    return null;
  }

  const { apiId, apiHash, session } = config;
  if (!apiId || !apiHash || !session) {
    return null;
  }

  return async function resolveWithAutomation(rawInput, sanitised) {
    const phones = buildPhoneCandidates(rawInput, sanitised);
    if (!phones.length) {
      return null;
    }

    const client = new TelegramClient(new StringSession(session), apiId, apiHash, { connectionRetries: 5 });
    await client.connect();

    try {
      phonesLoop: for (const [index, phone] of phones.entries()) {
        try {
          const user = await importContact(client, phone, index);
          if (user && comparePhoneNumbers(user.phone ?? '', sanitised)) {
            return { chatId: String(user.id), phoneNumber: sanitised };
          }
        } catch (error) {
          if (error.message?.includes('FLOOD_WAIT')) {
            throw error;
          }
          if (error.message?.includes('PHONE_NUMBER_INVALID')) {
            continue phonesLoop;
          }
          throw error;
        }
      }
    } finally {
      await client.disconnect();
    }

    return null;
  };
}
