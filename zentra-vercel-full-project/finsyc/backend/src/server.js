import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import dashboardRoutes from './routes/dashboard.js';
import publicRoutes from './routes/public.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is missing or too short. Set a random secret (32+ characters) in backend/.env.');
  process.exit(1);
}
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()), credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', service: 'Zentra API', database: 'connected' }); }
  catch { res.status(503).json({ status: 'error', service: 'Zentra API', database: 'disconnected' }); }
});
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', publicRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
app.use((err, _req, res, _next) => {
  if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This record already exists.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});
const port = Number(process.env.PORT || 4000);
try {
  await pool.query('SELECT 1');
  app.listen(port, () => console.log(`Zentra API running at http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to MySQL. Check backend/.env and run database/schema.sql first.');
  console.error(error.message);
  process.exit(1);
}
