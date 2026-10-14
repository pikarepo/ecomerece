/** @jsxImportSource react */

import { Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Call/media-device controls (todo/09 batch 58): mic mute, camera toggle,
 * screen share, and an end-call button. `mat-*` + theme token utilities only.
 */

const BTN =
  'inline-flex shrink-0 select-none items-center justify-center rounded-full transition-all duration-skin ease-skin active:scale-[var(--press-scale)] disabled:pointer-events-none disabled:opacity-60';
const SIZE = { sm: 'size-9', md: 'size-11', lg: 'size-14' } as const;
type Size = keyof typeof SIZE;
const ICON = { sm: 'size-4', md: 'size-5', lg: 'size-6' } as const;

const ON = 'mat-primary text-accent-ink hover:opacity-90';
const OFF_BAD = 'bg-danger text-danger-ink hover:opacity-90';
const OFF_NEUTRAL = 'mat-control text-ink hover:opacity-90';

export interface CallDeviceButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
}

export interface MicButtonProps extends Omit<CallDeviceButtonProps, 'onToggle'> {
  /** `true` when the mic is muted. */
  muted: boolean;
  onToggle?: (muted: boolean) => void;
}

export function MicButton({ muted, onToggle, size = 'md', className, ...rest }: MicButtonProps) {
  const Icon = muted ? MicOff : Mic;
  return (
    <button
      type="button"
      aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
      aria-pressed={muted}
      className={cn(BTN, muted ? OFF_BAD : ON, SIZE[size], focusRing(), className)}
      onClick={(e) => {
        rest.onClick?.(e);
        onToggle?.(!muted);
      }}
      {...rest}
    >
      <Icon className={ICON[size]} aria-hidden />
    </button>
  );
}

export interface CameraButtonProps extends Omit<CallDeviceButtonProps, 'onToggle'> {
  /** `true` when the camera is on. */
  enabled: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function CameraButton({
  enabled,
  onToggle,
  size = 'md',
  className,
  ...rest
}: CameraButtonProps) {
  const Icon = enabled ? Video : VideoOff;
  return (
    <button
      type="button"
      aria-label={enabled ? 'Turn off camera' : 'Turn on camera'}
      aria-pressed={enabled}
      className={cn(BTN, enabled ? ON : OFF_BAD, SIZE[size], focusRing(), className)}
      onClick={(e) => {
        rest.onClick?.(e);
        onToggle?.(!enabled);
      }}
      {...rest}
    >
      <Icon className={ICON[size]} aria-hidden />
    </button>
  );
}

export interface ScreenShareButtonProps extends Omit<CallDeviceButtonProps, 'onToggle'> {
  sharing: boolean;
  onToggle?: (sharing: boolean) => void;
}

export function ScreenShareButton({
  sharing,
  onToggle,
  size = 'md',
  className,
  ...rest
}: ScreenShareButtonProps) {
  return (
    <button
      type="button"
      aria-label={sharing ? 'Stop sharing screen' : 'Share screen'}
      aria-pressed={sharing}
      className={cn(BTN, sharing ? ON : OFF_NEUTRAL, SIZE[size], focusRing(), className)}
      onClick={(e) => {
        rest.onClick?.(e);
        onToggle?.(!sharing);
      }}
      {...rest}
    >
      <MonitorUp className={ICON[size]} aria-hidden />
    </button>
  );
}

export interface EndCallButtonProps extends CallDeviceButtonProps {
  onEndCall?: () => void;
}

export function EndCallButton({ onEndCall, size = 'md', className, ...rest }: EndCallButtonProps) {
  return (
    <button
      type="button"
      aria-label="End call"
      className={cn(
        BTN,
        'bg-danger text-danger-ink hover:opacity-90',
        SIZE[size],
        focusRing(),
        className,
      )}
      onClick={(e) => {
        rest.onClick?.(e);
        onEndCall?.();
      }}
      {...rest}
    >
      <PhoneOff className={ICON[size]} aria-hidden />
    </button>
  );
}

export interface CallControlsProps {
  muted?: boolean;
  cameraOn?: boolean;
  sharing?: boolean;
  onToggleMute?: (muted: boolean) => void;
  onToggleCamera?: (on: boolean) => void;
  onToggleShare?: (sharing: boolean) => void;
  onEndCall?: () => void;
  /** Show the screen-share and end-call buttons (default true). */
  showShare?: boolean;
  size?: Size;
  className?: string;
  label?: string;
}

export function CallControls({
  muted = false,
  cameraOn = true,
  sharing = false,
  onToggleMute,
  onToggleCamera,
  onToggleShare,
  onEndCall,
  size = 'md',
  className,
  label = 'Call controls',
}: CallControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <MicButton muted={muted} onToggle={onToggleMute} size={size} />
      <CameraButton enabled={cameraOn} onToggle={onToggleCamera} size={size} />
      <ScreenShareButton sharing={sharing} onToggle={onToggleShare} size={size} />
      <EndCallButton onEndCall={onEndCall} size={size} />
    </div>
  );
}
