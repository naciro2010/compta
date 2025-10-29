import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-claude-accent focus:ring-offset-2 focus:ring-offset-claude-bg disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-claude-accent text-white hover:bg-claude-accent-hover': variant === 'primary',
            'bg-claude-surface border border-claude-border text-claude-text hover:bg-claude-surface-hover': variant === 'secondary',
            'hover:bg-claude-surface-hover text-claude-text': variant === 'ghost',
            'bg-claude-danger text-white hover:bg-red-600': variant === 'danger',
            'border border-claude-border text-claude-text hover:bg-claude-surface': variant === 'outline',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
