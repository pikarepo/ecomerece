/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Avatar, type PresenceStatus } from './Avatar';

export interface AvatarPerson {
  src?: string;
  name?: string;
  alt?: string;
  status?: PresenceStatus;
}

export interface AvatarGroupProps {
  people: AvatarPerson[];
  /** Max avatars shown before the `+N` chip. Default 4. */
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Total count (defaults to `people.length`) used for the `+N` remainder. */
  total?: number;
  /** Accessible name. Default "Avatar group". */
  label?: string;
  className?: string;
}

const GROUP_AVATAR_RING = 'ring-2 ring-surface-1';

/**
 * Avatar group (todo/09 §F batch 83) — overlapping avatars with a `+N` overflow
 * chip once the list exceeds `max`.
 */
export function AvatarGroup({
  people,
  max = 4,
  size = 'md',
  total,
  label,
  className,
}: AvatarGroupProps) {
  const count = total ?? people.length;
  const shown = people.slice(0, max);
  const remaining = Math.max(0, count - shown.length);

  return (
    <span
      role="img"
      aria-label={`${label ?? 'Avatar group'} — ${count} people`}
      className={cn('inline-flex items-center -space-x-2', className)}
    >
      {shown.map((person, i) => (
        <Avatar
          key={i}
          src={person.src}
          name={person.name}
          alt={person.alt}
          status={person.status}
          size={size}
          className={GROUP_AVATAR_RING}
        />
      ))}
      {remaining > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-surface-3 font-semibold text-ink-2',
            GROUP_AVATAR_RING,
            size === 'xs' || size === 'sm' ? 'size-8 text-xs' : 'size-9 text-xs',
          )}
        >
          +{remaining}
        </span>
      )}
    </span>
  );
}

export interface TeamMember {
  name: string;
  src?: string;
  role?: string;
  status?: PresenceStatus;
}

export interface TeamStackProps {
  members: TeamMember[];
  /** Max members shown before the `+N` tile. Default 4. */
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Show each member's name (and role) beneath the avatar. Default true. */
  showNames?: boolean;
  /** Total count (defaults to `members.length`) used for the `+N` remainder. */
  total?: number;
  /** Accessible name. Default "Team". */
  label?: string;
  className?: string;
}

/**
 * Team stack (todo/09 §F batch 83) — avatars with name/role labels, collapsing
 * the overflow into a `+N` tile.
 */
export function TeamStack({
  members,
  max = 4,
  size = 'md',
  showNames = true,
  total,
  label,
  className,
}: TeamStackProps) {
  const count = total ?? members.length;
  const shown = members.slice(0, max);
  const remaining = Math.max(0, count - shown.length);
  const avatarSize = size === 'lg' ? 'lg' : size;

  return (
    <ul
      aria-label={`${label ?? 'Team'} — ${count} members`}
      className={cn('flex flex-wrap items-start gap-4 list-none p-0', className)}
    >
      {shown.map((member, i) => (
        <li key={i} className="flex flex-col items-center gap-1 text-center">
          <Avatar src={member.src} name={member.name} status={member.status} size={avatarSize} />
          {showNames && (
            <div className="max-w-[7rem]">
              <p className="truncate text-sm font-medium text-ink">{member.name}</p>
              {member.role && <p className="truncate text-xs text-ink-3">{member.role}</p>}
            </div>
          )}
        </li>
      ))}
      {remaining > 0 && (
        <li className="flex flex-col items-center gap-1 text-center">
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full bg-surface-3 font-semibold text-ink-2',
              size === 'lg'
                ? 'size-11 text-sm'
                : size === 'sm'
                  ? 'size-8 text-xs'
                  : 'size-9 text-xs',
            )}
          >
            +{remaining}
          </span>
          {showNames && <p className="text-xs text-ink-3">more</p>}
        </li>
      )}
    </ul>
  );
}

export interface NameRoleProps {
  name: ReactNode;
  role?: ReactNode;
  /** Avatar rendered at the start of the block. */
  avatar?: AvatarPerson;
  size?: 'sm' | 'md' | 'lg';
  /** Wrap the name in a link. */
  href?: string;
  /** Trailing slot (e.g. an action button). */
  trailing?: ReactNode;
  /** Stack the avatar above the text instead of inline. */
  stacked?: boolean;
  className?: string;
}

const NAME_SIZE = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' } as const;
const ROLE_SIZE = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' } as const;
const AVATAR_SIZE = { sm: 'sm', md: 'md', lg: 'lg' } as const;

/**
 * Name + role block (todo/09 §F batch 83) — an optional avatar, a name line and
 * a muted role line, with a trailing slot.
 */
export function NameRole({
  name,
  role,
  avatar,
  size = 'md',
  href,
  trailing,
  stacked = false,
  className,
}: NameRoleProps) {
  const nameNode = href ? (
    <a href={href} className="font-medium text-ink hover:underline">
      {name}
    </a>
  ) : (
    <span className="font-medium text-ink">{name}</span>
  );

  return (
    <div
      className={cn(
        'inline-flex',
        stacked ? 'flex-col items-center gap-2 text-center' : 'items-center gap-3',
        className,
      )}
    >
      {avatar && (
        <Avatar
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          status={avatar.status}
          size={AVATAR_SIZE[size]}
        />
      )}
      <div className={cn('min-w-0', stacked && 'flex flex-col items-center')}>
        <div className={cn(NAME_SIZE[size])}>{nameNode}</div>
        {role && <div className={cn('text-ink-3', ROLE_SIZE[size])}>{role}</div>}
      </div>
      {trailing && <div className="ml-auto shrink-0">{trailing}</div>}
    </div>
  );
}

export interface BylineProps {
  /** Author name. */
  author: ReactNode;
  /** Avatar for the author. */
  avatar?: AvatarPerson;
  /** Author role or credential. */
  role?: ReactNode;
  /** Pre-formatted publication date/time. */
  date?: ReactNode;
  /** Prefix, e.g. "By". */
  prefix?: ReactNode;
  /** Author link. */
  href?: string;
  /** Separator between role and date. Default "·". */
  separator?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Author byline (todo/09 §F batch 83) — optional avatar, author, role and date,
 * joined by a separator.
 */
export function Byline({
  author,
  avatar,
  role,
  date,
  prefix,
  href,
  separator = '·',
  size = 'sm',
  className,
}: BylineProps) {
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';
  const authorNode = href ? (
    <a href={href} className="font-medium text-ink-2 hover:underline">
      {author}
    </a>
  ) : (
    <span className="font-medium text-ink-2">{author}</span>
  );

  return (
    <span className={cn('inline-flex items-center gap-2 text-ink-3', textSize, className)}>
      {avatar && <Avatar src={avatar.src} name={avatar.name} alt={avatar.alt} size="sm" />}
      {prefix && <span>{prefix}</span>}
      {authorNode}
      {role && <span>{role}</span>}
      {role && date && <span aria-hidden="true">{separator}</span>}
      {date && <span>{date}</span>}
    </span>
  );
}
