// Module: Đọc & Dịch Văn Bản Tiếng Trung (js/views/readingView.js)
import { speakChinese } from '../utils/speech.js';
import { lookupPinyinForHanzi, lookupHanVietForHanzi } from '../utils/pinyinUtils.js';
import { getEffectiveDictionaryData, getAllTopicsList, saveCustomTopic, syncTopicWordsToDictionary } from '../utils/srs.js';

/**
 * Tách đoạn văn bản tiếng Trung thành danh sách các câu đơn lẻ dựa vào dấu câu (。！？!?;\n)
 */
export function splitChineseSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const sanitized = text.replace(/\r/g, '');
  // Tách câu theo các dấu ngắt câu tiếng Trung và dấu xuống dòng
  const rawParts = sanitized.split(/(?<=[。！？!?;\n])/);
  
  const sentences = [];
  for (let part of rawParts) {
    const trimmed = part.trim();
    if (trimmed) {
      sentences.push(trimmed);
    }
  }
  return sentences;
}

/**
 * Chuyển câu tiếng Trung sang Pinyin có dấu
 */
export function getSentencePinyin(sentence) {
  if (!sentence) return '';
  if (window.pinyinPro && typeof window.pinyinPro.pinyin === 'function') {
    try {
      return window.pinyinPro.pinyin(sentence);
    } catch (e) {
      console.warn('Fallback lookup Pinyin:', e);
    }
  }
  return lookupPinyinForHanzi(sentence) || sentence;
}

// Bảng mẫu dịch nghĩa câu thông dụng Trung - Việt
const SENTENCE_TRANSLATION_MAP = {
  '你好！': 'Xin chào!',
  '你好': 'Xin chào',
  '欢迎来到 Hanzo 应用程序。': 'Chào mừng bạn đến với ứng dụng Hanzo.',
  '欢迎来到Hanzo。': 'Chào mừng bạn đến với Hanzo.',
  '欢迎来到 Hanzo。': 'Chào mừng bạn đến với Hanzo.',
  '今天天气很好，': 'Hôm nay thời tiết rất đẹp,',
  '今天天气很好': 'Hôm nay thời tiết rất đẹp',
  '我们一起学习汉语吧！': 'Chúng ta hãy cùng nhau học tiếng Trung nhé!',
  '我们一起学习汉语吧': 'Chúng ta hãy cùng nhau học tiếng Trung nhé',
  '你准备好了吗？': 'Bạn đã sẵn sàng chưa?',
  '你准备好了吗': 'Bạn đã sẵn sàng chưa',
  '经理，': 'Giám đốc,',
  '经理': 'Giám đốc',
  '这是本月的项目合同与出差议程。': 'Đây là hợp đồng dự án và lịch trình công tác tháng này.',
  '请您看一下，': 'Xin mời ngài xem qua,',
  '如果没有问题，': 'Nếu không có vấn đề gì,',
  '我们明天就安排和客户开会。': 'Ngày mai chúng ta sẽ sắp xếp họp với khách hàng.',
  '学习一门新的语言需要时间和耐心。': 'Học một ngôn ngữ mới cần có thời gian và sự kiên nhẫn.',
  '每天坚持练习听、说、读、写，': 'Mỗi ngày kiên trì luyện tập Nghe, Nói, Đọc, Viết,',
  '你一定会取得很大的进步！': 'Bạn nhất định sẽ đạt được tiến bộ rất lớn!',
  '祝你学习愉快！': 'Chúc bạn học tập vui vẻ!',
  '我是学生。': 'Tôi là học sinh.',
  '我是学生': 'Tôi là học sinh',
  '谢谢你！': 'Cảm ơn bạn!',
  '谢谢你': 'Cảm ơn bạn',
  '再见！': 'Tạm biệt!',
  '再见': 'Tạm biệt',
  '很高兴认识你。': 'Rất vui được quen biết bạn.',
  '很高兴认识你': 'Rất vui được quen biết bạn'
};

/**
 * Tự động dịch nghĩa tiếng Việt cho câu tiếng Trung (Phân tích từ ghép & Từ điển)
 */
export function autoTranslateChineseToVietnamese(sentence) {
  if (!sentence || typeof sentence !== 'string') return '';
  const cleanStr = sentence.trim();
  if (!cleanStr) return '';

  // 1. Kiểm tra bảng câu mẫu chính xác trước
  if (SENTENCE_TRANSLATION_MAP[cleanStr]) {
    return SENTENCE_TRANSLATION_MAP[cleanStr];
  }

  // Bỏ dấu câu đuôi để tra câu mẫu
  const stripped = cleanStr.replace(/[。！？!?;\n]/g, '').trim();
  if (SENTENCE_TRANSLATION_MAP[stripped]) {
    const endChar = cleanStr.slice(-1);
    const punc = /[。！？!?]/.test(endChar) ? endChar.replace('。', '.') : '';
    return SENTENCE_TRANSLATION_MAP[stripped] + punc;
  }

  // 2. Tra cứu theo thuật toán phân tách từ dài nhất (Longest Matching Word Segmentation)
  let dict = [];
  try {
    if (typeof getEffectiveDictionaryData === 'function') {
      dict = getEffectiveDictionaryData();
    }
  } catch (e) {}

  const wordMap = {};
  if (Array.isArray(dict)) {
    dict.forEach(w => {
      if (w.hanzi && w.meaning) {
        wordMap[w.hanzi] = w.meaning.split(';')[0].split(',')[0].trim();
      }
    });
  }

  // Các đại từ / phó từ / từ nối thông dụng
  const COMMON_WORDS = {
    '我': 'Tôi', '你': 'Bạn', '他': 'Anh ấy', '她': 'Cô ấy', '它': 'Nó',
    '我们': 'Chúng tôi', '你们': 'Các bạn', '他们': 'Họ', '她们': 'Họ',
    '是': 'là', '不': 'không', '有': 'có', '没': 'không có', '要': 'muốn/cần',
    '想': 'muốn', '去': 'đi', '来': 'đến', '吃': 'ăn', '喝': 'uống', '看': 'xem/đọc',
    '听': 'nghe', '写': 'viết', '说': 'nói', '做': 'làm', '买': 'mua', '卖': 'bán',
    '好': 'tốt/hay', '大': 'lớn', '小': 'nhỏ', '多': 'nhiều', '少': 'ít',
    '在': 'ở/đang', '和': 'và', '与': 'và', '的': 'của', '了': 'rồi', '吗': 'không',
    '呢': 'nhỉ', '吧': 'nhé', '这': 'đây', '那': 'đó', '什么': 'gì', '怎么': 'thế nào',
    '为什么': 'tại sao', '很': 'rất', '太': 'quá', '也': 'cũng', '都': 'đều',
    '今天': 'Hôm nay', '明天': 'Ngày mai', '昨天': 'Hôm qua',
    '现在': 'Bây giờ', '时间': 'Thời gian', '工作': 'Công việc',
    '学习': 'Học tập', '汉语': 'Tiếng Trung', '中国': 'Trung Quốc'
  };

  Object.assign(wordMap, COMMON_WORDS);

  const keys = Object.keys(wordMap).sort((a, b) => b.length - a.length);

  let i = 0;
  const tokens = [];
  const chars = Array.from(cleanStr);

  while (i < chars.length) {
    let matched = false;
    const subText = chars.slice(i).join('');

    for (const key of keys) {
      if (subText.startsWith(key)) {
        tokens.push(wordMap[key]);
        i += Array.from(key).length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const char = chars[i];
      if (!/[\u4e00-\u9fa5]/.test(char)) {
        tokens.push(char);
      } else {
        const hv = lookupHanVietForHanzi(char);
        tokens.push(hv || char);
      }
      i++;
    }
  }

  let res = tokens.join(' ')
    .replace(/\s+([。！？!?,.;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (res.length > 0) {
    res = res.charAt(0).toUpperCase() + res.slice(1);
  }

  return res;
}

/**
 * Trích xuất danh sách từ/cụm từ vựng thông dụng gợi ý từ đoạn văn bản tiếng Trung.
 * Chỉ tập trung trích xuất các từ ghép (2 ký tự trở lên) thông dụng và có nghĩa rõ ràng,
 * KHÔNG trích xuất tràn lan từng chữ Hán đơn lẻ trong đoạn văn.
 */
export function extractSuggestedWords(text) {
  if (!text || typeof text !== 'string') return [];
  const cleanStr = text.trim();
  if (!cleanStr) return [];

  let dict = [];
  try {
    if (typeof getEffectiveDictionaryData === 'function') {
      dict = getEffectiveDictionaryData();
    }
  } catch (e) {}

  const dictMap = new Map();
  if (Array.isArray(dict)) {
    dict.forEach(w => {
      if (w && w.hanzi && w.meaning) {
        dictMap.set(w.hanzi.trim(), w);
      }
    });
  }

  // Danh sách bổ sung các từ/cụm từ thông dụng
  const EXTRA_COMMON_WORDS = [
    { hanzi: '欢迎', pinyin: 'huān yíng', hanviet: 'Hoan nghênh', meaning: 'Chào mừng', hskLevel: 2 },
    { hanzi: '应用程序', pinyin: 'yìng yòng chéng xù', hanviet: 'Ứng dụng trình tự', meaning: 'Ứng dụng / Phần mềm', hskLevel: 4 },
    { hanzi: '天气', pinyin: 'tiān qì', hanviet: 'Thiên khí', meaning: 'Thời tiết', hskLevel: 2 },
    { hanzi: '学习', pinyin: 'xué xí', hanviet: 'Học tập', meaning: 'Học tập', hskLevel: 1 },
    { hanzi: '汉语', pinyin: 'hàn yǔ', hanviet: 'Hán ngữ', meaning: 'Tiếng Trung', hskLevel: 1 },
    { hanzi: '准备', pinyin: 'zhǔn bèi', hanviet: 'Chuẩn bị', meaning: 'Sẵn sàng / Chuẩn bị', hskLevel: 2 },
    { hanzi: '经理', pinyin: 'jīng lǐ', hanviet: 'Kinh lý', meaning: 'Giám đốc / Quản lý', hskLevel: 3 },
    { hanzi: '项目', pinyin: 'xiàng mù', hanviet: 'Hạng mục', meaning: 'Dự án / Hạng mục', hskLevel: 4 },
    { hanzi: '合同', pinyin: 'hé tong', hanviet: 'Hợp đồng', meaning: 'Hợp đồng', hskLevel: 4 },
    { hanzi: '出差', pinyin: 'chū chāi', hanviet: 'Xuất sai', meaning: 'Đi công tác', hskLevel: 3 },
    { hanzi: '议程', pinyin: 'yì chéng', hanviet: 'Nghị trình', meaning: 'Lịch trình / Chương trình họp', hskLevel: 5 },
    { hanzi: '安排', pinyin: 'ān pái', hanviet: 'An bài', meaning: 'Sắp xếp / An bài', hskLevel: 3 },
    { hanzi: '客户', pinyin: 'kè hù', hanviet: 'Khách hộ', meaning: 'Khách hàng', hskLevel: 4 },
    { hanzi: '开会', pinyin: 'kāi huì', hanviet: 'Khai hội', meaning: 'Họp / Mở cuộc họp', hskLevel: 2 },
    { hanzi: '语言', pinyin: 'yǔ yán', hanviet: 'Ngữ ngôn', meaning: 'Ngôn ngữ', hskLevel: 3 },
    { hanzi: '时间', pinyin: 'shí jiān', hanviet: 'Thời gian', meaning: 'Thời gian', hskLevel: 2 },
    { hanzi: '耐心', pinyin: 'nài xīn', hanviet: 'Nhẫn tâm', meaning: 'Kiên nhẫn / Nhẫn nại', hskLevel: 4 },
    { hanzi: '坚持', pinyin: 'jiān chí', hanviet: 'Kiên trì', meaning: 'Kiên trì', hskLevel: 4 },
    { hanzi: '练习', pinyin: 'liàn xí', hanviet: 'Luyện tập', meaning: 'Luyện tập', hskLevel: 2 },
    { hanzi: '进步', pinyin: 'jìn bù', hanviet: 'Tiến bộ', meaning: 'Tiến bộ', hskLevel: 3 },
    { hanzi: '愉快', pinyin: 'yú kuài', hanviet: 'Du khoái', meaning: 'Vui vẻ / Thỏa mái', hskLevel: 3 },
    { hanzi: '认识', pinyin: 'rèn shi', hanviet: 'Nhận thức', meaning: 'Quen biết / Nhận biết', hskLevel: 1 },
    { hanzi: '高兴', pinyin: 'gāo xìng', hanviet: 'Cao hứng', meaning: 'Vui mừng / Vui vẻ', hskLevel: 1 },
    { hanzi: '工作', pinyin: 'gōng zuò', hanviet: 'Công tác', meaning: 'Công việc / Làm việc', hskLevel: 1 },
    { hanzi: '中国', pinyin: 'zhōng guó', hanviet: 'Trung Quốc', meaning: 'Trung Quốc', hskLevel: 1 },
    { hanzi: '朋友', pinyin: 'péng you', hanviet: 'Bằng hữu', meaning: 'Bạn bè', hskLevel: 1 },
    { hanzi: '问题', pinyin: 'wèn tí', hanviet: 'Vấn đề', meaning: 'Vấn đề / Câu hỏi', hskLevel: 2 },
    { hanzi: '大家', pinyin: 'dà jiā', hanviet: 'Đại gia', meaning: 'Mọi người', hskLevel: 2 },
    { hanzi: '公司', pinyin: 'gōng sī', hanviet: 'Công ty', meaning: 'Công ty', hskLevel: 2 },
    { hanzi: '明天', pinyin: 'míng tiān', hanviet: 'Minh thiên', meaning: 'Ngày mai', hskLevel: 1 },
    { hanzi: '今天', pinyin: 'jīn tiān', hanviet: 'Kim thiên', meaning: 'Hôm nay', hskLevel: 1 }
  ];

  EXTRA_COMMON_WORDS.forEach(w => {
    if (!dictMap.has(w.hanzi)) {
      dictMap.set(w.hanzi, w);
    }
  });

  const matchedWords = [];
  const seenHanzi = new Set();

  // CHỈ trích xuất các từ/cụm từ ghép từ 2 ký tự trở lên xuất hiện trong văn bản
  // Sắp xếp ưu tiên các cụm từ dài trước
  const sortedDictWords = Array.from(dictMap.values())
    .filter(w => w && w.hanzi && w.hanzi.length >= 2)
    .sort((a, b) => b.hanzi.length - a.hanzi.length);

  for (const w of sortedDictWords) {
    if (cleanStr.includes(w.hanzi)) {
      if (!seenHanzi.has(w.hanzi)) {
        seenHanzi.add(w.hanzi);
        const pinyin = w.pinyin || lookupPinyinForHanzi(w.hanzi) || w.hanzi;
        const hanviet = w.hanviet || lookupHanVietForHanzi(w.hanzi) || '';
        const meaning = w.meaning ? w.meaning.split(';')[0].split(',')[0].trim() : w.hanzi;

        matchedWords.push({
          hanzi: w.hanzi,
          pinyin: pinyin,
          hanviet: hanviet,
          meaning: meaning,
          hskLevel: w.hskLevel || 1,
          firstPos: cleanStr.indexOf(w.hanzi)
        });
      }
    }
  }

  // Sắp xếp các từ theo thứ tự xuất hiện lần đầu trong văn bản
  matchedWords.sort((a, b) => a.firstPos - b.firstPos);

  // Giới hạn tối đa 20 từ/cụm từ gợi ý thông dụng nhất
  return matchedWords.slice(0, 20);
}

export function renderReadingView(container) {
  let inputText = localStorage.getItem('hanzo_reading_input_cache') || '';
  let processedSentences = [];
  let isProcessed = false;
  let currentModalItem = null;
  let isSuggestedVocabCollapsed = false;

  let customSuggestedWords = null;
  let lastExtractedInputText = null;

  // Khôi phục bộ đệm câu đã tách/sửa nếu có
  try {
    const cachedSentences = localStorage.getItem('hanzo_reading_processed_cache');
    if (cachedSentences) {
      processedSentences = JSON.parse(cachedSentences);
      if (Array.isArray(processedSentences) && processedSentences.length > 0) {
        isProcessed = true;
      }
    }
  } catch (e) {}

  // Đoạn văn mẫu
  const sampleTexts = {
    giaoTiep: '你好！欢迎来到 Hanzo 应用程序。今天天气很好，我们一起学习汉语吧！你准备好了吗？',
    congSo: '经理，这是本月的项目合同与出差议程。请您看一下，如果没有问题，我们明天就安排和客户开会。',
    hocTap: '学习一门新的语言需要时间和耐心。每天坚持练习听、说、读、写，你一定会取得很大的进步！祝你学习愉快！'
  };

  const saveProcessedCache = () => {
    try {
      localStorage.setItem('hanzo_reading_processed_cache', JSON.stringify(processedSentences));
    } catch (e) {}
  };

  const render = () => {
    if (lastExtractedInputText !== inputText || customSuggestedWords === null) {
      lastExtractedInputText = inputText;
      const extracted = extractSuggestedWords(inputText);
      customSuggestedWords = extracted.map((w, idx) => ({
        id: `sugg_${Date.now()}_${idx}`,
        ...w,
        isEditing: false
      }));
    }

    const suggestedWords = customSuggestedWords;

    container.innerHTML = `
      <!-- View Header -->
      <div class="view-header mb-5">
        <div>
          <h1 class="text-gradient text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>📖</span> <span>Đọc & Dịch Văn Bản Tiếng Trung</span>
          </h1>
          <p class="subtitle text-sm text-slate-600 mt-1">
            Công cụ đọc hiểu thông minh: Tách câu tự động, hiển thị Pinyin màu xanh lam dưới câu đỏ, <strong>trích xuất từ vựng gợi ý</strong> & thêm vào bộ chủ đề từ vựng.
          </p>
        </div>
      </div>

      <!-- Main Grid Container: 2 Main Upper Sections (Section 1 & Section 2) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        
        <!-- SECTION 1: Nhập Văn Bản Gốc Tiếng Trung (Left Column) -->
        <div class="lg:col-span-5 flex flex-col">
          <div class="glass-panel p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition flex-1 flex flex-col min-h-[500px]">
            
            <!-- Section Header -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold text-base shadow-2xs">
                  ✍️
                </div>
                <h3 class="font-extrabold text-base text-slate-900">Văn Bản Gốc Tiếng Trung</h3>
              </div>
              <span class="text-2xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full" id="input-char-counter">
                0 ký tự
              </span>
            </div>

            <!-- Quick Sample Paste Buttons -->
            <div class="mb-3 shrink-0">
              <label class="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chèn đoạn văn mẫu nhanh:</label>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" class="btn-sample-text text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-red-700 border border-rose-200 hover:bg-red-600 hover:text-white transition cursor-pointer" data-key="giaoTiep">
                  💬 Giao tiếp hàng ngày
                </button>
                <button type="button" class="btn-sample-text text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-red-600 hover:text-white transition cursor-pointer" data-key="congSo">
                  💼 Tiếng Trung công sở
                </button>
                <button type="button" class="btn-sample-text text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-red-600 hover:text-white transition cursor-pointer" data-key="hocTap">
                  📚 Động lực học tập
                </button>
              </div>
            </div>

            <!-- Input Textarea Container -->
            <div class="relative flex-1 flex flex-col my-1 min-h-[320px] lg:min-h-[380px]">
              <textarea 
                id="reading-input-textarea"
                class="w-full flex-1 min-h-[320px] p-4 text-base font-medium text-slate-800 bg-slate-50/70 border-2 border-slate-200 rounded-2xl focus:border-red-500 focus:bg-white focus:outline-none transition leading-relaxed resize-none shadow-inner"
                placeholder="Dán hoặc nhập đoạn văn bản tiếng Trung vào đây (Ví dụ: 你好！欢迎来到Hanzo。今天天气很好，我们一起学习汉语吧！)..."
              >${escapeHtml(inputText)}</textarea>
            </div>

            <!-- Action Buttons Bar -->
            <div class="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 mt-2 shrink-0">
              <button 
                id="btn-clear-reading"
                type="button"
                class="btn btn-secondary font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-rose-200 text-red-600 bg-rose-50/50 hover:bg-rose-100 hover:border-red-400 transition flex items-center gap-1.5 cursor-pointer"
                title="Xóa toàn bộ văn bản nhập và kết quả dịch"
              >
                <span>🗑️</span> <span>Xóa Tất Cả</span>
              </button>

              <button 
                id="btn-translate-reading"
                type="button"
                class="btn btn-primary btn-3d-play font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl text-white shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                title="Tách văn bản gốc thành câu và hiển thị Pinyin + Dịch tiếng Việt"
              >
                <span>⚡</span> <span>Tách Câu & Dịch Pinyin</span>
              </button>
            </div>

          </div>
        </div>

        <!-- SECTION 2: Hiển Thị Văn Bản Sau Khi Dịch (Right Column) -->
        <div class="lg:col-span-7 flex flex-col">
          <div class="glass-panel p-5 bg-white border border-slate-200 rounded-3xl shadow-sm flex-1 flex flex-col min-h-[500px]">
            
            <!-- Result Section Header -->
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  📝
                </div>
                <div>
                  <h3 class="font-extrabold text-base text-slate-900">Văn Bản Sau Khi Dịch & Tách Câu</h3>
                  <p class="text-2xs text-slate-400 font-medium">Xuống dòng từng câu • Tiếng Trung ĐỎ • Pinyin XANH LAM • Dịch nghĩa XANH LÁ</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                ${isProcessed && processedSentences.length > 0 ? `
                  <span class="bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3 py-1 rounded-full">
                    ${processedSentences.length} câu
                  </span>
                  <button id="btn-toggle-all-sentences" class="btn btn-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs" title="Thu nhỏ / Mở rộng tất cả các câu">
                    <span>${processedSentences.some(s => !s.isCollapsed) ? '▲ Thu gọn tất cả' : '▼ Mở tất cả'}</span>
                  </button>
                  <button id="btn-add-new-sentence" class="btn btn-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer" title="Thêm câu mới vào văn bản dịch">
                    <span>➕</span> <span>Thêm câu</span>
                  </button>
                  <button id="btn-read-all-tts" class="btn btn-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer">
                    <span>🔊</span> <span>Đọc tất cả</span>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Output Display Container -->
            <div class="flex-1 overflow-y-auto min-h-[380px] max-h-[620px] pr-1 space-y-3" id="reading-output-container">
              ${renderOutputBody()}
            </div>

          </div>
        </div>

      </div>

      <!-- SECTION 3: SECTION TỪ VỰNG GỢI Ý CỦA ĐOẠN VĂN BẢN (Nằm ngang kéo dài từ cạnh trái Section 1 đến cạnh phải Section 2) -->
      <div class="w-full mt-6">
        <div class="glass-panel p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition">
          
          <!-- Section 3 Header -->
          <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                💡
              </div>
              <div>
                <h3 class="font-extrabold text-base sm:text-lg text-slate-900">Từ Vựng Gợi Ý Từ Đoạn Văn Bản</h3>
                <p class="text-2xs text-slate-400 font-medium">Tự động trích xuất các từ vựng HSK & cụm từ quan trọng có trong đoạn văn bản</p>
              </div>
            </div>

            <!-- Vị trí nằm ở chính giữa Header của Section 3 -->
            <div class="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center gap-2 my-1 sm:my-0">
              ${suggestedWords.length > 0 ? `
                <span class="bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-2xs">
                  ${suggestedWords.length} từ vựng trích xuất
                </span>
              ` : ''}
              <button 
                id="btn-add-custom-suggested-word" 
                type="button" 
                class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 transition flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                title="Thêm từ vựng gợi ý mới thủ công"
              >
                ➕
              </button>
              <button 
                id="btn-toggle-suggested-vocab" 
                type="button" 
                class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-300 transition flex items-center justify-center font-bold text-base cursor-pointer shadow-2xs"
                title="${isSuggestedVocabCollapsed ? 'Mở rộng section' : 'Thu nhỏ section'}"
              >
                <span id="icon-toggle-suggested-vocab" class="transition-transform duration-200 inline-block">${isSuggestedVocabCollapsed ? '▼' : '▲'}</span>
              </button>
            </div>
          </div>

          <!-- Section 3 Body: Suggested Words Grid -->
          <div id="suggested-vocab-grid-container" class="${isSuggestedVocabCollapsed ? 'hidden' : ''}">
            ${renderSuggestedVocabBody(suggestedWords)}
          </div>

        </div>
      </div>

      <!-- Modal Thêm Từ/Câu Vào Bộ Chủ Đề Từ Vựng -->
      <div id="add-to-topic-modal" class="modal-overlay hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="modal-card max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 relative animate-fade-in my-auto">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div class="flex items-center gap-2.5 font-black text-base text-slate-900">
              <span class="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-base shadow-2xs">📁</span>
              <span>Thêm Thẻ Từ/Câu Vào Chủ Đề</span>
            </div>
            <button type="button" class="btn-close text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer" id="btn-close-topic-modal">&times;</button>
          </div>

          <!-- Preview Card -->
          <div class="space-y-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <label class="block text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Xem trước nội dung sẽ lưu vào bộ chủ đề:</label>
              <div class="text-lg font-black text-red-600 hanzi-font leading-snug" id="modal-preview-hanzi" style="color: #dc2626 !important;"></div>
              <div class="text-xs font-bold text-blue-600 font-pinyin" id="modal-preview-pinyin" style="color: #2563eb !important;"></div>
              <div class="text-2xs font-extrabold text-purple-700" id="modal-preview-hanviet" style="color: #7e22ce !important;"></div>
              <div class="text-xs font-extrabold text-emerald-800 mt-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-block" id="modal-preview-trans"></div>
            </div>

            <!-- Target Topic Dropdown Select -->
            <div>
              <label class="block text-2xs font-extrabold text-slate-700 uppercase mb-1">Chọn Bộ Chủ Đề Từ Vựng Đích *</label>
              <select id="modal-select-topic-target" class="w-full p-3 font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:border-red-500 focus:bg-white focus:outline-none text-xs">
                <!-- Populated dynamically -->
              </select>
            </div>

            <!-- Box Tạo Chủ Đề Mới -->
            <div id="modal-new-topic-box" class="hidden p-3 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
              <label class="block text-2xs font-extrabold text-rose-900 uppercase">Tên Bộ Chủ Đề Mới Muốn Tạo:</label>
              <input type="text" id="modal-new-topic-name" class="w-full p-2.5 text-xs font-extrabold text-slate-800 border border-rose-300 rounded-xl bg-white focus:outline-none focus:border-red-500" placeholder="v.d. Từ Vựng Trích Xuất Hay" />
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button type="button" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition text-xs cursor-pointer" id="btn-cancel-topic-modal">Hủy</button>
            <button type="button" class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1.5 shadow-md transition text-xs cursor-pointer" id="btn-confirm-add-to-topic">
              <span>➕</span> <span>Lưu Vào Chủ Đề</span>
            </button>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  };

  const renderSuggestedVocabBody = (words) => {
    if (!words || words.length === 0) {
      return `
        <div class="py-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div class="text-3xl mb-2">💡</div>
          <p class="font-extrabold text-slate-600 text-sm">Chưa có từ vựng gợi ý</p>
          <p class="text-2xs text-slate-400 mt-1 max-w-md mx-auto mb-3">
            Dán hoặc nhập đoạn văn bản tiếng Trung ở ô trên để tự động trích xuất danh sách các từ vựng HSK & cụm từ quan trọng.
          </p>
          <button type="button" class="btn-trigger-add-suggested-manual text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer">
            ➕ Thêm từ vựng thủ công
          </button>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        ${words.map((w, index) => {
          if (w.isEditing) {
            return `
              <div class="suggested-word-edit-card p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-2.5 animate-fade-in">
                <div class="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                  <span class="font-black text-2xs text-amber-900 uppercase">✏️ Sửa từ vựng ${index + 1}</span>
                  <button type="button" class="btn-cancel-edit-suggested text-2xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer" data-index="${index}">✕ Hủy</button>
                </div>

                <!-- Input Chữ Hán -->
                <div>
                  <label class="block text-3xs font-extrabold text-red-700 uppercase mb-0.5">Từ Tiếng Trung (Chữ đỏ):</label>
                  <input type="text" class="inp-edit-sugg-hanzi w-full p-2 text-xs font-black text-red-600 bg-white border border-rose-300 rounded-xl focus:outline-none focus:border-red-500 hanzi-font" value="${escapeHtml(w.hanzi)}" data-index="${index}" style="color: #dc2626 !important;" />
                </div>

                <!-- Input Pinyin -->
                <div>
                  <label class="block text-3xs font-extrabold text-blue-600 uppercase mb-0.5">Pinyin (Chữ xanh lam):</label>
                  <input type="text" class="inp-edit-sugg-pinyin w-full p-2 text-xs font-bold text-blue-600 bg-white border border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 font-pinyin" value="${escapeHtml(w.pinyin)}" data-index="${index}" style="color: #2563eb !important;" />
                </div>

                <!-- Input Hán Việt -->
                <div>
                  <label class="block text-3xs font-extrabold text-purple-700 uppercase mb-0.5">Âm Hán Việt (Chữ tím):</label>
                  <input type="text" class="inp-edit-sugg-hanviet w-full p-2 text-xs font-bold text-purple-700 bg-white border border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 uppercase" value="${escapeHtml(w.hanviet || '')}" data-index="${index}" style="color: #7e22ce !important;" />
                </div>

                <!-- Input Nghĩa tiếng Việt -->
                <div>
                  <label class="block text-3xs font-extrabold text-emerald-800 uppercase mb-0.5">Nghĩa Tiếng Việt (Chữ xanh lá):</label>
                  <input type="text" class="inp-edit-sugg-meaning w-full p-2 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:border-emerald-500" value="${escapeHtml(w.meaning || '')}" data-index="${index}" />
                </div>

                <!-- Edit Footer Buttons -->
                <div class="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-1">
                  <button type="button" class="btn-delete-suggested-word text-3xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer" data-index="${index}">
                    <span>🗑️ Xóa</span>
                  </button>
                  <div class="flex items-center gap-1">
                    <button type="button" class="btn-cancel-edit-suggested px-2.5 py-1 text-3xs font-bold bg-white text-slate-600 border border-slate-300 rounded-lg cursor-pointer" data-index="${index}">Hủy</button>
                    <button type="button" class="btn-save-edit-suggested px-3 py-1 text-3xs font-extrabold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-2xs cursor-pointer" data-index="${index}">💾 Lưu</button>
                  </div>
                </div>
              </div>
            `;
          }

          return `
            <div class="suggested-word-card p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-amber-400 hover:bg-white transition shadow-2xs flex flex-col justify-between group relative">
              <div>
                <!-- Top Row: Hanzi, HSK Badge & Edit/Delete Action Icons -->
                <div class="flex items-start justify-between mb-1 gap-1">
                  <h4 class="text-xl font-black text-red-600 hanzi-font leading-tight" style="color: #dc2626 !important;">
                    ${escapeHtml(w.hanzi)}
                  </h4>
                  <div class="flex items-center gap-1">
                    <span class="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      HSK ${w.hskLevel || 1}
                    </span>
                    <!-- Action Edit & Delete Buttons -->
                    <div class="flex items-center gap-0.5 ml-0.5">
                      <button type="button" class="btn-trigger-edit-suggested w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-300 flex items-center justify-center text-3xs transition cursor-pointer" data-index="${index}" title="Chỉnh sửa từ gợi ý này">
                        ✏️
                      </button>
                      <button type="button" class="btn-delete-suggested-word w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 flex items-center justify-center text-3xs transition cursor-pointer" data-index="${index}" title="Xóa từ gợi ý này">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Pinyin (Xanh lam) -->
                <div class="text-xs font-bold text-blue-600 font-pinyin mb-0.5" style="color: #2563eb !important;">
                  ${escapeHtml(w.pinyin)}
                </div>

                <!-- Hán Việt (Tím) -->
                ${w.hanviet ? `
                  <div class="text-2xs font-extrabold text-purple-700 uppercase mb-1" style="color: #7e22ce !important;">
                    [Hán Việt]: ${escapeHtml(w.hanviet)}
                  </div>
                ` : ''}

                <!-- Nghĩa tiếng Việt (Xanh lá) -->
                <div class="text-xs font-extrabold text-emerald-800 line-clamp-2 leading-snug mt-1">
                  💡 ${escapeHtml(w.meaning)}
                </div>
              </div>

              <!-- Card Footer: TTS & Add to Topic -->
              <div class="pt-2.5 mt-2 border-t border-slate-200/70 flex items-center justify-between gap-1.5 shrink-0">
                <button 
                  type="button"
                  class="btn-speak-suggested-word p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition cursor-pointer text-2xs font-bold flex items-center gap-1 shadow-2xs"
                  data-text="${escapeHtml(w.hanzi)}"
                  title="Phát âm từ vựng này"
                >
                  <span>🔊 Nghe</span>
                </button>
                
                <button 
                  type="button"
                  class="btn-add-suggested-to-topic px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-red-600 hover:text-white transition cursor-pointer text-2xs font-bold flex items-center gap-1 shadow-2xs"
                  data-hanzi="${escapeHtml(w.hanzi)}"
                  data-pinyin="${escapeHtml(w.pinyin)}"
                  data-hanviet="${escapeHtml(w.hanviet)}"
                  data-meaning="${escapeHtml(w.meaning)}"
                  title="Thêm từ này vào Bộ chủ đề từ vựng"
                >
                  <span>📁 Thêm vào chủ đề</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const renderOutputBody = () => {
    if (!isProcessed || processedSentences.length === 0) {
      return `
        <div class="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div class="w-16 h-16 rounded-full bg-rose-50 text-red-500 border border-rose-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
            📖
          </div>
          <h4 class="font-black text-slate-700 text-base mb-1">Chưa có dữ liệu câu dịch</h4>
          <p class="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
            Nhập văn bản tiếng Trung ở ô bên trái, sau đó bấm nút <strong class="text-red-600">"Tách Câu & Dịch Pinyin"</strong> để tự động tách câu, hiển thị Pinyin và dịch nghĩa tiếng Việt.
          </p>
          <button id="btn-try-sample-trigger" class="btn btn-sm btn-secondary font-bold text-xs px-4 py-2 rounded-xl text-red-600 border border-red-300 hover:bg-red-50 cursor-pointer">
            ✨ Thử bằng đoạn văn mẫu
          </button>
        </div>
      `;
    }

    return processedSentences.map((item, index) => {
      const pinyinText = item.customPinyin !== undefined && item.customPinyin !== '' ? item.customPinyin : getSentencePinyin(item.sentence);
      const hanvietText = item.customHanviet !== undefined && item.customHanviet !== '' ? item.customHanviet : lookupHanVietForHanzi(item.sentence);
      const vietnameseTrans = item.customTranslation !== undefined && item.customTranslation !== '' ? item.customTranslation : autoTranslateChineseToVietnamese(item.sentence);

      // Trạng thái đang chỉnh sửa câu
      if (item.isEditing) {
        return `
          <div class="sentence-edit-card p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-sm space-y-3 animate-fade-in">
            <div class="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <span class="font-black text-xs text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <span>✏️</span> <span>Chỉnh Sửa Câu Số ${index + 1}</span>
              </span>
              <button type="button" class="btn-cancel-edit-sentence text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer" data-index="${index}" title="Hủy chỉnh sửa">✕ Hủy</button>
            </div>

            <!-- Input Chữ Hán -->
            <div>
              <label class="block text-2xs font-extrabold text-red-700 uppercase mb-1">Câu Tiếng Trung (Chữ đỏ):</label>
              <input 
                type="text" 
                class="inp-edit-hanzi w-full p-2.5 text-base font-black text-red-600 bg-white border border-rose-300 rounded-xl focus:border-red-500 focus:outline-none hanzi-font shadow-2xs" 
                value="${escapeHtml(item.sentence)}" 
                data-index="${index}" 
                placeholder="Nhập câu tiếng Trung..."
                style="color: #dc2626 !important;"
              />
            </div>

            <!-- Input Pinyin -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-2xs font-extrabold text-blue-700 uppercase">Phiên Âm Pinyin (Chữ xanh lam):</label>
                <button type="button" class="btn-auto-pinyin-edit text-3xs font-bold text-blue-600 hover:underline cursor-pointer" data-index="${index}">
                  🔄 Tự động tạo Pinyin mới
                </button>
              </div>
              <input 
                type="text" 
                class="inp-edit-pinyin w-full p-2.5 text-sm font-bold text-blue-600 bg-white border border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none font-pinyin shadow-2xs" 
                value="${escapeHtml(pinyinText)}" 
                data-index="${index}" 
                placeholder="Nhập Pinyin..."
                style="color: #2563eb !important;"
              />
            </div>

            <!-- Input Âm Hán Việt -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-2xs font-extrabold text-purple-700 uppercase">Âm Hán Việt (Chữ tím):</label>
                <button type="button" class="btn-auto-hanviet-edit text-3xs font-bold text-purple-600 hover:underline cursor-pointer" data-index="${index}">
                  🔄 Tự động tra Hán Việt mới
                </button>
              </div>
              <input 
                type="text" 
                class="inp-edit-hanviet w-full p-2.5 text-sm font-bold text-purple-700 bg-white border border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none uppercase shadow-2xs" 
                value="${escapeHtml(hanvietText)}" 
                data-index="${index}" 
                placeholder="Nhập âm Hán Việt (Ví dụ: NỄ HẢO)..." 
                style="color: #7e22ce !important;"
              />
            </div>

            <!-- Input Bản dịch tiếng Việt -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-2xs font-extrabold text-emerald-800 uppercase">Dịch Nghĩa Tiếng Việt (Chữ xanh lá):</label>
                <button type="button" class="btn-auto-trans-edit text-3xs font-bold text-emerald-700 hover:underline cursor-pointer" data-index="${index}">
                  🔄 Tự động dịch lại tiếng Việt
                </button>
              </div>
              <input 
                type="text" 
                class="inp-edit-trans w-full p-2.5 text-sm font-extrabold text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:border-emerald-500 focus:outline-none shadow-2xs" 
                value="${escapeHtml(vietnameseTrans)}" 
                placeholder="Nhập bản dịch nghĩa tiếng Việt cho câu này..." 
                data-index="${index}" 
              />
            </div>

            <!-- Footer Action Buttons -->
            <div class="flex items-center justify-between pt-1">
              <button type="button" class="btn-delete-sentence text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer" data-index="${index}" title="Xóa câu này">
                <span>🗑️ Xóa câu này</span>
              </button>
              <div class="flex items-center gap-2">
                <button type="button" class="btn-cancel-edit-sentence px-3.5 py-1.5 text-xs font-bold bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer" data-index="${index}">Hủy</button>
                <button type="button" class="btn-save-edit-sentence px-4 py-1.5 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1" data-index="${index}">
                  <span>💾</span> <span>Lưu Chỉnh Sửa</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      const isCollapsed = item.isCollapsed === true;

      // Trạng thái hiển thị câu thông thường
      return `
        <div class="sentence-result-card p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-red-300 hover:bg-white transition shadow-xs group space-y-1">
          <!-- Card Top Bar: Sentence Index & Action Buttons -->
          <div class="flex items-center justify-between mb-2 flex-wrap gap-1.5">
            <span class="inline-flex items-center gap-1 text-2xs font-extrabold px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
              <span>Câu ${index + 1}</span>
            </span>
            
            <!-- Nút chức năng: Thêm vào chủ đề, Sửa, Nghe, Copy, Thu nhỏ/Mở rộng -->
            <div class="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition flex-wrap">
              <button 
                class="btn-trigger-add-to-topic px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-red-600 hover:text-white flex items-center gap-1 text-xs font-bold transition cursor-pointer shadow-2xs" 
                data-index="${index}" 
                title="Thêm thẻ từ/câu này vào Bộ chủ đề từ vựng có sẵn"
              >
                <span>📁</span> <span>Thêm vào chủ đề</span>
              </button>

              <button 
                class="btn-trigger-edit-sentence px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-600 hover:text-white flex items-center gap-1 text-xs font-bold transition cursor-pointer shadow-2xs" 
                data-index="${index}" 
                title="Chỉnh sửa Chữ Hán, Pinyin, Hán Việt hoặc Bản dịch của câu này"
              >
                <span>✏️</span> <span>Sửa</span>
              </button>
              
              <button 
                class="btn-speak-sentence w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition cursor-pointer shadow-2xs" 
                data-text="${escapeHtml(item.sentence)}" 
                title="Phát âm câu này"
              >
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02z"/>
                </svg>
              </button>
              
              <button 
                class="btn-copy-sentence w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-700 hover:text-white flex items-center justify-center transition cursor-pointer shadow-2xs" 
                data-text="${escapeHtml(item.sentence)}" 
                data-pinyin="${escapeHtml(pinyinText)}"
                data-hanviet="${escapeHtml(hanvietText)}"
                data-trans="${escapeHtml(vietnameseTrans)}"
                title="Sao chép câu, Pinyin, Hán Việt và bản dịch"
              >
                <span class="text-xs">📋</span>
              </button>

              <!-- Nút Thu nhỏ / Mở rộng cho từng câu -->
              <button 
                class="btn-toggle-sentence-collapse w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition cursor-pointer shadow-2xs font-bold text-xs ml-0.5" 
                data-index="${index}"
                title="${isCollapsed ? 'Mở rộng câu này' : 'Thu nhỏ câu này'}"
              >
                <span class="transition-transform duration-200 inline-block">${isCollapsed ? '▼' : '▲'}</span>
              </button>
            </div>
          </div>

          <!-- Yêu cầu 3.1: Câu tiếng Trung hiển thị màu ĐỎ -->
          <div class="chinese-sentence-line text-lg sm:text-xl font-black text-red-600 hanzi-font leading-relaxed tracking-wide mb-1" style="color: #dc2626 !important;">
            ${escapeHtml(item.sentence)}
          </div>

          <!-- Chi tiết Pinyin, Hán Việt và Bản dịch (Ẩn khi thu nhỏ câu) -->
          <div class="sentence-detail-body space-y-1 ${isCollapsed ? 'hidden' : ''}">
            <!-- Yêu cầu 3.1: Pinyin hiển thị màu XANH LAM -->
            <div class="pinyin-sentence-line text-sm sm:text-base font-semibold text-blue-600 font-pinyin leading-snug tracking-normal" style="color: #2563eb !important;">
              ${escapeHtml(pinyinText)}
            </div>

            <!-- Âm Hán Việt (Hiển thị màu Tím nổi bật) -->
            ${hanvietText ? `
              <div class="hanviet-sentence-line text-xs font-extrabold text-purple-700 uppercase tracking-wider" style="color: #7e22ce !important;">
                [Hán Việt]: ${escapeHtml(hanvietText)}
              </div>
            ` : ''}

            <!-- Bổ sung Dịch Nghĩa Tiếng Việt tự động (Màu Xanh Lá Emerald Nổi Bật) -->
            ${vietnameseTrans ? `
              <div class="vietnamese-translation-line text-xs sm:text-sm font-extrabold text-emerald-800 bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200 mt-2 flex items-start gap-1.5 shadow-2xs">
                <span class="shrink-0 text-base">🇻🇳</span>
                <span class="leading-snug">Dịch nghĩa: ${escapeHtml(vietnameseTrans)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  const updateCharCounter = () => {
    const textarea = container.querySelector('#reading-input-textarea');
    const counter = container.querySelector('#input-char-counter');
    if (textarea && counter) {
      const len = textarea.value.length;
      counter.innerText = `${len} ký tự`;
    }
  };

  const updateInputFromSentences = () => {
    if (processedSentences.length > 0) {
      inputText = processedSentences.map(s => s.sentence).join('\n');
      const textarea = container.querySelector('#reading-input-textarea');
      if (textarea) textarea.value = inputText;
      localStorage.setItem('hanzo_reading_input_cache', inputText);
      updateCharCounter();
    }
  };

  const processTranslation = () => {
    const textarea = container.querySelector('#reading-input-textarea');
    if (!textarea) return;
    
    inputText = textarea.value.trim();
    localStorage.setItem('hanzo_reading_input_cache', inputText);

    if (!inputText) {
      alert('Vui lòng nhập hoặc dán đoạn văn bản tiếng Trung cần tách câu và dịch!');
      return;
    }

    const sentences = splitChineseSentences(inputText);
    processedSentences = sentences.map(s => ({
      id: `sent_${Math.random().toString(36).substr(2, 9)}`,
      sentence: s,
      customPinyin: '',
      customHanviet: '',
      customTranslation: autoTranslateChineseToVietnamese(s),
      isEditing: false
    }));
    isProcessed = true;
    saveProcessedCache();
    render();
  };

  const clearAll = () => {
    inputText = '';
    processedSentences = [];
    isProcessed = false;
    customSuggestedWords = null;
    lastExtractedInputText = null;
    localStorage.removeItem('hanzo_reading_input_cache');
    localStorage.removeItem('hanzo_reading_processed_cache');
    render();
  };

  const openAddToTopicModal = (itemObj) => {
    if (!itemObj) return;
    currentModalItem = itemObj;

    const modal = container.querySelector('#add-to-topic-modal');
    const previewHanzi = container.querySelector('#modal-preview-hanzi');
    const previewPinyin = container.querySelector('#modal-preview-pinyin');
    const previewHanviet = container.querySelector('#modal-preview-hanviet');
    const previewTrans = container.querySelector('#modal-preview-trans');
    const topicSelect = container.querySelector('#modal-select-topic-target');
    const newTopicBox = container.querySelector('#modal-new-topic-box');

    const pinyinText = itemObj.customPinyin !== undefined && itemObj.customPinyin !== '' ? itemObj.customPinyin : (itemObj.pinyin || getSentencePinyin(itemObj.sentence || itemObj.hanzi));
    const hanvietText = itemObj.customHanviet !== undefined && itemObj.customHanviet !== '' ? itemObj.customHanviet : (itemObj.hanviet || lookupHanVietForHanzi(itemObj.sentence || itemObj.hanzi));
    const vietnameseTrans = itemObj.customTranslation !== undefined && itemObj.customTranslation !== '' ? itemObj.customTranslation : (itemObj.meaning || autoTranslateChineseToVietnamese(itemObj.sentence || itemObj.hanzi));

    const hanziStr = itemObj.sentence || itemObj.hanzi;

    if (previewHanzi) previewHanzi.innerText = hanziStr;
    if (previewPinyin) previewPinyin.innerText = pinyinText;
    if (previewHanviet) previewHanviet.innerText = hanvietText ? `[Hán Việt]: ${hanvietText}` : '';
    if (previewTrans) previewTrans.innerText = vietnameseTrans ? `🇻🇳 Dịch: ${vietnameseTrans}` : '';

    const allTopics = getAllTopicsList();
    let optionsHtml = allTopics.map(t => {
      const count = (t.words || []).length;
      return `<option value="${t.id}">📂 ${escapeHtml(t.name)} (${count} từ)</option>`;
    }).join('');
    optionsHtml += `<option value="NEW_TOPIC">✨ + Tạo bộ chủ đề mới...</option>`;

    if (topicSelect) {
      topicSelect.innerHTML = optionsHtml;
    }
    if (newTopicBox) newTopicBox.classList.add('hidden');

    modal?.classList.remove('hidden');
  };

  const attachEvents = () => {
    const textarea = container.querySelector('#reading-input-textarea');
    const translateBtn = container.querySelector('#btn-translate-reading');
    const clearBtn = container.querySelector('#btn-clear-reading');
    const trySampleBtn = container.querySelector('#btn-try-sample-trigger');
    const readAllBtn = container.querySelector('#btn-read-all-tts');
    const addNewSentenceBtn = container.querySelector('#btn-add-new-sentence');

    // Topic Modal elements
    const topicModal = container.querySelector('#add-to-topic-modal');
    const closeTopicModalBtn = container.querySelector('#btn-close-topic-modal');
    const cancelTopicModalBtn = container.querySelector('#btn-cancel-topic-modal');
    const confirmAddToTopicBtn = container.querySelector('#btn-confirm-add-to-topic');
    const topicSelect = container.querySelector('#modal-select-topic-target');
    const newTopicBox = container.querySelector('#modal-new-topic-box');

    const closeTopicModal = () => topicModal?.classList.add('hidden');
    closeTopicModalBtn?.addEventListener('click', closeTopicModal);
    cancelTopicModalBtn?.addEventListener('click', closeTopicModal);

    topicSelect?.addEventListener('change', (e) => {
      if (e.target.value === 'NEW_TOPIC') {
        newTopicBox?.classList.remove('hidden');
      } else {
        newTopicBox?.classList.add('hidden');
      }
    });

    confirmAddToTopicBtn?.addEventListener('click', () => {
      if (!currentModalItem) {
        closeTopicModal();
        return;
      }

      const item = currentModalItem;
      const selectedTopicVal = topicSelect ? topicSelect.value : '';
      const allTopics = getAllTopicsList();

      let targetTopic = null;

      if (selectedTopicVal === 'NEW_TOPIC') {
        const newName = container.querySelector('#modal-new-topic-name')?.value.trim();
        if (!newName) {
          alert('Vui lòng nhập tên cho Bộ chủ đề mới!');
          return;
        }
        targetTopic = {
          id: `topic_custom_${Date.now()}`,
          name: newName,
          category: 'Đọc & Dịch',
          icon: '📖',
          description: 'Bộ từ vựng được lưu từ công cụ Đọc & Dịch.',
          words: []
        };
      } else {
        targetTopic = allTopics.find(t => t.id === selectedTopicVal) || allTopics[0];
      }

      if (!targetTopic) {
        alert('Không tìm thấy Bộ chủ đề từ vựng!');
        return;
      }

      if (!Array.isArray(targetTopic.words)) targetTopic.words = [];

      const hanziStr = item.sentence || item.hanzi;
      const pinyinText = item.customPinyin !== undefined && item.customPinyin !== '' ? item.customPinyin : (item.pinyin || getSentencePinyin(hanziStr));
      const hanvietText = item.customHanviet !== undefined && item.customHanviet !== '' ? item.customHanviet : (item.hanviet || lookupHanVietForHanzi(hanziStr));
      const vietnameseTrans = item.customTranslation !== undefined && item.customTranslation !== '' ? item.customTranslation : (item.meaning || autoTranslateChineseToVietnamese(hanziStr));

      const existingWordIdx = targetTopic.words.findIndex(w => w.hanzi === hanziStr);
      const wordObj = {
        hanzi: hanziStr,
        pinyin: pinyinText,
        hanviet: hanvietText,
        meaning: vietnameseTrans || hanziStr,
        hskLevel: item.hskLevel || 1
      };

      if (existingWordIdx >= 0) {
        targetTopic.words[existingWordIdx] = wordObj;
      } else {
        targetTopic.words.push(wordObj);
      }

      saveCustomTopic(targetTopic);
      syncTopicWordsToDictionary();
      closeTopicModal();

      alert(`🎉 Đã thêm thành công từ/câu "${hanziStr}" vào bộ chủ đề "${targetTopic.name}"!\n\n✨ Bạn có thể xem và luyện tập từ này trong tab "Chủ đề từ vựng" hoặc "Ôn tập & Kiểm tra".`);
    });

    textarea?.addEventListener('input', () => {
      inputText = textarea.value;
      localStorage.setItem('hanzo_reading_input_cache', inputText);
      updateCharCounter();
      render();
    });

    // Nút dịch & tách câu
    translateBtn?.addEventListener('click', () => {
      processTranslation();
    });

    // Nút xóa tất cả
    clearBtn?.addEventListener('click', () => {
      clearAll();
    });

    trySampleBtn?.addEventListener('click', () => {
      if (textarea) {
        textarea.value = sampleTexts.giaoTiep;
        inputText = sampleTexts.giaoTiep;
        updateCharCounter();
        processTranslation();
      }
    });

    // Chèn câu mới thủ công
    addNewSentenceBtn?.addEventListener('click', () => {
      const newSentence = prompt('Nhập câu tiếng Trung mới muốn thêm:');
      if (newSentence && newSentence.trim()) {
        const trimmed = newSentence.trim();
        processedSentences.push({
          id: `sent_${Math.random().toString(36).substr(2, 9)}`,
          sentence: trimmed,
          customPinyin: getSentencePinyin(trimmed),
          customHanviet: lookupHanVietForHanzi(trimmed),
          customTranslation: autoTranslateChineseToVietnamese(trimmed),
          isEditing: false
        });
        isProcessed = true;
        updateInputFromSentences();
        saveProcessedCache();
        render();
      }
    });

    // Sample buttons click
    container.querySelectorAll('.btn-sample-text').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.currentTarget.dataset.key;
        if (sampleTexts[key] && textarea) {
          textarea.value = sampleTexts[key];
          inputText = sampleTexts[key];
          updateCharCounter();
          processTranslation();
        }
      });
    });

    // Mở Modal Thêm câu từ danh sách câu đã dịch
    container.querySelectorAll('.btn-trigger-add-to-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && processedSentences[idx]) {
          openAddToTopicModal(processedSentences[idx]);
        }
      });
    });

    // Nút thu nhỏ / mở rộng Section 3 (Từ vựng gợi ý)
    const toggleSuggestedBtn = container.querySelector('#btn-toggle-suggested-vocab');
    const suggestedGridContainer = container.querySelector('#suggested-vocab-grid-container');
    const toggleIcon = container.querySelector('#icon-toggle-suggested-vocab');

    toggleSuggestedBtn?.addEventListener('click', () => {
      isSuggestedVocabCollapsed = !isSuggestedVocabCollapsed;
      if (suggestedGridContainer) {
        if (isSuggestedVocabCollapsed) {
          suggestedGridContainer.classList.add('hidden');
        } else {
          suggestedGridContainer.classList.remove('hidden');
        }
      }
      if (toggleIcon) {
        toggleIcon.innerText = isSuggestedVocabCollapsed ? '▼' : '▲';
      }
      if (toggleSuggestedBtn) {
        toggleSuggestedBtn.title = isSuggestedVocabCollapsed ? 'Mở rộng section' : 'Thu nhỏ section';
      }
    });

    // Nút Thêm từ vựng gợi ý thủ công (Tự động tạo card mới ở chế độ chỉnh sửa)
    const addCustomSuggestedBtn = container.querySelector('#btn-add-custom-suggested-word');
    const handleAddCustomWord = () => {
      if (!Array.isArray(customSuggestedWords)) customSuggestedWords = [];
      isSuggestedVocabCollapsed = false;
      customSuggestedWords.unshift({
        id: `sugg_custom_${Date.now()}`,
        hanzi: '',
        pinyin: '',
        hanviet: '',
        meaning: '',
        hskLevel: 1,
        isEditing: true
      });
      render();
      setTimeout(() => {
        const firstInput = container.querySelector('.inp-edit-sugg-hanzi');
        if (firstInput) {
          firstInput.focus();
          firstInput.placeholder = 'Nhập từ tiếng Trung mới...';
        }
      }, 50);
    };
    addCustomSuggestedBtn?.addEventListener('click', handleAddCustomWord);
    container.querySelector('.btn-trigger-add-suggested-manual')?.addEventListener('click', handleAddCustomWord);

    // Mở chế độ chỉnh sửa từ vựng gợi ý (Section 3)
    container.querySelectorAll('.btn-trigger-edit-suggested').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && customSuggestedWords[idx]) {
          customSuggestedWords[idx].isEditing = true;
          render();
        }
      });
    });

    // Tự động tra Pinyin, Hán Việt và Nghĩa tiếng Việt khi gõ Chữ Hán
    container.querySelectorAll('.inp-edit-sugg-hanzi').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const card = e.target.closest('.suggested-word-edit-card');
        if (card && val) {
          const pinyinInp = card.querySelector('.inp-edit-sugg-pinyin');
          const hanvietInp = card.querySelector('.inp-edit-sugg-hanviet');
          const meaningInp = card.querySelector('.inp-edit-sugg-meaning');
          if (pinyinInp && !pinyinInp.value.trim()) pinyinInp.value = getSentencePinyin(val);
          if (hanvietInp && !hanvietInp.value.trim()) hanvietInp.value = lookupHanVietForHanzi(val);
          if (meaningInp && !meaningInp.value.trim()) meaningInp.value = autoTranslateChineseToVietnamese(val);
        }
      });
    });

    // Hủy chỉnh sửa từ vựng gợi ý (Nút Hủy)
    container.querySelectorAll('.btn-cancel-edit-suggested').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && customSuggestedWords[idx]) {
          if (!customSuggestedWords[idx].hanzi || !customSuggestedWords[idx].hanzi.trim()) {
            customSuggestedWords.splice(idx, 1);
          } else {
            customSuggestedWords[idx].isEditing = false;
          }
          render();
        }
      });
    });

    // Lưu chỉnh sửa từ vựng gợi ý
    container.querySelectorAll('.btn-save-edit-suggested').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        const card = e.currentTarget.closest('.suggested-word-edit-card');
        const hanziInp = card?.querySelector('.inp-edit-sugg-hanzi');
        const pinyinInp = card?.querySelector('.inp-edit-sugg-pinyin');
        const hanvietInp = card?.querySelector('.inp-edit-sugg-hanviet');
        const meaningInp = card?.querySelector('.inp-edit-sugg-meaning');

        if (!isNaN(idx) && customSuggestedWords[idx] && hanziInp) {
          const newHanzi = hanziInp.value.trim();
          if (!newHanzi) {
            alert('Vui lòng nhập Từ Tiếng Trung!');
            hanziInp.focus();
            return;
          }
          customSuggestedWords[idx].hanzi = newHanzi;
          customSuggestedWords[idx].pinyin = pinyinInp && pinyinInp.value.trim() ? pinyinInp.value.trim() : getSentencePinyin(newHanzi);
          customSuggestedWords[idx].hanviet = hanvietInp && hanvietInp.value.trim() ? hanvietInp.value.trim() : lookupHanVietForHanzi(newHanzi);
          customSuggestedWords[idx].meaning = meaningInp && meaningInp.value.trim() ? meaningInp.value.trim() : autoTranslateChineseToVietnamese(newHanzi);
          customSuggestedWords[idx].isEditing = false;
          render();
        }
      });
    });

    // Xóa từ vựng gợi ý khỏi danh sách
    container.querySelectorAll('.btn-delete-suggested-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && customSuggestedWords[idx]) {
          const wordObj = customSuggestedWords[idx];
          if (confirm(`Bạn có chắc muốn xóa từ "${wordObj.hanzi}" khỏi danh sách từ vựng gợi ý?`)) {
            customSuggestedWords.splice(idx, 1);
            render();
          }
        }
      });
    });

    // Mở Modal Thêm từ từ danh sách Từ vựng gợi ý (Section 3)
    container.querySelectorAll('.btn-add-suggested-to-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hanzi = e.currentTarget.dataset.hanzi;
        const pinyin = e.currentTarget.dataset.pinyin;
        const hanviet = e.currentTarget.dataset.hanviet;
        const meaning = e.currentTarget.dataset.meaning;

        if (hanzi) {
          openAddToTopicModal({ hanzi, pinyin, hanviet, meaning });
        }
      });
    });

    // Nghe phát âm từ vựng gợi ý
    container.querySelectorAll('.btn-speak-suggested-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.dataset.text;
        if (text) speakChinese(text);
      });
    });

    // Thu nhỏ / Mở rộng cho từng câu riêng lẻ trong Section 2
    container.querySelectorAll('.btn-toggle-sentence-collapse').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && processedSentences[idx]) {
          processedSentences[idx].isCollapsed = !processedSentences[idx].isCollapsed;
          saveProcessedCache();
          render();
        }
      });
    });

    // Thu nhỏ / Mở rộng tất cả các câu trong Section 2
    const toggleAllSentencesBtn = container.querySelector('#btn-toggle-all-sentences');
    toggleAllSentencesBtn?.addEventListener('click', () => {
      const anyExpanded = processedSentences.some(s => !s.isCollapsed);
      processedSentences.forEach(s => {
        s.isCollapsed = anyExpanded;
      });
      saveProcessedCache();
      render();
    });

    // Mở chế độ chỉnh sửa từng câu
    container.querySelectorAll('.btn-trigger-edit-sentence').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && processedSentences[idx]) {
          processedSentences[idx].isEditing = true;
          render();
        }
      });
    });

    // Hủy chỉnh sửa câu
    container.querySelectorAll('.btn-cancel-edit-sentence').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && processedSentences[idx]) {
          processedSentences[idx].isEditing = false;
          render();
        }
      });
    });

    // Tự động tạo Pinyin lại khi bấm nút
    container.querySelectorAll('.btn-auto-pinyin-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.sentence-edit-card');
        const hanziInp = card?.querySelector('.inp-edit-hanzi');
        const pinyinInp = card?.querySelector('.inp-edit-pinyin');
        if (hanziInp && pinyinInp) {
          const newHanzi = hanziInp.value.trim();
          if (newHanzi) {
            pinyinInp.value = getSentencePinyin(newHanzi);
          }
        }
      });
    });

    // Tự động tra Hán Việt lại khi bấm nút
    container.querySelectorAll('.btn-auto-hanviet-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.sentence-edit-card');
        const hanziInp = card?.querySelector('.inp-edit-hanzi');
        const hanvietInp = card?.querySelector('.inp-edit-hanviet');
        if (hanziInp && hanvietInp) {
          const newHanzi = hanziInp.value.trim();
          if (newHanzi) {
            hanvietInp.value = lookupHanVietForHanzi(newHanzi);
          }
        }
      });
    });

    // Tự động dịch lại tiếng Việt khi bấm nút
    container.querySelectorAll('.btn-auto-trans-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.sentence-edit-card');
        const hanziInp = card?.querySelector('.inp-edit-hanzi');
        const transInp = card?.querySelector('.inp-edit-trans');
        if (hanziInp && transInp) {
          const newHanzi = hanziInp.value.trim();
          if (newHanzi) {
            transInp.value = autoTranslateChineseToVietnamese(newHanzi);
          }
        }
      });
    });

    // Lưu chỉnh sửa câu
    container.querySelectorAll('.btn-save-edit-sentence').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        const card = e.currentTarget.closest('.sentence-edit-card');
        const hanziInp = card?.querySelector('.inp-edit-hanzi');
        const pinyinInp = card?.querySelector('.inp-edit-pinyin');
        const hanvietInp = card?.querySelector('.inp-edit-hanviet');
        const transInp = card?.querySelector('.inp-edit-trans');

        if (hanziInp && !isNaN(idx) && processedSentences[idx]) {
          const newHanzi = hanziInp.value.trim();
          if (!newHanzi) {
            alert('Câu tiếng Trung không được để trống!');
            return;
          }
          const newPinyin = pinyinInp ? pinyinInp.value.trim() : '';
          const newHanviet = hanvietInp ? hanvietInp.value.trim() : '';
          const newTrans = transInp ? transInp.value.trim() : '';

          processedSentences[idx].sentence = newHanzi;
          processedSentences[idx].customPinyin = newPinyin;
          processedSentences[idx].customHanviet = newHanviet;
          processedSentences[idx].customTranslation = newTrans;
          processedSentences[idx].isEditing = false;

          updateInputFromSentences();
          saveProcessedCache();
          render();
        }
      });
    });

    // Xóa từng câu
    container.querySelectorAll('.btn-delete-sentence').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && processedSentences[idx]) {
          if (confirm(`Bạn có chắc muốn xóa câu số ${idx + 1} này khỏi kết quả dịch?`)) {
            processedSentences.splice(idx, 1);
            if (processedSentences.length === 0) isProcessed = false;
            updateInputFromSentences();
            saveProcessedCache();
            render();
          }
        }
      });
    });

    // Sentence TTS audio buttons
    container.querySelectorAll('.btn-speak-sentence').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = e.currentTarget.dataset.text;
        speakChinese(text);
      });
    });

    // Sentence Copy buttons
    container.querySelectorAll('.btn-copy-sentence').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = e.currentTarget.dataset.text;
        const pinyin = e.currentTarget.dataset.pinyin;
        const hanviet = e.currentTarget.dataset.hanviet;
        const trans = e.currentTarget.dataset.trans;
        
        let copyContent = `${text}\n${pinyin}`;
        if (hanviet) copyContent += `\n[Hán Việt]: ${hanviet}`;
        if (trans) copyContent += `\n🇻🇳 Dịch nghĩa: ${trans}`;

        navigator.clipboard.writeText(copyContent).then(() => {
          alert('📋 Đã sao chép câu, Pinyin, Hán Việt và bản dịch vào khay nhớ tạm!');
        }).catch(() => {
          alert('Không thể tự động sao chép. Vui lòng sao chép thủ công.');
        });
      });
    });

    // Read all sentences TTS
    readAllBtn?.addEventListener('click', () => {
      if (processedSentences.length > 0) {
        const fullText = processedSentences.map(s => s.sentence).join(' ');
        speakChinese(fullText);
      }
    });

    updateCharCounter();
  };

  render();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
