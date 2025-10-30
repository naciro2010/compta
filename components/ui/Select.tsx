import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-medium text-claude-text">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-3 py-2.5 rounded-lg',
          'bg-claude-surface border border-claude-border',
          'text-claude-text',
          'focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-claude-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          'cursor-pointer',
          'text-sm md:text-base',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-claude-surface text-claude-text py-2"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
