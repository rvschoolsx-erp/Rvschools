import { Router, Request, Response } from 'express';
import { query, pool } from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { AppError } from '../../middleware/error.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('admin'), asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search as string || '';
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `SELECT t.id, t.employee_id, t.designation, t.department, t.joining_date,
            t.experience_years, t.qualification, t.is_active,
            u.first_name, u.last_name, u.email, u.phone, u.avatar_url
     FROM teachers t JOIN users u ON u.id = t.user_id
     WHERE u.deleted_at IS NULL AND t.is_active = TRUE
       AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR t.employee_id ILIKE $1)
     ORDER BY u.first_name
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );

  res.json({ success: true, message: 'Teachers', data: rows });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
     FROM teachers t JOIN users u ON u.id = t.user_id
     WHERE t.id = $1 AND u.deleted_at IS NULL`,
    [req.params.id]
  );
  if (!rows[0]) throw new AppError('Teacher not found', 404);
  res.json({ success: true, message: 'Teacher found', data: rows[0] });
}));

export default router;
