/** @jsxImportSource react */
import { Clock, ImageOff, Play, Star, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Avatar } from '../surface/Avatar';
import { Badge } from '../surface/Badge';
import { Rating } from '../surface/Rating';

type CoverRatio = 'video' | 'wide' | 'square' | 'poster';

const RATIO: Record<CoverRatio, string> = {
  video: 'aspect-video',
  wide: 'aspect-[16/9]',
  square: 'aspect-square',
  poster: 'aspect-[2/3]',
};

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

function Cover({
  src,
  alt,
  ratio = 'video',
  children,
}: {
  src?: string;
  alt?: string;
  ratio?: CoverRatio;
  children?: ReactNode;
}) {
  return (
    <div className={cn('relative w-full overflow-hidden bg-surface-3', RATIO[ratio])}>
      {src ? (
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-skin ease-skin group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-ink-4">
          <ImageOff className="size-8" aria-hidden="true" />
        </span>
      )}
      {children}
    </div>
  );
}

function PlayOverlay({ href, onPlay }: { href?: string; onPlay?: () => void }) {
  const dot = (
    <span className="flex size-11 items-center justify-center rounded-full bg-ground/70 text-ink backdrop-blur-sm transition-transform duration-skin ease-skin group-hover:scale-110">
      <Play className="size-5 fill-current" aria-hidden="true" />
    </span>
  );
  if (!href && onPlay) {
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label="Play"
        className={cn('absolute inset-0 flex items-center justify-center', focusRing())}
      >
        {dot}
      </button>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {dot}
    </span>
  );
}

function DurationBadge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute bottom-2 right-2 rounded-chip bg-ground/80 px-1.5 py-0.5 font-mono text-[11px] text-ink">
      {children}
    </span>
  );
}

function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-3', className)}
    >
      {children}
    </p>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-ink-4">
      ·
    </span>
  );
}

function CardTitle({ children, link }: { children: ReactNode; link?: boolean }) {
  return (
    <h3 className="text-sm font-medium text-ink">
      {link ? <span className="group-hover:underline">{children}</span> : children}
    </h3>
  );
}

function TagRow({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
    </div>
  );
}

export interface ArticleCardProps {
  title: string;
  excerpt?: string;
  category?: string;
  image?: string;
  href?: string;
  author?: string;
  date?: ReactNode;
  readTime?: string;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — editorial article with a category kicker. */
export function ArticleCard({
  title,
  excerpt,
  category,
  image,
  href,
  author,
  date,
  readTime,
  className,
}: ArticleCardProps) {
  const hasMeta = Boolean(author || date || readTime);
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={title} ratio="wide">
        {category && (
          <span className="absolute left-2 top-2">
            <Badge tone="accent">{category}</Badge>
          </span>
        )}
      </Cover>
      <div className="p-4">
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        {excerpt && <p className="mt-1 line-clamp-2 text-xs text-ink-3">{excerpt}</p>}
        {hasMeta && (
          <Meta className="mt-3">
            {author && <span>{author}</span>}
            {author && (date || readTime) && <Dot />}
            {date && <span>{date}</span>}
            {date && readTime && <Dot />}
            {readTime && <span>{readTime}</span>}
          </Meta>
        )}
      </div>
    </Shell>
  );
}

export interface BlogCardProps {
  title: string;
  excerpt?: string;
  image?: string;
  href?: string;
  author?: { name: string; src?: string };
  date?: ReactNode;
  tags?: string[];
  readTime?: string;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — blog post led by the author. */
export function BlogCard({
  title,
  excerpt,
  image,
  href,
  author,
  date,
  tags,
  readTime,
  className,
}: BlogCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={title} ratio="wide" />
      <div className="p-4">
        {author && (
          <div className="mb-2 flex items-center gap-2">
            <Avatar src={author.src} name={author.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-ink">{author.name}</p>
              {date && <p className="truncate text-[11px] text-ink-3">{date}</p>}
            </div>
          </div>
        )}
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        {excerpt && <p className="mt-1 line-clamp-2 text-xs text-ink-3">{excerpt}</p>}
        <TagRow tags={tags} />
        {readTime && <Meta className="mt-3">{readTime}</Meta>}
      </div>
    </Shell>
  );
}

export interface NewsCardProps {
  headline: string;
  summary?: string;
  image?: string;
  href?: string;
  section?: string;
  source?: string;
  date?: ReactNode;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — news headline with a section kicker. */
export function NewsCard({
  headline,
  summary,
  image,
  href,
  section,
  source,
  date,
  className,
}: NewsCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={headline} ratio="wide" />
      <div className="p-4">
        {section && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {section}
          </p>
        )}
        <CardTitle link={Boolean(href)}>{headline}</CardTitle>
        {summary && <p className="mt-1 line-clamp-2 text-xs text-ink-3">{summary}</p>}
        {(source || date) && (
          <Meta className="mt-3">
            {source && <span>{source}</span>}
            {source && date && <Dot />}
            {date && <span>{date}</span>}
          </Meta>
        )}
      </div>
    </Shell>
  );
}

export interface VideoCardProps {
  title: string;
  thumbnail?: string;
  href?: string;
  channel?: string;
  views?: string;
  date?: ReactNode;
  duration?: string;
  onPlay?: () => void;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — video thumbnail with duration & play. */
export function VideoCard({
  title,
  thumbnail,
  href,
  channel,
  views,
  date,
  duration,
  onPlay,
  className,
}: VideoCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={thumbnail} alt={title} ratio="video">
        <PlayOverlay href={href} onPlay={onPlay} />
        {duration && <DurationBadge>{duration}</DurationBadge>}
      </Cover>
      <div className="p-4">
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        {(channel || views || date) && (
          <Meta className="mt-2">
            {channel && <span>{channel}</span>}
            {channel && views && <Dot />}
            {views && <span>{views}</span>}
            {(channel || views) && date && <Dot />}
            {date && <span>{date}</span>}
          </Meta>
        )}
      </div>
    </Shell>
  );
}

export interface AlbumCardProps {
  title: string;
  artist: string;
  cover?: string;
  href?: string;
  year?: number | string;
  tracks?: number;
  onPlay?: () => void;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — album / music release. */
export function AlbumCard({
  title,
  artist,
  cover,
  href,
  year,
  tracks,
  onPlay,
  className,
}: AlbumCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={cover} alt={`${title} — ${artist}`} ratio="square">
        <PlayOverlay href={href} onPlay={onPlay} />
      </Cover>
      <div className="p-4">
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        <p className="mt-0.5 text-xs text-ink-3">{artist}</p>
        {(year || tracks) && (
          <Meta className="mt-2">
            {year && <span>{year}</span>}
            {year && tracks && <Dot />}
            {tracks && <span>{tracks} tracks</span>}
          </Meta>
        )}
      </div>
    </Shell>
  );
}

export interface PodcastCardProps {
  title: string;
  show?: string;
  cover?: string;
  href?: string;
  episode?: number;
  duration?: string;
  date?: ReactNode;
  onPlay?: () => void;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — podcast episode with play. */
export function PodcastCard({
  title,
  show,
  cover,
  href,
  episode,
  duration,
  date,
  onPlay,
  className,
}: PodcastCardProps) {
  return (
    <Shell href={href} className={className}>
      <div className="flex gap-4 p-4">
        <div className="w-24 shrink-0">
          <Cover src={cover} alt={title} ratio="square">
            <PlayOverlay href={href} onPlay={onPlay} />
          </Cover>
        </div>
        <div className="min-w-0 flex-1">
          {show && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">{show}</p>
          )}
          {episode !== undefined && <p className="text-[11px] text-ink-3">Episode {episode}</p>}
          <CardTitle link={Boolean(href)}>{title}</CardTitle>
          {(duration || date) && (
            <Meta className="mt-2">
              {duration && <span>{duration}</span>}
              {duration && date && <Dot />}
              {date && <span>{date}</span>}
            </Meta>
          )}
        </div>
      </div>
    </Shell>
  );
}

const DIFFICULTY_TONE: Record<'easy' | 'medium' | 'hard', 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export interface RecipeCardProps {
  title: string;
  image?: string;
  href?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: number;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — recipe with cook time, servings & rating. */
export function RecipeCard({
  title,
  image,
  href,
  cookTime,
  servings,
  difficulty,
  rating,
  className,
}: RecipeCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={title} ratio="wide">
        {difficulty && (
          <span className="absolute right-2 top-2">
            <Badge tone={DIFFICULTY_TONE[difficulty]}>{difficulty}</Badge>
          </span>
        )}
      </Cover>
      <div className="p-4">
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          {cookTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {cookTime}
            </span>
          )}
          {servings !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden="true" />
              {servings}
            </span>
          )}
          {rating !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-current text-warning" aria-hidden="true" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Shell>
  );
}

export interface MovieCardProps {
  title: string;
  poster?: string;
  href?: string;
  year?: number | string;
  rating?: number;
  genres?: string[];
  runtime?: string;
  className?: string;
}

/** Content card (todo/09 §F batch 84) — movie poster with rating & genres. */
export function MovieCard({
  title,
  poster,
  href,
  year,
  rating,
  genres,
  runtime,
  className,
}: MovieCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={poster} alt={title} ratio="poster" />
      <div className="p-4">
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        {(year || runtime) && (
          <Meta className="mt-1">
            {year && <span>{year}</span>}
            {year && runtime && <Dot />}
            {runtime && <span>{runtime}</span>}
          </Meta>
        )}
        {rating !== undefined && (
          <div className="mt-2">
            <Rating value={rating} readOnly size="sm" />
          </div>
        )}
        <TagRow tags={genres} />
      </div>
    </Shell>
  );
}

/** Alias for {@link AlbumCard} — music release. */
export const MusicCard = AlbumCard;
