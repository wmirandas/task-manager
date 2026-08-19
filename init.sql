CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  assignee_id INTEGER REFERENCES users(id),
  -- Campo denormalizado: se guarda copia del nombre del asignado para
  -- "evitar el JOIN" en el listado (decisión tomada en el sprint 4,
  -- nunca documentada, nunca se mantiene sincronizada si el usuario
  -- cambia su nombre).
  assignee_name_cache VARCHAR(120),
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  priority_score INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message VARCHAR(300) NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Datos semilla para que el laboratorio tenga algo que auditar desde el minuto 1
INSERT INTO users (name, email, password_hash, created_at) VALUES
  ('Ana Torres', 'ana.torres@demo.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q9v7t3yF3aQxYVAyMzE1sYY0mSY2G', NOW()),
  ('Luis Mendoza', 'luis.mendoza@demo.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q9v7t3yF3aQxYVAyMzE1sYY0mSY2G', NOW()),
  ('Carla Ruiz', 'carla.ruiz@demo.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q9v7t3yF3aQxYVAyMzE1sYY0mSY2G', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, due_date, assignee_id, assignee_name_cache, is_urgent, priority_score, status, created_at) VALUES
  ('Diseñar wireframes de login', 'Pantallas de acceso y registro', NOW() + INTERVAL '2 days', 1, 'Ana Torres', true, 90, 'in_progress', NOW()),
  ('Migrar tabla de notificaciones', 'Agregar índice por user_id', NOW() + INTERVAL '10 days', 2, 'Luis Mendoza', false, 40, 'todo', NOW()),
  ('Corregir bug de doble notificación', 'Se envía dos veces al marcar como completada', NOW() + INTERVAL '1 days', 2, 'Luis Mendoza', true, 98, 'todo', NOW()),
  ('Documentar endpoints de la API', NULL, NOW() + INTERVAL '15 days', 3, 'Carla Ruiz', false, 20, 'todo', NOW())
ON CONFLICT DO NOTHING;
