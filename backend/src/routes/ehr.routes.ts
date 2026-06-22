import { Router } from 'express';
import { authenticate, authorize, authorizeOwnerOrRoles } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { auditLog } from '../middleware/audit.middleware';
import {
  getMyRecord,
  getPatientRecord,
  updateRecord,
  updateMyRecord,
  addDiagnosis,
  addConsultationNote,
} from '../controllers/ehr.controller';
import {
  updateRecordSchema,
  addDiagnosisSchema,
  addConsultationNoteSchema,
} from '../validators/ehr.validator';

const router = Router();

// Apply authentication to all EHR routes
router.use(authenticate);

// Patient routes
router.get(
  '/my-record',
  authorize('PATIENT'),
  auditLog({ action: 'VIEW_RECORD', resource: 'MedicalRecord' }),
  getMyRecord
);

// Patient self-update (demographics, allergies, medical history)
router.put(
  '/my-record',
  authorize('PATIENT'),
  auditLog({ action: 'UPDATE_RECORD', resource: 'MedicalRecord' }),
  updateMyRecord
);

// Doctor & Admin routes
router.get(
  '/patient/:patientId',
  authorize('DOCTOR', 'ADMIN'),
  auditLog({ action: 'VIEW_RECORD', resource: 'MedicalRecord', getResourceId: (req) => req.params.patientId as string }),
  getPatientRecord
);

// Doctor-only routes for modifications
router.put(
  '/patient/:patientId',
  authorize('DOCTOR'),
  validate(updateRecordSchema, 'body'),
  auditLog({ action: 'UPDATE_RECORD', resource: 'MedicalRecord', getResourceId: (req) => req.params.patientId as string }),
  updateRecord
);

router.post(
  '/patient/:patientId/diagnoses',
  authorize('DOCTOR'),
  validate(addDiagnosisSchema, 'body'),
  auditLog({ action: 'UPDATE_RECORD', resource: 'MedicalRecord', getResourceId: (req) => req.params.patientId as string }),
  addDiagnosis
);

router.post(
  '/patient/:patientId/notes',
  authorize('DOCTOR'),
  validate(addConsultationNoteSchema, 'body'),
  auditLog({ action: 'UPDATE_RECORD', resource: 'MedicalRecord', getResourceId: (req) => req.params.patientId as string }),
  addConsultationNote
);

export default router;
