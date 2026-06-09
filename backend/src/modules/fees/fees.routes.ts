import { Router, Request, Response } from 'express';
import { feesService } from './fees.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.get('/student/:studentId', asyncHandler(async (req: Request, res: Response) => {
  const data = await feesService.getFeesByStudent(req.params.studentId, req.query.academicYearId as string);
  res.json({ success: true, message: 'Student fees', data });
}));

router.get('/dashboard', authorize('admin'), asyncHandler(async (_req, res) => {
  const data = await feesService.getFeeDashboard();
  res.json({ success: true, message: 'Fee dashboard', data });
}));

router.get('/overdue', authorize('admin'), asyncHandler(async (_req, res) => {
  const data = await feesService.getOverdueFees();
  res.json({ success: true, message: 'Overdue fees', data });
}));

router.post('/payment', authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await feesService.recordPayment({ ...req.body, collectedBy: req.user!.userId });
  res.status(201).json({ success: true, message: 'Payment recorded', data: result });
}));

router.post('/generate', authorize('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { classId, academicYearId, feeStructureId } = req.body;
  const result = await feesService.generateFeeForClass(classId, academicYearId, feeStructureId);
  res.status(201).json({ success: true, message: 'Fees generated', data: result });
}));

export default router;
