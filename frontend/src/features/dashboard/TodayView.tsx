import { useTimer } from '../../hooks/useTimer';
import { TimerWidget } from '../timer/TimerWidget';
import { FocusLauncher } from '../focus/FocusLauncher';
import { FocusSession } from '../focus/FocusSession';
import { SelfRating } from '../focus/SelfRating';
import { Card } from '../../components/ui';
import { TimePieChart } from './TimePieChart';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { format } from 'date-fns';
import type { DailyReport } from '../../types';

export function TodayView() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [report, setReport] = useState<DailyReport | null>(null);

  useEffect(() => {
    api.getDailyReport(today).then((r) => setReport(r as DailyReport)).catch(() => {});
  }, [today]);

  const hours = report ? (report.total_seconds / 3600).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">今日</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TimerWidget />
          <FocusLauncher />
        </div>

        <div className="space-y-6">
          <Card>
            <div className="text-sm text-gray-400 mb-1">今日追踪</div>
            <div className="text-3xl font-bold">{hours}<span className="text-lg text-gray-500 font-normal">h</span></div>
          </Card>
          <Card>
            <div className="text-sm text-gray-400 mb-1">专注次数</div>
            <div className="text-3xl font-bold">{report?.focus_sessions || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-400 mb-3">项目分布</div>
            {report && <TimePieChart projects={report.projects} />}
          </Card>
        </div>
      </div>

      <FocusSession />
      <SelfRating />
    </div>
  );
}
