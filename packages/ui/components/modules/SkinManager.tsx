/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../controls/Button';
import { Badge } from '../surface/Badge';

/** Where a skin's compiled CSS currently lives (§38.5, todo/14). */
export type SkinInstallStatus = 'active' | 'cached' | 'remote';

export interface SkinManagerItem {
  id: string;
  label: string;
  swatch: [string, string];
  dimension: '2d' | '3d';
  cost: 'low' | 'medium' | 'high';
  status: SkinInstallStatus;
  /** Cached CSS byte size; omitted while remote-only. */
  bytes?: number;
}

export interface SkinManagerProps {
  items: SkinManagerItem[];
  /** Total bytes currently held in the local skin cache. */
  totalBytes: number;
  /** Cache cap in bytes (`MAX_CACHE_BYTES`). */
  maxBytes: number;
  /** Id currently being fetched/removed (disables its actions). */
  busyId?: string | null;
  onInstall: (id: string) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

const STATUS_TONE: Record<SkinInstallStatus, 'success' | 'accent' | 'neutral'> = {
  active: 'success',
  cached: 'accent',
  remote: 'neutral',
};

const STATUS_LABEL: Record<SkinInstallStatus, string> = {
  active: 'Active',
  cached: 'Cached',
  remote: 'Remote',
};

/** Human byte size; kept pure so tests can pin the formatting. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Swatch({ colors }: { colors: [string, string] }): ReactNode {
  return (
    <span aria-hidden="true" className="flex h-4 w-6 shrink-0 overflow-hidden rounded-chip">
      <span style={{ background: colors[0], width: 12, height: 16 }} />
      <span style={{ background: colors[1], width: 12, height: 16 }} />
    </span>
  );
}

/**
 * Skin cache manager (§38.5) — shows which skins are installed locally and
 * lets the user delete or reinstall them. Fully controlled: the host owns
 * cache access and network, so this stays a presentation + callback surface.
 */
export function SkinManager({
  items,
  totalBytes,
  maxBytes,
  busyId = null,
  onInstall,
  onRefresh,
  onRemove,
  onClearAll,
  className,
}: SkinManagerProps) {
  const cachedCount = items.filter((item) => item.status !== 'remote').length;
  const pct = maxBytes > 0 ? Math.min(100, Math.round((totalBytes / maxBytes) * 100)) : 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-ink-3">Installed skins (local cache)</p>
          <p className="text-xs text-ink-3">
            {cachedCount} of {items.length} installed · {formatBytes(totalBytes)} /{' '}
            {formatBytes(maxBytes)} ({pct}%)
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearAll} disabled={totalBytes === 0}>
          Clear cache
        </Button>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Skin cache usage"
        className="h-1.5 overflow-hidden rounded-chip bg-surface-3"
      >
        <div
          className={cn('h-full rounded-chip', pct >= 90 ? 'bg-danger' : 'bg-accent')}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="flex flex-col divide-y divide-line/40 rounded-control border border-line/40">
        {items.map((item) => {
          const busy = busyId === item.id;
          return (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2">
              <Swatch colors={item.swatch} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">{item.label}</span>
                  <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  {item.dimension === '3d' && <Badge tone="info">3D</Badge>}
                </span>
                <span className="text-xs text-ink-3">
                  {item.cost} cost
                  {item.bytes !== undefined ? ` · ${formatBytes(item.bytes)}` : ''}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {item.status === 'remote' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={busy}
                    onClick={() => onInstall(item.id)}
                  >
                    Install
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={busy}
                      onClick={() => onRefresh(item.id)}
                    >
                      Reinstall
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={busy && item.status !== 'active'}
                      disabled={busy || item.status === 'active'}
                      title={
                        item.status === 'active'
                          ? 'Active skin — switch away before deleting'
                          : `Delete ${item.label} from cache`
                      }
                      onClick={() => onRemove(item.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
