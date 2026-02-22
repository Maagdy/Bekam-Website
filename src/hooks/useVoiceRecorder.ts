import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  duration: number;
  mimeType: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceRecorder(maxDurationMs = 15000): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('audio/webm');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveRef = useRef<((base64: string | null) => void) | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  // Determine best supported mime type
  function getMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    return 'audio/webm';
  }

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setDuration(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const selectedMime = getMimeType();
      setMimeType(selectedMime);
      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        cleanup();

        const blob = new Blob(chunksRef.current, { type: selectedMime });

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          // Strip data:audio/...;base64, prefix
          const base64 = dataUrl.split(',')[1] || '';
          resolveRef.current?.(base64);
          resolveRef.current = null;
        };
        reader.onerror = () => {
          resolveRef.current?.(null);
          resolveRef.current = null;
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);

      // Duration timer (update every 100ms)
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Date.now() - startTime);
      }, 100);

      // Auto-stop after max duration
      autoStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, maxDurationMs);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'mic_permission_denied'
          : 'mic_error';
      setError(message);
    }
  }, [maxDurationMs, cleanup]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        resolve(null);
        return;
      }

      resolveRef.current = resolve;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    });
  }, []);

  return {
    isRecording,
    duration,
    mimeType,
    startRecording,
    stopRecording,
    error,
    isSupported,
  };
}
