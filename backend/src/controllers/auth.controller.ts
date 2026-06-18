import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../types';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input, req.ip || 'unknown');

      const response: ApiResponse = {
        success: true,
        message: 'Account created successfully. Welcome to MediVault!',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input, req.ip || 'unknown');

      const response: ApiResponse = {
        success: true,
        message: 'Login successful.',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken, req.ip || 'unknown');

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully.',
        data: tokens,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user!.userId, refreshToken, req.ip || 'unknown');

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully.',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, profile } = await authService.getProfile(req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully.',
        data: { user, profile },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
