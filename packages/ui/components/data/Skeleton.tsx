import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      // skeleton fill = the skin's well bg (E.6 #4): reads as a "well" not a raised box
      className={cn('animate-pulse rounded-chip mat-well', className)}
      style={style}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? 'w-2/3' : index === 0 ? 'w-1/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export interface SkeletonCardProps {
  title?: boolean;
  rows?: number;
  className?: string;
}

export function SkeletonCard({ title = true, rows = 4, className }: SkeletonCardProps) {
  return (
    <div className={cn('mat-card rounded-card p-4', className)}>
      {title && <Skeleton className="mb-3 h-4 w-1/3" />}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={cn('h-4', index === rows - 1 ? 'w-3/4' : 'w-full')} />
        ))}
      </div>
    </div>
  );
}

export interface SkeletonRowProps {
  className?: string;
}

export function SkeletonRow({ className }: SkeletonRowProps) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-8 shrink-0" />
    </div>
  );
}

export interface SkeletonCircleProps {
  className?: string;
}

export function SkeletonCircle({ className }: SkeletonCircleProps) {
  return <Skeleton className={cn('h-9 w-9 rounded-full', className)} />;
}

export interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export function SkeletonTable({ rows = 6, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      <div className="flex items-center px-3 py-2">
        <Skeleton className="h-3 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-3 py-2">
          <Skeleton className="h-3.5 w-1/4" />
          <Skeleton className="h-3.5 w-1/5" />
          <Skeleton className="h-3.5 w-1/6" />
        </div>
      ))}
    </div>
  );
}

export interface SkeletonGroupProps {
  children: ReactNode;
}

export function SkeletonGroup({ children }: SkeletonGroupProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      {children}
    </div>
  );
}
