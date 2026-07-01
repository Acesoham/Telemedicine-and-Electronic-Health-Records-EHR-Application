import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Alert, CircularProgress, Fab, Tooltip,
  Chip, Snackbar, IconButton,
} from '@mui/material';
import {
  Mic, MicOff, Videocam, VideocamOff, CallEnd,
  FiberManualRecord, Stop, VideoLibrary,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { recordingsApi } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ConsultationRoom: React.FC = () => {
  const { roomToken } = useParams<{ roomToken: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  // ── Basic call state ─────────────────────────────────────────────────────
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Initializing connection...');
  const [remoteParticipantName, setRemoteParticipantName] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // ── Recording state ───────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState('');
  const [recordingSaved, setRecordingSaved] = useState(false);
  const [savingRecording, setSavingRecording] = useState(false);

  // appointmentId passed from DoctorConsultations via navigate state
  const appointmentId: string | undefined = (location.state as { appointmentId?: string } | null)
    ?.appointmentId;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerSocketIdRef = useRef<string | null>(null);

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── WebRTC / media setup ─────────────────────────────────────────────────
  useEffect(() => {
    if (!roomToken || !user) return;
    let isComponentMounted = true;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isComponentMounted) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setStatus('Waiting for other participant to join...');
        connectSocket();
      } catch {
        setError('Failed to access camera and microphone. Please ensure permissions are granted.');
        setStatus('Error');
      }
    };

    const connectSocket = () => {
      const token = localStorage.getItem('medivault_access_token');
      const socket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => {
        const name = profile ? `${(profile as { firstName?: string }).firstName ?? ''} ${(profile as { lastName?: string }).lastName ?? ''}`.trim() : 'Participant';
        socket.emit('room:join', { roomToken, name });
      });

      socket.on('error', (err: { message?: string }) => {
        setError(err.message || 'Connection error.');
        setStatus('Error');
      });

      socket.on('room:joined', ({ participants }: { participants: { socketId: string; name: string }[] }) => {
        if (participants.length > 0) {
          peerSocketIdRef.current = participants[0].socketId;
          setRemoteParticipantName(participants[0].name);
          setStatus(`Connected with ${participants[0].name}`);
          initiateCall(participants[0].socketId);
        }
      });

      socket.on('room:peer-joined', ({ socketId, name }: { socketId: string; name: string }) => {
        peerSocketIdRef.current = socketId;
        setRemoteParticipantName(name);
        setStatus(`Connected with ${name}`);
      });

      socket.on('webrtc:offer', async ({ offer, fromSocketId }: { offer: RTCSessionDescriptionInit; fromSocketId: string }) => {
        peerSocketIdRef.current = fromSocketId;
        await handleReceiveOffer(offer, fromSocketId);
      });

      socket.on('webrtc:answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('webrtc:ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (peerConnectionRef.current && candidate) {
          try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (e) { console.error('Error adding ICE candidate', e); }
        }
      });

      socket.on('room:peer-left', () => {
        setRemoteParticipantName(null);
        setStatus('Participant left. Waiting...');
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
      });
    };

    startMedia();

    return () => {
      isComponentMounted = false;
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomToken, user, profile]);

  const createPeerConnection = (targetSocketId: string) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
    }
    pc.ontrack = (event) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0]; };
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice-candidate', { candidate: event.candidate, targetSocketId });
      }
    };
    peerConnectionRef.current = pc;
    return pc;
  };

  const initiateCall = async (targetSocketId: string) => {
    const pc = createPeerConnection(targetSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (socketRef.current) socketRef.current.emit('webrtc:offer', { offer, targetSocketId });
  };

  const handleReceiveOffer = async (offer: RTCSessionDescriptionInit, fromSocketId: string) => {
    const pc = createPeerConnection(fromSocketId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (socketRef.current) socketRef.current.emit('webrtc:answer', { answer, targetSocketId: fromSocketId });
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) { track.enabled = !track.enabled; setAudioEnabled(track.enabled); }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setVideoEnabled(track.enabled); }
    }
  };

  const handleEndCall = () => {
    if (socketRef.current) socketRef.current.emit('room:leave', { roomToken });
    navigate(user?.role === 'DOCTOR' ? '/doctor/consultations' : '/patient/appointments');
  };

  // ── Recording logic ───────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (!appointmentId) {
      setRecordingError('No appointment ID available. Please join from the Consultations page.');
      return;
    }
    if (!localStreamRef.current) {
      setRecordingError('Camera stream not available.');
      return;
    }

    try {
      // 1. Notify backend recording started
      const res = await recordingsApi.start(appointmentId);
      const recId = (res.data?.data as { _id: string })?._id;
      if (!recId) throw new Error('Failed to get recording ID from server');
      setRecordingId(recId);

      // 2. Start MediaRecorder on local stream
      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';

      const mr = new MediaRecorder(localStreamRef.current, mimeType ? { mimeType } : undefined);
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mr.start(1000); // collect data every second
      mediaRecorderRef.current = mr;

      // 3. Start timer
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);

      setIsRecording(true);
      setRecordingError('');
    } catch (err) {
      setRecordingError('Could not start recording. Please try again.');
      console.error(err);
    }
  }, [appointmentId]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !recordingId) return;

    setSavingRecording(true);

    // Stop timer
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }

    // Stop MediaRecorder and wait for all data
    await new Promise<void>((resolve) => {
      const mr = mediaRecorderRef.current!;
      mr.onstop = () => resolve();
      mr.stop();
    });

    const blob = new Blob(recordedChunksRef.current, { type: mediaRecorderRef.current.mimeType });
    const mimeType = blob.type;
    const fileSize = blob.size;

    // Convert blob to base64 Data URL
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        await recordingsApi.stop(recordingId, {
          recordingDataUrl: dataUrl,
          durationSeconds: recordingSeconds,
          fileSize,
          mimeType,
        });
        setRecordingSaved(true);
      } catch (err) {
        setRecordingError('Recording captured but failed to save to server.');
        console.error(err);
      } finally {
        setIsRecording(false);
        setRecordingId(null);
        setSavingRecording(false);
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
      }
    };
  }, [recordingId, recordingSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isDoctor = user?.role === 'DOCTOR';

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" color="white" sx={{ fontWeight: 600 }}>
          Consultation Room
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* Recording badge */}
          {isRecording && (
            <Chip
              icon={<FiberManualRecord sx={{ animation: 'pulse 1s infinite', color: '#ef4444 !important', fontSize: '0.8rem' }} />}
              label={`REC ${formatTime(recordingSeconds)}`}
              sx={{
                bgcolor: 'rgba(239,68,68,0.2)',
                color: '#ef4444',
                fontWeight: 700,
                border: '1px solid rgba(239,68,68,0.4)',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
          )}
          <Typography color="white" sx={{ opacity: 0.8 }}>
            {status}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {recordingError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setRecordingError('')}>
          {recordingError}
        </Alert>
      )}

      {/* Video area */}
      <Box sx={{ flex: 1, position: 'relative', display: 'flex', gap: 2, minHeight: 0 }}>
        {/* Remote Video */}
        <Paper
          sx={{
            flex: 1, bgcolor: '#1e293b', borderRadius: 3, overflow: 'hidden',
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {remoteParticipantName && (
            <Typography sx={{
              position: 'absolute', top: 16, left: 16, color: 'white', zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)', px: 2, py: 0.5, borderRadius: 1,
            }}>
              {remoteParticipantName}
            </Typography>
          )}
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {!remoteParticipantName && !error && (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress size={60} sx={{ mb: 2, color: 'primary.main' }} />
              <Typography>Waiting for other participant...</Typography>
            </Box>
          )}
        </Paper>

        {/* Local Video (PiP) */}
        <Paper
          sx={{
            position: 'absolute', bottom: 24, right: 24, width: 240, height: 160,
            bgcolor: '#334155', borderRadius: 2, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 10,
          }}
        >
          <Typography sx={{
            position: 'absolute', bottom: 8, left: 8, color: 'white', zIndex: 10,
            fontSize: '0.75rem', bgcolor: 'rgba(0,0,0,0.5)', px: 1, borderRadius: 1,
          }}>
            You
          </Typography>
          <video
            ref={localVideoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        </Paper>
      </Box>

      {/* Controls */}
      <Box sx={{ height: 90, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Tooltip title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}>
          <Fab color={audioEnabled ? 'default' : 'error'} onClick={toggleAudio} sx={{ width: 56, height: 56 }}>
            {audioEnabled ? <Mic /> : <MicOff />}
          </Fab>
        </Tooltip>

        {/* Recording button — doctors only */}
        {isDoctor && (
          <Tooltip title={isRecording ? 'Stop Recording' : (appointmentId ? 'Start Recording' : 'Join from Consultations page to enable recording')}>
            <span>
              <Fab
                onClick={isRecording ? stopRecording : startRecording}
                disabled={savingRecording || !appointmentId}
                sx={{
                  width: 56, height: 56,
                  bgcolor: isRecording ? '#ef4444' : '#7c3aed',
                  color: 'white',
                  '&:hover': { bgcolor: isRecording ? '#dc2626' : '#6d28d9' },
                  '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
                  boxShadow: isRecording ? '0 0 20px rgba(239,68,68,0.5)' : undefined,
                }}
              >
                {savingRecording ? <CircularProgress size={24} sx={{ color: 'white' }} /> : isRecording ? <Stop /> : <FiberManualRecord />}
              </Fab>
            </span>
          </Tooltip>
        )}

        <Tooltip title="End Call">
          <Fab color="error" onClick={handleEndCall} sx={{ width: 64, height: 64 }}>
            <CallEnd fontSize="large" />
          </Fab>
        </Tooltip>

        <Tooltip title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}>
          <Fab color={videoEnabled ? 'default' : 'error'} onClick={toggleVideo} sx={{ width: 56, height: 56 }}>
            {videoEnabled ? <Videocam /> : <VideocamOff />}
          </Fab>
        </Tooltip>

        {/* Go to Recordings shortcut — doctor only */}
        {isDoctor && (
          <Tooltip title="View Recordings">
            <IconButton
              onClick={() => navigate('/doctor/consultations', { state: { openTab: 4 } })}
              sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}
            >
              <VideoLibrary />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Snackbar: recording saved */}
      <Snackbar
        open={recordingSaved}
        autoHideDuration={5000}
        onClose={() => setRecordingSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setRecordingSaved(false)} sx={{ width: '100%' }}>
          Recording saved! View it in the Recordings tab.
        </Alert>
      </Snackbar>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
};

export default ConsultationRoom;
