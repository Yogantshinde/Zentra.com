import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { cleanText, isEmail } from '../utils/validation.js';

const router = Router();
const issueToken = (user) => jwt.sign({ sub: String(user.id), email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

router.post('/register', async (req, res, next) => {
  try {
    const name = cleanText(req.body.name, 100);
    const email = cleanText(req.body.email, 190).toLowerCase();
    const password = req.body.password;
    if (name.length < 2 || !isEmail(email) || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Enter a name, valid email, and password with at least 8 characters.' });
    }
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, passwordHash]);
    const user = { id: result.insertId, name, email, currency: 'INR' };
    res.status(201).json({ message: 'Account created.', token: issueToken(user), user });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = cleanText(req.body.email, 190).toLowerCase();
    const password = req.body.password;
    if (!isEmail(email) || typeof password !== 'string') return res.status(400).json({ error: 'Enter a valid email and password.' });
    const [rows] = await pool.execute('SELECT id, name, email, password_hash, currency FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    const { password_hash, ...user } = rows[0];
    res.json({ message: 'Login successful.', token: issueToken(user), user });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, currency, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (error) { next(error); }
});

export default router;
