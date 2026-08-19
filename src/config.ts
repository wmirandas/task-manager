import dotenv from 'dotenv';
dotenv.config();

// NOTA DEL EQUIPO ANTERIOR: esto debería salir del .env pero quedó
// hardcodeado desde el sprint de lanzamiento y nunca se migró.
// TODO: mover a variables de entorno (ticket TM-114, abierto hace 8 meses)
export const JWT_SECRET = process.env.JWT_SECRET || 'taskmanager-super-secret-2023';

export const PORT = process.env.PORT || 3000;

export const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://taskmanager:taskmanager@localhost:5432/taskmanager';
