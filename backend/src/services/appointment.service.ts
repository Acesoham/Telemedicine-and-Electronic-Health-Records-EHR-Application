import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { Appointment } from '../modules/appointments/appointment.model';
import { Doctor } from '../modules/auth/doctor.model';
import { Patient } from '../modules/auth/patient.model';
import { AppError } from '../middleware/error.middleware';
import { CreateAppointmentInput } from '../validators/appointment.validator';

export class AppointmentService {
  /**
   * Book an appointment — called by PATIENT
   */
  static async create(patientUserId: string, input: CreateAppointmentInput) {
    // Resolve patient profile
    const patient = await Patient.findOne({ userId: patientUserId });
    if (!patient) throw new AppError('Patient profile not found', 404);

    // Resolve doctor
    const doctor = await Doctor.findById(input.doctorId);
    if (!doctor) throw new AppError('Doctor not found', 404);
    if (!doctor.isAcceptingAppointments)
      throw new AppError('This doctor is not accepting appointments right now', 409);

    const scheduledAt = new Date(input.scheduledAt);
    if (scheduledAt < new Date()) throw new AppError('Appointment time must be in the future', 422);

    const durationMinutes = doctor.consultationDurationMinutes || 30;
    const endsAt = new Date(scheduledAt.getTime() + durationMinutes * 60_000);

    // Conflict detection — no overlapping PENDING or CONFIRMED appts for this doctor
    const conflict = await Appointment.findOne({
      doctorId: doctor._id,
      status: { $in: ['PENDING', 'CONFIRMED'] },
      $or: [
        { scheduledAt: { $lt: endsAt }, endsAt: { $gt: scheduledAt } },
      ],
    });
    if (conflict) throw new AppError('This time slot is already booked. Please choose another.', 409);

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      scheduledAt,
      endsAt,
      durationMinutes,
      chiefComplaint: input.chiefComplaint,
      notes: input.notes,
      timezone: input.timezone || 'UTC',
      status: 'PENDING',
    });

    return appointment.populate([
      { path: 'doctorId', select: 'firstName lastName specialization profilePhoto phone' },
      { path: 'patientId', select: 'firstName lastName dateOfBirth gender phone' },
    ]);
  }

  /**
   * List appointments for the authenticated user
   */
  static async list(
    userId: string,
    role: 'PATIENT' | 'DOCTOR',
    filters: { status?: string; page: number; limit: number },
  ) {
    let profileId: mongoose.Types.ObjectId;

    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient) throw new AppError('Patient profile not found', 404);
      profileId = patient._id;
    } else {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) throw new AppError('Doctor profile not found', 404);
      profileId = doctor._id;
    }

    const query: Record<string, unknown> =
      role === 'PATIENT' ? { patientId: profileId } : { doctorId: profileId };

    if (filters.status) {
      const statuses = filters.status.split(',').map((s) => s.trim().toUpperCase());
      query.status = { $in: statuses };
    }

    const skip = (filters.page - 1) * filters.limit;
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .populate('doctorId', 'firstName lastName specialization profilePhoto phone bio yearsOfExperience')
      .populate('patientId', 'firstName lastName dateOfBirth gender phone');

    return {
      data: appointments,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
      hasNext: skip + appointments.length < total,
      hasPrev: filters.page > 1,
    };
  }

  /**
   * Get single appointment by ID (validates ownership)
   */
  static async getById(appointmentId: string, userId: string, role: string) {
    const appt = await Appointment.findById(appointmentId)
      .populate('doctorId', 'firstName lastName specialization profilePhoto phone bio')
      .populate('patientId', 'firstName lastName dateOfBirth gender phone');

    if (!appt) throw new AppError('Appointment not found', 404);

    // Ownership check
    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient || appt.patientId.toString() !== patient._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    } else if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor || appt.doctorId.toString() !== doctor._id.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    return appt;
  }

  /**
   * Confirm appointment — called by DOCTOR
   * Generates a secure roomToken for the video consultation
   */
  static async confirm(appointmentId: string, doctorUserId: string) {
    const doctor = await Doctor.findOne({ userId: doctorUserId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);

    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.doctorId.toString() !== doctor._id.toString())
      throw new AppError('Access denied', 403);
    if (appt.status !== 'PENDING')
      throw new AppError(`Cannot confirm an appointment with status: ${appt.status}`, 409);

    // Generate a cryptographically secure room token
    const roomToken = randomBytes(16).toString('hex');

    appt.status = 'CONFIRMED';
    appt.roomToken = roomToken;
    await appt.save();

    return appt.populate([
      { path: 'doctorId', select: 'firstName lastName specialization' },
      { path: 'patientId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Cancel appointment — called by PATIENT or DOCTOR
   */
  static async cancel(appointmentId: string, userId: string, role: string, reason?: string) {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw new AppError('Appointment not found', 404);

    // Ownership check
    if (role === 'PATIENT') {
      const patient = await Patient.findOne({ userId });
      if (!patient || appt.patientId.toString() !== patient._id.toString())
        throw new AppError('Access denied', 403);
    } else if (role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId });
      if (!doctor || appt.doctorId.toString() !== doctor._id.toString())
        throw new AppError('Access denied', 403);
    }

    if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(appt.status))
      throw new AppError(`Cannot cancel an appointment with status: ${appt.status}`, 409);

    appt.status = 'CANCELLED';
    appt.cancellationReason = reason;
    await appt.save();

    return appt;
  }

  /**
   * Get all verified doctors (for patient browse)
   */
  static async listDoctors(filters: {
    search?: string;
    specialization?: string;
    page: number;
    limit: number;
  }) {
    const query: Record<string, unknown> = {};
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { specialization: { $regex: filters.search, $options: 'i' } },
      ];
    } else if (filters.specialization) {
      query.specialization = { $regex: filters.specialization, $options: 'i' };
    }

    const skip = (filters.page - 1) * filters.limit;
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .sort({ yearsOfExperience: -1 })
      .skip(skip)
      .limit(filters.limit)
      .select('-userId');

    return {
      data: doctors,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }
}
