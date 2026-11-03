import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VoiceRecorderProps {
  onAudioRecorded: (base64Audio: string) => void;
  existingAudio?: string;
  onClearAudio?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioRecorded,
  existingAudio,
  onClearAudio,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio || null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recordedAudioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (existingAudio) {
      setAudioUrl(existingAudio);
    }
  }, [existingAudio]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setRecorderError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt hiện tại chưa hỗ trợ ghi âm trực tiếp qua microphone.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onAudioRecorded(base64data);
        };

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setRecorderError(
        err.message || 'Không thể truy cập microphone. Bạn có thể sử dụng nút tải lên tệp âm thanh có sẵn bên dưới.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const playRecorded = () => {
    if (!audioUrl) return;

    if (isPlayingRecorded) {
      recordedAudioElementRef.current?.pause();
      setIsPlayingRecorded(false);
      return;
    }

    const audio = new Audio(audioUrl);
    recordedAudioElementRef.current = audio;
    setIsPlayingRecorded(true);

    audio.onended = () => {
      setIsPlayingRecorded(false);
    };
    audio.play();
  };

  const clearAudio = () => {
    setAudioUrl(null);
    setIsPlayingRecorded(false);
    audioChunksRef.current = [];
    if (onClearAudio) onClearAudio();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecorderError(null);
    const localUrl = URL.createObjectURL(file);
    setAudioUrl(localUrl);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      onAudioRecorded(base64data);
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-stone-50 border-2 border-dashed border-amber-300 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-stone-800">
          Bản ghi âm giọng đọc bản địa <span className="text-amber-800">*</span>
        </label>
        <span className="text-xs text-stone-500">Ghi âm trực tiếp hoặc tải file</span>
      </div>

      {recorderError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{recorderError}</span>
        </div>
      )}

      {!audioUrl && !isRecording && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={startRecording}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-700 hover:bg-red-800 text-white font-medium rounded-xl shadow-xs transition cursor-pointer"
            >
              <Mic className="w-5 h-5 text-amber-200 animate-pulse" />
              <span>Nhấn để bắt đầu ghi âm</span>
            </button>

            <label className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-white hover:bg-stone-100 text-stone-700 font-medium border border-stone-300 rounded-xl shadow-2xs transition cursor-pointer">
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Tải file âm thanh (.mp3, .wav)</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-stone-500 text-center italic">
            Lưu ý: Hãy đọc rõ âm tiết, ngữ điệu tự nhiên và chuẩn theo ngữ âm tiếng Ê-đê.
          </p>
        </div>
      )}

      {isRecording && (
        <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-red-50/80 rounded-xl border border-red-200">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span className="text-red-700 font-semibold text-sm">Đang ghi âm microphone...</span>
            <span className="font-mono text-base font-bold text-red-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-red-200">
              {formatTime(recordDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1 h-6">
            {[40, 70, 90, 60, 100, 50, 80, 45, 95, 65, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-red-600 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDuration: `${0.4 + (i % 3) * 0.2}s` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center space-x-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-sm shadow-sm transition cursor-pointer"
          >
            <Square className="w-4 h-4 text-red-400 fill-current" />
            <span>Hoàn thành & Dừng ghi</span>
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={playRecorded}
              aria-label="Nghe lại bản ghi âm"
              className="p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white transition cursor-pointer shadow-xs"
            >
              {isPlayingRecorded ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-900 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bản ghi âm đã sẵn sàng</span>
              </div>
              <p className="text-xs text-stone-500">Bấm nút để nghe lại và kiểm tra chất lượng âm thanh</p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearAudio}
            aria-label="Xóa bản ghi âm này để ghi lại"
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            title="Ghi lại âm thanh mới"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
