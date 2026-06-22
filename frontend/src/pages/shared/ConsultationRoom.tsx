import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Fab, Tooltip } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, CallEnd } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ConsultationRoom: React.FC = () => {
  const { roomToken } = useParams<{ roomToken: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Initializing connection...');
  const [remoteParticipantName, setRemoteParticipantName] = useState<string | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerSocketIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomToken || !user) return;

    let isComponentMounted = true;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isComponentMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setStatus('Waiting for other participant to join...');
        connectSocket();
      } catch (err) {
        setError('Failed to access camera and microphone. Please ensure permissions are granted.');
        setStatus('Error');
      }
    };

    const connectSocket = () => {
      const token = localStorage.getItem('medivault_access_token');
      const socket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => {
        const name = profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : 'Participant';
        socket.emit('room:join', { roomToken, name });
      });

      socket.on('error', (err: any) => {
        setError(err.message || 'Connection error.');
        setStatus('Error');
      });

      socket.on('room:joined', ({ participants }) => {
        if (participants.length > 0) {
          peerSocketIdRef.current = participants[0].socketId;
          setRemoteParticipantName(participants[0].name);
          setStatus(`Connected with ${participants[0].name}`);
          initiateCall(participants[0].socketId);
        }
      });

      socket.on('room:peer-joined', ({ socketId, name }) => {
        peerSocketIdRef.current = socketId;
        setRemoteParticipantName(name);
        setStatus(`Connected with ${name}`);
      });

      socket.on('webrtc:offer', async ({ offer, fromSocketId }) => {
        peerSocketIdRef.current = fromSocketId;
        await handleReceiveOffer(offer, fromSocketId);
      });

      socket.on('webrtc:answer', async ({ answer }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('webrtc:ice-candidate', async ({ candidate }) => {
        if (peerConnectionRef.current && candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        }
      });

      socket.on('room:peer-left', () => {
        setRemoteParticipantName(null);
        setStatus('Participant left. Waiting...');
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      });
    };

    startMedia();

    return () => {
      isComponentMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomToken, user, profile]);

  const createPeerConnection = (targetSocketId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice-candidate', {
          candidate: event.candidate,
          targetSocketId
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const initiateCall = async (targetSocketId: string) => {
    const pc = createPeerConnection(targetSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    if (socketRef.current) {
      socketRef.current.emit('webrtc:offer', { offer, targetSocketId });
    }
  };

  const handleReceiveOffer = async (offer: any, fromSocketId: string) => {
    const pc = createPeerConnection(fromSocketId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (socketRef.current) {
      socketRef.current.emit('webrtc:answer', { answer, targetSocketId: fromSocketId });
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      }
    }
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('room:leave', { roomToken });
    }
    navigate(user?.role === 'DOCTOR' ? '/doctor/appointments' : '/patient/appointments');
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" color="white" sx={{ fontWeight: 600 }}>
          Consultation Room
        </Typography>
        <Typography color="white" sx={{ opacity: 0.8 }}>
          {status}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ flex: 1, position: 'relative', display: 'flex', gap: 2, minHeight: 0 }}>
        {/* Remote Video */}
        <Paper 
          sx={{ 
            flex: 1, 
            bgcolor: '#1e293b', 
            borderRadius: 3, 
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {remoteParticipantName && (
            <Typography sx={{ position: 'absolute', top: 16, left: 16, color: 'white', zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)', px: 2, py: 0.5, borderRadius: 1 }}>
              {remoteParticipantName}
            </Typography>
          )}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          {!remoteParticipantName && !error && (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress size={60} sx={{ mb: 2, color: 'primary.main' }} />
              <Typography>Waiting for other participant...</Typography>
            </Box>
          )}
        </Paper>

        {/* Local Video */}
        <Paper 
          sx={{ 
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 240, 
            height: 160, 
            bgcolor: '#334155', 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 10
          }}
        >
          <Typography sx={{ position: 'absolute', bottom: 8, left: 8, color: 'white', zIndex: 10, fontSize: '0.75rem', bgcolor: 'rgba(0,0,0,0.5)', px: 1, borderRadius: 1 }}>
            You
          </Typography>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
          />
        </Paper>
      </Box>

      {/* Controls */}
      <Box sx={{ height: 80, mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
        <Tooltip title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}>
          <Fab 
            color={audioEnabled ? "default" : "error"} 
            onClick={toggleAudio}
            sx={{ width: 56, height: 56 }}
          >
            {audioEnabled ? <Mic /> : <MicOff />}
          </Fab>
        </Tooltip>

        <Tooltip title="End Call">
          <Fab 
            color="error" 
            onClick={handleEndCall}
            sx={{ width: 64, height: 64 }}
          >
            <CallEnd fontSize="large" />
          </Fab>
        </Tooltip>

        <Tooltip title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}>
          <Fab 
            color={videoEnabled ? "default" : "error"} 
            onClick={toggleVideo}
            sx={{ width: 56, height: 56 }}
          >
            {videoEnabled ? <Videocam /> : <VideocamOff />}
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ConsultationRoom;
