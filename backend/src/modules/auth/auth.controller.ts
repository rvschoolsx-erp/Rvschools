import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { AuthRequest, ApiResponse } from '../../shared/types';
import { AppError } from '../../middleware/error.middleware';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fcmToken: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.tokens.accessToken,
        user: result.user,
      },
    };
    res.status(200).json(response);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const tokens = await authService.refreshToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: 'Token refreshed', data: { accessToken: tokens.accessToken } });
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1] ?? '';
    await authService.logout(req.user!.userId, token);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    res.json({ success: true, message: 'User info', data: req.user });
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  }
}

export const authController = new AuthController();
