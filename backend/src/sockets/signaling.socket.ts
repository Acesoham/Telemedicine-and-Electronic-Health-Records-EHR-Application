import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { Appointment } from '../modules/appointments/appointment.model';
import { logger } from '../utils/logger';

interface RoomParticipant {
  socketId: string;
  userId: string;
  role: string;
  name: string;
}

// Track active rooms in memory
const activeRooms = new Map<string, RoomParticipant[]>();

/**
 * Authenticates socket connection via JWT in handshake
 */
const authenticateSocket = (socket: Socket): { userId: string; role: string } | null => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
};

export const registerSignalingHandlers = (io: SocketServer): void => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // ──────────────────────────────────
    // Join Consultation Room
    // ──────────────────────────────────
    socket.on('room:join', async (data: { roomToken: string; name: string }) => {
      const auth = authenticateSocket(socket);
      if (!auth) {
        socket.emit('error', { message: 'Authentication required.' });
        return;
      }

      const { roomToken, name } = data;

      try {
        // Validate appointment room token and time window
        const now = new Date();
        const appointment = await Appointment.findOne({
          roomToken,
          status: 'CONFIRMED',
          scheduledAt: { $lte: new Date(now.getTime() + 5 * 60 * 1000) }, // 5min early
          endsAt: { $gte: new Date(now.getTime() - 10 * 60 * 1000) }, // 10min grace
        });

        if (!appointment) {
          socket.emit('error', {
            message: 'Room not found or consultation time has not started yet.',
          });
          return;
        }

        // Join the socket room
        await socket.join(roomToken);

        // Track participant
        const participant: RoomParticipant = {
          socketId: socket.id,
          userId: auth.userId,
          role: auth.role,
          name,
        };

        if (!activeRooms.has(roomToken)) {
          activeRooms.set(roomToken, []);
        }
        activeRooms.get(roomToken)!.push(participant);

        const roomParticipants = activeRooms.get(roomToken)!;

        // Notify others in room
        socket.to(roomToken).emit('room:peer-joined', {
          socketId: socket.id,
          userId: auth.userId,
          name,
        });

        // Send current participants to the joining user
        socket.emit('room:joined', {
          roomToken,
          participants: roomParticipants.filter((p) => p.socketId !== socket.id),
        });

        logger.info(`User ${auth.userId} joined room ${roomToken}`);
      } catch (err) {
        logger.error(`Room join error: ${err}`);
        socket.emit('error', { message: 'Failed to join consultation room.' });
      }
    });

    // ──────────────────────────────────
    // WebRTC Signaling: SDP Offer
    // ──────────────────────────────────
    socket.on(
      'webrtc:offer',
      (data: { roomToken: string; offer: Record<string, any>; targetSocketId: string }) => {
        socket.to(data.targetSocketId).emit('webrtc:offer', {
          offer: data.offer,
          fromSocketId: socket.id,
        });
      },
    );

    // ──────────────────────────────────
    // WebRTC Signaling: SDP Answer
    // ──────────────────────────────────
    socket.on(
      'webrtc:answer',
      (data: { answer: Record<string, any>; targetSocketId: string }) => {
        socket.to(data.targetSocketId).emit('webrtc:answer', {
          answer: data.answer,
          fromSocketId: socket.id,
        });
      },
    );

    // ──────────────────────────────────
    // WebRTC Signaling: ICE Candidates
    // ──────────────────────────────────
    socket.on(
      'webrtc:ice-candidate',
      (data: { candidate: Record<string, any>; targetSocketId: string }) => {
        socket.to(data.targetSocketId).emit('webrtc:ice-candidate', {
          candidate: data.candidate,
          fromSocketId: socket.id,
        });
      },
    );

    // ──────────────────────────────────
    // Leave Room
    // ──────────────────────────────────
    socket.on('room:leave', (data: { roomToken: string }) => {
      const { roomToken } = data;
      socket.to(roomToken).emit('room:peer-left', { socketId: socket.id });
      socket.leave(roomToken);
      cleanupParticipant(socket.id, roomToken);
      logger.info(`Socket ${socket.id} left room ${roomToken}`);
    });

    // ──────────────────────────────────
    // Disconnect
    // ──────────────────────────────────
    socket.on('disconnect', () => {
      // Remove from all rooms
      activeRooms.forEach((participants, roomToken) => {
        const wasInRoom = participants.some((p) => p.socketId === socket.id);
        if (wasInRoom) {
          socket.to(roomToken).emit('room:peer-left', { socketId: socket.id });
          cleanupParticipant(socket.id, roomToken);
        }
      });
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

const cleanupParticipant = (socketId: string, roomToken: string): void => {
  const room = activeRooms.get(roomToken);
  if (room) {
    const updated = room.filter((p) => p.socketId !== socketId);
    if (updated.length === 0) {
      activeRooms.delete(roomToken);
    } else {
      activeRooms.set(roomToken, updated);
    }
  }
};
