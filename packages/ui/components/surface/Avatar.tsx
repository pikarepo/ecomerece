import { cn } from '../../lib/cn';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
  xl: 'size-14 text-base',
} as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full bg-surface-3 object-cover font-semibold text-ink-2',
    sizeClasses[size],
    className,
  );

  if (src) {
    return <img src={src} alt={alt ?? name ?? ''} className={cn(classes, 'object-cover')} />;
  }

  if (name) {
    return (
      <span className={classes} role="img" aria-label={name}>
        {initials(name)}
      </span>
    );
  }

  return <span className={classes} aria-hidden="true" />;
}
