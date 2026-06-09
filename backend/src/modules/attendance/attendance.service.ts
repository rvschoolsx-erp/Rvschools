import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction, pool } from '../../config/database';
import { cache } from '../../config/redis';
import { AppError } from '../../middleware/error.middleware';
import { notificationService } from '../notifications/notification.service';
import { AttendanceStatus } from '../../shared/types';

interface MarkAttendanceDto {
  sectionId: string;
  date: string;
  attendance: Array<{
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }>;
  markedBy: string;
}

export class AttendanceService {
  async markAttendance(dto: MarkAttendanceDto) {
    return withTransaction(async (client) => {
      const results = [];

      for (const record of dto.attendance) {
        const id = uuidv4();
        await client.query(
          `INSERT INTO attendance (id, student_id, section_id, date, status, marked_by, remarks)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (student_id, date, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::UUID))
           DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, updated_at = NOW()`,
          [id, record.studentId, dto.sectionId, dto.date, record.status, dto.markedBy, record.remarks || null]
        );
        results.push(record.studentId);
      }

      // Notify parents of absent students
      const absentStudents = dto.attendance.filter(a => a.status === 'absent');
      for (const absent of absentStudents) {
        await notificationService.notifyAbsence(absent.studentId, dto.date).catch(() => {});
      }

      await cache.delPattern(`${cache.prefix.cache}attendance:*`);
      return { marked: results.length };
    });
  }

  async getSectionAttendance(sectionId: string, date: string) {
    const cacheKey = `${cache.prefix.cache}attendance:section:${sectionId}:${date}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await query(
      `SELECT a.id, a.status, a.remarks, a.date,
              s.id AS student_id, s.admission_number, s.roll_number,
              u.first_name, u.last_name, u.avatar_url
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $2
       WHERE s.section_id = $1 AND s.admission_status = 'active' AND u.deleted_at IS NULL
       ORDER BY s.roll_number NULLS LAST, u.first_name`,
      [sectionId, date]
    );

    const result = { date, sectionId, students: rows, total: rows.length };
    await cache.set(cacheKey, result, 60);
    return result;
  }

  async getStudentAttendance(studentId: string, startDate: string, endDate: string) {
    const { rows } = await query(
      `SELECT date, status, remarks
       FROM attendance
       WHERE student_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [studentId, startDate, endDate]
    );

    const total = rows.length;
    const present = rows.filter(r => ['present', 'late'].includes(r.status)).length;
    const absent = rows.filter(r => r.status === 'absent').length;
    const late = rows.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

    return {
      records: rows,
      summary: { total, present, absent, late, percentage: parseFloat(percentage) },
    };
  }

  async getMonthlyReport(sectionId: string, year: number, month: number) {
    const cacheKey = `${cache.prefix.cache}attendance:monthly:${sectionId}:${year}-${month}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         s.id AS student_id, s.admission_number, s.roll_number,
         u.first_name, u.last_name,
         COUNT(*) AS total_days,
         COUNT(*) FILTER (WHERE a.status IN ('present','late')) AS present_days,
         COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_days,
         ROUND(COUNT(*) FILTER (WHERE a.status IN ('present','late'))::DECIMAL / NULLIF(COUNT(*),0) * 100, 2) AS percentage
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date BETWEEN $2 AND $3
       WHERE s.section_id = $1 AND s.admission_status = 'active'
       GROUP BY s.id, u.first_name, u.last_name, s.admission_number, s.roll_number
       ORDER BY percentage DESC`,
      [sectionId, startDate, endDate]
    );

    const result = { year, month, sectionId, data: rows };
    await cache.set(cacheKey, result, 300);
    return result;
  }

  async getDashboardStats(schoolId?: string) {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${cache.prefix.cache}attendance:dashboard:${today}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT a.student_id) FILTER (WHERE a.date = $1 AND a.status IN ('present','late')) AS present_today,
        COUNT(DISTINCT a.student_id) FILTER (WHERE a.date = $1 AND a.status = 'absent') AS absent_today,
        ROUND(
          COUNT(DISTINCT a.student_id) FILTER (WHERE a.date = $1 AND a.status IN ('present','late'))::DECIMAL /
          NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
        ) AS today_percentage
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id
      WHERE s.admission_status = 'active'
    `, [today]);

    await cache.set(cacheKey, rows[0], 120);
    return rows[0];
  }
}

export const attendanceService = new AttendanceService();
