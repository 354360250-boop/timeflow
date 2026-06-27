import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card, Button, Badge } from '../../components/ui';
import type { Task } from '../../types';

export function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const loadTasks = () => {
    api.getTasks().then((r) => setTasks(r as Task[])).catch(() => {});
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await api.createTask({ title: newTitle.trim() });
    setNewTitle('');
    loadTasks();
  };

  const priorityLabels = ['P0', 'P1', 'P2', 'P3'];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">任务</h2>

      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="添加任务..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button onClick={handleCreate}>添加</Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={task.priority <= 1 ? 'danger' : task.priority === 2 ? 'warning' : 'default'}>
                {priorityLabels[task.priority] || 'P2'}
              </Badge>
              <span className={task.status === 'done' ? 'line-through text-gray-600' : ''}>{task.title}</span>
            </div>
            <div className="flex items-center gap-3">
              {task.estimated_hours && (
                <span className="text-xs text-gray-500">{task.estimated_hours}小时 预估</span>
              )}
              <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
                {task.status === 'todo' ? '待办' : task.status === 'in_progress' ? '进行中' : '已完成'}
              </Badge>
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-600 text-center py-8">暂无任务，请在上方创建。</p>
        )}
      </div>
    </div>
  );
}
