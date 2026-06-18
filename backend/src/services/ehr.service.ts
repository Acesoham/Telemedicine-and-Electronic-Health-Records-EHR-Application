import mongoose from 'mongoose';
import MedicalRecord from '../modules/ehr/medicalRecord.model';
import { encrypt, decrypt } from '../utils/encryption';
import logger from '../utils/logger';

const encryptJSON = (data: unknown): string => {
  if (data === undefined || data === null) return '';
  return encrypt(JSON.stringify(data));
};

const decryptJSON = (data: string): any => {
  if (!data) return null;
  try {
    return JSON.parse(decrypt(data));
  } catch (err) {
    logger.error('Failed to decrypt medical record field:', err);
    return null;
  }
};

export class EhrService {
  /**
   * Initializes an empty medical record for a new patient
   */
  static async initializeRecord(patientId: string, createdBy: string) {
    const record = new MedicalRecord({
      patientId,
      demographics: encryptJSON({}),
      allergies: encryptJSON([]),
      medicalHistory: encryptJSON(''),
      diagnoses: encryptJSON([]),
      consultationNotes: encryptJSON([]),
      lastUpdatedBy: createdBy,
    });
    await record.save();
    return record;
  }

  /**
   * Retrieves and decrypts a patient's medical record
   */
  static async getRecord(patientId: string) {
    let record = await MedicalRecord.findOne({ patientId });
    if (!record) return null;

    return {
      _id: record._id,
      patientId: record.patientId,
      demographics: decryptJSON(record.demographics),
      allergies: decryptJSON(record.allergies),
      medicalHistory: decryptJSON(record.medicalHistory),
      diagnoses: decryptJSON(record.diagnoses) || [],
      consultationNotes: decryptJSON(record.consultationNotes) || [],
      reports: record.reports,
      lastUpdatedBy: record.lastUpdatedBy,
      version: record.version,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Updates basic medical record fields
   */
  static async updateRecord(patientId: string, doctorId: string, updates: any) {
    const record = await MedicalRecord.findOne({ patientId });
    if (!record) throw new Error('Medical record not found');

    if (updates.demographics !== undefined) record.demographics = encryptJSON(updates.demographics);
    if (updates.allergies !== undefined) record.allergies = encryptJSON(updates.allergies);
    if (updates.medicalHistory !== undefined) record.medicalHistory = encryptJSON(updates.medicalHistory);

    record.lastUpdatedBy = new mongoose.Types.ObjectId(doctorId);
    record.version += 1;
    await record.save();

    return this.getRecord(patientId);
  }

  /**
   * Appends a new diagnosis to the record
   */
  static async addDiagnosis(patientId: string, doctorId: string, diagnosisData: any) {
    const record = await MedicalRecord.findOne({ patientId });
    if (!record) throw new Error('Medical record not found');

    const diagnoses = decryptJSON(record.diagnoses) || [];
    diagnoses.push({
      ...diagnosisData,
      diagnosedBy: doctorId,
      diagnosedAt: diagnosisData.diagnosedAt || new Date(),
    });

    record.diagnoses = encryptJSON(diagnoses);
    record.lastUpdatedBy = new mongoose.Types.ObjectId(doctorId);
    record.version += 1;
    await record.save();

    return this.getRecord(patientId);
  }

  /**
   * Appends a new consultation note to the record
   */
  static async addConsultationNote(patientId: string, doctorId: string, noteData: any) {
    const record = await MedicalRecord.findOne({ patientId });
    if (!record) throw new Error('Medical record not found');

    const notes = decryptJSON(record.consultationNotes) || [];
    notes.push({
      ...noteData,
      authorId: doctorId,
      createdAt: new Date(),
    });

    record.consultationNotes = encryptJSON(notes);
    record.lastUpdatedBy = new mongoose.Types.ObjectId(doctorId);
    record.version += 1;
    await record.save();

    return this.getRecord(patientId);
  }
}
