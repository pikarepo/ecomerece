/** @jsxImportSource react */

import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Square } from 'lucide-react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Media transport controls (todo/09 batch 57): play/pause, stop, prev/next,
 * shuffle and repeat. `mat-*` + theme token utilities only.
 */

export type RepeatMode = 'off' | 'all' | 'one';

const BTN =
  'inline-flex shrink-0 select-none items-center justify-center rounded-control text-ink-2 transition-all duration-skin ease-skin hover:bg-surface-3 hover:text-ink disabled:pointer-events-none disabled:opacity-60';

export interface MediaControlsProps {
  playing?: boolean;
  onPlayPause?: () => void;
  onStop?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onShuffle?: () => void;
  onRepeatToggle?: (mode: RepeatMode) => void;
  shuffleOn?: boolean;
  repeat?: RepeatMode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZES = {
  sm: { box: 'size-8', icon: 'size-3.5' },
  md: { box: 'size-10', icon: 'size-4' },
  lg: { box: 'size-12', icon: 'size-5' },
} as const;

export function MediaControls({
  playing = false,
  onPlayPause,
  onStop,
  onNext,
  onPrevious,
  onShuffle,
  onRepeatToggle,
  shuffleOn = false,
  repeat = 'off',
  size = 'md',
  className,
  label = 'Media controls',
}: MediaControlsProps) {
  const s = SIZES[size];
  const nextRepeat: RepeatMode = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('inline-flex items-center gap-1', className)}
    >
      <button
        type="button"
        aria-label="Shuffle"
        aria-pressed={shuffleOn}
        data-active={shuffleOn || undefined}
        onClick={onShuffle}
        className={cn(BTN, s.box, shuffleOn && 'text-accent', focusRing())}
      >
        <Shuffle className={s.icon} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrevious}
        className={cn(BTN, s.box, focusRing())}
      >
        <SkipBack className={s.icon} aria-hidden />
      </button>
      <button
        type="button"
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={onPlayPause}
        className={cn(
          'mat-primary inline-flex shrink-0 items-center justify-center rounded-full text-accent-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
          s.box,
          focusRing(),
        )}
      >
        {playing ? (
          <Pause className={s.icon} aria-hidden />
        ) : (
          <Play className={cn(s.icon, 'translate-x-px')} aria-hidden />
        )}
      </button>
      <button
        type="button"
        aria-label="Stop"
        onClick={onStop}
        className={cn(BTN, s.box, focusRing())}
      >
        <Square className={cn(s.icon, 'size-3')} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        className={cn(BTN, s.box, focusRing())}
      >
        <SkipForward className={s.icon} aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`Repeat: ${repeat}`}
        data-repeat={repeat}
        onClick={() => onRepeatToggle?.(nextRepeat)}
        className={cn(BTN, s.box, repeat !== 'off' && 'text-accent', focusRing())}
      >
        <RepeatIcon className={s.icon} aria-hidden />
      </button>
    </div>
  );
}

export interface PlayPauseButtonProps {
  playing: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayPauseButton({
  playing,
  onToggle,
  size = 'md',
  className,
}: PlayPauseButtonProps) {
  const s = SIZES[size];
  return (
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      aria-pressed={playing}
      onClick={onToggle}
      className={cn(
        'mat-primary inline-flex shrink-0 items-center justify-center rounded-full text-accent-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
        s.box,
        focusRing(),
        className,
      )}
    >
      {playing ? (
        <Pause className={s.icon} aria-hidden />
      ) : (
        <Play className={cn(s.icon, 'translate-x-px')} aria-hidden />
      )}
    </button>
  );
}
