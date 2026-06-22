import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';

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
