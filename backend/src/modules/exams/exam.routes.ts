import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler, AppError } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { classId, examType, academicYearId } = req.query;
  const { rows } = await pool.query(
    `SELECT e.id, e.name, e.exam_type, e.start_date, e.end_date, e.is_published,
            c.name AS class_name, ay.name AS academic_year,
            COUNT(es.id) AS subject_count
     FROM exams e
     JOIN classes c ON c.id = e.class_id
     JOIN academic_years ay ON ay.id = e.academic_year_id
     LEFT JOIN exam_schedules es ON es.exam_id = e.id
     WHERE ($1::UUID IS NULL OR e.class_id = $1)
       AND ($2::exam_type IS NULL OR e.exam_type = $2)
       AND ($3::UUID IS NULL OR e.academic_year_id = $3)
     GROUP BY e.id, c.name, ay.name
     ORDER BY e.start_date DESC`,
    [classId || null, examType || null, academicYearId || null]
  );
  res.json({ success: true, message: 'Exams', data: rows });
}));

router.post('/', authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, classId, academicYearId, examType, startDate, endDate } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO exams (id, name, class_id, academic_year_id, exam_type, start_date, end_date, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [uuidv4(), name, classId, academicYearId, examType, startDate, endDate, req.user!.userId]
  );
  res.status(201).json({ success: true, message: 'Exam created', data: { id: rows[0].id } });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT e.*, c.name AS class_name,
            json_agg(json_build_object('subjectId', es.subject_id, 'subject', sub.name,
              'date', es.exam_date, 'maxMarks', es.max_marks, 'passingMarks', es.passing_marks)) AS schedule
     FROM exams e
     JOIN classes c ON c.id = e.class_id
     LEFT JOIN exam_schedules es ON es.exam_id = e.id
     LEFT JOIN subjects sub ON sub.id = es.subject_id
     WHERE e.id = $1
     GROUP BY e.id, c.name`,
    [req.params.id]
  );
  if (!rows[0]) throw new AppError('Exam not found', 404);
  res.json({ success: true, message: 'Exam details', data: rows[0] });
}));

router.patch('/:id/publish', authorize('admin'), asyncHandler(async (req: Request, res: Response) => {
  await pool.query('UPDATE exams SET is_published = TRUE WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Exam published' });
}));

export default router;
