import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../config/database';
import { cache } from '../../config/redis';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { logger } from '../../shared/utils/logger';
import { JwtPayload, UserRole } from '../../shared/types';

interface LoginDto {
  identifier: string; // email or phone
  password: string;
  fcmToken?: string;
}

interface RegisterDto {
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  generateTokens(payload: JwtPayload): TokenPair {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sign = jwt.sign as any;
    const accessToken = sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    const refreshToken = sign(
      { userId: payload.userId, role: payload.role },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const { identifier, password, fcmToken } = dto;
    const isEmail = identifier.includes('@');
    const field = isEmail ? 'email' : 'phone';

    const { rows } = await query<{
      id: string; email: string; phone: string;
      password_hash: string; role: UserRole; first_name: string;
      last_name: string; is_active: boolean; avatar_url: string;
    }>(
      `SELECT id, email, phone, password_hash, role, first_name, last_name,
              is_active, avatar_url
       FROM users
       WHERE ${field} = $1 AND deleted_at IS NULL`,
      [identifier]
    );

    const user = rows[0];
    if (!user) throw new AppError('Invalid credentials', 401);
    if (!user.is_active) throw new AppError('Account is deactivated. Contact admin.', 403);

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    };

    const tokens = this.generateTokens(payload);

    // Store refresh token + update FCM token
    await query(
      'UPDATE users SET refresh_token = $1, last_login_at = NOW(), fcm_token = COALESCE($2, fcm_token) WHERE id = $3',
      [tokens.refreshToken, fcmToken || null, user.id]
    );

    // Cache user session
    await cache.set(`${cache.prefix.user}${user.id}`, {
      id: user.id, role: user.role, firstName: user.first_name, lastName: user.last_name,
    }, 60 * 60);

    logger.info('User logged in', { userId: user.id, role: user.role });

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

      const { rows } = await query<{ id: string; role: UserRole; email: string; phone: string; refresh_token: string; is_active: boolean }>(
        'SELECT id, role, email, phone, refresh_token, is_active FROM users WHERE id = $1 AND deleted_at IS NULL',
        [payload.userId]
      );

      const user = rows[0];
      if (!user || user.refresh_token !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }
      if (!user.is_active) throw new AppError('Account is deactivated', 403);

      const newPayload: JwtPayload = { userId: user.id, role: user.role, email: user.email, phone: user.phone };
      const tokens = this.generateTokens(newPayload);

      await query('UPDATE users SET refresh_token = $1 WHERE id = $2', [tokens.refreshToken, user.id]);

      return tokens;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) throw new AppError('Invalid refresh token', 401);
      throw err;
    }
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    await query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);
    await cache.del(`${cache.prefix.user}${userId}`);
    // Blacklist the current access token
    await cache.set(`${cache.prefix.session}blacklist:${accessToken}`, true, 60 * 16);
  }

  async createUser(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

    const { rows } = await query<{ id: string }>(
      `INSERT INTO users (id, email, phone, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [uuidv4(), dto.email || null, dto.phone || null, hash, dto.role, dto.firstName, dto.lastName]
    );

    return rows[0].id;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const { rows } = await query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (!rows[0]) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const newHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await query('UPDATE users SET password_hash = $1, refresh_token = NULL, updated_at = NOW() WHERE id = $2', [newHash, userId]);
  }
}

export const authService = new AuthService();
