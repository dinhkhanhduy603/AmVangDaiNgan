import React, { useState } from 'react';
import { PlusCircle, CheckCircle2, AlertCircle, Volume2, ShieldAlert, Sparkles, Send, RefreshCw, Trash2 } from 'lucide-react';
import { ContributionFormData, DictionaryItem } from '../types/dictionary';
import { validateContributionForm } from '../utils/dictionary';
import { VoiceRecorder } from './VoiceRecorder';
import { AudioPlayerButton } from './AudioPlayerButton';

interface ContributeScreenProps {
  contributions: DictionaryItem[];
  onContributionAdded: (newEntry: DictionaryItem) => void;
  onSelectWord: (item: DictionaryItem) => void;
  onDeleteContribution?: (id: string, e?: React.MouseEvent) => void;
}

export const ContributeScreen: React.FC<ContributeScreenProps> = ({
  contributions,
  onContributionAdded,
  onSelectWord,
  onDeleteContribution,
}) => {
  const [formData, setFormData] = useState<ContributionFormData>({
    tu_tieng_viet: '',
    tu_tieng_ede: '',
    phien_am: '',
    duong_dan_hinh_anh: '',
    chu_thich_hinh_anh: '',
    duong_dan_tep_am_thanh: '',
    audio_data_base64: '',
    ten_nguoi_doc_ban_ghi: '',
    nguon_tu_lieu: '',
    chu_de: 'Nhà cửa & Đời sống',
    vi_du_ngu_canh: '',
    ghi_chu_nguoi_dong_gop: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = [
    'Nhà cửa & Đời sống',
    'Văn hóa & Âm nhạc',
    'Thiên nhiên & Môi trường',
    'Ẩm thực & Đời sống',
    'Trang phục & Thổ cẩm',
    'Gia đình & Xã hội',
    'Muông thú & Chăn nuôi',
    'Cây cối & Nông nghiệp',
    'Khác (Cộng đồng)',
  ];

  const handleChange = (field: keyof ContributionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    // Strict validation
    const validation = validateContributionForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      // Scroll to first error
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onContributionAdded(data.data);
        setSuccessMessage(
          `Cảm ơn bạn! Bản ghi âm cho từ "${formData.tu_tieng_ede || formData.tu_tieng_viet}" do "${formData.ten_nguoi_doc_ban_ghi}" đọc đã được lưu vào hệ thống thành công.`
        );

        // Reset form
        setFormData({
          tu_tieng_viet: '',
          tu_tieng_ede: '',
          phien_am: '',
          duong_dan_hinh_anh: '',
          chu_thich_hinh_anh: '',
          duong_dan_tep_am_thanh: '',
          audio_data_base64: '',
          ten_nguoi_doc_ban_ghi: '',
          nguon_tu_lieu: '',
          chu_de: 'Nhà cửa & Đời sống',
          vi_du_ngu_canh: '',
          ghi_chu_nguoi_dong_gop: '',
        });
        setFormErrors({});
      } else {
        setFormErrors({ submit: data.message || 'Lỗi khi gửi đóng góp.' });
      }
    } catch {
      setFormErrors({ submit: 'Lỗi kết nối máy chủ.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Intro Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-red-900 border border-red-200 text-xs font-semibold">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Chung Tay Lưu Giữ Tiếng Nói Bản Địa</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950">
          Đóng Góp Bản Ghi Âm & Từ Vựng Mới
        </h1>

        <p className="text-sm text-stone-600 leading-relaxed">
          Mỗi bản ghi âm giọng đọc chuẩn của bạn là một viên gạch quý báu bảo tồn di sản tiếng Ê-đê cho thế hệ mai sau. 
          Vui lòng điền đầy đủ các thông tin, đặc biệt là <strong>Tên người đọc bản ghi âm</strong> và nguồn tham khảo để bảo đảm tính chuẩn xác khoa học.
        </p>

        {/* Anti-AI Slop & Authenticity Guidelines */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Quy chuẩn dữ liệu nghiêm ngặt:</span>{' '}
            Không sử dụng trí tuệ nhân tạo để tự suy đoán từ ngữ hoặc tự sinh ảnh hiện vật. Chỉ sử dụng ảnh chụp thực tế và giọng đọc của người bản ngữ.
          </div>
        </div>
      </section>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Gửi dữ liệu thành công!</p>
            <p className="text-xs">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Contribution Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-6">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-base font-bold text-stone-900 uppercase tracking-wide">
            Biểu Mẫu Gửi Bản Ghi Tư Liệu
          </h2>
          <p className="text-xs text-stone-500">Các trường đánh dấu (*) là bắt buộc</p>
        </div>

        {/* Speaker Name (BẮT BUỘC theo yêu cầu đề bài) */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-300/80 space-y-1.5">
          <label className="block text-sm font-bold text-amber-950">
            Tên người đọc bản ghi âm <span className="text-red-600">* (Bắt buộc)</span>
          </label>
          <input
            type="text"
            value={formData.ten_nguoi_doc_ban_ghi}
            onChange={(e) => handleChange('ten_nguoi_doc_ban_ghi', e.target.value)}
            placeholder="Ví dụ: Nghệ nhân Y Bhiôn Niê, Cô H'Lâm Êban (Buôn Akô Dhông)..."
            className={`w-full px-4 py-3 rounded-xl border bg-white text-stone-900 text-sm focus:ring-2 outline-none transition ${
              formErrors.ten_nguoi_doc_ban_ghi
                ? 'border-red-500 focus:ring-red-200'
                : 'border-stone-300 focus:border-amber-700 focus:ring-amber-200'
            }`}
          />
          {formErrors.ten_nguoi_doc_ban_ghi ? (
            <p className="text-xs text-red-600 font-medium">{formErrors.ten_nguoi_doc_ban_ghi}</p>
          ) : (
            <p className="text-xs text-stone-500">
              Ghi rõ họ tên nghệ nhân hoặc người phát âm bản ngữ để lưu danh trong kho tư liệu.
            </p>
          )}
        </div>

        {/* Word fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Vietnamese */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Từ tiếng Việt <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.tu_tieng_viet}
              onChange={(e) => handleChange('tu_tieng_viet', e.target.value)}
              placeholder="Ví dụ: Nhà sàn, Cơm rẫy, Nước..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-stone-900 text-sm focus:ring-2 outline-none transition ${
                formErrors.tu_tieng_viet
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-stone-300 focus:border-amber-700 focus:ring-amber-200'
              }`}
            />
            {formErrors.tu_tieng_viet && (
              <p className="text-xs text-red-600 font-medium">{formErrors.tu_tieng_viet}</p>
            )}
          </div>

          {/* E-de */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Từ tiếng Ê-đê <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.tu_tieng_ede}
              onChange={(e) => handleChange('tu_tieng_ede', e.target.value)}
              placeholder="Ví dụ: Sang, Êsei, Čing..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-stone-900 text-sm focus:ring-2 outline-none transition ${
                formErrors.tu_tieng_ede
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-stone-300 focus:border-amber-700 focus:ring-amber-200'
              }`}
            />
            {formErrors.tu_tieng_ede && (
              <p className="text-xs text-red-600 font-medium">{formErrors.tu_tieng_ede}</p>
            )}
          </div>


          {/* Phonetic / Phien am */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Phiên âm ngữ âm (IPA)
            </label>
            <input
              type="text"
              value={formData.phien_am}
              onChange={(e) => handleChange('phien_am', e.target.value)}
              placeholder="Ví dụ: /saːŋ/, /eː.səi/, /tʃiːŋ/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 text-sm outline-none transition font-mono"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            Chủ đề / Phân loại
          </label>
          <select
            value={formData.chu_de}
            onChange={(e) => handleChange('chu_de', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 text-sm outline-none transition bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Recording Component */}
        <VoiceRecorder
          onAudioRecorded={(base64) => {
            handleChange('audio_data_base64', base64);
            handleChange('duong_dan_tep_am_thanh', 'Bản ghi âm trực tiếp');
          }}
          existingAudio={formData.audio_data_base64}
          onClearAudio={() => {
            handleChange('audio_data_base64', '');
            handleChange('duong_dan_tep_am_thanh', '');
          }}
        />

        {/* Visual Image & Caption */}
        <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Đường dẫn hình ảnh tư liệu (URL)
            </label>
            <input
              type="url"
              value={formData.duong_dan_hinh_anh}
              onChange={(e) => handleChange('duong_dan_hinh_anh', e.target.value)}
              placeholder="https://... (Hình ảnh hiện vật hoặc sinh hoạt thực tế)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 text-sm outline-none transition bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Chú thích hình ảnh & không gian văn hóa
            </label>
            <input
              type="text"
              value={formData.chu_thich_hinh_anh}
              onChange={(e) => handleChange('chu_thich_hinh_anh', e.target.value)}
              placeholder="Mô tả hiện vật, địa điểm hoặc bối cảnh chụp ảnh..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 text-sm outline-none transition bg-white"
            />
          </div>
        </div>

        {/* Example in Context */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            Ví dụ câu hoặc thành ngữ Ê-đê (kèm bản dịch)
          </label>
          <textarea
            rows={2}
            value={formData.vi_du_ngu_canh}
            onChange={(e) => handleChange('vi_du_ngu_canh', e.target.value)}
            placeholder="Ví dụ: Sang Êđê mâo kpan - Nhà người Ê-đê có ghế Kpan..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 text-sm outline-none transition"
          />
        </div>

        {/* Submit Error */}
        {formErrors.submit && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formErrors.submit}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-linear-to-r from-red-800 to-amber-900 hover:from-red-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2 text-base disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang lưu bản ghi âm và từ vựng...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-amber-300" />
              <span>Gửi Đóng Góp Vào Từ Điển</span>
            </>
          )}
        </button>
      </form>

      {/* Community Contributions List Preview */}
      {contributions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>Bản Ghi Đóng Góp Gần Đây</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              {contributions.length} đóng góp
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contributions.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectWord(item)}
                className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-amber-600 transition shadow-2xs cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-amber-950 group-hover:text-red-700 transition">
                      {item.tu_tieng_ede || item.tu_tieng_viet}
                    </h3>
                    <p className="text-xs text-stone-600">{item.tu_tieng_viet}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AudioPlayerButton
                      word={item.tu_tieng_ede || item.tu_tieng_viet}
                      phonetic={item.phien_am}
                      audioUrl={item.duong_dan_tep_am_thanh}
                      audioBase64={item.audio_data_base64}
                      speakerName={item.ten_nguoi_doc_ban_ghi}
                      variant="compact"
                    />
                    {onDeleteContribution && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Xóa bản ghi "${item.tu_tieng_ede || item.tu_tieng_viet}"?`)) {
                            onDeleteContribution(item.id, e);
                          }
                        }}
                        title="Xóa bản ghi này"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <div>
                    Người đọc: <span className="font-semibold text-stone-700">{item.ten_nguoi_doc_ban_ghi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
