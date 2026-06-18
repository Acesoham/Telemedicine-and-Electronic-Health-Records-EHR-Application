import mongoose, { Document, Schema } from 'mongoose';
import { AppointmentStatus } from '../../types';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  endsAt: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  timezone: string;
  roomToken?: string;
  chiefComplaint: string;
  notes?: string;       // Encrypted — doctor consultation notes
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Appointment date/time is required'],
    },
    endsAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
      min: 15,
      max: 120,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'PENDING',
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    roomToken: {
      type: String,
      unique: true,
      sparse: true, // Only unique when non-null
    },
    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String, // AES-256-GCM encrypted
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Critical indexes for collision detection and queries
AppointmentSchema.index({ doctorId: 1, scheduledAt: 1 });
AppointmentSchema.index({ patientId: 1, scheduledAt: 1 });
AppointmentSchema.index({ doctorId: 1, status: 1, scheduledAt: 1 });
AppointmentSchema.index({ status: 1, scheduledAt: 1 });
AppointmentSchema.index({ createdAt: -1 });

// Compound index for collision detection query
AppointmentSchema.index(
  { doctorId: 1, status: 1, scheduledAt: 1, endsAt: 1 },
  { name: 'collision_detection_idx' },
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;
