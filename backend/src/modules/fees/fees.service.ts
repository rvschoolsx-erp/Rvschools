import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction, pool } from '../../config/database';
import { cache } from '../../config/redis';
import { AppError } from '../../middleware/error.middleware';
import { notificationService } from '../notifications/notification.service';

interface RecordPaymentDto {
  feeId: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  collectedBy: string;
  remarks?: string;
}

export class FeesService {
  async getFeesByStudent(studentId: string, academicYearId?: string) {
    const params: unknown[] = [studentId];
    let yearCond = '';
    if (academicYearId) {
      yearCond = ' AND f.academic_year_id = $2';
      params.push(academicYearId);
    }

    const { rows } = await pool.query(
      `SELECT f.id, f.amount_due, f.amount_paid, f.discount, f.fine,
              f.due_date, f.status, f.created_at,
              fs.fee_type, fs.is_recurring,
              ay.name AS academic_year
       FROM fees f
       JOIN fee_structures fs ON fs.id = f.fee_structure_id
       JOIN academic_years ay ON ay.id = f.academic_year_id
       WHERE f.student_id = $1${yearCond}
       ORDER BY f.due_date ASC`,
      params
    );

    const totalDue = rows.reduce((s, r) => s + Number(r.amount_due), 0);
    const totalPaid = rows.reduce((s, r) => s + Number(r.amount_paid), 0);
    const totalPending = totalDue - totalPaid;

    return { fees: rows, summary: { totalDue, totalPaid, totalPending } };
  }

  async recordPayment(dto: RecordPaymentDto) {
    return withTransaction(async (client) => {
      const { rows: feeRows } = await client.query(
        'SELECT * FROM fees WHERE id = $1 AND student_id = $2 FOR UPDATE',
        [dto.feeId, dto.studentId]
      );

      const fee = feeRows[0];
      if (!fee) throw new AppError('Fee record not found', 404);

      const remaining = Number(fee.amount_due) - Number(fee.amount_paid);
      if (dto.amount > remaining) throw new AppError(`Cannot pay more than due amount: ₹${remaining}`, 400);

      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      await client.query(
        `INSERT INTO fee_transactions (id, fee_id, student_id, amount, payment_method, transaction_ref, receipt_number, collected_by, remarks)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uuidv4(), dto.feeId, dto.studentId, dto.amount, dto.paymentMethod,
          dto.transactionRef || null, receiptNumber, dto.collectedBy, dto.remarks || null]
      );

      const newPaid = Number(fee.amount_paid) + dto.amount;
      const newStatus = newPaid >= Number(fee.amount_due) ? 'paid' : 'partial';

      await client.query(
        'UPDATE fees SET amount_paid = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newPaid, newStatus, dto.feeId]
      );

      await cache.delPattern(`${cache.prefix.cache}fees:${dto.studentId}:*`);

      // Send receipt notification
      await notificationService.sendFeeReceipt(dto.studentId, dto.amount, receiptNumber).catch(() => {});

      return { receiptNumber, newPaid, status: newStatus };
    });
  }

  async getFeeDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${cache.prefix.cache}fees:dashboard:${today}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await pool.query(`
      SELECT
        SUM(amount_due) AS total_due,
        SUM(amount_paid) AS total_collected,
        SUM(amount_due - amount_paid) AS total_pending,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        SUM(amount_paid) FILTER (WHERE created_at::DATE = CURRENT_DATE) AS collected_today
      FROM fees
    `);

    // Monthly collection trend
    const { rows: monthlyTrend } = await pool.query(`
      SELECT
        DATE_TRUNC('month', payment_date) AS month,
        SUM(amount) AS collected
      FROM fee_transactions
      WHERE payment_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `);

    const result = { ...rows[0], monthlyTrend };
    await cache.set(cacheKey, result, 300);
    return result;
  }

  async getOverdueFees() {
    const { rows } = await pool.query(`
      SELECT f.id, f.amount_due, f.amount_paid, f.due_date,
             f.amount_due - f.amount_paid AS balance,
             s.admission_number, u.first_name, u.last_name, u.phone,
             c.name AS class_name, sec.name AS section_name,
             fs.fee_type
      FROM fees f
      JOIN students s ON s.id = f.student_id
      JOIN users u ON u.id = s.user_id
      JOIN fee_structures fs ON fs.id = f.fee_structure_id
      LEFT JOIN sections sec ON sec.id = s.section_id
      LEFT JOIN classes c ON c.id = sec.class_id
      WHERE f.due_date < CURRENT_DATE AND f.status NOT IN ('paid','waived')
      ORDER BY f.due_date ASC
    `);

    return rows;
  }

  async generateFeeForClass(classId: string, academicYearId: string, feeStructureId: string) {
    const { rows: students } = await pool.query(
      `SELECT s.id FROM students s
       JOIN sections sec ON sec.id = s.section_id
       WHERE sec.class_id = $1 AND s.admission_status = 'active'`,
      [classId]
    );

    const { rows: structure } = await pool.query(
      'SELECT * FROM fee_structures WHERE id = $1',
      [feeStructureId]
    );

    if (!structure[0]) throw new AppError('Fee structure not found', 404);

    return withTransaction(async (client) => {
      let count = 0;
      for (const student of students) {
        await client.query(
          `INSERT INTO fees (id, student_id, fee_structure_id, academic_year_id, amount_due, due_date)
           VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [uuidv4(), student.id, feeStructureId, academicYearId,
            structure[0].amount, structure[0].due_date || new Date().toISOString().split('T')[0]]
        );
        count++;
      }
      return { generated: count };
    });
  }
}

export const feesService = new FeesService();
