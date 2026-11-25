import React, { useState } from 'react';
import { Search, ArrowLeftRight, Sparkles, Filter, Volume2, BookOpen, Layers, UserCheck, Trash2 } from 'lucide-react';
import { DictionaryItem, SearchDirection } from '../types/dictionary';
import { searchDictionary, filterByCategory, getUniqueCategories } from '../utils/dictionary';
import { AudioPlayerButton } from './AudioPlayerButton';

interface HomeScreenProps {
  dictionary: DictionaryItem[];
  contributions: DictionaryItem[];
  onSelectWord: (item: DictionaryItem) => void;
  onOpenGemini: () => void;
  onNavigateToContribute: () => void;
  onDeleteContribution?: (id: string, e?: React.MouseEvent) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  dictionary,
  contributions,
  onSelectWord,
  onOpenGemini,
  onNavigateToContribute,
  onDeleteContribution,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [direction, setDirection] = useState<SearchDirection>('all');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Combined active data
  const allItems = [...dictionary, ...contributions];
  const categories = getUniqueCategories(allItems);

  // Filtered list
  const searchedItems = searchDictionary(allItems, searchQuery, direction);
  const finalItems = filterByCategory(searchedItems, selectedCategory);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Cultural Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-950 via-stone-900 to-amber-900 text-stone-100 p-6 sm:p-10 shadow-xl border border-amber-800/60">
        {/* Ethnic brocade decorative pattern backdrop */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-900/80 border border-amber-500/40 text-amber-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Dự án Bảo tồn Di sản Ngôn ngữ & Văn hóa Tây Nguyên</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-100">
            Từ Điển Hình Ảnh Số Tiếng Dân Tộc Ê-đê
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            Kho tư liệu song ngữ trực quan kết hợp phát âm bản địa chuẩn xác từ các nghệ nhân, giáo viên và cộng đồng người Ê-đê tại tỉnh Đắk Lắk.
          </p>

          {/* Quick stats banner */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-amber-200/90">
            <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-amber-900/60">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{allItems.filter(i => i.tu_tieng_ede).length} Từ vựng tư liệu</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-amber-900/60">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Hỗ trợ phát âm tự động (TTS)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-amber-900/60">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Ghi rõ người đọc & nguồn</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Way Search & Filter Control Bar */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-stone-200 space-y-4">
        {/* Search Bar with Direction Selector */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tra từ bằng tiếng Việt hoặc tiếng Ê-đê (VD: sang, cồng chiêng, cơm, êa)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-stone-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-stone-900 placeholder-stone-400 text-sm outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-100 px-2 py-1 rounded"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Direction Selector */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 self-stretch sm:self-auto">
            <button
              onClick={() => setDirection('all')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                direction === 'all'
                  ? 'bg-amber-800 text-amber-100 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hai chiều
            </button>
            <button
              onClick={() => setDirection('vi_to_ede')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                direction === 'vi_to_ede'
                  ? 'bg-amber-800 text-amber-100 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Việt ➔ Ê-đê
            </button>
            <button
              onClick={() => setDirection('ede_to_vi')}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                direction === 'ede_to_vi'
                  ? 'bg-amber-800 text-amber-100 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ê-đê ➔ Việt
            </button>
          </div>

          {/* Ask Gemini Button */}
          <button
            onClick={onOpenGemini}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-linear-to-r from-red-800 to-amber-800 hover:from-red-700 hover:to-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Hỏi Gemini tư liệu</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-900 text-amber-100 font-semibold shadow-2xs ring-2 ring-amber-600/30'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Vocabulary Results Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>Danh Sách Từ Vựng Bản Địa</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
              {finalItems.length} từ
            </span>
          </h2>
          <span className="text-xs text-stone-500">Chạm thẻ từ để xem chi tiết & hình ảnh</span>
        </div>

        {finalItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-stone-800">Không tìm thấy từ vựng phù hợp</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Hiện chưa có bản ghi cho từ khóa "{searchQuery}". Bạn có thể thử tra cứu bằng Gemini hoặc tự đóng góp thêm bản ghi âm mới cho cộng đồng!
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onOpenGemini}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs"
              >
                Tra cứu cùng Gemini
              </button>
              <button
                onClick={onNavigateToContribute}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Gửi đóng góp từ này
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {finalItems.map((item) => {
              return (
                <article
                  key={item.id}
                  onClick={() => onSelectWord(item)}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-amber-600 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Image with overlay tag */}
                  <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
                    {item.duong_dan_hinh_anh ? (
                      <img
                        src={item.duong_dan_hinh_anh}
                        alt={item.chu_thich_hinh_anh || item.tu_tieng_viet}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                        <BookOpen className="w-8 h-8 mb-1" />
                        <span className="text-xs">Ảnh tư liệu đang cập nhật</span>
                      </div>
                    )}

                    {/* Category badge */}
                    {item.chu_de && (
                      <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-900/80 text-amber-200 backdrop-blur-xs border border-amber-500/30">
                        {item.chu_de}
                      </span>
                    )}

                    {/* Delete button if this card is a user contribution */}
                    {onDeleteContribution && (item.id.startsWith('dong_gop_') || item.trang_thai) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Xóa bản ghi "${item.tu_tieng_ede || item.tu_tieng_viet}" khỏi từ điển?`)) {
                            onDeleteContribution(item.id, e);
                          }
                        }}
                        title="Xóa bản ghi đóng góp này"
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-md cursor-pointer transition hover:scale-110 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Audio play button floating on card */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <AudioPlayerButton
                        word={item.tu_tieng_ede || item.tu_tieng_viet}
                        phonetic={item.phien_am}
                        audioUrl={item.duong_dan_tep_am_thanh}
                        audioBase64={item.audio_data_base64}
                        speakerName={item.ten_nguoi_doc_ban_ghi}
                        variant="compact"
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xl font-extrabold text-amber-950 tracking-tight group-hover:text-red-700 transition-colors">
                          {item.tu_tieng_ede || 'Chưa có từ Ê-đê'}
                        </h3>
                        {item.phien_am && (
                          <span className="text-xs text-stone-500 font-mono">
                            {item.phien_am}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-sm font-semibold text-stone-800">
                        {item.tu_tieng_viet}
                      </div>
                    </div>

                    {/* Speaker and Source Footnote */}
                    <div className="pt-2 border-t border-stone-100 space-y-1 text-[11px] text-stone-500">
                      <div className="flex items-center justify-between truncate">
                        <span className="text-stone-400">Giọng đọc:</span>
                        <span
                          className="font-medium text-stone-700 truncate max-w-[170px]"
                          title={item.ten_nguoi_doc_ban_ghi || 'Chưa định danh'}
                        >
                          {item.ten_nguoi_doc_ban_ghi || 'Chưa định danh'}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
