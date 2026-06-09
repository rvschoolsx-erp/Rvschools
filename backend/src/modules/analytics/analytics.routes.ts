import { Router, Response } from 'express';
import { analyticsService } from './analytics.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';
import { pool } from '../../config/database';

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

router.get('/parent', authorize('parent', 'admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rows } = await pool.query(
    `SELECT s.id AS student_id, u.first_name, u.last_name,
            c.name AS class_name, sec.name AS section_name,
            s.admission_number, s.roll_number,
            sp.is_primary
     FROM parents p
     JOIN student_parents sp ON sp.parent_id = p.id
     JOIN students s          ON s.id = sp.student_id AND s.admission_status = 'active'
     JOIN users u             ON u.id = s.user_id
     JOIN sections sec        ON sec.id = s.section_id
     JOIN classes c           ON c.id = sec.class_id
     WHERE p.user_id = $1
     ORDER BY sp.is_primary DESC`,
    [req.user!.userId]
  );
  res.json({ success: true, message: 'Parent children', data: { children: rows } });
}));

export default router;
