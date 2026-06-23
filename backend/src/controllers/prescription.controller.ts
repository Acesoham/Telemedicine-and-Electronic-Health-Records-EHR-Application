import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { Prescription } from '../modules/prescriptions/prescription.model';
import { Appointment } from '../modules/appointments/appointment.model';
import { Patient } from '../modules/auth/patient.model';
import { Doctor } from '../modules/auth/doctor.model';
import { encrypt, decrypt, hashSHA256 } from '../utils/encryption';
import mongoose from 'mongoose';

export const createPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user!.userId;
    const { appointmentId, patientId, medications, instructions, diagnosis } = req.body;

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    // Verify appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // Generate RX ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    const prescriptionId = `RX-${dateStr}-${randomStr}`;

    // Prepare data to encrypt
    const medsJson = JSON.stringify(medications);
    
    // Create Hash for verification
    const dataToHash = `${prescriptionId}:${doctor._id}:${patientId}:${medsJson}:${diagnosis}`;
    const prescriptionHash = hashSHA256(dataToHash);
    
    // QR Code data (Verification URL or hash)
    // In a real app, this would be a URL to verify the prescription
    const qrCodeData = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-prescription/${prescriptionHash}`;

    const newPrescription = new Prescription({
      prescriptionId,
      appointmentId,
      doctorId: doctor._id,
      patientId,
      medications: encrypt(medsJson),
      instructions: encrypt(instructions || ''),
      diagnosis: encrypt(diagnosis || ''),
      prescriptionHash,
      qrCodeData,
      isValid: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
    });

    await newPrescription.save();

    res.status(201).json({ success: true, data: newPrescription });
  } catch (error) {
    next(error);
  }
};

export const getMyPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If the user is a doctor
    const doctor = await Doctor.findOne({ userId: req.user!.userId });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'firstName lastName')
      .populate('appointmentId', 'scheduledAt')
      .sort({ createdAt: -1 });

    // Decrypt data before sending
    const decryptedPrescriptions = prescriptions.map((p) => {
      const obj = p.toObject();
      try {
        obj.medications = JSON.parse(decrypt(obj.medications));
        obj.instructions = decrypt(obj.instructions);
        obj.diagnosis = decrypt(obj.diagnosis);
      } catch (e) {
        // Skip on decrypt error
      }
      return obj;
    });

    res.status(200).json({ success: true, data: decryptedPrescriptions });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let patientObjId;
    
    if (req.user!.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user!.userId });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found' });
        return;
      }
      patientObjId = patient._id;
    } else {
      // If accessed by doctor, the patientId param should be the actual Patient ObjectId or User ObjectId
      // For safety, let's assume req.params.patientId is the User ObjectId or Patient ObjectId.
      // In EHR routes it is patient._id.toString()
      patientObjId = req.params.patientId;
    }

    const prescriptions = await Prescription.find({ patientId: patientObjId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    const decryptedPrescriptions = prescriptions.map((p) => {
      const obj = p.toObject();
      try {
        obj.medications = JSON.parse(decrypt(obj.medications));
        obj.instructions = decrypt(obj.instructions);
        obj.diagnosis = decrypt(obj.diagnosis);
      } catch (e) {
        // Skip on decrypt error
      }
      return obj;
    });

    res.status(200).json({ success: true, data: decryptedPrescriptions });
  } catch (error) {
    next(error);
  }
};

export const downloadPrescriptionPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate('doctorId')
      .populate('patientId');

    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }

    // Check permissions
    if (req.user!.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user!.userId });
      if (!patient || patient._id.toString() !== prescription.patientId._id.toString()) {
         res.status(403).json({ success: false, message: 'Unauthorized' });
         return;
      }
    } else if (req.user!.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user!.userId });
      if (!doctor || doctor._id.toString() !== prescription.doctorId._id.toString()) {
         res.status(403).json({ success: false, message: 'Unauthorized' });
         return;
      }
    }

    let meds = [];
    let diagnosis = '';
    let instructions = '';
    try {
      meds = JSON.parse(decrypt(prescription.medications));
      diagnosis = decrypt(prescription.diagnosis);
      instructions = decrypt(prescription.instructions);
    } catch (e) {
      res.status(500).json({ success: false, message: 'Failed to decrypt prescription data' });
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${prescription.prescriptionId}.pdf`);

    doc.pipe(res);

    // Header
    const doctorObj = prescription.doctorId as any;
    const patientObj = prescription.patientId as any;

    doc.fontSize(24).fillColor('#1565C0').text('MediVault Health', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#000000').text('Official Medical Prescription', { align: 'center' });
    doc.moveDown(2);

    // Doctor Info
    doc.fontSize(14).text(`Dr. ${doctorObj.firstName} ${doctorObj.lastName}`, { continued: true }).text('', { align: 'right' });
    doc.fontSize(10).text(`Specialization: ${doctorObj.specialization}`);
    doc.text(`License No: ${doctorObj.licenseNumber}`);
    doc.text(`Phone: ${doctorObj.phone}`);
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
    doc.moveDown();

    // Patient Info & Prescription Details
    doc.fontSize(12).text(`Patient Name: ${patientObj.firstName} ${patientObj.lastName}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
    doc.text(`Prescription ID: ${prescription.prescriptionId}`);
    if (diagnosis) {
      doc.moveDown(0.5);
      doc.text(`Diagnosis: ${diagnosis}`);
    }
    doc.moveDown();

    // Medications
    doc.fontSize(16).fillColor('#1565C0').text('Rx Medications');
    doc.moveDown(0.5);
    doc.fillColor('#000000').fontSize(12);

    meds.forEach((med: any, index: number) => {
      doc.text(`${index + 1}. ${med.name}`, { stroke: true });
      doc.fontSize(10).text(`   Dosage: ${med.dosage} | Frequency: ${med.frequency} | Duration: ${med.duration}`);
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`);
      }
      doc.moveDown(0.5);
      doc.fontSize(12);
    });

    if (instructions) {
      doc.moveDown();
      doc.fontSize(14).text('General Instructions:');
      doc.fontSize(10).text(instructions);
    }

    doc.moveDown(2);

    // QR Code for verification
    try {
      const qrImage = await QRCode.toDataURL(prescription.qrCodeData);
      doc.image(qrImage, 50, doc.y, { width: 100 });
      doc.text('Scan to verify', 60, doc.y + 105, { width: 100 });
    } catch (err) {
      // If QR fails, ignore
    }

    doc.fontSize(10).fillColor('#666666').text('This is a digitally generated prescription and does not require a physical signature.', 50, doc.page.height - 100, { align: 'center' });

    doc.end();

  } catch (error) {
    next(error);
  }
};
