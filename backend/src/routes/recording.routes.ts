import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  startRecording,
  stopRecording,
  listRecordings,
  getRecording,
  deleteRecording,
  streamRecording,
} from '../controllers/recording.controller';

const router = Router();

// All recording routes require authentication
router.use(authenticate);

// ── Doctor-only recording routes ─────────────────────────────────────────────

/** POST /api/recordings/start — begin a new recording for an appointment */
router.post('/start', authorize('DOCTOR'), startRecording);

/** GET /api/recordings — list all recordings for the authenticated doctor */
router.get('/', authorize('DOCTOR'), listRecordings);

/** GET /api/recordings/:id — fetch a single recording (with data URL) */
router.get('/:id', authorize('DOCTOR', 'ADMIN'), getRecording);

/** PUT /api/recordings/:id/stop — finalise a recording and save data */
router.put('/:id/stop', authorize('DOCTOR'), stopRecording);

/** GET /api/recordings/:id/stream — stream raw video bytes with proper Content-Type */
router.get('/:id/stream', authorize('DOCTOR', 'ADMIN'), streamRecording);

/** DELETE /api/recordings/:id — delete a recording */
router.delete('/:id', authorize('DOCTOR'), deleteRecording);

export default router;
