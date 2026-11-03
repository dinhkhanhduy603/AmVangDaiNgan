import { DictionaryItem, SearchDirection, ContributionFormData } from '../types/dictionary';

/**
 * Remove Vietnamese and Ê-đê specific diacritics for broad matching
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[čČ]/g, 'c')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[ĭĬ]/g, 'i')
    .replace(/[ŭŬ]/g, 'u')
    .replace(/[ĕĔ]/g, 'e')
    .replace(/[ŏŎ]/g, 'o')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
}

/**
 * Two-way search implementation (Việt - Ê-đê, Ê-đê - Việt, or All)
 */
export function searchDictionary(
  items: DictionaryItem[],
  query: string,
  direction: SearchDirection = 'all'
): DictionaryItem[] {
  if (!query || !query.trim()) {
    // Return non-empty items (filtering out blank template)
    return items.filter(item => Boolean(item.tu_tieng_viet?.trim() || item.tu_tieng_ede?.trim()));
  }

  const cleanQuery = query.trim().toLowerCase();
  const normalizedQuery = removeDiacritics(cleanQuery);

  return items.filter(item => {
    // Skip empty templates
    if (!item.tu_tieng_viet && !item.tu_tieng_ede) return false;

    const viet = (item.tu_tieng_viet || '').toLowerCase();
    const ede = (item.tu_tieng_ede || '').toLowerCase();
    const phienAm = (item.phien_am || '').toLowerCase();

    const normViet = removeDiacritics(viet);
    const normEde = removeDiacritics(ede);

    if (direction === 'vi_to_ede') {
      return (
        viet.includes(cleanQuery) ||
        normViet.includes(normalizedQuery)
      );
    }

    if (direction === 'ede_to_vi') {
      return (
        ede.includes(cleanQuery) ||
        normEde.includes(normalizedQuery) ||
        phienAm.includes(cleanQuery)
      );
    }

    // Default 'all'
    return (
      viet.includes(cleanQuery) ||
      normViet.includes(normalizedQuery) ||
      ede.includes(cleanQuery) ||
      normEde.includes(normalizedQuery) ||
      phienAm.includes(cleanQuery) ||
      (item.ten_ban_ghi && item.ten_ban_ghi.toLowerCase().includes(cleanQuery))
    );
  });
}

/**
 * Filter items by category/theme
 */
export function filterByCategory(items: DictionaryItem[], category: string): DictionaryItem[] {
  if (!category || category === 'Tất cả') {
    return items.filter(item => Boolean(item.tu_tieng_viet?.trim() || item.tu_tieng_ede?.trim()));
  }
  return items.filter(item => item.chu_de === category);
}

/**
 * Extract unique non-empty categories
 */
export function getUniqueCategories(items: DictionaryItem[]): string[] {
  const set = new Set<string>();
  items.forEach(item => {
    if (item.chu_de && item.chu_de.trim()) {
      set.add(item.chu_de.trim());
    }
  });
  return ['Tất cả', ...Array.from(set)];
}

/**
 * Validate contribution submission form
 */
export function validateContributionForm(form: Partial<ContributionFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!form.ten_nguoi_doc_ban_ghi || !form.ten_nguoi_doc_ban_ghi.trim()) {
    errors.ten_nguoi_doc_ban_ghi = 'Bắt buộc nhập tên người đọc bản ghi âm.';
  }

  if (!form.tu_tieng_viet || !form.tu_tieng_viet.trim()) {
    errors.tu_tieng_viet = 'Bắt buộc nhập từ tiếng Việt.';
  }

  if (!form.tu_tieng_ede || !form.tu_tieng_ede.trim()) {
    errors.tu_tieng_ede = 'Bắt buộc nhập từ tiếng bản địa (Ê-đê).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Client-side in-memory audio cache
export const clientAudioCache = new Map<string, string>();

/**
 * Universal pronunciation playback engine with multi-tiered resilience:
 * 1. User recorded base64 audio
 * 2. Cached Gemini 3.8 Flash Lite TTS
 * 3. Fresh Gemini 3.8 Flash Lite TTS via /api/tts
 * 4. Browser Web Speech Synthesis (SpeechSynthesisUtterance)
 * 5. Web Audio API articulatory vocal formant synthesis
 */
export async function playPronunciation(params: {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  audioBase64?: string;
  playbackRate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}): Promise<void> {
  const { word, phonetic, audioUrl, audioBase64, playbackRate = 1, onStart, onEnd } = params;

  if (onStart) onStart();

  const handleFinish = () => {
    if (onEnd) onEnd();
  };

  // 1. Direct base64 audio (e.g. from user recording in Contribute)
  if (audioBase64 && audioBase64.startsWith('data:audio/')) {
    try {
      const audio = new Audio(audioBase64);
      audio.playbackRate = playbackRate;
      audio.onended = handleFinish;
      audio.onerror = () => {
        fallbackWebSpeech(word, playbackRate, handleFinish);
      };
      await audio.play();
      return;
    } catch {
      // Proceed to next fallback
    }
  }

  // 2. Direct remote URL if valid http/https
  if (audioUrl && audioUrl.startsWith('http')) {
    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackRate;
      audio.onended = handleFinish;
      audio.onerror = () => {
        tryFetchTtsOrFallback(word, phonetic, playbackRate, handleFinish);
      };
      await audio.play();
      return;
    } catch {
      // Proceed to next fallback
    }
  }

  // 3. Try Gemini TTS (/api/tts)
  await tryFetchTtsOrFallback(word, phonetic, playbackRate, handleFinish);
}

async function tryFetchTtsOrFallback(
  word: string,
  phonetic: string | undefined,
  playbackRate: number,
  onEnd: () => void
): Promise<void> {
  const cacheKey = word.trim().toLowerCase();

  // Check client cache first
  if (clientAudioCache.has(cacheKey)) {
    const cachedData = clientAudioCache.get(cacheKey)!;
    try {
      const audio = new Audio(cachedData);
      audio.playbackRate = playbackRate;
      audio.onended = onEnd;
      audio.onerror = () => fallbackWebSpeech(word, playbackRate, onEnd);
      await audio.play();
      return;
    } catch {
      // Proceed
    }
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, phonetic }),
    });

    const data = await res.json();
    if (data.success && data.audioBase64) {
      clientAudioCache.set(cacheKey, data.audioBase64);
      const audio = new Audio(data.audioBase64);
      audio.playbackRate = playbackRate;
      audio.onended = onEnd;
      audio.onerror = () => fallbackWebSpeech(word, playbackRate, onEnd);
      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Server TTS fetch failed, switching to browser speech synthesis:', err);
  }

  // 4. Browser Web Speech fallback
  fallbackWebSpeech(word, playbackRate, onEnd);
}

function fallbackWebSpeech(word: string, playbackRate: number, onEnd: () => void): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = playbackRate * 0.9;
      utterance.pitch = 1.0;

      // Prefer Vietnamese voice or standard natural voice
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
        utterance.lang = viVoice.lang;
      } else {
        utterance.lang = 'vi-VN';
      }

      utterance.onend = onEnd;
      utterance.onerror = () => {
        fallbackFormantSynthesizer(word, onEnd);
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('Web Speech API error, falling back to Web Audio formant:', e);
    }
  }

  // 5. Final fallback: Web Audio formant synthesizer
  fallbackFormantSynthesizer(word, onEnd);
}

/**
 * Resonant vocal formant acoustic synthesizer
 */
export function fallbackFormantSynthesizer(word: string, onEnd: () => void): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      onEnd();
      return;
    }

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const duration = 0.65;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Fundamental frequency with natural inflection
    osc1.frequency.setValueAtTime(195, now);
    osc1.frequency.exponentialRampToValueAtTime(155, now + duration);

    osc2.frequency.setValueAtTime(390, now);
    osc2.frequency.exponentialRampToValueAtTime(310, now + duration);

    // Formant filter (human vowel envelope)
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);

    setTimeout(() => {
      onEnd();
    }, duration * 1000);
  } catch (err) {
    console.warn('Formant synthesizer error:', err);
    onEnd();
  }
}
