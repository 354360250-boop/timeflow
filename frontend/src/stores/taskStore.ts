import { create } from 'zustand';
import type { Task, Project } from '../types';
import { api } from '../services/api';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  loading: boolean;

  loadTasks: (status?: string) => Promise<void>;
  loadProjects: () => Promise<void>;
  createTask: (title: string, projectId?: string) => Promise<Task>;
  init: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projects: [],
  loading: false,

  loadTasks: async (status) => {
    set({ loading: true });
    const tasks = await api.getTasks(status) as Task[];
    set({ tasks, loading: false });
  },

  loadProjects: async () => {
    const projects = await api.getProjects() as Project[];
    set({ projects });
  },

  createTask: async (title, projectId) => {
    const task = await api.createTask({ title, project_id: projectId }) as Task;
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  init: async () => {
    await Promise.all([get().loadTasks(), get().loadProjects()]);
  },
}));
