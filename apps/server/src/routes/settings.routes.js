import { Router } from 'express';

export function createSettingsRouter(settingsRepository) {
  const router = Router();

  router.get('/telegram', async (req, res, next) => {
    try {
      const settings = await settingsRepository.getTelegramSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  router.put('/telegram', async (req, res, next) => {
    try {
      const { chatId } = req.body ?? {};
      if (typeof chatId !== 'string' || !chatId.trim()) {
        const error = new Error('A Telegram chat id is required');
        error.status = 400;
        throw error;
      }

      const sanitised = chatId.trim();
      if (!/^[-\d]+$/.test(sanitised)) {
        const error = new Error('Telegram chat id must contain digits and optional leading dash');
        error.status = 400;
        throw error;
      }

      const updated = await settingsRepository.updateTelegramSettings(sanitised);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
