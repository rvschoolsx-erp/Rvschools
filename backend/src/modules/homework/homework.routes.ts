import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler, AppError } from '../../middleware/error.middleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sectionId, subjectId, limit = 20, page = 1 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { rows } = await pool.query(
    `SELECT h.id, h.title, h.description, h.due_date, h.max_marks, h.attachment_url,
            h.created_at, sub.name AS subject_name, sec.name AS section_name,
            u.first_name AS teacher_first, u.last_name AS teacher_last,
            (SELECT COUNT(*) FROM homework_submissions hs WHERE hs.homework_id = h.id) AS submissions
     FROM homework h
     JOIN subjects sub ON sub.id = h.subject_id
     JOIN sections sec ON sec.id = h.section_id
     JOIN users u ON u.id = h.teacher_id
     WHERE ($1::UUID IS NULL OR h.section_id = $1)
       AND ($2::UUID IS NULL OR h.subject_id = $2)
     ORDER BY h.due_date DESC
     LIMIT $3 OFFSET $4`,
    [sectionId || null, subjectId || null, limit, offset]
  );

  res.json({ success: true, message: 'Homework list', data: rows });
}));

router.post('/', authorize('admin', 'teacher'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, sectionId, subjectId, dueDate, maxMarks, attachmentUrl } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO homework (id, teacher_id, section_id, subject_id, title, description, due_date, max_marks, attachment_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [uuidv4(), req.user!.userId, sectionId, subjectId, title, description, dueDate, maxMarks || null, attachmentUrl || null]
  );
  res.status(201).json({ success: true, message: 'Homework assigned', data: { id: rows[0].id } });
}));

router.post('/:id/submit', authorize('student'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, attachmentUrl } = req.body;
  await pool.query(
    `INSERT INTO homework_submissions (id, homework_id, student_id, attachment_url, status)
     VALUES ($1,$2,$3,$4,'submitted') ON CONFLICT (homework_id, student_id) DO UPDATE SET attachment_url = EXCLUDED.attachment_url, submitted_at = NOW()`,
    [uuidv4(), req.params.id, studentId, attachmentUrl || null]
  );
  res.json({ success: true, message: 'Homework submitted' });
}));

export default router;
