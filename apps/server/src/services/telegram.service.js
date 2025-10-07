import { formatOrderMessage } from '../utils/order-formatter.js';

export class TelegramService {
  constructor(settingsRepository, options = {}) {
    this.settingsRepository = settingsRepository;
    this.botToken = options.botToken ?? process.env.TELEGRAM_BOT_TOKEN;
    this.apiBaseUrl = options.apiBaseUrl ?? 'https://api.telegram.org';
  }

  ensureBotToken() {
    if (!this.botToken) {
      const error = new Error('Telegram bot token is not configured');
      error.status = 500;
      throw error;
    }
  }

  async sendOrderNotification(submission) {
    this.ensureBotToken();
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
}

export function createTelegramService(settingsRepository, options) {
  return new TelegramService(settingsRepository, options);
}
