import mongoose, { Document, Schema } from 'mongoose';

export interface IDiagnosis {
  code?: string;        // ICD-10 code
  description: string;
  diagnosedAt: Date;
  diagnosedBy: mongoose.Types.ObjectId;
}

export interface IReport {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
  description?: string;
}

export interface IMedicalRecord extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  // AES-256-GCM encrypted fields
  demographics: string;       // JSON encrypted
  allergies: string;          // JSON array encrypted
  medicalHistory: string;     // JSON string encrypted
  diagnoses: string;          // JSON array encrypted
  consultationNotes: string;  // JSON array encrypted
  // Non-encrypted
  reports: IReport[];
  lastUpdatedBy: mongoose.Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
  },
  { _id: true },
);

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true, // One record document per patient (subdocument approach)
    },
    // All sensitive fields stored AES-256-GCM encrypted
    demographics: { type: String, default: '' },
    allergies: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
    diagnoses: { type: String, default: '' },
    consultationNotes: { type: String, default: '' },
    // Reports are file metadata — less sensitive, stored plaintext
    reports: { type: [ReportSchema], default: [] },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
MedicalRecordSchema.index({ lastUpdatedBy: 1 });
MedicalRecordSchema.index({ updatedAt: -1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
export default MedicalRecord;
