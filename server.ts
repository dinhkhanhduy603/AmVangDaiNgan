import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to read tudien.json
function getDictionaryData() {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, 'tudien.json'), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading tudien.json:', err);
    return [];
  }
}

// Remove Vietnamese and Ê-đê specific diacritics for broad matching
function normalizeDiacritics(str: string): string {
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

// Promise timeout wrapper to prevent long hanging API requests
function callWithTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Thao tác quá thời gian chờ (${ms}ms)`)), ms)
    ),
  ]);
}

// Common Vietnamese question/connecting words to avoid false positive matches on auxiliary fields
const VI_QUESTION_WORDS = new Set([
  'ai', 'la', 'gi', 'sao', 'nao', 'the', 'cho', 'toi', 'hoi', 'xem', 'tu', 'trong', 'tieng', 'va', 'co', 'o', 'doc', 'ban', 'ghi'
]);

// In-memory contributions store (with initial sample if needed)
let userContributions: any[] = [];

// In-memory TTS audio cache for instant replay
const ttsAudioCache = new Map<string, string>();
let ttsQuotaExhaustedUntil = 0;

// API: Get dictionary
app.get('/api/dictionary', (_req, res) => {
  const data = getDictionaryData();
  res.json({
    success: true,
    data,
    contributions: userContributions,
  });
});

// API: Gemini 3.8 Flash Lite TTS pronunciation with graceful fallback
app.post('/api/tts', async (req, res) => {
  try {
    const { word, phonetic } = req.body;
    if (!word || typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu từ cần phát âm.' });
    }

    const cleanWord = word.trim();
    const cacheKey = cleanWord.toLowerCase();
    if (ttsAudioCache.has(cacheKey)) {
      return res.json({
        success: true,
        audioBase64: ttsAudioCache.get(cacheKey),
        cached: true,
      });
    }

    // If quota was previously exhausted, return immediately so client uses browser Web Speech
    if (Date.now() < ttsQuotaExhaustedUntil) {
      return res.json({
        success: false,
        fallback: true,
        message: 'TTS đạt giới hạn gọi của ngày, sử dụng phát âm trình duyệt.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'Chưa cấu hình GEMINI_API_KEY cho TTS.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanWord,
                speechMetadata: {
                  style: 'Clear, natural, educational pronunciation of word',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      }),
      6000
    );

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const dataUri = `data:audio/wav;base64,${base64Audio}`;
      ttsAudioCache.set(cacheKey, dataUri);
      return res.json({
        success: true,
        audioBase64: dataUri,
      });
    }

    return res.json({
      success: false,
      message: 'Không nhận được dữ liệu âm thanh từ mô hình TTS.',
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (
      err?.status === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('Quota exceeded')
    ) {
      ttsQuotaExhaustedUntil = Date.now() + 60 * 60 * 1000;
      console.log('Gemini TTS quota limit reached, switching to browser synthesis fallback.');
    } else {
      console.warn('TTS server notice:', errMsg);
    }

    return res.status(200).json({
      success: false,
      fallback: true,
      message: 'TTS tạm thời không khả dụng, chuyển sang chế độ phát âm trình duyệt.',
    });
  }
});

// API: Submit contribution
app.post('/api/contribute', (req, res) => {
  const {
    tu_tieng_viet,
    tu_tieng_ede,
    phien_am,
    duong_dan_hinh_anh,
    chu_thich_hinh_anh,
    duong_dan_tep_am_thanh,
    audio_data_base64,
    ten_nguoi_doc_ban_ghi,
    nguon_tu_lieu,
    chu_de,
    vi_du_ngu_canh,
    ghi_chu_nguoi_dong_gop
  } = req.body;

  if (!ten_nguoi_doc_ban_ghi || !ten_nguoi_doc_ban_ghi.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Trường "Tên người đọc bản ghi âm" là bắt buộc.'
    });
  }

  if (!tu_tieng_viet || !tu_tieng_viet.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Trường "Từ tiếng Việt" là bắt buộc.'
    });
  }

  const newEntry = {
    id: `dong_gop_${Date.now()}`,
    ten_ban_ghi: `Bản ghi đóng góp: ${tu_tieng_ede || tu_tieng_viet}`,
    tu_tieng_viet: tu_tieng_viet.trim(),
    tu_tieng_ede: (tu_tieng_ede || '').trim(),
    phien_am: (phien_am || '').trim(),
    duong_dan_hinh_anh: (duong_dan_hinh_anh || '').trim(),
    chu_thich_hinh_anh: (chu_thich_hinh_anh || '').trim(),
    duong_dan_tep_am_thanh: (duong_dan_tep_am_thanh || '').trim(),
    audio_data_base64: audio_data_base64 || '',
    ten_nguoi_doc_ban_ghi: ten_nguoi_doc_ban_ghi.trim(),
    nguon_tu_lieu: (nguon_tu_lieu || 'Cộng đồng đóng góp & xác thực').trim(),
    chu_de: (chu_de || 'Đóng góp cộng đồng').trim(),
    vi_du_ngu_canh: (vi_du_ngu_canh || '').trim(),
    ghi_chu_nguoi_dong_gop: (ghi_chu_nguoi_dong_gop || '').trim(),
    ngay_tao: new Date().toISOString(),
    trang_thai: 'cho_duyet'
  };

  userContributions.unshift(newEntry);
  res.json({
    success: true,
    message: 'Bản ghi âm và từ vựng đã được tiếp nhận thành công!',
    data: newEntry
  });
});

// API: Delete contribution
app.delete('/api/contribute/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = userContributions.length;
  userContributions = userContributions.filter((c: any) => c.id !== id);
  res.json({
    success: true,
    deleted: userContributions.length < initialLength,
    message: 'Đã xóa bản ghi đóng góp.',
  });
});

// API: Gemini Strictly Grounded Lookup / Q&A
app.post('/api/gemini/lookup', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp từ khóa hoặc câu hỏi cần tra cứu.',
      });
    }

    const dictData = getDictionaryData().filter(
      (item: any) => Boolean((item.tu_tieng_viet && item.tu_tieng_viet.trim()) || (item.tu_tieng_ede && item.tu_tieng_ede.trim()))
    );
    const combinedData = [...dictData, ...userContributions];

    const qLower = query.trim().toLowerCase();
    const qNorm = normalizeDiacritics(qLower);

    // Extract matched records accurately (handling diacritics and two-way search)
    const matchedEntries = combinedData.filter((item: any) => {
      const v = (item.tu_tieng_viet || '').trim().toLowerCase();
      const e = (item.tu_tieng_ede || '').trim().toLowerCase();
      const p = (item.phien_am || '').trim().toLowerCase();
      const n = (item.ten_ban_ghi || '').trim().toLowerCase();

      const nv = normalizeDiacritics(v);
      const ne = normalizeDiacritics(e);

      const checkMatch = (term: string, normTerm: string) => {
        if (!term || term.length < 2) return false;
        // For short terms (<= 3 chars like 'ai', 'ea', 'mir'), require word boundary
        if (normTerm.length <= 3) {
          const re = new RegExp(`(^|[^a-z0-9])${normTerm}([^a-z0-9]|$)`, 'i');
          return re.test(qNorm) || (qNorm.length <= 3 && normTerm.includes(qNorm));
        }
        return (
          qLower.includes(term) ||
          term.includes(qLower) ||
          qNorm.includes(normTerm) ||
          normTerm.includes(qNorm)
        );
      };

      const checkTerms = (raw: string) => {
        if (!raw) return false;
        const parts = raw.split(/[/,]/).map(p => p.trim().toLowerCase()).filter(Boolean);
        return parts.some(part => {
          const normPart = normalizeDiacritics(part);
          return checkMatch(part, normPart) && (!VI_QUESTION_WORDS.has(normPart) || qNorm.length < 8);
        });
      };

      const matchViet = (checkMatch(v, nv) || checkTerms(v)) && (!VI_QUESTION_WORDS.has(nv) || qNorm.length < 8);
      const matchEde = checkMatch(e, ne) || checkTerms(e);

      return (
        matchViet ||
        matchEde ||
        (p && p.length > 2 && !VI_QUESTION_WORDS.has(p) && (qLower.includes(p) || p.includes(qLower))) ||
        (n && n.length > 5 && (qLower.includes(n) || n.includes(qLower)))
      );
    });

    const apiKey = process.env.GEMINI_API_KEY;
    let answer = '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const compactData = combinedData.map((item: any) => ({
          ten_ban_ghi: item.ten_ban_ghi || `${item.tu_tieng_viet} - ${item.tu_tieng_ede}`,
          tu_tieng_ede: item.tu_tieng_ede || '',
          tu_tieng_viet: item.tu_tieng_viet || '',
          phien_am: item.phien_am || '',
          ten_nguoi_doc_ban_ghi: item.ten_nguoi_doc_ban_ghi || '',
          nguon_tu_lieu: item.nguon_tu_lieu || '',
          chu_de: item.chu_de || '',
          vi_du_ngu_canh: item.vi_du_ngu_canh || '',
        }));

        const systemInstruction = `Bạn là Trợ lý Ngôn ngữ học tra cứu từ điển số tiếng dân tộc Ê-đê.
NHIỆM VỤ CỦA BẠN:
Đọc từ khóa hoặc câu hỏi của người dùng và tra cứu trong tệp dữ liệu từ điển tudien.json (và các bản ghi đóng góp) được cung cấp dưới đây.

RÀNG BUỘC TUYỆT ĐỐI KHÔNG ĐƯỢC VI PHẠM:
1. Bạn CHỈ ĐƯỢC PHÉP trả lời dựa HOÀN TOÀN và DUY NHẤT vào danh sách dữ liệu được cung cấp dưới đây.
2. TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ SUY ĐOÁN, BỊA RA NỘI DUNG, HOẶC ĐOÁN NGHĨA.
3. Nếu không có thông tin về từ khóa/câu hỏi trong dữ liệu được cung cấp, bạn BẮT BUỘC PHẢI TRẢ LỜI ĐÚNG CÂU NÀY:
"Hiện tại chưa có tư liệu về từ này trong từ điển."
4. Khi tìm thấy kết quả phù hợp, BẮT BUỘC trong mỗi kết quả phải hiển thị đầy đủ và rõ ràng các trường sau:
   - Tên bản ghi (ten_ban_ghi)
   - Từ tiếng Ê-đê (tu_tieng_ede)
   - Từ tiếng Việt (tu_tieng_viet)
   - Phiên âm (phien_am)
   - Tên người đọc (ten_nguoi_doc_ban_ghi)
   - Ngữ cảnh ví dụ (nếu có)
5. Luôn giữ phong cách học thuật, tôn trọng bản sắc văn hóa dân tộc Ê-đê, câu từ tiếng Việt chuẩn xác và có dấu.

DỮ LIỆU TỪ ĐIỂN TUDIEN.JSON:
${JSON.stringify(compactData, null, 2)}`;

        // Primary model with adequate timeout and seamless fallback
        const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
        for (const model of modelsToTry) {
          try {
            const response = await callWithTimeout(
              ai.models.generateContent({
                model,
                contents: query,
                config: {
                  systemInstruction,
                  temperature: 0.1,
                },
              }),
              15000
            );
            if (response && response.text) {
              answer = response.text;
              break;
            }
          } catch {
            // Silently fallback to next model or grounded local match
          }
        }
      } catch {
        // Fallback to grounded local search
      }
    }

    // If Gemini was unreachable, timed out, or returned a false negative despite exact entries existing in tudien.json:
    if (!answer || (matchedEntries.length > 0 && answer.toLowerCase().includes('chưa có tư liệu'))) {
      if (matchedEntries.length === 0) {
        answer = 'Hiện tại chưa có tư liệu về từ này trong từ điển.';
      } else {
        let text = `Đối chiếu dữ liệu chuẩn xác từ tệp tư liệu tudien.json (Tìm thấy ${matchedEntries.length} bản ghi phù hợp):\n\n`;
        matchedEntries.forEach((item: any, idx: number) => {
          text += `**${idx + 1}. ${item.ten_ban_ghi || item.tu_tieng_ede}**\n`;
          text += `- **Từ tiếng Ê-đê**: ${item.tu_tieng_ede || 'Chưa cập nhật'}\n`;
          text += `- **Từ tiếng Việt**: ${item.tu_tieng_viet}\n`;
          text += `- **Phiên âm**: ${item.phien_am || 'Chưa có phiên âm'}\n`;
          text += `- **Tên người đọc**: ${item.ten_nguoi_doc_ban_ghi}\n`;
          if (item.vi_du_ngu_canh) text += `- **Ngữ cảnh ví dụ**: ${item.vi_du_ngu_canh}\n`;
          text += `\n`;
        });
        answer = text;
      }
    }

    const finalMatchedEntries =
      answer.toLowerCase().includes('chưa có tư liệu') || answer.toLowerCase().includes('không có tư liệu')
        ? []
        : matchedEntries;

    return res.json({
      success: true,
      answer,
      matchedEntries: finalMatchedEntries,
      grounded: true,
    });
  } catch (error: any) {
    console.error('Gemini lookup unexpected error, serving safe response:', error);
    return res.json({
      success: true,
      answer: 'Hiện tại chưa có tư liệu về từ này trong từ điển.',
      matchedEntries: [],
      grounded: true,
    });
  }
});

// Setup Vite or Static
async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist/index.html'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
