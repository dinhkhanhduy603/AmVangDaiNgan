import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, Volume2, Bookmark, Check, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { DictionaryItem } from '../types/dictionary';
import { AudioPlayerButton } from './AudioPlayerButton';

interface WordDetailScreenProps {
  word: DictionaryItem | null;
  allWords: DictionaryItem[];
  onBack: () => void;
  onSelectWord: (item: DictionaryItem) => void;
  onOpenGemini: () => void;
}

export const WordDetailScreen: React.FC<WordDetailScreenProps> = ({
  word,
  allWords,
  onBack,
  onSelectWord,
  onOpenGemini,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!word) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-4">
        <p className="text-stone-600">Chưa có từ vựng nào được chọn.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-800 text-white rounded-xl text-sm font-medium cursor-pointer"
        >
          Quay lại danh sách từ vựng
        </button>
      </div>
    );
  }

  // Find index for next/prev navigation
  const currentIndex = allWords.findIndex((item) => item.id === word.id);
  const prevWord = currentIndex > 0 ? allWords[currentIndex - 1] : null;
  const nextWord = currentIndex >= 0 && currentIndex < allWords.length - 1 ? allWords[currentIndex + 1] : null;

  const handleCopy = () => {
    const text = `${word.tu_tieng_ede || word.tu_tieng_viet} (${word.phien_am}) - Nghĩa: ${word.tu_tieng_viet}. Người đọc: ${word.ten_nguoi_doc_ban_ghi}.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-medium shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách từ</span>
        </button>

        {/* Previous / Next buttons */}
        <div className="flex items-center space-x-2">
          <button
            disabled={!prevWord}
            onClick={() => prevWord && onSelectWord(prevWord)}
            aria-label="Từ trước đó"
            className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            title={prevWord ? `Từ trước: ${prevWord.tu_tieng_ede || prevWord.tu_tieng_viet}` : ''}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-stone-500 font-mono">
            {currentIndex + 1} / {allWords.length}
          </span>
          <button
            disabled={!nextWord}
            onClick={() => nextWord && onSelectWord(nextWord)}
            aria-label="Từ kế tiếp"
            className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            title={nextWord ? `Từ kế tiếp: ${nextWord.tu_tieng_ede || nextWord.tu_tieng_viet}` : ''}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <article className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
        {/* Decorative strip */}
        <div className="h-2 w-full bg-linear-to-r from-red-700 via-amber-600 to-indigo-700" />

        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Header row: Word & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
                  {word.chu_de || 'Từ vựng tiếng Ê-đê'}
                </span>
                {word.trang_thai === 'cho_duyet' && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    Bản ghi đóng góp mới
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-amber-950 tracking-tight">
                {word.tu_tieng_ede || word.tu_tieng_viet}
              </h1>

              {word.phien_am && (
                <div className="mt-1 text-base sm:text-lg text-amber-800/80 font-mono font-medium">
                  Phiên âm quốc tế: {word.phien_am}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium cursor-pointer"
                title="Sao chép thông tin từ vựng"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
              </button>

              <button
                onClick={onOpenGemini}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-medium cursor-pointer"
                title="Hỏi thêm về ngữ cảnh từ này với Gemini"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Hỏi Gemini</span>
              </button>
            </div>
          </div>

          {/* Meaning Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Nghĩa tiếng Việt:
              </span>
              <p className="text-xl font-bold text-stone-900">{word.tu_tieng_viet}</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Tên bản ghi tư liệu:
              </span>
              <p className="text-sm font-semibold text-stone-800">{word.ten_ban_ghi || word.tu_tieng_ede}</p>
            </div>
          </div>

          {/* Audio Player Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {word.audio_data_base64 ? 'Bản Ghi Âm Đóng Góp:' : 'Hỗ Trợ Phát Âm Tự Động (TTS):'}
            </h3>
            <AudioPlayerButton
              word={word.tu_tieng_ede || word.tu_tieng_viet}
              phonetic={word.phien_am}
              audioUrl={word.duong_dan_tep_am_thanh}
              audioBase64={word.audio_data_base64}
              speakerName={word.ten_nguoi_doc_ban_ghi}
              variant="large"
            />
          </div>

          {/* Cultural Visual Image with Mandatory Caption & Source Below */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Hình Ảnh Tư Liệu Trực Quan:
            </h3>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden shadow-xs">
              {word.duong_dan_hinh_anh ? (
                <div className="relative aspect-16/9 sm:aspect-21/9 bg-stone-900 flex items-center justify-center">
                  <img
                    src={word.duong_dan_hinh_anh}
                    alt={word.chu_thich_hinh_anh || word.tu_tieng_viet}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-16/9 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                  <BookOpen className="w-12 h-12 mb-2 text-stone-300" />
                  <p className="text-sm font-medium text-stone-600">Hình ảnh hiện vật đang được điền dã bổ sung</p>
                  <p className="text-xs text-stone-400 mt-1">Cộng đồng có thể đóng góp ảnh tư liệu thực tế qua trang Đóng góp.</p>
                </div>
              )}

              {/* RÀNG BUỘC BẮT BUỘC: Ảnh tư liệu phải hiển thị kèm chú thích và nguồn ngay bên dưới */}
              <div className="p-3.5 sm:p-4 bg-stone-100 border-t border-stone-200 space-y-1">
                <div className="text-xs sm:text-sm font-medium text-stone-800">
                  <span className="font-semibold text-stone-900">Chú thích hình ảnh: </span>
                  {word.chu_thich_hinh_anh || `Hiện vật và không gian văn hóa gắn liền với từ "${word.tu_tieng_ede || word.tu_tieng_viet}".`}
                </div>
                {word.nguon_tu_lieu && (
                  <div className="text-[11px] sm:text-xs text-stone-500">
                    <span className="font-semibold text-stone-700">Nguồn tư liệu: </span>
                    {word.nguon_tu_lieu}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Example in Context */}
          {word.vi_du_ngu_canh && (
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-1.5">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Ví dụ ngữ cảnh / Thành ngữ văn hóa:
              </span>
              <p className="text-base text-stone-800 font-extrabold italic">
                "{word.vi_du_ngu_canh}"
              </p>
            </div>
          )}

          {/* Detailed Metadata Box */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Chứng chỉ & Thông tin bản ghi âm:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="text-stone-400 block mb-0.5">Tên bản ghi:</span>
                <span className="font-semibold text-stone-800">
                  {word.ten_ban_ghi || `Bản ghi: ${word.tu_tieng_ede}`}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <span className="text-stone-400 block mb-0.5">Người đọc bản ghi âm:</span>
                <span className="font-semibold text-stone-800">
                  {word.ten_nguoi_doc_ban_ghi || 'Chưa định danh'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
