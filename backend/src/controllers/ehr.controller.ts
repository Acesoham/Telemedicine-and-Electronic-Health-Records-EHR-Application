import { Request, Response, NextFunction } from 'express';
import { EhrService } from '../services/ehr.service';
import { Patient } from '../modules/auth/patient.model';

export const getMyRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const patient = await Patient.findOne({ userId });
    
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient profile not found' });
      return;
    }

    let record = await EhrService.getRecord(patient._id.toString());
    if (!record) {
      record = await EhrService.initializeRecord(patient._id.toString(), userId);
      record = await EhrService.getRecord(patient._id.toString());
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const updateMyRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const patient = await Patient.findOne({ userId });

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient profile not found' });
      return;
    }

    // Only allow safe fields — patients cannot write diagnoses or consultation notes
    const { demographics, allergies, medicalHistory } = req.body;

    let record = await EhrService.getRecord(patient._id.toString());
    if (!record) {
      await EhrService.initializeRecord(patient._id.toString(), userId);
    }

    const updated = await EhrService.updateRecord(patient._id.toString(), userId, {
      demographics,
      allergies,
      medicalHistory,
    });

    res.status(200).json({ success: true, message: 'Medical record updated', data: updated });
  } catch (error) {
    next(error);
  }
};

export const getPatientRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    let record = await EhrService.getRecord(patientId);
    
    if (!record) {
      // If doctor is accessing and it doesn't exist, we can initialize it
      record = await EhrService.initializeRecord(patientId, req.user!.userId);
      record = await EhrService.getRecord(patientId);
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    const doctorId = req.user!.userId;
    const record = await EhrService.updateRecord(patientId, doctorId, req.body);
    
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const addDiagnosis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    const doctorId = req.user!.userId;
    const record = await EhrService.addDiagnosis(patientId, doctorId, req.body);
    
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const addConsultationNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId as string;
    const doctorId = req.user!.userId;
    const record = await EhrService.addConsultationNote(patientId, doctorId, req.body);
    
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
