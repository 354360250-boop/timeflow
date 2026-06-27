import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: '今日', icon: '○' },
  { to: '/reports', label: '周报', icon: '◫' },
  { to: '/tasks', label: '任务', icon: '☰' },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-gray-800 flex flex-col bg-gray-950 shrink-0">
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-brand-400">Time</span>Flow
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              )
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-600">TimeFlow v0.1.0</div>
      </div>
    </aside>
  );
}
