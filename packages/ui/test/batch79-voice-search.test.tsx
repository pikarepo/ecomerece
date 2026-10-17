/** @jsxImportSource react */

import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import { useSpeechRecognition, VoiceSearchButton } from '../components/navigation';
import { act, fire, registerDom, render, renderHook, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  started = 0;
  stopped = 0;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started += 1;
  }

  stop() {
    this.stopped += 1;
  }

  abort() {}
}

function installSpeechCtor() {
  FakeRecognition.instances = [];
  (window as any).SpeechRecognition = FakeRecognition;
  delete (window as any).webkitSpeechRecognition;
}

function uninstallSpeechCtor() {
  delete (window as any).SpeechRecognition;
  delete (window as any).webkitSpeechRecognition;
}

function button(container: HTMLElement): HTMLButtonElement {
  return container.querySelector('button') as HTMLButtonElement;
}

describe('batch 79 voice search - hook', () => {
  beforeEach(() => {
    uninstallSpeechCtor();
  });

  it('reports unsupported until the platform has a constructor', () => {
    uninstallSpeechCtor();
    const h = renderHook(() => useSpeechRecognition());
    // useEffect hasn't flushed yet in sync? renderHook runs act to render once.
    expect(h.latest().supported).toBe(false);
    h.unmount();
  });

  it('detects support after mount when the constructor exists', () => {
    installSpeechCtor();
    const h = renderHook(() => useSpeechRecognition());
    expect(h.latest().supported).toBe(true);
    h.unmount();
  });

  it('starts and stops recognition', async () => {
    installSpeechCtor();
    const h = renderHook(() => useSpeechRecognition());
    act(() => {
      h.latest().start();
    });
    expect(h.latest().listening).toBe(true);
    expect(FakeRecognition.instances.length).toBe(1);
    expect(FakeRecognition.instances[0].started).toBe(1);
    act(() => {
      h.latest().stop();
    });
    expect(h.latest().listening).toBe(false);
    expect(FakeRecognition.instances[0].stopped).toBe(1);
    h.unmount();
  });

  it('passes lang/continuous/interimResults to the instance', () => {
    installSpeechCtor();
    const h = renderHook(() =>
      useSpeechRecognition({ lang: 'en-US', continuous: true, interimResults: false }),
    );
    act(() => {
      h.latest().start();
    });
    const inst = FakeRecognition.instances[0];
    expect(inst.lang).toBe('en-US');
    expect(inst.continuous).toBe(true);
    expect(inst.interimResults).toBe(false);
    h.unmount();
  });

  it('emits final and interim transcripts', () => {
    installSpeechCtor();
    const results: Array<[string, boolean]> = [];
    const h = renderHook(() => useSpeechRecognition({ onResult: (t, f) => results.push([t, f]) }));
    act(() => {
      h.latest().start();
    });
    const inst = FakeRecognition.instances[0];
    // interim result at index 0
    inst.onresult?.({
      resultIndex: 0,
      results: [
        {
          isFinal: false,
          length: 1,
          0: { transcript: 'pag' },
        } as any,
      ],
    });
    // final result
    inst.onresult?.({
      resultIndex: 1,
      results: [
        {
          isFinal: false,
          length: 1,
          0: { transcript: 'pag' },
        } as any,
        {
          isFinal: true,
          length: 1,
          0: { transcript: 'page' },
        } as any,
      ],
    });
    expect(results).toEqual([
      ['pag', false],
      ['page', true],
    ]);
    h.unmount();
  });

  it('reports errors and stops listening', () => {
    installSpeechCtor();
    const errors: string[] = [];
    const h = renderHook(() => useSpeechRecognition({ onError: (e) => errors.push(e) }));
    act(() => {
      h.latest().start();
    });
    const inst = FakeRecognition.instances[0];
    act(() => {
      inst.onerror?.({ error: 'not-allowed' } as any);
    });
    expect(h.latest().listening).toBe(false);
    expect(h.latest().error).toBe('not-allowed');
    expect(errors).toEqual(['not-allowed']);
    h.unmount();
  });

  it('toggle starts when stopped and stops when listening', () => {
    installSpeechCtor();
    const h = renderHook(() => useSpeechRecognition());
    act(() => {
      h.latest().toggle();
    });
    expect(h.latest().listening).toBe(true);
    act(() => {
      h.latest().toggle();
    });
    expect(h.latest().listening).toBe(false);
    h.unmount();
  });
});

describe('batch 79 voice search button', () => {
  beforeEach(() => {
    uninstallSpeechCtor();
  });

  it('renders unsupported state (disabled mic-off, accessible label)', () => {
    uninstallSpeechCtor();
    const { container, unmount } = render(<VoiceSearchButton />);
    const btn = button(container);
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-label')).toBe('Voice search unavailable');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    unmount();
  });

  it('starts listening when clicked (supported)', async () => {
    installSpeechCtor();
    const { container, unmount } = render(<VoiceSearchButton />);
    const btn = button(container);
    expect(btn.disabled).toBe(false);
    expect(btn.getAttribute('aria-label')).toBe('Search by voice');
    await act(async () => {
      fire(btn, 'click');
    });
    expect(button(container).getAttribute('aria-label')).toBe('Stop voice search');
    expect(button(container).getAttribute('aria-pressed')).toBe('true');
    expect(FakeRecognition.instances[0].started).toBe(1);
    unmount();
  });

  it('stops when clicked while listening', async () => {
    installSpeechCtor();
    const { container, unmount } = render(<VoiceSearchButton />);
    const btn = button(container);
    await act(async () => {
      fire(btn, 'click');
    });
    await act(async () => {
      fire(button(container), 'click');
    });
    expect(button(container).getAttribute('aria-label')).toBe('Search by voice');
    expect(button(container).getAttribute('aria-pressed')).toBe('false');
    expect(FakeRecognition.instances[0].stopped).toBe(1);
    unmount();
  });
});
