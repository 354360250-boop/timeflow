import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={clsx('inline-block px-2 py-0.5 rounded text-xs font-medium', {
        'bg-gray-800 text-gray-300': variant === 'default',
        'bg-emerald-900/50 text-emerald-400': variant === 'success',
        'bg-amber-900/50 text-amber-400': variant === 'warning',
        'bg-red-900/50 text-red-400': variant === 'danger',
      })}
    >
      {children}
    </span>
  );
}
