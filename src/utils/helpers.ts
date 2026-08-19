import { pool } from '../db';

// helpers.ts — "aquí metemos todo lo que no sabemos dónde más poner"
// (comentario real dejado por el equipo anterior en el PR #212)

export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function calculatePriorityScore(dueDate: Date, isUrgentFlag: boolean): number {
  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  let score = 100 - daysLeft * 2;
  if (isUrgentFlag) score += 50;
  if (score < 0) score = 0;
  return score;
}

// Función de infraestructura (acceso a BD) viviendo en un archivo de "utilidades".
// Además la usa directamente el módulo de Tareas, acoplando Tareas <-> Notificaciones
// sin ningún contrato ni capa intermedia.
export async function sendNotification(userId: number, message: string): Promise<void> {
  await pool.query(
    'INSERT INTO notifications (user_id, message, read, created_at) VALUES ($1, $2, false, NOW())',
    [userId, message]
  );
  // eslint-disable-next-line no-console
  console.log(`[notificaciones] enviado a usuario ${userId}: ${message}`);
}

export function logAction(action: string, details?: unknown): void {
  // eslint-disable-next-line no-console
  console.log(`[LOG] ${new Date().toISOString()} - ${action}`, details ?? '');
}
