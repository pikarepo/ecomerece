import { Search, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  onClear?: () => void;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { invalid, onClear, className, value, disabled, ...rest },
  ref,
) {
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <div
      className={cn(
        'mat-raised flex items-center gap-2 rounded-control px-4 py-2.5 transition-all duration-skin ease-skin',
        'focus-within:ring-2 focus-within:ring-accent',
        invalid && 'ring-2 ring-danger',
        disabled && 'opacity-60',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none',
          '[&::-webkit-search-cancel-button]:appearance-none',
          'disabled:cursor-not-allowed disabled:text-ink-4',
        )}
        {...rest}
      />
      {hasValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="-m-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-3 transition-all duration-skin ease-skin hover:bg-surface-1 hover:text-ink"
          tabIndex={-1}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
});
