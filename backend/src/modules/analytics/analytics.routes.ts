import { Router, Response } from 'express';
import { analyticsService } from './analytics.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.get('/admin', authorize('admin'), asyncHandler(async (_req, res) => {
  const data = await analyticsService.getAdminDashboard();
  res.json({ success: true, message: 'Admin analytics', data });
}));

router.get('/teacher', authorize('admin', 'teacher'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const teacherId = req.query.teacherId as string || req.user!.userId;
  const data = await analyticsService.getTeacherDashboard(teacherId);
  res.json({ success: true, message: 'Teacher analytics', data });
}));

router.get('/student/:studentId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getStudentDashboard(req.params.studentId);
  res.json({ success: true, message: 'Student analytics', data });
}));

export default router;
