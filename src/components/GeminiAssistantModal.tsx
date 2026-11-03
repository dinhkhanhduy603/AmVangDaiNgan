import React, { useState } from 'react';
import { X, Sparkles, Search, BookOpen, Volume2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { DictionaryItem } from '../types/dictionary';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (item: DictionaryItem) => void;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectWord,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [matchedEntries, setMatchedEntries] = useState<DictionaryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setMatchedEntries([]);

    try {
      const res = await fetch('/api/gemini/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (data.success) {
        setAnswer(data.answer);
        if (data.matchedEntries && Array.isArray(data.matchedEntries)) {
          setMatchedEntries(data.matchedEntries);
        }
      } else {
        setError(data.message || 'Không thể tra cứu với Gemini.');
      }
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ khi tra cứu.');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Từ "Sang" trong tiếng Ê-đê nghĩa là gì?',
    'Cồng chiêng đọc thế nào và ai là người đọc bản ghi?',
    'Từ "Nước" trong tiếng Ê-đê phát âm thế nào?',
    'Tra từ "Điện thoại thông minh" (Kiểm tra quy tắc không bịa từ)',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-amber-800 overflow-hidden">
        {/* Header decoration */}
        <div className="h-2 w-full bg-linear-to-r from-red-700 via-amber-600 to-indigo-700" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-red-900 border border-amber-500/40">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2">
                Tra Cứu Thông Minh Gemini
              </h3>
              <p className="text-xs text-stone-300">
                Chỉ trả lời dựa trên tệp dữ liệu thực tế, hiển thị đầy đủ tên bản ghi và người đọc.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng tra cứu"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Query input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="relative"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập từ hoặc đặt câu hỏi (VD: 'Sang nghĩa là gì?', 'Người đọc từ cơm là ai?')..."
                className="w-full pl-11 pr-24 py-3 rounded-xl border-2 border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 placeholder-stone-400 text-sm outline-none transition"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Đang tra...' : 'Tra cứu'}
              </button>
            </div>
          </form>

          {/* Prompt chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-500 block">Gợi ý tra cứu nhanh:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    handleSearch(item);
                  }}
                  className="text-xs text-stone-700 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 px-2.5 py-1.5 rounded-lg border border-stone-200 transition cursor-pointer text-left"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Strict Grounding Assurance Notice */}
          <div className="p-3 bg-stone-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-800">Cam kết bảo tồn ngôn ngữ chính xác:</span>{' '}
              Mô hình được thiết lập nghiêm ngặt: Tuyệt đối không tự suy đoán hoặc bịa nội dung. Mọi thông tin đều gắn với người bản ngữ phát âm và tài liệu kiểm duyệt.
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-800 rounded-full animate-spin" />
              <p className="text-sm font-medium text-amber-900">
                Gemini đang đối chiếu và tra cứu
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Output */}
          {answer && !loading && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>Kết quả tra cứu đối chiếu từ điển:</span>
                </div>
                <div className="text-sm text-stone-800 whitespace-pre-line leading-relaxed font-normal">
                  {answer}
                </div>
              </div>

              {/* Matched interactive entries */}
              {matchedEntries.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Các bản ghi liên quan trực tiếp:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedEntries.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectWord(item);
                          onClose();
                        }}
                        className="p-3 bg-white border border-stone-200 hover:border-amber-600 rounded-xl shadow-2xs hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-amber-950 text-sm group-hover:text-red-700 transition">
                            {item.tu_tieng_ede || item.tu_tieng_viet}
                          </div>
                          <div className="text-xs text-stone-600 truncate">
                            {item.tu_tieng_viet} {item.phien_am && `(${item.phien_am})`}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate mt-0.5">
                            Người đọc: {item.ten_nguoi_doc_ban_ghi}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Dự án bảo tồn văn hóa ngôn ngữ phi lợi nhuận</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
