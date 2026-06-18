import mongoose, { Document, Schema } from 'mongoose';

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  _id: mongoose.Types.ObjectId;
  prescriptionId: string;      // Human-readable ID: RX-YYYYMMDD-XXXXX
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  // AES-256-GCM encrypted
  medications: string;          // JSON array of IMedication encrypted
  instructions: string;         // General instructions encrypted
  diagnosis: string;            // Diagnosis for prescription encrypted
  // Non-encrypted metadata
  prescriptionHash: string;     // SHA-256 hash for verification
  qrCodeData: string;           // QR code content (verification URL)
  pdfPath?: string;             // Server path to generated PDF
  isValid: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    // Encrypted fields
    medications: { type: String, required: true },
    instructions: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    // Verification fields
    prescriptionHash: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    pdfPath: { type: String },
    isValid: { type: Boolean, default: true },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
PrescriptionSchema.index({ prescriptionId: 1 });
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ doctorId: 1, createdAt: -1 });
PrescriptionSchema.index({ appointmentId: 1 });
PrescriptionSchema.index({ prescriptionHash: 1 });
PrescriptionSchema.index({ expiresAt: 1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
export default Prescription;
