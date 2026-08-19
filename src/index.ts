import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT } from './config';
import { usersRouter } from './routes/users.routes';
import { tasksRouter } from './routes/tasks.routes';
import { notificationsRouter } from './routes/notifications.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'task-manager-api' });
});

app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/notifications', notificationsRouter);

app.listen(PORT, () => {
  console.log(`Task Manager API escuchando en el puerto ${PORT}`);
});
