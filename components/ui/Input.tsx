import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 bg-claude-bg border border-claude-border rounded-lg text-claude-text placeholder:text-claude-text-subtle focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent transition-colors',
          className
        )}
        {...props}
      />
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
