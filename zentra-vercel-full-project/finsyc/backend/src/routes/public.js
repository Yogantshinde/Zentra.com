import { Router } from 'express';
import { pool } from '../config/db.js';
import { cleanText, isEmail } from '../utils/validation.js';
const router = Router();
router.post('/newsletter', async (req, res, next) => {
  try {
    const email = cleanText(req.body.email, 190).toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    await pool.execute('INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = VALUES(email)', [email]);
    res.status(201).json({ message: 'Thanks for subscribing!' });
  } catch (e) { next(e); }
});
router.post('/contact', async (req, res, next) => {
  try {
    const name = cleanText(req.body.name, 100);
    const email = cleanText(req.body.email, 190).toLowerCase();
    const subject = cleanText(req.body.subject, 180) || null;
    const message = cleanText(req.body.message, 5000);
    if (name.length < 2 || !isEmail(email) || message.length < 10) return res.status(400).json({ error: 'Name, valid email, and a message of at least 10 characters are required.' });
    await pool.execute('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
    res.status(201).json({ message: 'Your message has been received.' });
  } catch (e) { next(e); }
});
export default router;
