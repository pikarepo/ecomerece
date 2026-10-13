/** @jsxImportSource react */
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../controls/Button';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  showJump?: boolean;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  showFirstLast = false,
  showJump = false,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < pageCount;
  const prevPage = Math.max(1, Math.min(page - 1, pageCount));
  const nextPage = Math.min(page + 1, pageCount);

  const pages: number[] = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(pageCount, page + 1); i++) {
    pages.push(i);
  }

  const [jump, setJump] = useState(String(page));
  useEffect(() => {
    setJump(String(page));
  }, [page]);

  const commitJump = () => {
    const n = Number.parseInt(jump, 10);
    if (Number.isFinite(n) && n >= 1 && n <= pageCount) onPageChange(n);
    else setJump(String(page));
  };

  const pageButton = (p: number) => (
    <button
      key={p}
      type="button"
      aria-current={p === page ? 'page' : undefined}
      onClick={() => onPageChange(p)}
      className={cn(
        'mat-control flex h-11 min-w-11 items-center justify-center rounded-control px-3 text-sm transition-all duration-skin ease-skin',
        p === page
          ? 'bg-accent font-semibold text-accent-ink'
          : 'text-ink-3 hover:bg-surface-3 hover:text-ink',
      )}
    >
      <span className="font-mono tabular-nums">{p}</span>
    </button>
  );

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center gap-2', className)}>
      {showFirstLast && (
        <IconButton label="First page" disabled={!canPrev} onClick={() => onPageChange(1)}>
          <ChevronsLeft className="size-4" />
        </IconButton>
      )}
      <IconButton label="Previous page" disabled={!canPrev} onClick={() => onPageChange(prevPage)}>
        <ChevronLeft className="size-4" />
      </IconButton>
      {pages.map(pageButton)}
      <IconButton label="Next page" disabled={!canNext} onClick={() => onPageChange(nextPage)}>
        <ChevronRight className="size-4" />
      </IconButton>
      {showFirstLast && (
        <IconButton label="Last page" disabled={!canNext} onClick={() => onPageChange(pageCount)}>
          <ChevronsRight className="size-4" />
        </IconButton>
      )}

      {showJump && (
        <div className="ml-2 flex items-center gap-1 text-sm text-ink-3">
          <span>Go to</span>
          <input
            aria-label="Jump to page"
            inputMode="numeric"
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            onBlur={commitJump}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitJump();
            }}
            className="mat-control h-9 w-14 rounded-control px-2 text-center font-mono text-sm tabular-nums text-ink outline-none"
          />
        </div>
      )}

      {pageSize && onPageSizeChange && (
        <label className="ml-2 flex items-center gap-1 text-sm text-ink-3">
          <span>Rows</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="mat-control h-9 rounded-control px-2 text-sm text-ink outline-none"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}

      {typeof totalItems === 'number' && (
        <span className="ml-2 text-sm text-ink-3 tabular-nums">{totalItems} total</span>
      )}
    </nav>
  );
}
