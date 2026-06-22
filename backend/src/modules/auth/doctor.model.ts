import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailabilitySlot {
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
}

export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  bio: string;
  profilePhoto?: string;
  qualifications: string[];
  yearsOfExperience: number;
  availabilitySlots: IAvailabilitySlot[];
  consultationDurationMinutes: number;
  isVerified: boolean;
  isAcceptingAppointments: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Virtual
  fullName: string;
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true }, // HH:MM format
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    profilePhoto: { type: String },
    qualifications: { type: [String], default: [] },
    yearsOfExperience: { type: Number, default: 0 },
    availabilitySlots: { type: [AvailabilitySlotSchema], default: [] },
    consultationDurationMinutes: { type: Number, default: 30 },
    isVerified: { type: Boolean, default: true },
    isAcceptingAppointments: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ isVerified: 1, isAcceptingAppointments: 1 });

// Virtual for full name
DoctorSchema.virtual('fullName').get(function () {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

DoctorSchema.set('toJSON', { virtuals: true });
DoctorSchema.set('toObject', { virtuals: true });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
export default Doctor;
