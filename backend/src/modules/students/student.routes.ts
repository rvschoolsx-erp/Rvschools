import { Router, Request, Response } from 'express';
import { studentService } from './student.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { ApiResponse } from '../../shared/types';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/students
 * Query: page, limit, search, classId, sectionId, status
 * Access: admin, teacher
 */
router.get('/', authorize('admin', 'teacher'), asyncHandler(async (req: Request, res: Response) => {
  const data = await studentService.findAll({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string,
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    status: (req.query.status as string) || 'active',
  });
  res.json({ success: true, message: 'Students fetched', ...data });
}));

/**
 * GET /api/v1/students/stats
 * Access: admin
 */
router.get('/stats', authorize('admin'), asyncHandler(async (_req: Request, res: Response) => {
  const stats = await studentService.getStudentStats();
  res.json({ success: true, message: 'Student statistics', data: stats });
}));

/**
 * GET /api/v1/students/:id
 * Access: admin, teacher, parent (own child), student (self)
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const data = await studentService.findById(req.params.id);
  res.json({ success: true, message: 'Student found', data });
}));

/**
 * POST /api/v1/students
 * Body: CreateStudentDto
 * Access: admin
 */
router.post('/', authorize('admin'), asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.create(req.body);
  res.status(201).json({ success: true, message: 'Student enrolled successfully', data: result } as ApiResponse);
}));

/**
 * PATCH /api/v1/students/:id
 * Access: admin
 */
router.patch('/:id', authorize('admin'), asyncHandler(async (req: Request, res: Response) => {
  await studentService.update(req.params.id, req.body);
  res.json({ success: true, message: 'Student updated successfully' });
}));

/**
 * DELETE /api/v1/students/:id
 * Access: admin
 */
router.delete('/:id', authorize('admin'), asyncHandler(async (req: Request, res: Response) => {
  await studentService.delete(req.params.id);
  res.json({ success: true, message: 'Student deactivated successfully' });
}));

export default router;
