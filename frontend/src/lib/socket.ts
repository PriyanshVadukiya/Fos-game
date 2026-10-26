import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      // Vite proxy forwards /socket.io → localhost:4000
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket?.id);
    });
    socket.on('connect_error', (err) => {
      console.error('[WS] Connection error:', err.message);
    });
    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
}
