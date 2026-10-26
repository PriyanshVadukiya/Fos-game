import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import levelsRouter from './routes/levels';
import { registerSimulationHandlers } from './socket/simulation';

const PORT = process.env.PORT ?? 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

// ── Express app ─────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

// ── REST Routes ──────────────────────────────────────────────────────────────
app.use('/api/levels', levelsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── HTTP + Socket.IO Server ──────────────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  registerSimulationHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`[WS] Client disconnected: ${socket.id} (${reason})`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🖥️  System Call Telephone Game — Backend`);
  console.log(`   REST API : http://localhost:${PORT}/api`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   CORS     : ${CLIENT_ORIGIN}\n`);
});

export { app, io };
