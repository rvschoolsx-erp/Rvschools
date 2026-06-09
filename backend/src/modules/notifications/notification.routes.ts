import { Router, Response } from 'express';
import { notificationService } from './notification.service';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const unreadOnly = req.query.unread === 'true';
  const data = await notificationService.getUserNotifications(req.user!.userId, unreadOnly);
  res.json({ success: true, message: 'Notifications', data });
}));

router.patch('/read', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { ids } = req.body;
  await notificationService.markAsRead(req.user!.userId, ids);
  res.json({ success: true, message: 'Marked as read' });
}));

router.post('/broadcast', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, body, roles } = req.body;
  await notificationService.broadcastAnnouncement(title, body, req.user!.userId, roles);
  res.status(201).json({ success: true, message: 'Announcement broadcast sent' });
}));

export default router;
