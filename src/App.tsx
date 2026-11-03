/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { WordDetailScreen } from './components/WordDetailScreen';
import { ContributeScreen } from './components/ContributeScreen';
import { AboutScreen } from './components/AboutScreen';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { DictionaryItem } from './types/dictionary';
import { BookOpen, Volume2, PlusCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'contribute' | 'about'>('home');
  const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
  const [contributions, setContributions] = useState<DictionaryItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<DictionaryItem | null>(null);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial dictionary data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dictionary');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDictionary(json.data);
          // Set first word as initial selection for detail view
          const validWords = json.data.filter((item: DictionaryItem) => item.tu_tieng_ede || item.tu_tieng_viet);
          if (validWords.length > 0) {
            setSelectedWord(validWords[0]);
          }
        }
        if (json.contributions && Array.isArray(json.contributions)) {
          setContributions(json.contributions);
        }
      } catch (err) {
        console.error('Failed to load dictionary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectWord = (item: DictionaryItem) => {
    setSelectedWord(item);
    setCurrentScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContributionAdded = (newEntry: DictionaryItem) => {
    setContributions((prev) => [newEntry, ...prev]);
  };

  const handleDeleteContribution = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/contribute/${id}`, { method: 'DELETE' });
      setContributions((prev) => prev.filter((item) => item.id !== id));
      if (selectedWord?.id === id) {
        const validWords = dictionary.filter((item: DictionaryItem) => item.tu_tieng_ede || item.tu_tieng_viet);
        setSelectedWord(validWords[0] || null);
      }
    } catch (err) {
      console.error('Lỗi khi xóa bản ghi đóng góp:', err);
    }
  };

  const allActiveWords = [...dictionary, ...contributions].filter(
    (item) => Boolean(item.tu_tieng_ede?.trim() || item.tu_tieng_viet?.trim())
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGemini={() => setIsGeminiModalOpen(true)}
        selectedWordId={selectedWord?.id || null}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-800 rounded-full animate-spin" />
            <p className="text-sm font-medium text-amber-950">
              Đang tải cơ sở dữ liệu từ điển hình ảnh số tiếng Ê-đê...
            </p>
          </div>
        ) : (
          <>
            {currentScreen === 'home' && (
              <HomeScreen
                dictionary={dictionary}
                contributions={contributions}
                onSelectWord={handleSelectWord}
                onOpenGemini={() => setIsGeminiModalOpen(true)}
                onNavigateToContribute={() => {
                  setCurrentScreen('contribute');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onDeleteContribution={handleDeleteContribution}
              />
            )}

            {currentScreen === 'detail' && (
              <WordDetailScreen
                word={selectedWord}
                allWords={allActiveWords}
                onBack={() => {
                  setCurrentScreen('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectWord={handleSelectWord}
                onOpenGemini={() => setIsGeminiModalOpen(true)}
              />
            )}

            {currentScreen === 'contribute' && (
              <ContributeScreen
                contributions={contributions}
                onContributionAdded={handleContributionAdded}
                onSelectWord={handleSelectWord}
                onDeleteContribution={handleDeleteContribution}
              />
            )}


            {currentScreen === 'about' && (
              <AboutScreen />
            )}
          </>
        )}
      </main>

      {/* Gemini Strict Grounded Modal */}
      <GeminiAssistantModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onSelectWord={handleSelectWord}
      />

      {/* Mobile Bottom Quick Bar for Easy Thumb Access */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 md:hidden px-2 py-1.5 shadow-lg"
        aria-label="Thanh điều hướng di động"
      >
        <div className="flex items-center justify-around">
          <button
            onClick={() => {
              setCurrentScreen('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              currentScreen === 'home' ? 'text-amber-900 font-bold' : 'text-stone-500'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Trang chủ</span>
          </button>

          <button
            disabled={!selectedWord}
            onClick={() => {
              setCurrentScreen('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              currentScreen === 'detail'
                ? 'text-amber-900 font-bold'
                : !selectedWord
                ? 'text-stone-300'
                : 'text-stone-500'
            }`}
          >
            <Volume2 className="w-5 h-5 mb-0.5" />
            <span>Chi tiết</span>
          </button>

          {/* Center Floating Gemini Button */}
          <button
            onClick={() => setIsGeminiModalOpen(true)}
            aria-label="Tra cứu Gemini"
            className="flex flex-col items-center -mt-4 bg-linear-to-tr from-red-800 to-amber-700 text-white p-2.5 rounded-full shadow-md border-2 border-white cursor-pointer active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </button>

          <button
            onClick={() => {
              setCurrentScreen('contribute');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              currentScreen === 'contribute' ? 'text-amber-900 font-bold' : 'text-stone-500'
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5" />
            <span>Đóng góp</span>
          </button>

          <button
            onClick={() => {
              setCurrentScreen('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              currentScreen === 'about' ? 'text-amber-900 font-bold' : 'text-stone-500'
            }`}
          >
            <Info className="w-5 h-5 mb-0.5" />
            <span>Giới thiệu</span>
          </button>
        </div>
      </nav>

      {/* Desktop/Global Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-amber-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="font-semibold text-stone-200">
              Klei Blŭ Êđê - Từ Điển Hình Ảnh Số & Phát Âm Ngôn Ngữ Dân Tộc Thiểu Số
            </p>
            {/* MANDATORY PROJECT FOOTNOTE */}
            <p className="text-amber-400/90 font-medium">
              Sản phẩm thực tập của Đinh Khánh Duy, MSSV TH05056, Nhóm 2, Chương trình Thực tập sinh Đợt 15 FPT Polytechnic và IMTA TECH, dự án xã hội phi lợi nhuận.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-stone-400">

            <button
              onClick={() => {
                setCurrentScreen('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-300 transition cursor-pointer"
            >
              Về dự án
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="text-amber-400 hover:text-amber-200 font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trợ lý Gemini</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
