import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import rateLimit from 'express-rate-limit';
import { config } from '../configs/config';

const router = Router();

// Strict rate limiting for auth routes
const authRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new patient or doctor
 * @access  Public
 */
router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  authController.register.bind(authController),
);

/**
 * @route   POST /api/auth/login
 * @desc    Login and get tokens
 * @access  Public
 */
router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  authController.login.bind(authController),
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token)
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController),
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout and revoke refresh token
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController),
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user's profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController),
);

export default router;
