/** @jsxImportSource react */
import { Check, ChevronDown } from 'lucide-react';
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  label?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  label,
  emptyText = 'No matches',
  disabled = false,
  id,
  className,
}: ComboboxProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const listId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    if (query === null) return options;
    const needle = query.trim().toLowerCase();
    if (needle === '') return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const display = query ?? selected?.label ?? '';

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    setQuery((event.target as HTMLInputElement).value);
    setOpen(true);
    setActive(0);
  };

  const pick = (option: ComboboxOption) => {
    if (option.disabled) return;
    onValueChange(option.value);
    setQuery(null);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
      } else {
        setActive((index) => Math.min(index + 1, filtered.length - 1));
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      if (open && filtered[active]) {
        event.preventDefault();
        pick(filtered[active]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery(null);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  const activeOption = open ? filtered[active] : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <div ref={rootRef} className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? `${listId}-${activeOption.value}` : undefined}
          aria-label={label}
          disabled={disabled}
          placeholder={placeholder}
          value={display}
          onChange={handleInput}
          onInput={handleInput}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'mat-raised w-full rounded-control px-4 py-2.5 pr-10 text-sm text-ink',
            'placeholder:text-ink-3 transition-all duration-skin ease-skin focus:outline-none',
            'focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60',
            focusRing(),
          )}
        />
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2',
            disabled ? 'text-ink-4' : 'text-ink-3',
          )}
        />
        {open && (
          <div
            id={listId}
            role="listbox"
            className="mat-overlay absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-card py-1"
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-sm text-ink-3">{emptyText}</div>
            ) : (
              filtered.map((option) => (
                <div
                  key={option.value}
                  id={`${listId}-${option.value}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled || undefined}
                  data-active={activeOption === option ? 'true' : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(option)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      pick(option);
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-4 py-2 text-sm transition-colors duration-skin ease-skin',
                    option.disabled
                      ? 'cursor-not-allowed text-ink-4'
                      : activeOption === option
                        ? 'bg-surface-3 text-ink'
                        : 'text-ink-2 hover:bg-surface-1',
                  )}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
