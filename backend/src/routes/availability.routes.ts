import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getMyAvailability,
  updateMyAvailability,
  getDoctorAvailability,
} from '../controllers/availability.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/availability/me
 * @desc    Get the authenticated doctor's availability schedule
 * @access  Private (Doctor only)
 */
router.get('/me', authorize('DOCTOR'), getMyAvailability);

/**
 * @route   PUT /api/availability/me
 * @desc    Update the authenticated doctor's availability schedule
 * @access  Private (Doctor only)
 */
router.put('/me', authorize('DOCTOR'), updateMyAvailability);

/**
 * @route   GET /api/availability/:doctorId
 * @desc    Get a specific doctor's availability (for patients browsing)
 * @access  Private (Patient, Doctor, Admin)
 */
router.get('/:doctorId', authorize('PATIENT', 'DOCTOR', 'ADMIN'), getDoctorAvailability);

export default router;
