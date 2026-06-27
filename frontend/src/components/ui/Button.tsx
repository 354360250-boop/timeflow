import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50',
        {
          'bg-brand-600 hover:bg-brand-500 text-white': variant === 'primary',
          'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700': variant === 'secondary',
          'hover:bg-gray-800 text-gray-400': variant === 'ghost',
          'bg-red-600 hover:bg-red-500 text-white': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
