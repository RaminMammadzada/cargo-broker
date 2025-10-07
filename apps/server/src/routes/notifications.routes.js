import { Router } from 'express';

export function createNotificationsRouter(telegramService) {
  const router = Router();

  router.post('/order', async (req, res, next) => {
    try {
      const { submission } = req.body ?? {};
      if (!submission || typeof submission !== 'object') {
        const error = new Error('Order submission payload is required');
        error.status = 400;
        throw error;
      }

      if (!submission.id) {
        const error = new Error('Order identifier is required');
        error.status = 400;
        throw error;
      }

      await telegramService.sendOrderNotification(submission);
      res.status(202).json({ status: 'sent' });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
