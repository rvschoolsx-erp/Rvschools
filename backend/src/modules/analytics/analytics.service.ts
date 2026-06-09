import { pool } from '../../config/database';
import { cache } from '../../config/redis';

export class AnalyticsService {
  async getAdminDashboard() {
    const cacheKey = `${cache.prefix.cache}analytics:admin:dashboard`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const [students, fees, attendance, exams] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE admission_status='active') AS total,
          COUNT(*) FILTER (WHERE gender='male' AND admission_status='active') AS male,
          COUNT(*) FILTER (WHERE gender='female' AND admission_status='active') AS female,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_this_month
        FROM students
      `),

      pool.query(`
        SELECT
          SUM(amount_due) AS total_due,
          SUM(amount_paid) AS total_collected,
          SUM(amount_due - amount_paid) AS pending,
          ROUND(SUM(amount_paid) / NULLIF(SUM(amount_due),0) * 100, 2) AS collection_rate
        FROM fees
      `),

      pool.query(`
        SELECT
          ROUND(
            COUNT(*) FILTER (WHERE status IN ('present','late'))::DECIMAL /
            NULLIF(COUNT(*),0) * 100, 2
          ) AS overall_percentage,
          COUNT(*) FILTER (WHERE date = CURRENT_DATE AND status = 'present') AS present_today,
          COUNT(*) FILTER (WHERE date = CURRENT_DATE AND status = 'absent') AS absent_today
        FROM attendance
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total_exams,
          COUNT(*) FILTER (WHERE is_published = TRUE) AS published,
          COUNT(*) FILTER (WHERE start_date > CURRENT_DATE) AS upcoming
        FROM exams
      `),
    ]);

    // Monthly revenue trend (last 6 months)
    const { rows: revenueTrend } = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') AS month,
        SUM(amount) AS collected
      FROM fee_transactions
      WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY DATE_TRUNC('month', payment_date)
    `);

    // Attendance trend (last 30 days)
    const { rows: attendanceTrend } = await pool.query(`
      SELECT
        date,
        COUNT(*) FILTER (WHERE status IN ('present','late')) AS present,
        COUNT(*) FILTER (WHERE status = 'absent') AS absent,
        COUNT(*) AS total
      FROM attendance
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date
    `);

    // Class-wise student count
    const { rows: classDistribution } = await pool.query(`
      SELECT c.name AS class_name, c.numeric_level, COUNT(s.id) AS student_count
      FROM classes c
      JOIN sections sec ON sec.class_id = c.id
      JOIN students s ON s.section_id = sec.id AND s.admission_status = 'active'
      JOIN academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE
      GROUP BY c.id, c.name, c.numeric_level
      ORDER BY c.numeric_level
    `);

    const result = {
      students: students.rows[0],
      fees: fees.rows[0],
      attendance: attendance.rows[0],
      exams: exams.rows[0],
      revenueTrend,
      attendanceTrend,
      classDistribution,
    };

    await cache.set(cacheKey, result, 300);
    return result;
  }

  async getTeacherDashboard(teacherId: string) {
    const cacheKey = `${cache.prefix.cache}analytics:teacher:${teacherId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const [sections, homework, marks] = await Promise.all([
      pool.query(`
        SELECT sec.id, sec.name AS section_name, c.name AS class_name,
               COUNT(s.id) AS student_count
        FROM sections sec
        JOIN classes c ON c.id = sec.class_id
        JOIN students s ON s.section_id = sec.id AND s.admission_status = 'active'
        WHERE sec.class_teacher_id = $1
        GROUP BY sec.id, sec.name, c.name
      `, [teacherId]),

      pool.query(`
        SELECT COUNT(*) AS total_assigned,
               COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS this_week
        FROM homework
        WHERE teacher_id = $1
      `, [teacherId]),

      pool.query(`
        SELECT ROUND(AVG(m.marks_obtained / NULLIF(es.max_marks, 0) * 100), 2) AS avg_performance
        FROM marks m
        JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
        WHERE m.entered_by = $1 AND m.is_absent = FALSE
      `, [teacherId]),
    ]);

    const result = { sections: sections.rows, homework: homework.rows[0], marks: marks.rows[0] };
    await cache.set(cacheKey, result, 180);
    return result;
  }

  async getStudentDashboard(studentId: string) {
    const cacheKey = `${cache.prefix.cache}analytics:student:${studentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [attendance, marks, homework, fees] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS total_days,
          COUNT(*) FILTER (WHERE status IN ('present','late')) AS present,
          ROUND(COUNT(*) FILTER (WHERE status IN ('present','late'))::DECIMAL / NULLIF(COUNT(*),0) * 100, 2) AS percentage
        FROM attendance
        WHERE student_id = $1 AND date >= $2 AND date <= $3
      `, [studentId, monthStart, today]),

      pool.query(`
        SELECT ROUND(AVG((m.marks_obtained + COALESCE(m.practical_marks,0)) / NULLIF(es.max_marks,0) * 100), 2) AS avg_percentage
        FROM marks m
        JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
        WHERE m.student_id = $1 AND m.is_absent = FALSE
      `, [studentId]),

      pool.query(`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE due_date < CURRENT_DATE) AS overdue
        FROM homework h
        JOIN sections sec ON sec.id = h.section_id
        JOIN students s ON s.section_id = sec.id
        WHERE s.id = $1 AND NOT EXISTS (
          SELECT 1 FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = $1
        )
      `, [studentId]),

      pool.query(`
        SELECT SUM(amount_due - amount_paid) AS pending_fees
        FROM fees WHERE student_id = $1 AND status NOT IN ('paid','waived')
      `, [studentId]),
    ]);

    const result = {
      attendance: attendance.rows[0],
      marks: marks.rows[0],
      homework: homework.rows[0],
      fees: fees.rows[0],
    };

    await cache.set(cacheKey, result, 120);
    return result;
  }
}

export const analyticsService = new AnalyticsService();
