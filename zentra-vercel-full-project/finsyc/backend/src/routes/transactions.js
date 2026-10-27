import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { cleanText, positiveAmount, validDate } from '../utils/validation.js';
const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const [rows] = await pool.execute(`SELECT id, type, title, category, amount, transaction_date, notes, created_at FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, id DESC LIMIT ${limit}`, [req.user.id]);
    res.json({ transactions: rows });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const type = req.body.type;
    const title = cleanText(req.body.title, 140);
    const category = cleanText(req.body.category || 'Other', 80);
    const amount = Number(req.body.amount);
    const date = req.body.transaction_date || new Date().toISOString().slice(0, 10);
    const notes = cleanText(req.body.notes, 500) || null;
    if (!['income', 'expense'].includes(type) || title.length < 1 || !positiveAmount(amount) || !validDate(date)) return res.status(400).json({ error: 'Provide type (income/expense), title, positive amount, and date in YYYY-MM-DD format.' });
    const [result] = await pool.execute('INSERT INTO transactions (user_id, type, title, category, amount, transaction_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, type, title, category, amount, date, notes]);
    const [rows] = await pool.execute('SELECT id, type, title, category, amount, transaction_date, notes, created_at FROM transactions WHERE id = ? AND user_id = ?', [result.insertId, req.user.id]);
    res.status(201).json({ transaction: rows[0] });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (e) { next(e); }
});
export default router;
