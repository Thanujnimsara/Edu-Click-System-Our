import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { env } from './config/env';
import { db } from './config/db';
import apiRouter from './routes';
import { runFullSeed } from './scripts/seed';

const app = express();
const server = http.createServer(app);

// Cross-Platform WebSocket Hub (Live classes, active chat, and real-time device sync)
const wss = new WebSocketServer({ server });
const clients = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket, req) => {
  const clientId = `client-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  clients.set(clientId, ws);
  console.log(`[WebSocket] Client connected: ${clientId} (Total active: ${clients.size})`);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      // Broadcast message to other active clients (e.g. classroom chat, hand raise, sync)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.error('[WebSocket] Malformed message', e);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`[WebSocket] Client disconnected: ${clientId}`);
  });
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount Centralized REST API
app.use(env.API_PREFIX, apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    brand: 'EDU CLICK',
    tagline: 'One Platform. Every Device. Every Student.',
    api: `${env.API_PREFIX}/health`,
    docs: '/docs'
  });
});

// Start Server
async function startServer() {
  try {
    console.log('[EDU CLICK] Initializing database layer...');
    await db.init();
    await runFullSeed();

    server.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`  EDU CLICK LMS BACKEND SERVER ACTIVE`);
      console.log(`  Brand: EDU CLICK - One Platform. Every Device. Every Student.`);
      console.log(`  API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`  Health Check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
      console.log(`  WebSocket Hub: ws://localhost:${env.PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error);
    process.exit(1);
  }
}

startServer();
