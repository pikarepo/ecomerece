/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Circle,
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  Mail,
  MapPin,
  Phone,
  Star,
  ThumbsUp,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Button } from '../controls/Button';
import { Avatar } from '../surface/Avatar';
import { Badge, Chip } from '../surface/Badge';
import { IconTile } from '../surface/IconTile';
import { Rating } from '../surface/Rating';
import { TrendArrow, type TrendDirection } from './IconIndicators';
import { Progress } from './Progress';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

function Shell({
  href,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = cn('group mat-card block overflow-hidden rounded-card', className);
  if (href) {
    return (
      <a href={href} className={cn(cls, focusRing())}>
        {children}
      </a>
    );
  }
  return <article className={cls}>{children}</article>;
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-ink-4">
      ·
    </span>
  );
}

function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3', className)}>
      {children}
    </p>
  );
}

/* ── Contact ──────────────────────────────────────────────────────────── */

export interface ContactCardProps {
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  href?: string;
  onEmail?: () => void;
  onCall?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — person contact with email/phone actions. */
export function ContactCard({
  name,
  role,
  company,
  email,
  phone,
  avatar,
  href,
  onEmail,
  onCall,
  className,
}: ContactCardProps) {
  return (
    <Shell href={href} className={cn('p-4', className)}>
      <div className="flex items-center gap-3">
        <Avatar src={avatar} name={name} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-ink">
            {href ? <span className="group-hover:underline">{name}</span> : name}
          </h3>
          {(role || company) && (
            <Meta>
              {role && <span>{role}</span>}
              {role && company && <Dot />}
              {company && (
                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3" aria-hidden="true" />
                  {company}
                </span>
              )}
            </Meta>
          )}
        </div>
      </div>
      {(email || phone) && (
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className={cn('inline-flex items-center gap-2 hover:text-accent', focusRing())}
            >
              <Mail className="size-3.5 text-ink-3" aria-hidden="true" />
              {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className={cn('inline-flex items-center gap-2 hover:text-accent', focusRing())}
            >
              <Phone className="size-3.5 text-ink-3" aria-hidden="true" />
              {phone}
            </a>
          )}
        </div>
      )}
      {(onEmail || onCall) && (
        <div className="mt-3 flex gap-2">
          {onEmail && (
            <Button size="sm" variant="secondary" onClick={onEmail}>
              <Mail className="size-3.5" aria-hidden="true" />
              Email
            </Button>
          )}
          {onCall && (
            <Button size="sm" variant="secondary" onClick={onCall}>
              <Phone className="size-3.5" aria-hidden="true" />
              Call
            </Button>
          )}
        </div>
      )}
    </Shell>
  );
}

/* ── Business ─────────────────────────────────────────────────────────── */

export interface BusinessCardProps {
  name: string;
  category?: string;
  logo?: string;
  rating?: number;
  reviews?: number;
  address?: string;
  phone?: string;
  website?: string;
  onDirections?: () => void;
  href?: string;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — business/listing with rating & contact. */
export function BusinessCard({
  name,
  category,
  logo,
  rating,
  reviews,
  address,
  phone,
  website,
  onDirections,
  href,
  className,
}: BusinessCardProps) {
  return (
    <Shell href={href} className={cn('p-4', className)}>
      <div className="flex items-start gap-3">
        <Avatar src={logo} name={name} size="lg" className="rounded-control" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-ink">{name}</h3>
          {category && <Meta className="mt-0.5">{category}</Meta>}
          {rating !== undefined && (
            <div className="mt-1 flex items-center gap-1.5">
              <Rating value={rating} readOnly size="sm" />
              {reviews !== undefined && <span className="text-xs text-ink-3">({reviews})</span>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-xs text-ink-2">
        {address && (
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
            {address}
          </span>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className={cn('inline-flex items-center gap-2 hover:text-accent', focusRing())}
          >
            <Phone className="size-3.5 text-ink-3" aria-hidden="true" />
            {phone}
          </a>
        )}
        {website && (
          <a
            href={website}
            className={cn('inline-flex items-center gap-2 hover:text-accent', focusRing())}
          >
            <ArrowRight className="size-3.5 text-ink-3" aria-hidden="true" />
            {website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
      {onDirections && (
        <Button size="sm" variant="secondary" className="mt-3" onClick={onDirections}>
          <MapPin className="size-3.5" aria-hidden="true" />
          Directions
        </Button>
      )}
    </Shell>
  );
}

/* ── Team member ──────────────────────────────────────────────────────── */

export interface TeamMemberCardProps {
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  socials?: { label: string; href: string }[];
  className?: string;
}

/** Work card (todo/09 §F batch 86) — team member profile with socials. */
export function TeamMemberCard({
  name,
  role,
  bio,
  avatar,
  email,
  socials,
  className,
}: TeamMemberCardProps) {
  return (
    <article className={cn('mat-card rounded-card p-5 text-center', className)}>
      <Avatar src={avatar} name={name} size="xl" className="mx-auto" />
      <h3 className="mt-3 text-sm font-medium text-ink">{name}</h3>
      {role && <p className="text-xs text-ink-3">{role}</p>}
      {bio && <p className="mt-2 text-xs leading-relaxed text-ink-2">{bio}</p>}
      {email && (
        <a
          href={`mailto:${email}`}
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline',
            focusRing(),
          )}
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {email}
        </a>
      )}
      {socials && socials.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} className={cn('text-xs text-ink-3 hover:text-accent', focusRing())}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* ── Review ───────────────────────────────────────────────────────────── */

export interface ReviewCardProps {
  author: string;
  avatar?: string;
  rating: number;
  date?: string;
  title?: string;
  body: string;
  verified?: boolean;
  helpfulCount?: number;
  onHelpful?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — customer review with rating & helpful. */
export function ReviewCard({
  author,
  avatar,
  rating,
  date,
  title,
  body,
  verified,
  helpfulCount,
  onHelpful,
  className,
}: ReviewCardProps) {
  return (
    <article className={cn('mat-card rounded-card p-4', className)}>
      <div className="flex items-start gap-3">
        <Avatar src={avatar} name={author} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-ink">{author}</span>
            {verified && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Rating value={rating} readOnly size="sm" />
            {date && <span className="text-xs text-ink-3">{date}</span>}
          </div>
        </div>
      </div>
      {title && <h4 className="mt-3 text-sm font-medium text-ink">{title}</h4>}
      <p className="mt-1 text-xs leading-relaxed text-ink-2">{body}</p>
      {onHelpful && (
        <Button size="sm" variant="ghost" className="mt-3 -ml-2" onClick={onHelpful}>
          <ThumbsUp className="size-3.5" aria-hidden="true" />
          Helpful
          {helpfulCount !== undefined && <span className="text-ink-3">({helpfulCount})</span>}
        </Button>
      )}
    </article>
  );
}

/* ── Notification ─────────────────────────────────────────────────────── */

const NOTIFICATION_TONE: Record<Tone, 'neutral' | 'accent' | 'success' | 'warning' | 'danger'> = {
  neutral: 'neutral',
  accent: 'accent',
  info: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export interface NotificationCardProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
  tone?: Tone;
  time?: string;
  unread?: boolean;
  onRead?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — notification with unread state & actions. */
export function NotificationCard({
  title,
  message,
  icon,
  tone = 'accent',
  time,
  unread,
  onRead,
  onDismiss,
  className,
}: NotificationCardProps) {
  return (
    <article
      className={cn(
        'mat-card flex gap-3 rounded-card p-4',
        unread && 'ring-1 ring-accent/30',
        className,
      )}
    >
      <IconTile icon={icon ?? Circle} tone={NOTIFICATION_TONE[tone]} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-ink">{title}</h3>
          {unread && (
            <span
              role="img"
              aria-label="unread"
              className="size-2 shrink-0 rounded-full bg-accent"
            />
          )}
        </div>
        {message && <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{message}</p>}
        <div className="mt-2 flex items-center gap-3">
          {time && <span className="text-xs text-ink-3">{time}</span>}
          {onRead && (
            <button
              type="button"
              onClick={onRead}
              className={cn('text-xs font-medium text-accent hover:underline', focusRing())}
            >
              Mark read
            </button>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn(
            '-m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-3 hover:text-ink',
            focusRing(),
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

/* ── Task ─────────────────────────────────────────────────────────────── */

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export interface TaskCardProps {
  title: string;
  description?: string;
  done?: boolean;
  onToggle?: () => void;
  priority?: TaskPriority;
  assignee?: string;
  assigneeAvatar?: string;
  due?: string;
  tags?: string[];
  className?: string;
}

/** Work card (todo/09 §F batch 86) — task with completion toggle & metadata. */
export function TaskCard({
  title,
  description,
  done,
  onToggle,
  priority,
  assignee,
  assigneeAvatar,
  due,
  tags,
  className,
}: TaskCardProps) {
  return (
    <article className={cn('mat-card rounded-card p-4', className)}>
      <div className="flex items-start gap-3">
        {onToggle && (
          <button
            type="button"
            aria-pressed={done}
            aria-label={done ? 'Mark task incomplete' : 'Mark task complete'}
            onClick={onToggle}
            className={cn(
              'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-chip border transition-colors',
              done
                ? 'border-success bg-success text-accent-ink'
                : 'border-line/40 text-transparent hover:border-accent',
              focusRing(),
            )}
          >
            <Check className="size-3.5" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn('text-sm font-medium text-ink', done && 'text-ink-3 line-through')}>
              {title}
            </h3>
            {priority && <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>}
          </div>
          {description && <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>}
          {(assignee || due || (tags && tags.length > 0)) && (
            <Meta className="mt-3">
              {assignee && (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar src={assigneeAvatar} name={assignee} size="xs" />
                  {assignee}
                </span>
              )}
              {assignee && due && <Dot />}
              {due && <span>{due}</span>}
              {tags && tags.length > 0 && (
                <>
                  {(assignee || due) && <Dot />}
                  <span className="flex gap-1">
                    {tags.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </span>
                </>
              )}
            </Meta>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Project ──────────────────────────────────────────────────────────── */

export interface ProjectCardProps {
  name: string;
  description?: string;
  status?: string;
  progress?: number;
  members?: { name: string; src?: string }[];
  due?: string;
  taskCount?: number;
  doneCount?: number;
  href?: string;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — project with progress, members & due. */
export function ProjectCard({
  name,
  description,
  status,
  progress,
  members,
  due,
  taskCount,
  doneCount,
  href,
  className,
}: ProjectCardProps) {
  return (
    <Shell href={href} className={cn('p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">
          {href ? <span className="group-hover:underline">{name}</span> : name}
        </h3>
        {status && <Badge tone="accent">{status}</Badge>}
      </div>
      {description && <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>}
      {progress !== undefined && (
        <div className="mt-3">
          <Progress value={progress} />
          <p className="mt-1 text-right text-xs text-ink-3">{progress}%</p>
        </div>
      )}
      {members && members.length > 0 && (
        <ul className="mt-3 flex -space-x-2">
          {members.map((m) => (
            <li key={m.name}>
              <Avatar src={m.src} name={m.name} size="sm" className="ring-2 ring-surface-1" />
            </li>
          ))}
        </ul>
      )}
      <Meta className="mt-3">
        {doneCount !== undefined && taskCount !== undefined && (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {doneCount}/{taskCount} tasks
          </span>
        )}
        {doneCount !== undefined && due && <Dot />}
        {due && <span>{due}</span>}
      </Meta>
    </Shell>
  );
}

/* ── File / Folder ────────────────────────────────────────────────────── */

export type FileKind =
  | 'image'
  | 'pdf'
  | 'doc'
  | 'sheet'
  | 'zip'
  | 'audio'
  | 'video'
  | 'code'
  | 'generic';

const FILE_ICON: Record<FileKind, LucideIcon> = {
  image: FileImage,
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  zip: FileArchive,
  audio: FileAudio,
  video: FileVideo,
  code: FileCode,
  generic: File,
};

export interface FileCardProps {
  name: string;
  kind?: FileKind;
  size?: string;
  modified?: string;
  thumbnail?: string;
  href?: string;
  onDownload?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — file with type icon & download. */
export function FileCard({
  name,
  kind = 'generic',
  size,
  modified,
  thumbnail,
  href,
  onDownload,
  className,
}: FileCardProps) {
  return (
    <Shell href={href} className={cn('flex items-center gap-3 p-4', className)}>
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className="size-11 shrink-0 rounded-control object-cover"
        />
      ) : (
        <IconTile icon={FILE_ICON[kind]} tone="neutral" size="lg" />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-ink">
          {href ? <span className="group-hover:underline">{name}</span> : name}
        </h3>
        <Meta className="mt-0.5">
          <span className="uppercase">{kind}</span>
          {size && <Dot />}
          {size && <span>{size}</span>}
          {modified && <Dot />}
          {modified && <span>{modified}</span>}
        </Meta>
      </div>
      {onDownload && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDownload();
          }}
          aria-label={`Download ${name}`}
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-3 hover:text-ink',
            focusRing(),
          )}
        >
          <Download className="size-4" aria-hidden="true" />
        </button>
      )}
    </Shell>
  );
}

export interface FolderCardProps {
  name: string;
  itemCount?: number;
  modified?: string;
  shared?: boolean;
  href?: string;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — folder with item count & shared state. */
export function FolderCard({
  name,
  itemCount,
  modified,
  shared,
  href,
  className,
}: FolderCardProps) {
  return (
    <Shell href={href} className={cn('flex items-center gap-3 p-4', className)}>
      <IconTile icon={Folder} tone="accent" size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-medium text-ink">
            {href ? <span className="group-hover:underline">{name}</span> : name}
          </h3>
          {shared && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-3">
              <Users className="size-3.5" aria-hidden="true" />
              Shared
            </span>
          )}
        </div>
        <Meta className="mt-0.5">
          {itemCount !== undefined && (
            <span>
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </span>
          )}
          {itemCount !== undefined && modified && <Dot />}
          {modified && <span>{modified}</span>}
        </Meta>
      </div>
    </Shell>
  );
}

/* ── App / Integration ────────────────────────────────────────────────── */

export interface AppCardProps {
  name: string;
  description?: string;
  icon?: LucideIcon;
  category?: string;
  rating?: number;
  installed?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — app with rating & install/open action. */
export function AppCard({
  name,
  description,
  icon,
  category,
  rating,
  installed,
  actionLabel,
  onAction,
  className,
}: AppCardProps) {
  return (
    <article className={cn('mat-card flex flex-col rounded-card p-4', className)}>
      <div className="flex items-start gap-3">
        <IconTile icon={icon ?? Star} tone="accent" size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-ink">{name}</h3>
          {category && <Meta className="mt-0.5">{category}</Meta>}
          {rating !== undefined && <Rating value={rating} readOnly size="sm" className="mt-1" />}
        </div>
      </div>
      {description && <p className="mt-2 text-xs leading-relaxed text-ink-2">{description}</p>}
      {onAction && (
        <Button
          size="sm"
          variant={installed ? 'secondary' : 'primary'}
          className="mt-3 self-start"
          onClick={onAction}
        >
          {actionLabel ?? (installed ? 'Open' : 'Install')}
        </Button>
      )}
    </article>
  );
}

export interface IntegrationCardProps {
  name: string;
  description?: string;
  icon?: LucideIcon;
  connected?: boolean;
  onToggle?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — integration with connect/disconnect. */
export function IntegrationCard({
  name,
  description,
  icon,
  connected,
  onToggle,
  className,
}: IntegrationCardProps) {
  return (
    <article className={cn('mat-card flex items-start gap-3 rounded-card p-4', className)}>
      <IconTile icon={icon ?? Star} tone={connected ? 'success' : 'neutral'} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-ink">{name}</h3>
          {connected && <Badge tone="success">Connected</Badge>}
        </div>
        {description && <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>}
        {onToggle && (
          <Button
            size="sm"
            variant={connected ? 'ghost' : 'primary'}
            className="mt-3"
            onClick={onToggle}
          >
            {connected ? 'Disconnect' : 'Connect'}
          </Button>
        )}
      </div>
    </article>
  );
}

/* ── Feature ──────────────────────────────────────────────────────────── */

export interface FeatureCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — marketing feature with optional link. */
export function FeatureCard({
  icon,
  title,
  description,
  href,
  linkLabel,
  className,
}: FeatureCardProps) {
  return (
    <article className={cn('mat-card rounded-card p-5', className)}>
      {icon && <IconTile icon={icon} tone="accent" size="lg" />}
      <h3 className="mt-3 text-sm font-medium text-ink">{title}</h3>
      {description && <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>}
      {href && (
        <a
          href={href}
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline',
            focusRing(),
          )}
        >
          {linkLabel ?? 'Learn more'}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

/* ── Metric alert ─────────────────────────────────────────────────────── */

export type MetricAlertStatus = 'ok' | 'warning' | 'critical';

const ALERT_META: Record<
  MetricAlertStatus,
  { icon: LucideIcon; tone: 'success' | 'warning' | 'danger'; label: string }
> = {
  ok: { icon: CheckCircle2, tone: 'success', label: 'OK' },
  warning: { icon: AlertTriangle, tone: 'warning', label: 'Warning' },
  critical: { icon: AlertCircle, tone: 'danger', label: 'Critical' },
};

export interface MetricAlertCardProps {
  metric: string;
  value: string | number;
  threshold?: string | number;
  status: MetricAlertStatus;
  message?: string;
  trend?: number;
  onView?: () => void;
  className?: string;
}

/** Work card (todo/09 §F batch 86) — metric threshold alert with status. */
export function MetricAlertCard({
  metric,
  value,
  threshold,
  status,
  message,
  trend,
  onView,
  className,
}: MetricAlertCardProps) {
  const meta = ALERT_META[status];
  const direction: TrendDirection = !trend ? 'flat' : trend > 0 ? 'up' : 'down';
  return (
    <article className={cn('mat-card rounded-card p-4', className)}>
      <div className="flex items-start gap-3">
        <IconTile icon={meta.icon} tone={meta.tone} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-ink">{metric}</h3>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-ink">{value}</span>
            {trend !== undefined && (
              <TrendArrow direction={direction} value={Math.abs(trend)} percent />
            )}
          </div>
          {threshold !== undefined && (
            <p className="mt-0.5 text-xs text-ink-3">Threshold {threshold}</p>
          )}
        </div>
      </div>
      {message && <p className="mt-2 text-xs leading-relaxed text-ink-2">{message}</p>}
      {onView && (
        <Button size="sm" variant="secondary" className="mt-3" onClick={onView}>
          View details
        </Button>
      )}
    </article>
  );
}
