import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../modules/admin/auditLog.model';
import { AuditAction, UserRole } from '../types';
import { logger } from '../utils/logger';

interface AuditOptions {
  action: AuditAction;
  resource?: string;
  getResourceId?: (req: Request) => string | undefined;
  getMetadata?: (req: Request) => Record<string, unknown>;
}

/**
 * Audit logging middleware factory
 * Logs critical operations to the immutable AuditLog collection
 */
export const auditLog = (options: AuditOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalEnd = res.end.bind(res);

    // Override res.end to capture response status before logging
    (res as any).end = async function (...args: any[]) {
      const success = res.statusCode >= 200 && res.statusCode < 400;

      try {
        await AuditLog.create({
          userId: req.user?.userId,
          userEmail: req.user?.email,
          role: req.user?.role as UserRole | undefined,
          action: options.action,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent'),
          resource: options.resource,
          resourceId: options.getResourceId ? options.getResourceId(req) : undefined,
          metadata: options.getMetadata ? options.getMetadata(req) : undefined,
          success,
          errorMessage: !success ? res.statusMessage : undefined,
          timestamp: new Date(),
        });
      } catch (err) {
        // Audit log failures must never crash the application
        logger.error('Failed to write audit log', { error: err, action: options.action });
      }

      originalEnd(...args);
    };

    next();
  };
};

/**
 * Direct audit log write utility (for use in services)
 */
export const writeAuditLog = async (params: {
  userId?: string;
  userEmail?: string;
  role?: UserRole;
  action: AuditAction;
  ipAddress: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}): Promise<void> => {
  try {
    await AuditLog.create({
      ...params,
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error('Failed to write audit log', { error: err, action: params.action });
  }
};
