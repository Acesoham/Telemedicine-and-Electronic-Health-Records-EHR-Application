import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Avatar, Button,
  Skeleton, Alert, Divider, Grid, alpha,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Assignment as RecordsIcon,
  Description as PrescriptionIcon,
  Dashboard as DashboardIcon,
  Download as DownloadIcon,
  QrCode as QrIcon,
  Medication as MedIcon,
  CheckCircle as ValidIcon,
  Cancel as ExpiredIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { prescriptionsApi } from '../../services/api';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <DashboardIcon /> },
  { label: 'Medical Records', path: '/patient/records', icon: <RecordsIcon /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <CalendarIcon /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <PrescriptionIcon /> },
];

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  _id: string;
  prescriptionId: string;
  doctorId: any;
  medications: Medication[];
  instructions: string;
  diagnosis: string;
  isValid: boolean;
  expiresAt: string;
  createdAt: string;
}

const PatientPrescriptions: React.FC = () => {
  const { profile } = useAuth();
  const patientProfile = profile as { _id: string } | null;
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!patientProfile?._id) { setLoading(false); return; }
      try {
        const res = await prescriptionsApi.getPatientPrescriptions(patientProfile._id);
        const data = (res.data?.data as any) || [];
        setPrescriptions(Array.isArray(data) ? data : data.data || []);
      } catch {
        setError('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientProfile?._id]);

  const handleDownload = async (id: string, rxId: string) => {
    setDownloadingId(id);
    try {
      const res = await prescriptionsApi.download(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rxId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // PDF might not be generated yet — just skip silently
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="My Prescriptions">
      {/* Summary banner */}
      <Box
        sx={{
          mb: 4, p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 60%, #1565C0 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
          My Prescriptions
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
          {prescriptions.filter((p) => p.isValid).length} active ·{' '}
          {prescriptions.length} total
        </Typography>
      </Box>

      {loading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i} sx={{ mb: 3, p: 3 }}>
            <Skeleton width="40%" height={28} />
            <Skeleton width="60%" height={20} />
            <Skeleton width="100%" height={80} sx={{ mt: 2 }} />
          </Card>
        ))
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : prescriptions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <PrescriptionIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No prescriptions yet</Typography>
          <Typography color="text.secondary">
            Prescriptions issued by your doctors will appear here.
          </Typography>
        </Box>
      ) : (
        prescriptions.map((rx) => {
          const doctor = typeof rx.doctorId === 'object' ? rx.doctorId : null;
          const expiresAt = new Date(rx.expiresAt);
          const isExpired = expiresAt < new Date();
          const meds: Medication[] = Array.isArray(rx.medications) ? rx.medications : [];

          return (
            <Card
              key={rx._id}
              sx={{
                mb: 3,
                border: '1px solid',
                borderColor: rx.isValid && !isExpired ? alpha('#7B1FA2', 0.2) : 'divider',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
              }}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48, fontWeight: 700 }}>
                      {(doctor?.firstName || 'D').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Dr. {doctor?.firstName || 'Unknown'} {doctor?.lastName || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(rx.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      icon={rx.isValid && !isExpired ? <ValidIcon /> : <ExpiredIcon />}
                      label={rx.isValid && !isExpired ? 'Valid' : 'Expired'}
                      color={rx.isValid && !isExpired ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={rx.prescriptionId}
                      size="small"
                      variant="outlined"
                      icon={<QrIcon />}
                      sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>

                {rx.diagnosis && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha('#1565C0', 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      DIAGNOSIS
                    </Typography>
                    <Typography variant="body2">{rx.diagnosis}</Typography>
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Medications */}
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <MedIcon sx={{ fontSize: 18, color: 'secondary.main' }} /> Medications
                </Typography>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {meds.map((med, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <Box
                        sx={{
                          p: 2, borderRadius: 2, border: '1px solid',
                          borderColor: 'divider', bgcolor: 'background.default',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{med.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          💊 {med.dosage} — {med.frequency}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          ⏱ Duration: {med.duration}
                        </Typography>
                        {med.instructions && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            ℹ {med.instructions}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {rx.instructions && (
                  <Alert severity="info" sx={{ mb: 2 }} icon={false}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>General Instructions: </Typography>
                    <Typography variant="caption">{rx.instructions}</Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Valid until: {expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={downloadingId === rx._id ? undefined : <DownloadIcon />}
                    onClick={() => handleDownload(rx._id, rx.prescriptionId)}
                    disabled={downloadingId === rx._id}
                  >
                    {downloadingId === rx._id ? 'Downloading…' : 'Download PDF'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
