import { Router } from 'express';

export function createSettingsRouter(settingsRepository, telegramService) {
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
      const { phoneNumber } = req.body ?? {};
      if (typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
        const error = new Error('A Telegram phone number is required');
        error.status = 400;
        throw error;
      }

      const resolved = await telegramService.resolveChatIdByPhoneNumber(phoneNumber);
      const updated = await settingsRepository.updateTelegramSettings({
        phoneNumber: resolved.phoneNumber,
        chatId: resolved.chatId,
        lastSyncedAt: new Date().toISOString()
      });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
