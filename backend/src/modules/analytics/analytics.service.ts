import { pool } from '../../config/database';
import { cache } from '../../config/redis';
import { logger } from '../../shared/utils/logger';

async function safeQuery<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
  try {
    const result = await pool.query(sql, params as unknown[]);
    return result.rows as T[];
  } catch (err) {
    logger.warn('Analytics query failed', { sql: sql.slice(0, 120), error: (err as Error).message });
    return [];
  }
}

export class AnalyticsService {
  async getAdminDashboard() {
    const cacheKey = `${cache.prefix.cache}analytics:admin:dashboard`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const [studentsRows, feesRows, attendanceRows, examsRows, teachersRows] = await Promise.all([
      safeQuery(`
        SELECT
          COUNT(*) FILTER (WHERE admission_status = 'active') AS total,
          COUNT(*) FILTER (WHERE gender = 'male'   AND admission_status = 'active') AS male,
          COUNT(*) FILTER (WHERE gender = 'female' AND admission_status = 'active') AS female,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_this_month
        FROM students
      `),

      safeQuery(`
        SELECT
          COALESCE(SUM(amount_due), 0)                                              AS total_due,
          COALESCE(SUM(amount_paid), 0)                                             AS total_collected,
          COALESCE(SUM(amount_due - amount_paid), 0)                                AS pending,
          COALESCE(ROUND(SUM(amount_paid) / NULLIF(SUM(amount_due), 0) * 100, 2), 0) AS collection_rate,
          COUNT(*) FILTER (WHERE status = 'paid')    AS paid_count,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
          COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
          COALESCE(SUM(amount_paid) FILTER (WHERE updated_at::DATE = CURRENT_DATE), 0) AS collected_today
        FROM fees
      `),

      safeQuery(`
        SELECT
          COALESCE(ROUND(
            COUNT(*) FILTER (WHERE status IN ('present','late'))::DECIMAL /
            NULLIF(COUNT(*), 0) * 100, 2
          ), 0)                                                                    AS overall_percentage,
          COUNT(*) FILTER (WHERE date = CURRENT_DATE AND status = 'present')       AS present_today,
          COUNT(*) FILTER (WHERE date = CURRENT_DATE AND status = 'absent')        AS absent_today
        FROM attendance
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      `),

      safeQuery(`
        SELECT
          COUNT(*)                                             AS total,
          COUNT(*) FILTER (WHERE is_published = TRUE)         AS published,
          COUNT(*) FILTER (WHERE start_date > CURRENT_DATE)   AS upcoming
        FROM exams
      `),

      safeQuery(`
        SELECT COUNT(*) AS total FROM teachers WHERE is_active = TRUE
      `),
    ]);

    const revenueTrend = await safeQuery(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') AS month,
        COALESCE(SUM(amount), 0) AS collected
      FROM fee_transactions
      WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY DATE_TRUNC('month', payment_date)
    `);

    const attendanceTrend = await safeQuery(`
      SELECT
        date,
        COUNT(*) FILTER (WHERE status IN ('present','late')) AS present,
        COUNT(*) FILTER (WHERE status = 'absent')            AS absent,
        COUNT(*)                                             AS total
      FROM attendance
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date
    `);

    const classDistribution = await safeQuery(`
      SELECT c.name AS class_name, c.numeric_level, COUNT(s.id) AS student_count
      FROM classes c
      JOIN sections sec ON sec.class_id = c.id
      JOIN students s   ON s.section_id = sec.id AND s.admission_status = 'active'
      JOIN academic_years ay ON ay.id = c.academic_year_id AND ay.is_current = TRUE
      GROUP BY c.id, c.name, c.numeric_level
      ORDER BY c.numeric_level
    `);

    const result = {
      students:          studentsRows[0]   ?? { total: 0, male: 0, female: 0, new_this_month: 0 },
      fees:              feesRows[0]       ?? { total_due: 0, total_collected: 0, pending: 0, collection_rate: 0, paid_count: 0, pending_count: 0, overdue_count: 0, collected_today: 0 },
      attendance:        attendanceRows[0] ?? { overall_percentage: 0, present_today: 0, absent_today: 0 },
      exams:             examsRows[0]      ?? { total: 0, published: 0, upcoming: 0 },
      teachers:          teachersRows[0]   ?? { total: 0 },
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
      safeQuery(`
        SELECT sec.id, sec.name AS section_name, c.name AS class_name,
               COUNT(s.id) AS student_count
        FROM sections sec
        JOIN classes c  ON c.id = sec.class_id
        JOIN students s ON s.section_id = sec.id AND s.admission_status = 'active'
        WHERE sec.class_teacher_id = $1
        GROUP BY sec.id, sec.name, c.name
      `, [teacherId]),

      safeQuery(`
        SELECT
          COUNT(*) AS total_assigned,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS this_week
        FROM homework
        WHERE teacher_id = $1
      `, [teacherId]),

      safeQuery(`
        SELECT ROUND(AVG(m.marks_obtained / NULLIF(es.max_marks, 0) * 100), 2) AS avg_performance
        FROM marks m
        JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
        WHERE m.entered_by = $1 AND m.is_absent = FALSE
      `, [teacherId]),
    ]);

    const result = {
      sections: sections,
      homework: homework[0] ?? { total_assigned: 0, this_week: 0 },
      marks:    marks[0]    ?? { avg_performance: 0 },
    };
    await cache.set(cacheKey, result, 180);
    return result;
  }

  async getStudentDashboard(studentId: string) {
    const cacheKey = `${cache.prefix.cache}analytics:student:${studentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const today      = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [attendance, marks, homework, fees] = await Promise.all([
      safeQuery(`
        SELECT
          COUNT(*)                                                                       AS total_days,
          COUNT(*) FILTER (WHERE status IN ('present','late'))                           AS present,
          COALESCE(ROUND(
            COUNT(*) FILTER (WHERE status IN ('present','late'))::DECIMAL /
            NULLIF(COUNT(*), 0) * 100, 2
          ), 0)                                                                          AS percentage
        FROM attendance
        WHERE student_id = $1 AND date >= $2 AND date <= $3
      `, [studentId, monthStart, today]),

      safeQuery(`
        SELECT COALESCE(ROUND(
          AVG((m.marks_obtained + COALESCE(m.practical_marks, 0)) / NULLIF(es.max_marks, 0) * 100), 2
        ), 0) AS avg_percentage
        FROM marks m
        JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
        WHERE m.student_id = $1 AND m.is_absent = FALSE
      `, [studentId]),

      safeQuery(`
        SELECT COUNT(*) AS total,
               COUNT(*) FILTER (WHERE due_date < CURRENT_DATE) AS overdue
        FROM homework h
        JOIN sections sec ON sec.id = h.section_id
        JOIN students s   ON s.section_id = sec.id
        WHERE s.id = $1 AND NOT EXISTS (
          SELECT 1 FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.student_id = $1
        )
      `, [studentId]),

      safeQuery(`
        SELECT COALESCE(SUM(amount_due - amount_paid), 0) AS pending_fees
        FROM fees WHERE student_id = $1 AND status NOT IN ('paid', 'waived')
      `, [studentId]),
    ]);

    const result = {
      attendance: attendance[0] ?? { total_days: 0, present: 0, percentage: 0 },
      marks:      marks[0]      ?? { avg_percentage: 0 },
      homework:   homework[0]   ?? { total: 0, overdue: 0 },
      fees:       fees[0]       ?? { pending_fees: 0 },
    };

    await cache.set(cacheKey, result, 120);
    return result;
  }
}

export const analyticsService = new AnalyticsService();
