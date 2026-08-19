import { Router, Request, Response } from 'express';
import { pool } from '../db';

export const notificationsRouter = Router();

notificationsRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = req.query;

  try {
    const query = userId
      ? 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM notifications ORDER BY created_at DESC';
    const params = userId ? [userId] : [];

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al listar notificaciones' });
  }
});

notificationsRouter.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});
