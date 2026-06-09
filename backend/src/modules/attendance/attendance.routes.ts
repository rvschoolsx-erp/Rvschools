import { Router, Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

/**
 * POST /api/v1/attendance
 * Body: { sectionId, date, attendance: [{studentId, status, remarks}] }
 * Access: admin, teacher
 */
router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await attendanceService.markAttendance({
    ...req.body,
    markedBy: req.user!.userId,
  });
  res.status(201).json({ success: true, message: 'Attendance marked', data: result });
}));

/**
 * GET /api/v1/attendance/section/:sectionId?date=YYYY-MM-DD
 * Access: admin, teacher
 */
router.get('/section/:sectionId', authorize('admin', 'teacher'), asyncHandler(async (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const data = await attendanceService.getSectionAttendance(req.params.sectionId, date);
  res.json({ success: true, message: 'Attendance fetched', data });
}));

/**
 * GET /api/v1/attendance/student/:studentId?startDate=&endDate=
 * Access: admin, teacher, parent, student
 */
router.get('/student/:studentId', asyncHandler(async (req: Request, res: Response) => {
  const startDate = (req.query.startDate as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const endDate = (req.query.endDate as string) || new Date().toISOString().split('T')[0];
  const data = await attendanceService.getStudentAttendance(req.params.studentId, startDate, endDate);
  res.json({ success: true, message: 'Student attendance', data });
}));

/**
 * GET /api/v1/attendance/report/monthly?sectionId=&year=&month=
 * Access: admin, teacher
 */
router.get('/report/monthly', authorize('admin', 'teacher'), asyncHandler(async (req: Request, res: Response) => {
  const { sectionId, year, month } = req.query;
  const data = await attendanceService.getMonthlyReport(
    sectionId as string,
    Number(year) || new Date().getFullYear(),
    Number(month) || new Date().getMonth() + 1
  );
  res.json({ success: true, message: 'Monthly attendance report', data });
}));

/**
 * GET /api/v1/attendance/dashboard
 * Access: admin
 */
router.get('/dashboard', authorize('admin'), asyncHandler(async (_req: Request, res: Response) => {
  const data = await attendanceService.getDashboardStats();
  res.json({ success: true, message: 'Attendance dashboard', data });
}));

export default router;
