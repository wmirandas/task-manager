import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { calculatePriorityScore, sendNotification, logAction } from '../utils/helpers';

export const tasksRouter = Router();

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

// --- Crear tarea ---
tasksRouter.post('/', async (req: Request, res: Response) => {
  const { title, description, dueDate, assigneeId, isUrgent, assigneeEmail } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'El título es requerido' });
  }
  if (!dueDate) {
    return res.status(400).json({ error: 'La fecha límite es requerida' });
  }

  // Validación de email duplicada de users.routes.ts (copy-paste del PR #187)
  if (assigneeEmail) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(assigneeEmail)) {
      return res.status(400).json({ error: 'Email de asignado inválido' });
    }
  }

  try {
    // Regla de negocio (cálculo de prioridad) resuelta directo en el controlador
    const priorityScore = calculatePriorityScore(new Date(dueDate), Boolean(isUrgent));
    const status = 'todo';

    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, assignee_id, is_urgent, priority_score, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [title, description || null, dueDate, assigneeId || null, Boolean(isUrgent), priorityScore, status]
    );

    const task = result.rows[0];

    // Acoplamiento directo con el módulo de Notificaciones: la creación de una
    // tarea "sabe" cómo notificar, sin ningún tipo de evento o cola de por medio.
    if (assigneeId) {
      await sendNotification(assigneeId, `Se te asignó la tarea: "${title}"`);
    }

    logAction('task_created', { taskId: task.id });
    return res.status(201).json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// --- Listar tareas (con filtros ad-hoc) ---
tasksRouter.get('/', async (req: Request, res: Response) => {
  const { status, assigneeId } = req.query;

  try {
    // Construcción manual de query dinámica, sin capa de repositorio
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (assigneeId) {
      params.push(assigneeId);
      query += ` AND assignee_id = $${params.length}`;
    }
    query += ' ORDER BY priority_score DESC, due_date ASC';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al listar tareas' });
  }
});

// --- Actualizar estado de tarea ---
tasksRouter.patch('/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Estado inválido. Usa: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const current = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    const task = current.rows[0];

    // Regla de negocio: no se puede pasar de 'todo' a 'done' directamente.
    // Esta regla vive únicamente aquí; si mañana hay una app móvil o un
    // proceso batch que actualice tareas, esta regla habría que reescribirla.
    if (task.status === 'todo' && status === 'done') {
      return res.status(400).json({ error: 'No puedes pasar de "todo" a "done" sin pasar por "in_progress"' });
    }

    const updated = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (status === 'done' && task.assignee_id) {
      await sendNotification(task.assignee_id, `La tarea "${task.title}" fue marcada como completada`);
    }

    return res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// --- Eliminar tarea ---
tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});
