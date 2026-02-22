import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Loader2 } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  className?: string;
}

export default function VoiceSearchButton({ onResult, className }: VoiceSearchButtonProps) {
  const { t, i18n } = useTranslation();
  const { isRecording, duration, mimeType, startRecording, stopRecording, error: recorderError, isSupported } = useVoiceRecorder(10000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupported) return null;

  async function handleClick() {
    setError(null);

    if (isRecording) {
      const base64 = await stopRecording();
      if (!base64) return;

      setIsProcessing(true);
      try {
        const { data } = await api.post('/voice/search', {
          audio_base64: base64,
          language: i18n.language,
          mime_type: mimeType,
        });

        if (data.transcript?.trim()) {
          onResult(data.transcript.trim());
        } else {
          setError(t('voice.search_error'));
          setTimeout(() => setError(null), 3000);
        }
      } catch {
        setError(t('voice.search_error'));
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsProcessing(false);
      }
    } else {
      await startRecording();
    }
  }

  // Show recorder error (e.g. mic denied)
  const displayError = recorderError
    ? t(recorderError === 'mic_permission_denied' ? 'voice.mic_denied' : 'voice.mic_error')
    : error;

  const durationSec = Math.floor(duration / 1000);

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={isRecording ? t('voice.search_listening') : t('common.search')}
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center transition-all',
          isRecording
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
            : isProcessing
              ? 'bg-gray-100 text-gray-400 cursor-wait'
              : 'bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-500 active:scale-95',
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Duration badge while recording */}
      {isRecording && (
        <span className="absolute -top-2 -end-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {durationSec}s
        </span>
      )}

      {/* Status text */}
      {(isRecording || isProcessing) && (
        <span className="ms-2 text-xs font-medium text-gray-500 whitespace-nowrap">
          {isRecording ? t('voice.search_listening') : t('voice.search_processing')}
        </span>
      )}

      {/* Error toast */}
      {displayError && (
        <span className="absolute top-full mt-1 start-0 text-xs text-red-500 whitespace-nowrap bg-white rounded-lg shadow-sm px-2 py-1 border border-red-100 z-10">
          {displayError}
        </span>
      )}
    </div>
  );
}
