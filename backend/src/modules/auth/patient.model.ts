import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phone: string;
  address: string;
  emergencyContact?: IEmergencyContact;
  bloodGroup?: string;
  profilePhoto?: string;
  // Encrypted fields — stored encrypted in DB
  allergies: string;        // JSON array encrypted
  medicalHistory: string;   // JSON string encrypted
  createdAt: Date;
  updatedAt: Date;
  // Virtual
  fullName: string;
  age: number;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const PatientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
      required: true,
    },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, default: '' },
    emergencyContact: { type: EmergencyContactSchema },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
    },
    profilePhoto: { type: String },
    // AES-256-GCM encrypted fields
    allergies: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ createdAt: -1 });

// Virtual: full name
PatientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: age
PatientSchema.virtual('age').get(function () {
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

PatientSchema.set('toJSON', { virtuals: true });
PatientSchema.set('toObject', { virtuals: true });

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;
