/** @jsxImportSource react */
import { ChevronDown } from 'lucide-react';
import { createContext, type ReactNode, useContext, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  open: string[];
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  /** `single` keeps one panel open; `multiple` allows any number. */
  type?: AccordionType;
  defaultOpen?: string | string[];
  children?: ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', defaultOpen, children, className }: AccordionProps) {
  const initial =
    defaultOpen === undefined ? [] : Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  const [open, setOpen] = useState<string[]>(initial);

  const toggle = (id: string) =>
    setOpen((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return type === 'single' ? [id] : [...current, id];
    });

  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <div className={cn('mat-card overflow-hidden rounded-card', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function AccordionItem({ id, title, children, className }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const panelId = useId();
  const isOpen = context?.open.includes(id) ?? false;

  return (
    <div className={cn('border-b border-line/10 last:border-b-0', className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => context?.toggle(id)}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-ink',
          'transition-colors duration-skin ease-skin hover:bg-surface-3',
          focusRing(),
        )}
      >
        <span>{title}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-ink-3 transition-transform duration-skin ease-skin',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div id={panelId} className="px-4 pb-4 text-sm leading-relaxed text-ink-2">
          {children}
        </div>
      )}
    </div>
  );
}
