import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction, pool } from '../../config/database';
import { cache } from '../../config/redis';
import { AppError } from '../../middleware/error.middleware';

interface EnterMarksDto {
  examId: string;
  marks: Array<{
    studentId: string;
    subjectId: string;
    marksObtained?: number;
    practicalMarks?: number;
    isAbsent?: boolean;
    remarks?: string;
  }>;
  enteredBy: string;
}

export class MarksService {
  async enterMarks(dto: EnterMarksDto) {
    return withTransaction(async (client) => {
      for (const mark of dto.marks) {
        await client.query(
          `INSERT INTO marks (id, exam_id, student_id, subject_id, marks_obtained, practical_marks, is_absent, remarks, entered_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (exam_id, student_id, subject_id)
           DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained,
             practical_marks = EXCLUDED.practical_marks,
             is_absent = EXCLUDED.is_absent,
             remarks = EXCLUDED.remarks,
             updated_at = NOW()`,
          [uuidv4(), dto.examId, mark.studentId, mark.subjectId,
            mark.marksObtained ?? null, mark.practicalMarks ?? null,
            mark.isAbsent ?? false, mark.remarks ?? null, dto.enteredBy]
        );
      }

      await cache.delPattern(`${cache.prefix.cache}marks:${dto.examId}:*`);
      return { entered: dto.marks.length };
    });
  }

  async getExamMarks(examId: string, sectionId?: string) {
    const cacheKey = `${cache.prefix.cache}marks:${examId}:${sectionId || 'all'}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const params: unknown[] = [examId];
    let extraCondition = '';
    if (sectionId) {
      extraCondition = ' AND s.section_id = $2';
      params.push(sectionId);
    }

    const { rows } = await pool.query(
      `SELECT m.id, m.marks_obtained, m.practical_marks, m.is_absent, m.remarks,
              s.id AS student_id, s.admission_number, s.roll_number,
              u.first_name, u.last_name,
              sub.name AS subject_name, sub.code AS subject_code, sub.max_marks,
              es.passing_marks
       FROM marks m
       JOIN students s ON s.id = m.student_id
       JOIN users u ON u.id = s.user_id
       JOIN subjects sub ON sub.id = m.subject_id
       JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
       WHERE m.exam_id = $1${extraCondition}
       ORDER BY s.roll_number, sub.name`,
      params
    );

    const result = { examId, data: rows };
    await cache.set(cacheKey, result, 120);
    return result;
  }

  async getStudentMarks(studentId: string, academicYearId?: string) {
    const params: unknown[] = [studentId];
    let yearCondition = '';
    if (academicYearId) {
      yearCondition = ' AND e.academic_year_id = $2';
      params.push(academicYearId);
    }

    const { rows } = await pool.query(
      `SELECT m.marks_obtained, m.practical_marks, m.is_absent,
              e.name AS exam_name, e.exam_type,
              sub.name AS subject_name, sub.code AS subject_code, sub.max_marks,
              es.passing_marks,
              CASE WHEN m.is_absent THEN 'A'
                   WHEN (m.marks_obtained + COALESCE(m.practical_marks,0)) >= es.passing_marks THEN 'P'
                   ELSE 'F' END AS result_status
       FROM marks m
       JOIN exams e ON e.id = m.exam_id
       JOIN subjects sub ON sub.id = m.subject_id
       JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
       WHERE m.student_id = $1${yearCondition}
       ORDER BY e.start_date DESC, sub.name`,
      params
    );

    return rows;
  }

  async generateReportCard(examId: string, studentId: string) {
    const { rows: marks } = await pool.query(
      `SELECT m.marks_obtained, m.practical_marks, m.is_absent,
              sub.name AS subject_name, sub.max_marks,
              es.max_marks AS exam_max_marks, es.passing_marks
       FROM marks m
       JOIN subjects sub ON sub.id = m.subject_id
       JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
       WHERE m.exam_id = $1 AND m.student_id = $2`,
      [examId, studentId]
    );

    const totalObtained = marks.reduce((sum, m) => {
      if (m.is_absent) return sum;
      return sum + (Number(m.marks_obtained) || 0) + (Number(m.practical_marks) || 0);
    }, 0);

    const totalMax = marks.reduce((sum, m) => sum + Number(m.exam_max_marks), 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    const grade = percentage >= 91 ? 'A+' : percentage >= 81 ? 'A' : percentage >= 71 ? 'B+'
      : percentage >= 61 ? 'B' : percentage >= 51 ? 'C+' : percentage >= 41 ? 'C'
      : percentage >= 33 ? 'D' : 'F';

    // Calculate rank
    const { rows: rankData } = await pool.query(
      `SELECT student_id,
        SUM(marks_obtained + COALESCE(practical_marks,0)) AS total
       FROM marks
       WHERE exam_id = $1
       GROUP BY student_id
       ORDER BY total DESC`,
      [examId]
    );

    const rank = rankData.findIndex(r => r.student_id === studentId) + 1;

    // Upsert report card
    await pool.query(
      `INSERT INTO report_cards (id, exam_id, student_id, total_marks, max_total_marks, percentage, grade, rank_in_class, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE)
       ON CONFLICT (exam_id, student_id)
       DO UPDATE SET total_marks=$4, max_total_marks=$5, percentage=$6, grade=$7, rank_in_class=$8`,
      [uuidv4(), examId, studentId, totalObtained, totalMax, percentage.toFixed(2), grade, rank]
    );

    return { examId, studentId, totalObtained, totalMax, percentage: percentage.toFixed(2), grade, rank, subjects: marks };
  }

  async getClassPerformance(examId: string) {
    const cacheKey = `${cache.prefix.cache}marks:class-performance:${examId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await pool.query(
      `SELECT sub.name AS subject, sub.code,
              ROUND(AVG(m.marks_obtained), 2) AS avg_marks,
              MAX(m.marks_obtained) AS max_marks,
              MIN(m.marks_obtained) AS min_marks,
              COUNT(*) FILTER (WHERE m.marks_obtained >= es.passing_marks) AS passed,
              COUNT(*) AS total,
              ROUND(COUNT(*) FILTER (WHERE m.marks_obtained >= es.passing_marks)::DECIMAL / NULLIF(COUNT(*),0) * 100, 2) AS pass_percentage
       FROM marks m
       JOIN subjects sub ON sub.id = m.subject_id
       JOIN exam_schedules es ON es.exam_id = m.exam_id AND es.subject_id = m.subject_id
       WHERE m.exam_id = $1 AND m.is_absent = FALSE
       GROUP BY sub.id, sub.name, sub.code
       ORDER BY avg_marks DESC`,
      [examId]
    );

    await cache.set(cacheKey, rows, 300);
    return rows;
  }
}

export const marksService = new MarksService();
