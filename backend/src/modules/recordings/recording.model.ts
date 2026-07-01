import mongoose, { Document, Schema } from 'mongoose';

export type RecordingStatus = 'RECORDING' | 'COMPLETED' | 'FAILED';

export interface IRecording extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  status: RecordingStatus;
  recordingDataUrl?: string; // base64 data URL stored for demo (replace with cloud URL in production)
  fileSize?: number;         // bytes
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecordingSchema = new Schema<IRecording>(
  {
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
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['RECORDING', 'COMPLETED', 'FAILED'],
      default: 'RECORDING',
    },
    recordingDataUrl: {
      type: String, // base64 Data URL — swap for cloud storage URL in production
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

RecordingSchema.index({ doctorId: 1, createdAt: -1 });
RecordingSchema.index({ appointmentId: 1 });

export const Recording = mongoose.model<IRecording>('Recording', RecordingSchema);
export default Recording;
