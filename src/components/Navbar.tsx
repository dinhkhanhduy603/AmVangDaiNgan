import React from 'react';
import { BookOpen, Volume2, PlusCircle, Info, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentScreen: 'home' | 'detail' | 'contribute' | 'about';
  onNavigate: (screen: 'home' | 'detail' | 'contribute' | 'about') => void;
  onOpenGemini: () => void;
  selectedWordId: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenGemini,
  selectedWordId
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: Array<{
    id: 'home' | 'detail' | 'contribute' | 'about';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }> = [
    { id: 'home', label: 'Trang chủ', icon: BookOpen },
    { id: 'detail', label: 'Chi tiết từ vựng', icon: Volume2, disabled: !selectedWordId },
    { id: 'contribute', label: 'Đóng góp bản ghi', icon: PlusCircle },
    { id: 'about', label: 'Giới thiệu', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-amber-950 text-stone-100 shadow-md border-b-2 border-amber-800/80">
      {/* Ethnic Brocade Decorative Top Strip */}
      <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-amber-500 via-emerald-600 to-indigo-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Cultural Title */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 text-left group cursor-pointer"
            aria-label="Về trang chủ Âm Vang Đại Ngàn - Từ Điển Ê-đê"
          >
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-600 to-red-700 flex items-center justify-center text-white shadow-inner border border-amber-400/40 group-hover:scale-105 transition-transform">
              {/* Traditional House / Sun motif symbol */}
              <span className="font-extrabold text-xl tracking-tighter">ÊĐ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-wide text-amber-200 group-hover:text-amber-100 transition-colors">
                  Âm Vang Đại Ngàn
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-red-900/80 text-amber-200 border border-red-700/60 inline-block">
                  Từ Điển Ê-đê
                </span>
              </div>
              <p className="text-xs text-stone-300 font-light hidden xs:block">
                Từ điển hình ảnh & phát âm tiếng dân tộc Ê-đê
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Điều hướng chính">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.id}
                  disabled={isDisabled}
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-800/90 text-amber-200 shadow-xs border border-amber-600/50'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed text-stone-400'
                      : 'text-stone-300 hover:text-amber-100 hover:bg-amber-900/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Tra cứu Gemini button */}
            <button
              onClick={onOpenGemini}
              className="ml-3 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-linear-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-500/40 shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95"
              aria-label="Tra cứu thông minh bằng Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Hỏi Gemini (Chuẩn tư liệu)</span>
            </button>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenGemini}
              className="p-2 rounded-lg bg-red-900/80 text-amber-200 border border-red-700/60"
              aria-label="Hỏi trợ lý Gemini"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-300 hover:text-amber-200 hover:bg-amber-900/50"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-amber-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-amber-800 text-amber-200 font-semibold'
                    : isDisabled
                    ? 'opacity-40 cursor-not-allowed text-stone-500'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-amber-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
