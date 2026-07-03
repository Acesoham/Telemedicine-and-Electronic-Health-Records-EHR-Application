import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getUsers,
  toggleUserStatus,
  getDoctors,
  verifyDoctor,
  getAnalytics,
  getAdminAuditLogs,
  getAdminRecordings,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Users
router.get('/users',              getUsers);
router.put('/users/:id/status',   toggleUserStatus);

// Doctors
router.get('/doctors',                      getDoctors);
router.put('/doctors/:doctorId/verify',     verifyDoctor);

// Analytics
router.get('/analytics',   getAnalytics);

// Audit logs (admin-facing, more powerful than /api/audit)
router.get('/audit-logs',  getAdminAuditLogs);

// All platform recordings
router.get('/recordings',  getAdminRecordings);

export default router;
