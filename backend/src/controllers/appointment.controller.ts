import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { Doctor } from '../modules/auth/doctor.model';
import { Appointment } from '../modules/appointments/appointment.model';
import { Prescription } from '../modules/prescriptions/prescription.model';
import { decrypt } from '../utils/encryption';

// ── Patient: Book appointment ─────────────────────────────────────────────────
export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await AppointmentService.create(req.user!.userId, req.body);
    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    next(error);
  }
};

// ── Any role: List appointments (scoped by role) ──────────────────────────────
export const listAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20 } = req.query as Record<string, string>;
    const role = req.user!.role as 'PATIENT' | 'DOCTOR';
    const result = await AppointmentService.list(req.user!.userId, role, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ── Any role: Get single appointment ─────────────────────────────────────────
export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appt = await AppointmentService.getById(
      req.params.id as string,
      req.user!.userId,
      req.user!.role,
    );
    res.json({ success: true, data: appt });
  } catch (error) {
    next(error);
  }
};

// ── Doctor: Confirm appointment ───────────────────────────────────────────────
export const confirmAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appt = await AppointmentService.confirm(req.params.id as string, req.user!.userId);
    res.json({ success: true, message: 'Appointment confirmed', data: appt });
  } catch (error) {
    next(error);
  }
};

// ── Patient or Doctor: Cancel appointment ────────────────────────────────────
export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appt = await AppointmentService.cancel(
      req.params.id as string,
      req.user!.userId,
      req.user!.role,
      req.body?.reason,
    );
    res.json({ success: true, message: 'Appointment cancelled', data: appt });
  } catch (error) {
    next(error);
  }
};

// ── Patient: List doctors ─────────────────────────────────────────────────────
export const listDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, specialization, page = '1', limit = '20' } = req.query as Record<string, string>;
    const result = await AppointmentService.listDoctors({
      search,
      specialization,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ── Doctor: Get Analytics ─────────────────────────────────────────────────────
export const getDoctorAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const doctorId = doctor._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ doctorId }).lean(),
      Prescription.find({ doctorId }).lean(),
    ]);

    // calculate stats
    // 1. mock earnings
    const completed = appointments.filter(a => a.status === 'COMPLETED').length;
    const totalEarnings = completed * 100;

    // 2. patient retention
    const patientCounts = new Map<string, number>();
    appointments.forEach(a => {
      const pId = String(a.patientId);
      patientCounts.set(pId, (patientCounts.get(pId) || 0) + 1);
    });
    let retained = 0;
    patientCounts.forEach(count => {
      if (count > 1) retained++;
    });
    const totalUniquePatients = patientCounts.size;
    const patientRetentionRate = totalUniquePatients > 0 ? (retained / totalUniquePatients) * 100 : 0;

    // 3. diagnoses
    const diagnoses = prescriptions.reduce((acc, p) => {
      let diag = 'Unknown';
      try {
        diag = decrypt(p.diagnosis) || 'Unknown';
      } catch (err) {
        // Fallback to unknown if decryption fails
      }
      acc[diag] = (acc[diag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const frequentDiagnoses = Object.entries(diagnoses)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. appointment trend
    const recentAppts = appointments.filter(a => new Date(a.scheduledAt) >= sevenDaysAgo);
    const trendMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap.set(d.toISOString().split('T')[0], 0);
    }
    recentAppts.forEach(a => {
      const d = new Date(a.scheduledAt).toISOString().split('T')[0];
      if (trendMap.has(d)) {
        trendMap.set(d, trendMap.get(d)! + 1);
      }
    });
    const appointmentTrend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

    res.json({
      success: true,
      data: {
        totalEarnings,
        totalUniquePatients,
        patientRetentionRate: Math.round(patientRetentionRate),
        frequentDiagnoses,
        appointmentTrend,
        completedConsultations: completed
      }
    });
  } catch (error) {
    next(error);
  }
};
