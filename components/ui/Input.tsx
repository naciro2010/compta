import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-sm font-medium text-claude-text">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={clsx(
            'w-full px-3 py-2.5 bg-claude-surface border border-claude-border rounded-lg text-claude-text placeholder:text-claude-text-subtle focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-claude-accent transition-colors',
            'text-sm md:text-base',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx('block text-sm font-medium text-claude-text mb-1.5', className)}
      {...props}
    />
  )
)

Label.displayName = 'Label'
