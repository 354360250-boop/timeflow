import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Props {
  projects: { project_id: string; seconds: number }[];
}

export function TimePieChart({ projects }: Props) {
  const data = projects.map((p, i) => ({
    name: p.project_id.slice(0, 8),
    value: Math.round(p.seconds / 60),
    color: COLORS[i % COLORS.length],
  }));

  if (data.length === 0) {
    return <p className="text-sm text-gray-600">No data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#d1d5db' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
