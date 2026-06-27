import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-gray-900 border border-gray-800 rounded-xl p-5',
        onClick && 'cursor-pointer hover:border-gray-700 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
