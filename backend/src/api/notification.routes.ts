import { Router } from 'express';
import { db } from '../config/database';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect all notification routes
router.use(verifyFirebaseToken);

// Get all notifications for current user
router.get('/', async (req, res) => {
  try {
    const notifications = await db.notifications.getAllForUser(req.user!.uid);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const success = await db.notifications.markAsRead(req.params.id, req.user!.uid);
    if (!success) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

export default router;
