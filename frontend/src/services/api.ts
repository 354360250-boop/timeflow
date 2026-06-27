const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Time Entries
  startTimer: (body: { task_id?: string; project_id?: string; track_mode?: string }) =>
    request('/api/time-entries/start', { method: 'POST', body: JSON.stringify(body) }),

  stopTimer: (entryId: string) =>
    request(`/api/time-entries/${entryId}/stop`, { method: 'POST' }),

  createManualEntry: (body: {
    task_id?: string;
    project_id?: string;
    start_time: string;
    end_time: string;
    plan_mark?: string;
  }) => request('/api/time-entries/manual', { method: 'POST', body: JSON.stringify(body) }),

  getTimeEntries: (date?: string, taskId?: string) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (taskId) params.set('task_id', taskId);
    return request(`/api/time-entries?${params}`);
  },

  getCurrentEntry: () => request('/api/time-entries/current'),

  // Tasks & Projects
  getTasks: (status?: string, projectId?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (projectId) params.set('project_id', projectId);
    return request(`/api/tasks?${params}`);
  },

  createTask: (body: { title: string; project_id?: string; priority?: number }) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),

  getProjects: () => request('/api/tasks/projects'),

  // Focus
  startFocus: (body: { task_id?: string; mode: string; planned_duration: number }) =>
    request('/api/focus/start', { method: 'POST', body: JSON.stringify(body) }),

  endFocus: (sessionId: string, body: { interruption_count: number }) =>
    request(`/api/focus/${sessionId}/end`, { method: 'POST', body: JSON.stringify(body) }),

  rateFocus: (sessionId: string, selfRating: number) =>
    request(`/api/focus/${sessionId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ self_rating: selfRating }),
    }),

  getFocusSessions: (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    return request(`/api/focus/sessions?${params}`);
  },

  getFocusStats: () => request('/api/focus/stats'),

  // Reports
  getDailyReport: (date: string) => request(`/api/reports/daily?date=${date}`),
  getWeeklyReport: (start: string) => request(`/api/reports/weekly?start=${start}`),
};
