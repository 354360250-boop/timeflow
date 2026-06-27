import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { TodayView } from './features/dashboard/TodayView';
import { WeeklyReportPage } from './features/dashboard/WeeklyReport';
import { TaskPage } from './features/dashboard/TaskPage';
import { useEffect } from 'react';
import { useTaskStore } from './stores/taskStore';

function AppInit() {
  const init = useTaskStore((s) => s.init);
  useEffect(() => { init(); }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<TodayView />} />
          <Route path="reports" element={<WeeklyReportPage />} />
          <Route path="tasks" element={<TaskPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
