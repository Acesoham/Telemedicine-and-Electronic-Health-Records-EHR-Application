import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';
import {
  createPrescription,
  getMyPrescriptions,
  getPatientPrescriptions,
  downloadPrescriptionPdf,
} from '../controllers/prescription.controller';

const router = Router();

// Apply authentication to all prescription routes
router.use(authenticate);

// Doctor routes
router.post(
  '/',
  authorize('DOCTOR'),
  auditLog({ action: 'CREATE_PRESCRIPTION', resource: 'Prescription' }),
  createPrescription
);

router.get(
  '/my',
  authorize('DOCTOR'),
  auditLog({ action: 'VIEW_PRESCRIPTION', resource: 'Prescription' }),
  getMyPrescriptions
);

// Shared / Patient routes
// Note: Frontend API expects `/patients/:patientId/prescriptions`, but it's simpler to map `/api/prescriptions/patient/:patientId`
router.get(
  '/patient/:patientId',
  authorize('DOCTOR', 'PATIENT'),
  auditLog({ action: 'VIEW_PRESCRIPTION', resource: 'Prescription' }),
  getPatientPrescriptions
);

// Download PDF
router.get(
  '/:id/download',
  authorize('DOCTOR', 'PATIENT'),
  auditLog({ action: 'DOWNLOAD_PRESCRIPTION', resource: 'Prescription', getResourceId: (req) => req.params.id as string }),
  downloadPrescriptionPdf
);

export default router;
