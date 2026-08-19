const API = '/api';

async function loadUsers() {
  const res = await fetch(`${API}/users`);
  const users = await res.json();
  const select = document.getElementById('assigneeId');
  users.forEach((u) => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.name;
    select.appendChild(opt);
  });
}

async function loadTasks() {
  const status = document.getElementById('filter-status').value;
  const url = status ? `${API}/tasks?status=${status}` : `${API}/tasks`;
  const res = await fetch(url);
  const tasks = await res.json();

  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach((t) => {
    const li = document.createElement('li');
    li.className = `task task-${t.status}`;
    li.innerHTML = `
      <div class="task-main">
        <strong>${t.title}</strong>
        <span class="badge">${t.status}</span>
        ${t.is_urgent ? '<span class="badge urgent">Urgente</span>' : ''}
      </div>
      <div class="task-meta">
        Vence: ${new Date(t.due_date).toLocaleDateString()} · Prioridad: ${t.priority_score}
        ${t.assignee_name_cache ? ` · Asignado a: ${t.assignee_name_cache}` : ''}
      </div>
      <div class="task-actions">
        <button data-id="${t.id}" data-next="in_progress">En progreso</button>
        <button data-id="${t.id}" data-next="done">Completar</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.task-actions button').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const next = e.target.getAttribute('data-next');
      const res = await fetch(`${API}/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Error al actualizar tarea');
        return;
      }
      loadTasks();
    });
  });
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value,
    assigneeId: document.getElementById('assigneeId').value || null,
    isUrgent: document.getElementById('isUrgent').checked,
  };

  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Error al crear tarea');
    return;
  }

  e.target.reset();
  loadTasks();
});

document.getElementById('filter-status').addEventListener('change', loadTasks);

loadUsers();
loadTasks();
