import { Request, Response, NextFunction } from 'express';
import { User } from '../modules/auth/user.model';
import { Patient } from '../modules/auth/patient.model';
import { Doctor } from '../modules/auth/doctor.model';
import { Appointment } from '../modules/appointments/appointment.model';
import { AuditLog } from '../modules/admin/auditLog.model';
import { Prescription } from '../modules/prescriptions/prescription.model';
import { Recording } from '../modules/recordings/recording.model';
import { ApiResponse } from '../types';
import { AppError } from '../middleware/error.middleware';
import { writeAuditLog } from '../middleware/audit.middleware';

// ── GET /admin/users ──────────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page      = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit     = Math.min(50, parseInt(req.query.limit as string) || 12);
    const skip      = (page - 1) * limit;
    const role      = req.query.role   as string | undefined;
    const search    = req.query.search as string | undefined;
    const isActiveQ = req.query.isActive;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (role && ['PATIENT', 'DOCTOR', 'ADMIN'].includes(role)) filter.role = role;
    if (isActiveQ !== undefined) filter.isActive = isActiveQ === 'true';
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    // Attach profiles
    const userIds    = users.map(u => u._id);
    const [patients, doctors] = await Promise.all([
      Patient.find({ userId: { $in: userIds } }).lean(),
      Doctor.find({ userId: { $in: userIds } }).lean(),
    ]);

    const patientMap = new Map(patients.map(p => [p.userId.toString(), p]));
    const doctorMap  = new Map(doctors.map(d => [d.userId.toString(), d]));

    const enriched = users.map(u => ({
      ...u,
      patientProfile: patientMap.get(u._id.toString()) || undefined,
      doctorProfile:  doctorMap.get(u._id.toString())  || undefined,
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        users: enriched,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ── PUT /admin/users/:id/status ──────────────────────────────────────────────
export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found.', 404);
    if (user.role === 'ADMIN') throw new AppError('Cannot modify admin accounts.', 403);

    user.isActive = !user.isActive;
    await user.save();

    await writeAuditLog({
      userId:     req.user!.userId,
      userEmail:  req.user!.email,
      role:       req.user!.role,
      action:     'ADMIN_ACTION',
      ipAddress:  req.ip || 'unknown',
      success:    true,
      resource:   'User',
      resourceId: String(req.params.id),
      metadata:   { action: user.isActive ? 'REACTIVATED' : 'SUSPENDED' },
    });

    const response: ApiResponse = {
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully.`,
      data: { isActive: user.isActive },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ── GET /admin/doctors ────────────────────────────────────────────────────────
export const getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

    const [doctors, total] = await Promise.all([
      Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Doctor.countDocuments(filter),
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Doctors retrieved successfully.',
      data: { doctors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ── PUT /admin/doctors/:doctorId/verify ───────────────────────────────────────
export const verifyDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) throw new AppError('Doctor not found.', 404);

    doctor.isVerified = true;
    await doctor.save();

    await writeAuditLog({
      userId:     req.user!.userId,
      userEmail:  req.user!.email,
      role:       req.user!.role,
      action:     'ADMIN_ACTION',
      ipAddress:  req.ip || 'unknown',
      success:    true,
      resource:   'Doctor',
      resourceId: String(req.params.doctorId),
      metadata:   { action: 'DOCTOR_VERIFIED' },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Doctor verified successfully.',
      data: doctor,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ── GET /admin/analytics ──────────────────────────────────────────────────────
export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Parallel aggregations
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      unverifiedDoctors,
      recentSignups,
      appointmentStats,
      totalPrescriptions,
      topSpecializations,
      appointmentTrend,
      patientDemographics,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'PATIENT' }),
      User.countDocuments({ role: 'DOCTOR' }),
      Doctor.countDocuments({ isVerified: false }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      // Appointment status breakdown
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Prescriptions count — handle missing collection gracefully
      Prescription.countDocuments().catch(() => 0),

      // Top specializations
      Doctor.aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // 7-day appointment trend
      Appointment.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),

      // Patient Demographics (Age groups)
      Patient.aggregate([
        {
          $project: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), '$dateOfBirth'] },
                  1000 * 60 * 60 * 24 * 365.25,
                ],
              },
            },
          },
        },
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [0, 18, 30, 45, 60, 200],
            default: 'Unknown',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

    // Shape appointment status breakdown
    const appointmentStatusBreakdown: Record<string, number> = {};
    for (const s of appointmentStats) {
      appointmentStatusBreakdown[s._id] = s.count;
    }
    const totalAppointments = Object.values(appointmentStatusBreakdown).reduce((a, b) => a + b, 0);
    const totalConsultations = appointmentStatusBreakdown['COMPLETED'] ?? 0;
    
    // Mock Revenue ($100 per completed consultation)
    const totalRevenue = totalConsultations * 100;

    const response: ApiResponse = {
      success: true,
      message: 'Analytics retrieved successfully.',
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        unverifiedDoctors,
        recentSignups,
        totalAppointments,
        appointmentStatusBreakdown,
        totalPrescriptions,
        totalConsultations,
        totalRevenue,
        topSpecializations,
        appointmentTrend,
        patientDemographics,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ── GET /admin/audit-logs ─────────────────────────────────────────────────────
export const getAdminAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.action)  filter.action = String(req.query.action);
    if (req.query.role)    filter.role   = String(req.query.role);
    if (req.query.success !== undefined) filter.success = req.query.success === 'true';

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Audit logs retrieved successfully.',
      data: { logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ── GET /admin/recordings ────────────────────────────────────────────────────
export const getAdminRecordings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const recordings = await Recording.find()
      .sort({ createdAt: -1 })
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName')
      .lean();

    const response: ApiResponse = {
      success: true,
      message: 'Recordings retrieved successfully.',
      data: { recordings },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
