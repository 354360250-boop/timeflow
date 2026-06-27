import { useEffect, useState } from 'react';
import { Card } from '../../components/ui';
import { api } from '../../services/api';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import type { WeeklyReport } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

export function WeeklyReportPage() {
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const [report, setReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    api.getWeeklyReport(weekStart).then((r) => setReport(r as WeeklyReport)).catch(() => {});
  }, [weekStart]);

  if (!report) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">周报</h2>
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  const hoursData = report.daily.map((d) => ({
    day: format(new Date(d.day), 'EEE'),
    hours: +(d.seconds / 3600).toFixed(1),
  }));

  const focusData = report.focus_scores.map((d) => ({
    day: format(new Date(d.day), 'EEE'),
    rating: d.avg_rating,
  }));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">周报</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-400">总时长</div>
          <div className="text-2xl font-bold">{(report.total_seconds / 3600).toFixed(1)}h</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-400">平均专注评分</div>
          <div className="text-2xl font-bold">
            {report.focus_scores.length > 0
              ? (report.focus_scores.reduce((a, b) => a + b.avg_rating, 0) / report.focus_scores.length).toFixed(1)
              : '-'}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-400">追踪项目数</div>
          <div className="text-2xl font-bold">{report.projects.length}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-gray-400 mb-4">每日时长</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hoursData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-400 mb-4">专注质量趋势</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={focusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 5]} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
            <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
