import React from 'react';
import { GraduationCap, Heart, BookOpen } from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const edeAlphabet = [
    { char: 'č', ipa: '/tʃ/', desc: 'Tương đương âm "ch" trong tiếng Việt nhưng bật hơi nhẹ (VD: Čing - Cồng chiêng).' },
    { char: 'ñ', ipa: '/ɲ/', desc: 'Tương đương âm "nh" trong tiếng Việt (VD: Ñu - Nó/Họ, Mñai - Dầu/Mỡ, Kñi - Vàng).' },
    { char: 'ĭ / ŭ', ipa: '/i/ /u/', desc: 'Nguyên âm ngắn có dấu trăng trên đầu, phát âm dứt khoát.' },
    { char: 'ĕ / ŏ', ipa: '/e/ /o/', desc: 'Nguyên âm ngắn (VD: Prŏng - To/Lớn, Kŏ - Trắng, Hĕ - Phải không).' },
    { char: 'dj', ipa: '/ɗʒ/', desc: 'Âm tắc - xát hữu thanh ngạc cứng đặc trưng ngôn ngữ Nam Đảo (Austronesian).' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Official Mandatory Student Attribution Box */}
      <section className="bg-linear-to-br from-amber-900 via-stone-900 to-red-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-amber-600/60 relative overflow-hidden">
        {/* Ethnic brocade decorative corner */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>Thông Tin Bản Quyền & Thực Tập Tốt Nghiệp</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-100">
            Dự Án Từ Điển Hình Ảnh Số Tiếng Dân Tộc Ê-đê
          </h1>

          {/* RÀNG BUỘC BẮT BUỘC: Ghi rõ ràng sản phẩm thực tập của Đinh Khánh Duy */}
          <div className="p-4 sm:p-5 bg-black/40 backdrop-blur-xs rounded-2xl border border-amber-400/40 space-y-2">
            <p className="text-base sm:text-lg font-bold text-amber-200 leading-snug">
              Sản phẩm thực tập của Đinh Khánh Duy, mã sinh viên TH05056, Nhóm 2, Chương trình Thực tập sinh Đợt 15 FPT Polytechnic và IMTA TECH, dự án xã hội phi lợi nhuận.
            </p>
            <p className="text-xs sm:text-sm text-stone-300">
              Chuyên ngành Công nghệ Thông tin - Trường Cao đẳng FPT Polytechnic phối hợp cùng Công ty Cổ phần Công nghệ IMTA TECH.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10">
              <span className="text-amber-300 block mb-0.5">Sinh viên thực hiện:</span>
              <span className="font-bold text-white text-sm">Đinh Khánh Duy</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10">
              <span className="text-amber-300 block mb-0.5">Mã số sinh viên:</span>
              <span className="font-bold text-white text-sm">TH05056 (Nhóm 2)</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10">
              <span className="text-amber-300 block mb-0.5">Đơn vị hướng dẫn:</span>
              <span className="font-bold text-white text-sm">FPT Polytechnic & IMTA TECH</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mục tiêu & Đối tượng phục vụ */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          <span>Sứ Mệnh Xã Hội & Người Dùng Mục Tiêu</span>
        </h2>

        <p className="text-sm text-stone-700 leading-relaxed">
          Ngôn ngữ Ê-đê (Klei Blŭ Êđê) thuộc nhóm ngôn ngữ Malay-Polynesia (ngữ hệ Nam Đảo), là di sản văn hóa phi vật thể vô giá của cộng đồng các dân tộc Tây Nguyên. Tuy nhiên, trước làn sóng giao lưu hiện đại, việc tiếp cận tài liệu song ngữ kèm giọng đọc bản ngữ chuẩn xác còn gặp nhiều rào cản.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <h3 className="font-bold text-sm text-amber-950">Học sinh & Sinh viên</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dễ dàng tra cứu trên điện thoại di động, luyện nghe phát âm qua trực quan âm thanh và hình ảnh sinh động.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <h3 className="font-bold text-sm text-amber-950">Cán bộ văn hóa cơ sở</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tài liệu tham chiếu chuẩn xác phục vụ công tác điền dã, tuyên truyền và bảo tồn văn hóa buôn làng Đắk Lắk.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <h3 className="font-bold text-sm text-amber-950">Người yêu văn hóa bản địa</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Khám phá không gian văn hóa cồng chiêng, tục mẫu hệ và nét đẹp kiến trúc nhà dài truyền thống.
            </p>
          </div>
        </div>
      </section>

      {/* Guide: E-de Alphabet & Diacritics */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-800" />
          <span>Bảng Ký Tự Ngữ Âm Chữ Viết Ê-đê</span>
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Chữ viết tiếng Ê-đê sử dụng hệ chữ cái La-tinh cải tiến kết hợp các ký tự đặc biệt thể hiện thanh điệu và trường độ nguyên âm:
        </p>

        <div className="space-y-2.5">
          {edeAlphabet.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start sm:items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-900 text-amber-100 flex items-center justify-center font-extrabold text-lg shrink-0">
                {item.char}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                    {item.ipa}
                  </span>
                </div>
                <p className="text-xs text-stone-700 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
