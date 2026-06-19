import mongoose, { Document, Schema } from 'mongoose';
import { AuditAction, UserRole } from '../../types';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  role?: UserRole;
  action: AuditAction;
  ipAddress: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: { type: String },
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'ADMIN'],
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTER',
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_UPDATE',
        'VIEW_RECORD',
        'CREATE_RECORD',
        'UPDATE_RECORD',
        'DELETE_RECORD',
        'BOOK_APPOINTMENT',
        'CONFIRM_APPOINTMENT',
        'CANCEL_APPOINTMENT',
        'JOIN_CONSULTATION',
        'LEAVE_CONSULTATION',
        'CREATE_PRESCRIPTION',
        'VIEW_PRESCRIPTION',
        'DOWNLOAD_PRESCRIPTION',
        'ADMIN_ACTION',
        'FAILED_LOGIN',
        'UNAUTHORIZED_ACCESS',
      ],
    },
    ipAddress: { type: String, default: 'unknown' },
    userAgent: { type: String },
    resource: { type: String },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    success: { type: Boolean, default: true },
    errorMessage: { type: String },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true, // MongoDB 4.0+ — field cannot be changed after insert
    },
  },
  {
    timestamps: false, // We use our own 'timestamp' field
    versionKey: false,
    // Disable all update operations at schema level via pre hooks
  },
);

// Make audit logs truly immutable — prevent any updates or deletes
AuditLogSchema.pre(/^(updateOne|updateMany|findOneAndUpdate|findOneAndDelete|deleteOne|deleteMany)$/, function (this: any, next: (err?: Error) => void) {
  const err = new Error('Audit logs are immutable and cannot be modified or deleted');
  next(err);
});

// Indexes for efficient admin queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });

// TTL index — optionally expire old logs after 2 years (7730 days)
// Uncomment in production if log retention policy requires it:
// AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7730 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
