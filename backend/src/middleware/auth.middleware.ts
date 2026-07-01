import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiResponse, UserRole } from '../types';
import { logger } from '../utils/logger';

/**
 * Authenticates request via Bearer token in Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required. Please provide a valid token.',
    };
    res.status(401).json(response);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    const err = error as Error;
    logger.warn(`Authentication failed: ${err.message}`, { ip: req.ip });

    let message = 'Invalid or expired token. Please login again.';
    if (err.name === 'TokenExpiredError') {
      message = 'Token has expired. Please refresh your session.';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please login again.';
    }

    const response: ApiResponse = { success: false, message };
    res.status(401).json(response);
  }
};

/**
 * Role-based access control middleware
 * Usage: authorize('ADMIN', 'DOCTOR')
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required.',
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt`, {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl,
        ip: req.ip,
      });

      const response: ApiResponse = {
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

/**
 * Middleware to allow access only to the resource owner or specified roles
 */
export const authorizeOwnerOrRoles = (
  getResourceOwnerId: (req: Request) => string,
  ...allowedRoles: UserRole[]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const isAllowedRole = allowedRoles.includes(req.user.role);
    const isOwner = getResourceOwnerId(req) === req.user.userId;

    if (!isAllowedRole && !isOwner) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    next();
  };
};
