import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import * as service from './school-settings.service';

const router = Router();

// Public — frontend reads this to render school branding without auth
router.get('/', asyncHandler(async (_req, res) => {
  const settings = await service.getSettings();
  res.json({ success: true, data: settings });
}));

// Admin only — update school branding/settings
router.put('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const settings = await service.updateSettings(req.body);
  res.json({ success: true, data: settings, message: 'Settings updated successfully' });
}));

export default router;
