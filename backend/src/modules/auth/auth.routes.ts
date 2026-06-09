import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimit } from '../../middleware/rateLimit.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Body: { identifier: string, password: string, fcmToken?: string }
 */
router.post('/login', authRateLimit, asyncHandler(authController.login.bind(authController)));

/**
 * POST /api/v1/auth/refresh
 * Cookie/Body: refreshToken
 */
router.post('/refresh', asyncHandler(authController.refreshToken.bind(authController)));

/**
 * POST /api/v1/auth/logout
 * Header: Authorization Bearer <token>
 */
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

/**
 * GET /api/v1/auth/me
 * Header: Authorization Bearer <token>
 */
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));

/**
 * PATCH /api/v1/auth/change-password
 * Body: { currentPassword, newPassword }
 */
router.patch('/change-password', authenticate, asyncHandler(authController.changePassword.bind(authController)));

export default router;
