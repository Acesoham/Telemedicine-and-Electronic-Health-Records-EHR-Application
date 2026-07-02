import { Request, Response, NextFunction } from 'express';
import { Recording } from '../modules/recordings/recording.model';
import { Appointment } from '../modules/appointments/appointment.model';
import { Doctor } from '../modules/auth/doctor.model';
import { AppError } from '../middleware/error.middleware';

// ── Start a recording for an appointment ──────────────────────────────────────
export const startRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.body as { appointmentId: string };
    if (!appointmentId) throw new AppError('appointmentId is required', 422);

    // Verify appointment belongs to this doctor
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.doctorId.toString() !== doctor._id.toString())
      throw new AppError('Access denied', 403);
    if (appt.status !== 'CONFIRMED')
      throw new AppError('Can only record confirmed appointments', 409);

    // Prevent duplicate active recordings for the same appointment
    const existing = await Recording.findOne({
      appointmentId: appt._id,
      status: 'RECORDING',
    });
    if (existing) {
      return res.json({ success: true, message: 'Recording already in progress', data: existing });
    }

    const recording = await Recording.create({
      appointmentId: appt._id,
      doctorId: doctor._id,
      patientId: appt.patientId,
      startedAt: new Date(),
      status: 'RECORDING',
    });

    res.status(201).json({
      success: true,
      message: 'Recording started',
      data: recording,
    });
  } catch (error) {
    next(error);
  }
};

// ── Stop / finalise a recording ───────────────────────────────────────────────
export const stopRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { recordingDataUrl, durationSeconds, fileSize, mimeType } = req.body as {
      recordingDataUrl?: string;
      durationSeconds?: number;
      fileSize?: number;
      mimeType?: string;
    };

    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const recording = await Recording.findById(id);
    if (!recording) throw new AppError('Recording not found', 404);
    if (recording.doctorId.toString() !== doctor._id.toString())
      throw new AppError('Access denied', 403);
    if (recording.status !== 'RECORDING')
      throw new AppError('Recording is not in progress', 409);

    recording.endedAt = new Date();
    recording.status = 'COMPLETED';
    if (recordingDataUrl) recording.recordingDataUrl = recordingDataUrl;
    if (durationSeconds !== undefined) recording.durationSeconds = durationSeconds;
    if (fileSize !== undefined) recording.fileSize = fileSize;
    if (mimeType) recording.mimeType = mimeType;
    await recording.save();

    res.json({
      success: true,
      message: 'Recording saved successfully',
      data: recording,
    });
  } catch (error) {
    next(error);
  }
};

// ── List all recordings for this doctor ───────────────────────────────────────
export const listRecordings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const recordings = await Recording.find({ doctorId: doctor._id })
      .sort({ createdAt: -1 })
      .select('-recordingDataUrl') // exclude large base64 payload from list
      .populate('appointmentId', 'scheduledAt chiefComplaint durationMinutes')
      .populate('patientId', 'firstName lastName gender');

    res.json({ success: true, data: recordings });
  } catch (error) {
    next(error);
  }
};

// ── Get a single recording ─────────────────────────────────────────────────────
export const getRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const recording = await Recording.findById(req.params.id)
      .populate('appointmentId', 'scheduledAt chiefComplaint durationMinutes')
      .populate('patientId', 'firstName lastName gender');

    if (!recording) throw new AppError('Recording not found', 404);
    if (recording.doctorId.toString() !== doctor._id.toString())
      throw new AppError('Access denied', 403);

    res.json({ success: true, data: recording });
  } catch (error) {
    next(error);
  }
};

// ── Delete a recording ────────────────────────────────────────────────────────
export const deleteRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const recording = await Recording.findById(req.params.id);
    if (!recording) throw new AppError('Recording not found', 404);
    if (recording.doctorId.toString() !== doctor._id.toString())
      throw new AppError('Access denied', 403);

    await recording.deleteOne();
    res.json({ success: true, message: 'Recording deleted' });
  } catch (error) {
    next(error);
  }
};

// ── Stream a recording as binary video ────────────────────────────────────────
// Returns the raw video bytes with the correct Content-Type so the browser
// (and Axios with responseType:'blob') can play/download it natively.
export const streamRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    // Only select the fields we need — avoids loading everything
    const recording = await Recording.findById(req.params.id)
      .select('doctorId recordingDataUrl mimeType');

    if (!recording) throw new AppError('Recording not found', 404);
    if (recording.doctorId.toString() !== doctor._id.toString())
      throw new AppError('Access denied', 403);
    if (!recording.recordingDataUrl)
      throw new AppError('No video data stored for this recording', 404);

    // Data URL format: "data:<mimeType>;base64,<base64data>"
    // IMPORTANT: mimeType may contain codec params with commas, e.g.:
    //   data:video/webm;codecs=vp8,opus;base64,<data>
    // Using indexOf(',') would match the comma inside "vp8,opus" — not the
    // base64 separator — producing garbage bytes. We must search for ";base64,"
    // as the correct delimiter.
    const BASE64_MARKER = ';base64,';
    const markerIdx = recording.recordingDataUrl.indexOf(BASE64_MARKER);
    if (markerIdx === -1) throw new AppError('Malformed recording data: missing ;base64, marker', 500);

    const header = recording.recordingDataUrl.slice(0, markerIdx); // "data:video/webm;codecs=vp8,opus"
    const base64Data = recording.recordingDataUrl.slice(markerIdx + BASE64_MARKER.length); // "<base64>"

    // Extract just the base MIME type (no codec params) from the header.
    // e.g. "data:video/webm;codecs=vp8,opus" → "video/webm"
    let mimeType = header.match(/^data:([^;]+)/)?.[1] ?? recording.mimeType ?? 'video/webm';

    // Strip any remaining codec suffix just in case
    if (mimeType.includes(';')) {
      mimeType = mimeType.split(';')[0];
    }

    const videoBuffer = Buffer.from(base64Data, 'base64');
    const fileSize = videoBuffer.length;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
        return;
      }

      const chunksize = end - start + 1;
      const chunk = videoBuffer.slice(start, end + 1);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      res.end(chunk);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
      });
      res.end(videoBuffer);
    }
  } catch (error) {
    next(error);
  }
};

