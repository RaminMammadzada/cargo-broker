import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { createSettingsRepository } from './services/settings.repository.js';
import { createTelegramService } from './services/telegram.service.js';
import { createSettingsRouter } from './routes/settings.routes.js';
import { createNotificationsRouter } from './routes/notifications.routes.js';
import { bootstrapTelegram } from './bootstrap/telegram.bootstrap.js';

dotenv.config();

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  const settingsRepository = createSettingsRepository();
  await bootstrapTelegram(settingsRepository);
  const telegramService = createTelegramService(settingsRepository);

  app.use('/api/settings', createSettingsRouter(settingsRepository, telegramService));
  app.use('/api/notifications', createNotificationsRouter(telegramService));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status ?? 500;
    res.status(status).json({ error: err.message, details: err.details });
  });

  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
