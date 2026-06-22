import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { auditLog } from '../middleware/audit.middleware';
import {
  createAppointment,
  listAppointments,
  getAppointment,
  confirmAppointment,
  cancelAppointment,
  listDoctors,
} from '../controllers/appointment.controller';
import {
  createAppointmentSchema,
  cancelAppointmentSchema,
} from '../validators/appointment.validator';

const router = Router();

// All appointment routes require auth
router.use(authenticate);

// ── Doctors list (patients browse) ───────────────────────────────────────────
router.get('/doctors', authorize('PATIENT', 'DOCTOR', 'ADMIN'), listDoctors);

// ── Appointments ─────────────────────────────────────────────────────────────
router.get(
  '/',
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  listAppointments,
);

router.post(
  '/',
  authorize('PATIENT'),
  validate(createAppointmentSchema),
  auditLog({ action: 'BOOK_APPOINTMENT', resource: 'Appointment' }),
  createAppointment,
);

router.get(
  '/:id',
  authorize('PATIENT', 'DOCTOR', 'ADMIN'),
  getAppointment,
);

router.put(
  '/:id/confirm',
  authorize('DOCTOR'),
  auditLog({
    action: 'CONFIRM_APPOINTMENT',
    resource: 'Appointment',
    getResourceId: (req) => req.params.id as string,
  }),
  confirmAppointment,
);

router.put(
  '/:id/cancel',
  authorize('PATIENT', 'DOCTOR'),
  validate(cancelAppointmentSchema),
  auditLog({
    action: 'CANCEL_APPOINTMENT',
    resource: 'Appointment',
    getResourceId: (req) => req.params.id as string,
  }),
  cancelAppointment,
);

export default router;
