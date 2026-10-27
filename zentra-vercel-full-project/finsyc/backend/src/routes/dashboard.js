import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
router.get('/summary', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) AS totalIncome,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS totalExpenses,
      COUNT(*) AS transactionCount
      FROM transactions WHERE user_id = ?`, [req.user.id]);
    const [recent] = await pool.execute('SELECT id, type, title, category, amount, transaction_date FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 5', [req.user.id]);
    const summary = rows[0];
    summary.balance = Number(summary.totalIncome) - Number(summary.totalExpenses);
    res.json({ summary, recentTransactions: recent });
  } catch (e) { next(e); }
});
export default router;
