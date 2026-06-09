import { Router, Request, Response } from 'express';
import { marksService } from './marks.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await marksService.enterMarks({ ...req.body, enteredBy: req.user!.userId });
  res.status(201).json({ success: true, message: 'Marks entered successfully', data: result });
}));

router.get('/exam/:examId', asyncHandler(async (req: Request, res: Response) => {
  const data = await marksService.getExamMarks(req.params.examId, req.query.sectionId as string);
  res.json({ success: true, message: 'Exam marks', data });
}));

router.get('/student/:studentId', asyncHandler(async (req: Request, res: Response) => {
  const data = await marksService.getStudentMarks(req.params.studentId, req.query.academicYearId as string);
  res.json({ success: true, message: 'Student marks', data });
}));

router.get('/exam/:examId/performance', asyncHandler(async (req: Request, res: Response) => {
  const data = await marksService.getClassPerformance(req.params.examId);
  res.json({ success: true, message: 'Class performance', data });
}));

router.post('/report-card', authorize('admin', 'teacher'), asyncHandler(async (req: Request, res: Response) => {
  const { examId, studentId } = req.body;
  const data = await marksService.generateReportCard(examId, studentId);
  res.json({ success: true, message: 'Report card generated', data });
}));

export default router;
