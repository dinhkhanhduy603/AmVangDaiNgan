import React, { useState, useRef } from 'react';
import { Volume2, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';
import { playPronunciation } from '../utils/dictionary';

interface AudioPlayerButtonProps {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  audioBase64?: string;
  speakerName?: string;
  variant?: 'compact' | 'standard' | 'large';
  showSpeakerBadge?: boolean;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  word,
  phonetic,
  audioUrl,
  audioBase64,
  speakerName,
  variant = 'standard',
  showSpeakerBadge = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await playPronunciation({
        word,
        phonetic,
        audioUrl,
        audioBase64,
        playbackRate,
        onStart: () => {
          setIsLoading(false);
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.warn('Playback error:', err);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const toggleRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRate = playbackRate === 1 ? 0.75 : 1;
    setPlaybackRate(nextRate);
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handlePlay}
        aria-label={`Nghe phát âm từ ${word}`}
        title={`Nghe phát âm: ${word}${speakerName ? ` (Đọc bởi: ${speakerName})` : ''}`}
        className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          isPlaying
            ? 'bg-amber-600 text-white animate-pulse shadow-md ring-2 ring-amber-400'
            : isLoading
            ? 'bg-amber-200 text-amber-900 border border-amber-400'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs'
        }`}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-amber-900" />
        ) : isPlaying ? (
          <Volume2 className="w-4 h-4 animate-bounce" />
        ) : (
          <Play className="w-4 h-4 ml-0.5 fill-current" />
        )}
      </button>
    );
  }

  if (variant === 'large') {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-stone-100 rounded-2xl border border-stone-200 shadow-xs">
        <button
          onClick={handlePlay}
          aria-label={`Nghe phát âm chuẩn: ${word}`}
          className={`flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-xs transition-all cursor-pointer ${
            isPlaying
              ? 'bg-red-700 text-white ring-4 ring-red-200 animate-pulse'
              : isLoading
              ? 'bg-amber-700 text-white'
              : 'bg-amber-800 hover:bg-amber-700 text-amber-50 active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 text-amber-200 animate-spin" />
              <span>Đang tải âm thanh giọng đọc...</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-5 h-5 text-amber-200" />
              <span>Đang phát âm thanh...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-amber-300" />
              <span>Nghe phát âm chuẩn bản địa</span>
            </>
          )}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Speed switch */}
          <button
            onClick={toggleRate}
            aria-label={`Đổi tốc độ phát: hiện tại ${playbackRate}x`}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer shadow-2xs"
            title="Tốc độ phát âm (hỗ trợ người học phát âm chậm)"
          >
            Tốc độ: <span className="text-amber-800">{playbackRate}x</span>
          </button>

          {speakerName ? (
            <div className="text-xs text-stone-700 bg-stone-200/90 px-3 py-2 rounded-lg border border-stone-300 truncate max-w-full sm:max-w-xs">
              Giọng đọc: <span className="font-semibold text-stone-900">{speakerName}</span>
            </div>
          ) : (
            <div className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Phát âm AI Studio chuẩn hóa</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePlay}
        aria-label={`Nghe phát âm: ${word}`}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isPlaying
            ? 'bg-amber-600 text-white shadow-xs'
            : isLoading
            ? 'bg-amber-200 text-amber-900'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-amber-900 animate-spin" />
            <span>Tải âm...</span>
          </>
        ) : isPlaying ? (
          <>
            <span className="flex space-x-0.5 items-end h-3">
              <span className="w-0.5 h-3 bg-white animate-bounce" />
              <span className="w-0.5 h-2 bg-white animate-bounce delay-75" />
              <span className="w-0.5 h-3 bg-white animate-bounce delay-150" />
            </span>
            <span>Đang đọc</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Nghe đọc</span>
          </>
        )}
      </button>

      {showSpeakerBadge && speakerName && (
        <span className="text-[11px] text-stone-500 truncate max-w-[140px]" title={speakerName}>
          {speakerName}
        </span>
      )}
    </div>
  );
};
