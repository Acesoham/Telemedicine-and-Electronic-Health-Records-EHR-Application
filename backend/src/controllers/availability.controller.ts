import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../modules/auth/doctor.model';
import { AppError } from '../middleware/error.middleware';

// ── Doctor: Get own availability ──────────────────────────────────────────────
export const getMyAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId }).select(
      'firstName lastName availabilitySlots consultationDurationMinutes isAcceptingAppointments',
    );
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    res.json({
      success: true,
      data: {
        availabilitySlots: doctor.availabilitySlots,
        consultationDurationMinutes: doctor.consultationDurationMinutes,
        isAcceptingAppointments: doctor.isAcceptingAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Doctor: Update own availability ──────────────────────────────────────────
export const updateMyAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const { availabilitySlots, consultationDurationMinutes, isAcceptingAppointments } = req.body;

    // Validate slots
    if (availabilitySlots !== undefined) {
      if (!Array.isArray(availabilitySlots)) {
        throw new AppError('availabilitySlots must be an array', 400);
      }
      for (const slot of availabilitySlots) {
        if (
          typeof slot.dayOfWeek !== 'number' ||
          slot.dayOfWeek < 0 ||
          slot.dayOfWeek > 6
        ) {
          throw new AppError('Each slot must have a dayOfWeek between 0 (Sun) and 6 (Sat)', 400);
        }
        if (
          typeof slot.startTime !== 'string' ||
          typeof slot.endTime !== 'string' ||
          !/^\d{2}:\d{2}$/.test(slot.startTime) ||
          !/^\d{2}:\d{2}$/.test(slot.endTime)
        ) {
          throw new AppError('startTime and endTime must be in HH:MM format', 400);
        }
        if (slot.startTime >= slot.endTime) {
          throw new AppError('startTime must be before endTime', 400);
        }
      }
      doctor.availabilitySlots = availabilitySlots;
    }

    if (consultationDurationMinutes !== undefined) {
      const dur = Number(consultationDurationMinutes);
      if (isNaN(dur) || dur < 15 || dur > 120) {
        throw new AppError('consultationDurationMinutes must be between 15 and 120', 400);
      }
      doctor.consultationDurationMinutes = dur;
    }

    if (isAcceptingAppointments !== undefined) {
      doctor.isAcceptingAppointments = Boolean(isAcceptingAppointments);
    }

    await doctor.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availabilitySlots: doctor.availabilitySlots,
        consultationDurationMinutes: doctor.consultationDurationMinutes,
        isAcceptingAppointments: doctor.isAcceptingAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Public/Patient: Get a doctor's availability by doctorId ───────────────────
export const getDoctorAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId).select(
      'firstName lastName specialization availabilitySlots consultationDurationMinutes isAcceptingAppointments',
    );
    if (!doctor) throw new AppError('Doctor not found', 404);

    res.json({
      success: true,
      data: {
        doctorId: doctor._id,
        fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        availabilitySlots: doctor.availabilitySlots,
        consultationDurationMinutes: doctor.consultationDurationMinutes,
        isAcceptingAppointments: doctor.isAcceptingAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
