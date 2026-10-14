/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  CallControls,
  CameraButton,
  MicButton,
  ScreenShareButton,
} from '../components/controls/CallControls';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const buttons = (c: HTMLElement) => Array.from(c.querySelectorAll('button')) as HTMLButtonElement[];

describe('batch 58 call controls', () => {
  it('MicButton toggles mute semantics', () => {
    const seen: boolean[] = [];
    const { container, unmount } = render(<MicButton muted onToggle={(v) => seen.push(v)} />);
    const btn = buttons(container)[0];
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Unmute microphone');
    act(() => btn.click());
    expect(seen).toEqual([false]);
    unmount();
  });

  it('CameraButton and ScreenShareButton report toggles', () => {
    const camera: boolean[] = [];
    const share: boolean[] = [];
    const { unmount } = render(
      <div>
        <CameraButton enabled={false} onToggle={(v) => camera.push(v)} />
        <ScreenShareButton sharing onToggle={(v) => share.push(v)} />
      </div>,
    );
    const [cam, sh] = buttons(document.body);
    act(() => cam.click());
    act(() => sh.click());
    expect(camera).toEqual([true]);
    expect(share).toEqual([false]);
    unmount();
  });

  it('CallControls renders the full cluster and wires callbacks', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      <CallControls
        muted={false}
        cameraOn
        sharing={false}
        onToggleMute={() => calls.push('mic')}
        onToggleCamera={() => calls.push('cam')}
        onToggleShare={() => calls.push('share')}
        onEndCall={() => calls.push('end')}
      />,
    );
    const [mic, cam, share, end] = buttons(container);
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    act(() => mic.click());
    act(() => cam.click());
    act(() => share.click());
    act(() => end.click());
    expect(calls).toEqual(['mic', 'cam', 'share', 'end']);
    unmount();
  });
});
