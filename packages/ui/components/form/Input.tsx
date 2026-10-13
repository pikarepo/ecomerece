import { Eye, EyeOff } from 'lucide-react';
import { type ElementType, forwardRef, type InputHTMLAttributes, useState } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  icon?: ElementType;
  iconPosition?: 'left' | 'right';
  onNativeIconClick?: () => void;
}

const wrapperBase =
  'mat-raised flex items-center gap-2 rounded-control px-4 py-2.5 transition-all duration-skin ease-skin focus-within:ring-2 focus-within:ring-accent';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    invalid,
    icon: Icon,
    iconPosition = 'left',
    onNativeIconClick,
    className,
    type = 'text',
    disabled,
    ...rest
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = cn(
    'min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none',
    'disabled:cursor-not-allowed disabled:text-ink-4',
  );

  return (
    <div
      className={cn(
        wrapperBase,
        invalid && 'ring-2 ring-danger',
        disabled && 'opacity-60',
        className,
      )}
    >
      {Icon && iconPosition === 'left' && (
        <Icon
          className={cn('size-4 shrink-0', invalid ? 'text-danger' : 'text-ink-3')}
          aria-hidden="true"
        />
      )}
      <input
        ref={ref}
        type={resolvedType}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={inputClasses}
        {...rest}
      />
      {isPassword ? (
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((v) => !v)}
          className="-mr-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-3 transition-all duration-skin ease-skin hover:bg-surface-1 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      ) : Icon && iconPosition === 'right' ? (
        <Icon
          className={cn('size-4 shrink-0', invalid ? 'text-danger' : 'text-ink-3')}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
});
