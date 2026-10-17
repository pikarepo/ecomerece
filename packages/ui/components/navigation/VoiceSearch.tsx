/** @jsxImportSource react */

/**
 * Voice search (todo/09 batch 79 §E, item 2). Wraps the platform Web Speech API
 * (`SpeechRecognition` / `webkitSpeechRecognition`) behind a tiny `mat-*`-styled
 * mic button — the API is not universally available, so support is detected on
 * mount (SSR renders the unsupported state) and the button degrades to a
 * disabled mic-off control.
 *
 * `packages/ui` stays headless: the recognized transcript is reported through
 * callbacks, never sent anywhere.
 */

import { Mic, MicOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../controls/Button';

/* Minimal Web Speech API shape — self-contained so we don't depend on lib.dom. */

interface SpeechRecognitionAlternativeLike {
  readonly transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}
export interface SpeechRecognitionHandle {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
export type SpeechRecognitionCtor = new () => SpeechRecognitionHandle;

/** The platform constructor, or `undefined` on the server / unsupported browsers. */
export function getSpeechRecognition(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export interface UseSpeechRecognitionOptions {
  /** BCP-47 language tag; left to the browser default when omitted. */
  lang?: string;
  /** Keep listening after a result. Default false (one-shot). */
  continuous?: boolean;
  /** Emit partial transcripts while speaking. Default true. */
  interimResults?: boolean;
  /** Called with the trimmed transcript; `isFinal` marks a settled phrase. */
  onResult?: (transcript: string, isFinal: boolean) => void;
  /** Called with the platform error code (`'not-allowed'`, `'no-speech'`, …). */
  onError?: (error: string) => void;
}

export interface SpeechRecognitionState {
  /** Platform support; false until mounted, so SSR output is stable. */
  supported: boolean;
  listening: boolean;
  /** Settled transcript, accumulated across final results. */
  transcript: string;
  /** In-flight partial transcript. */
  interimTranscript: string;
  /** Last platform error code, cleared on the next start. */
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/**
 * Headless Web Speech API controller. `start()` is a no-op when unsupported or
 * already listening; the recognition handle is abandoned on `end`/`error` so a
 * fresh one is created each session (restarting a finished handle throws).
 */
export function useSpeechRecognition({
  lang,
  continuous = false,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): SpeechRecognitionState {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<SpeechRecognitionHandle | null>(null);
  const callbacks = useRef({ onResult, onError });
  callbacks.current = { onResult, onError };

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()));
  }, []);

  const stop = useCallback(() => {
    handleRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor || handleRef.current) return;
    const handle = new Ctor();
    if (lang) handle.lang = lang;
    handle.continuous = continuous;
    handle.interimResults = interimResults;
    handle.onresult = (event) => {
      let finalText = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? '';
        if (result?.isFinal) finalText += text;
        else interim += text;
      }
      const settled = finalText.trim();
      if (settled) {
        setTranscript((prev) => (prev ? `${prev} ${settled}` : settled));
        callbacks.current.onResult?.(settled, true);
      }
      const partial = interim.trim();
      setInterimTranscript(partial);
      if (partial) callbacks.current.onResult?.(partial, false);
    };
    handle.onerror = (event) => {
      setError(event.error);
      setListening(false);
      handleRef.current = null;
      callbacks.current.onError?.(event.error);
    };
    handle.onend = () => {
      setListening(false);
      setInterimTranscript('');
      handleRef.current = null;
    };
    handleRef.current = handle;
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setListening(true);
    handle.start();
  }, [lang, continuous, interimResults]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(
    () => () => {
      handleRef.current?.abort();
      handleRef.current = null;
    },
    [],
  );

  return { supported, listening, transcript, interimTranscript, error, start, stop, toggle };
}

export interface VoiceSearchButtonProps extends UseSpeechRecognitionOptions {
  /** Accessible label when idle. Default "Search by voice". */
  label?: string;
  /** Accessible label while listening. Default "Stop voice search". */
  listeningLabel?: string;
  /** Accessible label when the platform has no speech API. Default "Voice search unavailable". */
  unsupportedLabel?: string;
  className?: string;
}

/**
 * Round mic toggle for a search field. Renders disabled (mic-off) when the
 * platform lacks the Web Speech API; otherwise pulses red while listening.
 */
export function VoiceSearchButton({
  label = 'Search by voice',
  listeningLabel = 'Stop voice search',
  unsupportedLabel = 'Voice search unavailable',
  className,
  ...options
}: VoiceSearchButtonProps) {
  const { supported, listening, toggle } = useSpeechRecognition(options);
  const accessibleLabel = !supported ? unsupportedLabel : listening ? listeningLabel : label;

  return (
    <IconButton
      label={accessibleLabel}
      aria-pressed={listening}
      disabled={!supported}
      onClick={toggle}
      className={cn(listening && 'animate-pulse text-danger', className)}
    >
      {supported ? (
        <Mic className="size-4" aria-hidden="true" />
      ) : (
        <MicOff className="size-4" aria-hidden="true" />
      )}
    </IconButton>
  );
}
