import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query, withTransaction, pool } from '../../config/database';
import { cache } from '../../config/redis';
import { AppError } from '../../middleware/error.middleware';
import { env } from '../../config/env';
import { PaginatedResponse, PaginationQuery, Student } from '../../shared/types';

interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
  admissionNumber: string;
  rollNumber?: string;
  sectionId?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  aadharNumber?: string;
  religion?: string;
  caste?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  previousSchool?: string;
  admissionDate: string;
  parentDetails?: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    relationship?: string;
    occupation?: string;
  };
}

export class StudentService {
  async create(dto: CreateStudentDto) {
    return withTransaction(async (client) => {
      // Create user account
      const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
      const userId = uuidv4();

      await client.query(
        `INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, 'student', $5, $6)`,
        [userId, dto.email || null, dto.phone || null, passwordHash, dto.firstName, dto.lastName]
      );

      const studentId = uuidv4();
      await client.query(
        `INSERT INTO students (id, user_id, admission_number, roll_number, section_id,
          date_of_birth, gender, blood_group, aadhar_number, religion, caste,
          address, city, state, pincode, previous_school, admission_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [studentId, userId, dto.admissionNumber, dto.rollNumber || null, dto.sectionId || null,
          dto.dateOfBirth, dto.gender, dto.bloodGroup || null, dto.aadharNumber || null,
          dto.religion || null, dto.caste || null, dto.address || null, dto.city || null,
          dto.state || null, dto.pincode || null, dto.previousSchool || null, dto.admissionDate]
      );

      // Create parent if provided
      if (dto.parentDetails) {
        const parentPasswordHash = await bcrypt.hash(dto.phone || dto.admissionNumber, env.BCRYPT_ROUNDS);
        const parentUserId = uuidv4();
        await client.query(
          `INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name)
           VALUES ($1,$2,$3,$4,'parent',$5,$6)`,
          [parentUserId, dto.parentDetails.email || null, dto.parentDetails.phone,
            parentPasswordHash, dto.parentDetails.firstName, dto.parentDetails.lastName]
        );

        const parentId = uuidv4();
        await client.query(
          `INSERT INTO parents (id, user_id, relationship, occupation) VALUES ($1,$2,$3,$4)`,
          [parentId, parentUserId, dto.parentDetails.relationship || 'parent', dto.parentDetails.occupation || null]
        );

        await client.query(
          `INSERT INTO student_parents (id, student_id, parent_id, is_primary) VALUES ($1,$2,$3,TRUE)`,
          [uuidv4(), studentId, parentId]
        );
      }

      await cache.delPattern(`${cache.prefix.cache}students:*`);
      return { studentId, userId };
    });
  }

  async findAll(query_params: PaginationQuery & { classId?: string; sectionId?: string; status?: string }): Promise<PaginatedResponse<unknown>> {
    const { page = 1, limit = 20, search = '', classId, sectionId, status = 'active' } = query_params;
    const offset = (page - 1) * limit;

    const cacheKey = `${cache.prefix.cache}students:${JSON.stringify(query_params)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached as PaginatedResponse<unknown>;

    const conditions: string[] = ["u.deleted_at IS NULL", "s.admission_status = $1"];
    const params: unknown[] = [status];
    let paramIdx = 2;

    if (search) {
      conditions.push(`(u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx} OR s.admission_number ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (classId) {
      conditions.push(`c.id = $${paramIdx++}`);
      params.push(classId);
    }
    if (sectionId) {
      conditions.push(`sec.id = $${paramIdx++}`);
      params.push(sectionId);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN sections sec ON sec.id = s.section_id
       LEFT JOIN classes c ON c.id = sec.class_id
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT s.id, s.admission_number, s.roll_number, s.gender, s.date_of_birth,
              s.blood_group, s.admission_status, s.admission_date, s.photo_url,
              u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
              sec.name AS section_name, c.name AS class_name, c.numeric_level
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN sections sec ON sec.id = s.section_id
       LEFT JOIN classes c ON c.id = sec.class_id
       WHERE ${whereClause}
       ORDER BY c.numeric_level, sec.name, s.roll_number
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    const result: PaginatedResponse<unknown> = {
      data: dataResult.rows,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    await cache.set(cacheKey, result, 120);
    return result;
  }

  async findById(id: string) {
    const cacheKey = `${cache.prefix.student}${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
              sec.name AS section_name, c.name AS class_name, c.numeric_level,
              ay.name AS academic_year
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN sections sec ON sec.id = s.section_id
       LEFT JOIN classes c ON c.id = sec.class_id
       LEFT JOIN academic_years ay ON ay.id = c.academic_year_id
       WHERE s.id = $1 AND u.deleted_at IS NULL`,
      [id]
    );

    if (!rows[0]) throw new AppError('Student not found', 404);

    // Fetch parents
    const { rows: parents } = await query(
      `SELECT p.id, p.relationship, p.occupation, u.first_name, u.last_name, u.email, u.phone
       FROM student_parents sp
       JOIN parents p ON p.id = sp.parent_id
       JOIN users u ON u.id = p.user_id
       WHERE sp.student_id = $1`,
      [id]
    );

    const result = { ...(rows[0] as Record<string, unknown>), parents };
    await cache.set(cacheKey, result, 300);
    return result;
  }

  async update(id: string, dto: Partial<CreateStudentDto>) {
    const student = await this.findById(id);
    if (!student) throw new AppError('Student not found', 404);

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const studentFields: Record<string, string> = {
      rollNumber: 'roll_number', sectionId: 'section_id', bloodGroup: 'blood_group',
      address: 'address', city: 'city', state: 'state', pincode: 'pincode',
    };

    for (const [key, col] of Object.entries(studentFields)) {
      if (dto[key as keyof typeof dto] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push(dto[key as keyof typeof dto]);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE students SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, values);
    }

    await cache.del(`${cache.prefix.student}${id}`);
    await cache.delPattern(`${cache.prefix.cache}students:*`);
  }

  async delete(id: string): Promise<void> {
    const { rows } = await query<{ user_id: string }>(
      'SELECT user_id FROM students WHERE id = $1',
      [id]
    );
    if (!rows[0]) throw new AppError('Student not found', 404);

    await query('UPDATE students SET admission_status = $1 WHERE id = $2', ['inactive', id]);
    await query('UPDATE users SET deleted_at = NOW(), is_active = FALSE WHERE id = $1', [rows[0].user_id]);

    await cache.del(`${cache.prefix.student}${id}`);
    await cache.delPattern(`${cache.prefix.cache}students:*`);
  }

  async getStudentStats() {
    const cacheKey = `${cache.prefix.cache}student:stats`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE admission_status = 'active') AS total_active,
        COUNT(*) FILTER (WHERE admission_status = 'inactive') AS total_inactive,
        COUNT(*) FILTER (WHERE gender = 'male' AND admission_status = 'active') AS total_male,
        COUNT(*) FILTER (WHERE gender = 'female' AND admission_status = 'active') AS total_female,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_this_month
      FROM students
    `);

    await cache.set(cacheKey, rows[0], 300);
    return rows[0];
  }
}

export const studentService = new StudentService();
