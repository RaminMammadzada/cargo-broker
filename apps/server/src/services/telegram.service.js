import { formatOrderMessage } from '../utils/order-formatter.js';
import { comparePhoneNumbers, sanitisePhoneNumber } from '../utils/phone-number.js';

export class TelegramService {
  constructor(settingsRepository, options = {}) {
    this.settingsRepository = settingsRepository;
    this.botToken = options.botToken ?? process.env.TELEGRAM_BOT_TOKEN ?? null;
    this.apiBaseUrl = options.apiBaseUrl ?? 'https://api.telegram.org';
  }

  async ensureBotToken() {
    if (this.botToken) {
      return this.botToken;
    }

    if (typeof this.settingsRepository.getBotToken === 'function') {
      const stored = await this.settingsRepository.getBotToken();
      if (stored) {
        this.botToken = stored;
        return this.botToken;
      }
    }

    const error = new Error('Telegram bot token is not configured');
    error.status = 500;
    throw error;
  }

  async sendOrderNotification(submission) {
    await this.ensureBotToken();
    const { chatId } = await this.settingsRepository.getTelegramSettings();

    if (!chatId) {
      const error = new Error('Telegram chat id is not configured');
      error.status = 400;
      throw error;
    }

    const message = formatOrderMessage(submission);
    const url = `${this.apiBaseUrl}/bot${this.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const body = await response.text();
      const error = new Error(`Failed to send Telegram notification: ${response.statusText}`);
      error.status = 502;
      error.details = body;
      throw error;
    }

    return response.json();
  }

  async resolveChatIdByPhoneNumber(phoneNumber) {
    const sanitised = sanitisePhoneNumber(phoneNumber);
    const botToken = await this.ensureBotToken();

    const url = `${this.apiBaseUrl}/bot${botToken}/getUpdates`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const body = await response.text();
      const error = new Error(`Failed to load Telegram updates: ${response.statusText}`);
      error.status = 502;
      error.details = body;
      throw error;
    }

    const payload = await response.json();
    if (payload.ok === false) {
      const error = new Error('Telegram API returned an error while fetching updates');
      error.status = 502;
      error.details = payload.description ?? payload;
      throw error;
    }

    const updates = Array.isArray(payload.result) ? payload.result : [];

    for (const update of updates) {
      const message = update.message ?? update.edited_message ?? null;
      if (!message) {
        continue;
      }

      if (message.contact && comparePhoneNumbers(message.contact.phone_number, sanitised)) {
        return { chatId: String(message.chat.id), phoneNumber: sanitised };
      }

      if (message.text && comparePhoneNumbers(message.text, sanitised)) {
        return { chatId: String(message.chat.id), phoneNumber: sanitised };
      }
    }

    const error = new Error(
      'Unable to locate a Telegram chat for the provided phone number. Share your contact with the bot and try again.'
    );
    error.status = 404;
    throw error;
  }
}

export function createTelegramService(settingsRepository, options) {
  return new TelegramService(settingsRepository, options);
}
