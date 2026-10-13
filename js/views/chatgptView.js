// Module 9: Trợ lý Hán Ngữ ChatGPT AI Assistant (chatgptView.js)
import { speakChinese } from '../utils/speech.js';

let suggestedPromptSets = [
  [
    '“你好” có nghĩa là gì?',
    'Giải thích cấu trúc “اگر...就...” kèm ví dụ.',
    'Dịch đoạn văn sau sang tiếng Trung: “Tôi sẽ đi Trung Quốc vào tháng sau.”',
    'Tạo 10 câu hội thoại khi đặt phòng khách sạn.',
    'Viết một đoạn văn giới thiệu bản thân bằng tiếng Trung.',
    'Ý nghĩa của lễ hội Trung Thu ở Trung Quốc là gì?'
  ],
  [
    'Phân biệt cách dùng “刚” và “刚才” trong tiếng Trung.',
    'Cách viết email xin báo giá sản phẩm chuẩn công sở.',
    '10 câu khẩu ngữ tiếng Trung giao tiếp thông dụng khi đi mua sắm.',
    'Ý nghĩa của Tết Nguyên Đán (春节) trong văn hóa Trung Hoa.',
    'Dịch sang tiếng Trung: "Rất vui được hợp tác với công ty của anh."',
    'Tóm tắt các điểm ngữ pháp HSK 3 quan trọng nhất cần nhớ.'
  ],
  [
    'Giải thích cấu trúc câu chữ 把 (把字句) kèm 3 ví dụ thực tế.',
    'Phân biệt sự khác nhau giữa 解决 và 处理 trong công việc.',
    'Viết một mẫu đơn xin nghỉ phép tiếng Trung chuẩn ngắn gọn.',
    'Top 10 mẫu câu giao tiếp tiếng Trung trong cuộc họp doanh nghiệp.',
    'Các câu chúc mừng sinh nhật tiếng Trung ý nghĩa nhất.',
    'Cách sử dụng trợ từ động thái “了” trong các thì tiếng Trung.'
  ]
];

let currentPromptSetIndex = 0;
let isWebSearchEnabled = true;
let selectedModel = 'GPT-4o';
let currentViewMode = 'landing'; // 'landing' or 'chat'
let activeCategory = 'all';

let chatHistory = [
  { id: 1, title: 'Giải thích từ ‘加油’', timestamp: '10:24', query: 'Giải thích từ ‘加油’' },
  { id: 2, title: 'Viết email xin việc tiếng Trung', timestamp: 'Hôm qua', query: 'Viết email xin việc tiếng Trung' },
  { id: 3, title: 'Dịch hợp đồng sang tiếng Trung', timestamp: 'Hôm qua', query: 'Dịch hợp đồng sang tiếng Trung' },
  { id: 4, title: 'Luyện hội thoại ở nhà hàng', timestamp: '20/09', query: 'Luyện hội thoại ở nhà hàng' },
  { id: 5, title: 'Cấu trúc “虽然...但是...”', timestamp: '18/09', query: 'Cấu trúc “虽然...但是...”' }
];

let activeMessages = [
  {
    sender: 'ai',
    timestamp: 'Vừa xong',
    text: `你好！我是 **Hanzo ChatGPT AI Assistant** 🤖✨

Tôi là Trợ lý Trí tuệ Nhân tạo chuyên biệt cho học tiếng Trung & Tiếng Trung Công sở.`
  }
];

export function renderChatGPTView(container) {
  let isGenerating = false;

  const renderView = () => {
    const suggestedPrompts = suggestedPromptSets[currentPromptSetIndex];

    const htmlContent = `
      <div class="space-y-6 pb-12 animate-fade-in relative max-w-7xl mx-auto">
        
        <!-- TOP SEARCH BAR & USER PROFILE -->
        <div class="bg-white rounded-2xl p-3.5 sm:px-6 sm:py-3 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
          <div class="relative flex-1 max-w-xl">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input type="text" id="top-search-input" class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/70 border border-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-crimson focus:bg-white transition" placeholder="Tìm chủ đề, từ vựng, ngữ pháp, văn hóa, ..." />
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button class="p-2 rounded-xl hover:bg-slate-100 text-slate-500 relative transition cursor-pointer" title="Thông báo">
              🔔
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson"></span>
            </button>

            <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div class="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition">
              <img src="./images/chibi_mascot.png" alt="Avatar" class="w-8 h-8 rounded-full border border-rose-200 object-cover" />
              <div class="hidden sm:block text-left">
                <div class="text-xs font-black text-slate-800 leading-tight">Nguyễn Minh Anh</div>
                <div class="text-[10px] text-slate-400 font-medium">Học viên</div>
              </div>
              <span class="text-xs text-slate-400">∨</span>
            </div>
          </div>
        </div>

        ${currentViewMode === 'landing' ? renderLandingHTML(suggestedPrompts) : renderChatHTML()}

      </div>
    `;

    container.innerHTML = htmlContent;
    if (currentViewMode === 'chat') scrollToBottom();
    bindEvents();
  };

  const renderLandingHTML = (suggestedPrompts) => {
    return `
      <!-- 2-COLUMN MAIN CONTENT LAYOUT -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- LEFT COLUMN: HERO + CARDS MATRIX + INPUT (8 Cols) -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- HERO ROBOT CONTAINER -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs text-center relative overflow-hidden">
            
            <!-- ROBOT SVG ILLUSTRATION -->
            <div class="w-36 h-36 mx-auto mb-4 relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-md">
                <circle cx="100" cy="100" r="85" fill="#FFEFEF" />
                
                <rect x="25" y="45" width="40" height="25" rx="8" fill="#FFD1D1" opacity="0.8" />
                <line x1="33" y1="53" x2="57" y2="53" stroke="#D90429" stroke-width="3" stroke-linecap="round" />
                <line x1="33" y1="60" x2="48" y2="60" stroke="#D90429" stroke-width="3" stroke-linecap="round" />
                
                <rect x="135" y="55" width="40" height="25" rx="8" fill="#FFD1D1" opacity="0.8" />
                <line x1="143" y1="63" x2="167" y2="63" stroke="#D90429" stroke-width="3" stroke-linecap="round" />
                <line x1="143" y1="70" x2="158" y2="70" stroke="#D90429" stroke-width="3" stroke-linecap="round" />

                <line x1="100" y1="50" x2="100" y2="35" stroke="#D90429" stroke-width="4" stroke-linecap="round" />
                <circle cx="100" cy="32" r="7" fill="#D90429" />

                <rect x="55" y="50" width="90" height="75" rx="28" fill="#FFFFFF" stroke="#D90429" stroke-width="5" />
                
                <rect x="42" y="70" width="14" height="35" rx="6" fill="#D90429" />
                <rect x="144" y="70" width="14" height="35" rx="6" fill="#D90429" />

                <rect x="68" y="62" width="64" height="42" rx="16" fill="#2B2D42" />

                <circle cx="84" cy="80" r="7" fill="#FF4D6D" />
                <circle cx="116" cy="80" r="7" fill="#FF4D6D" />
                <circle cx="86" cy="78" r="2.5" fill="#FFFFFF" />
                <circle cx="118" cy="78" r="2.5" fill="#FFFFFF" />

                <path d="M 92 90 Q 100 96 108 90" stroke="#FF4D6D" stroke-width="3" stroke-linecap="round" fill="none" />

                <circle cx="76" cy="90" r="4" fill="#FF8FA3" opacity="0.8" />
                <circle cx="124" cy="90" r="4" fill="#FF8FA3" opacity="0.8" />

                <path d="M 75 125 L 125 125 L 120 160 L 80 160 Z" fill="#FFFFFF" stroke="#D90429" stroke-width="4" />
                
                <circle cx="100" cy="142" r="11" fill="#D90429" />
                <text x="100" y="146" font-family="sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">汉</text>
              </svg>
            </div>

            <!-- TITLE & SUBTITLE -->
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              <span class="text-crimson">Hỏi GPT</span> – Học tiếng Trung dễ dàng hơn
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto mt-2 leading-relaxed">
              Tìm hiểu từ vựng, ngữ pháp, dịch, văn hóa, luyện hội thoại...<br class="hidden sm:inline" />
              với trợ lý AI, hỗ trợ tiếng Việt, tiếng Trung và tiếng Anh.
            </p>
          </div>

          <!-- CATEGORY FILTER TABS -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'all' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="all">
              <span class="mr-1">🔴</span> Tất cả
            </button>
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'vocab' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="vocab">
              <span class="mr-1">📖</span> Từ vựng
            </button>
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'grammar' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="grammar">
              <span class="mr-1">📄</span> Ngữ pháp
            </button>
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'translate' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="translate">
              <span class="mr-1">🔤</span> Dịch thuật
            </button>
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'dialog' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="dialog">
              <span class="mr-1">💬</span> Hội thoại
            </button>
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'culture' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="culture">
              <span class="mr-1">🏛️</span> Văn hóa
            </button>
            <button class="btn-category-tab px-4 py-2 rounded-xl ${activeCategory === 'study' ? 'bg-crimson text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} cursor-pointer shrink-0 transition" data-cat="study">
              <span class="mr-1">🎓</span> Học tập
            </button>
          </div>

          <!-- 2x3 FEATURE CARDS MATRIX -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <!-- Card 1 -->
            <div class="btn-feature-card bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center gap-3.5 group" data-prompt="Giải thích chi tiết nghĩa, cách dùng và ví dụ cho từ vựng tiếng Trung...">
              <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-110 transition">
                📙
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-800 group-hover:text-crimson transition">Giải thích từ vựng</h3>
                <p class="text-[11px] text-slate-400 font-medium">Giải thích nghĩa, cách dùng, ví dụ</p>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="btn-feature-card bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center gap-3.5 group" data-prompt="Giải thích cấu trúc ngữ pháp “如果...就...” trong tiếng Trung kèm ví dụ.">
              <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-110 transition">
                📄
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-800 group-hover:text-crimson transition">Ngữ pháp tiếng Trung</h3>
                <p class="text-[11px] text-slate-400 font-medium">Giải thích cấu trúc, cách sử dụng</p>
              </div>
            </div>

            <!-- Card 3 -->
            <div class="btn-feature-card bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center gap-3.5 group" data-prompt="Dịch đoạn văn sau sang tiếng Trung: “Tôi sẽ đi Trung Quốc vào tháng sau.”">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-110 transition">
                🔤
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-800 group-hover:text-crimson transition">Dịch đoạn văn</h3>
                <p class="text-[11px] text-slate-400 font-medium">Dịch Trung – Việt – Anh</p>
              </div>
            </div>

            <!-- Card 4 -->
            <div class="btn-feature-card bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center gap-3.5 group" data-prompt="Tạo 10 câu hội thoại giao tiếp tiếng Trung mẫu khi đặt phòng khách sạn.">
              <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-110 transition">
                💬
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-800 group-hover:text-crimson transition">Luyện hội thoại</h3>
                <p class="text-[11px] text-slate-400 font-medium">Tạo đoạn hội thoại theo tình huống</p>
              </div>
            </div>

            <!-- Card 5 -->
            <div class="btn-feature-card bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center gap-3.5 group" data-prompt="Viết một đoạn văn giới thiệu bản thân bằng tiếng Trung chuẩn công sở.">
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-110 transition">
                📝
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-800 group-hover:text-crimson transition">Viết đoạn văn</h3>
                <p class="text-[11px] text-slate-400 font-medium">Viết email, bài luận, tin nhắn...</p>
              </div>
            </div>

            <!-- Card 6 -->
            <div class="btn-feature-card bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center gap-3.5 group" data-prompt="Tìm hiểu ý nghĩa của lễ hội Trung Thu trong văn hóa Trung Quốc.">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg font-black shrink-0 group-hover:scale-110 transition">
                🏛️
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-800 group-hover:text-crimson transition">Tìm hiểu văn hóa</h3>
                <p class="text-[11px] text-slate-400 font-medium">Phong tục, ẩm thực, du lịch Trung Quốc</p>
              </div>
            </div>

          </div>

          <!-- PROMPT INPUT CARD AT BOTTOM -->
          <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <form id="landing-input-form" class="space-y-3">
              <textarea id="landing-user-input" rows="2" class="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none resize-none" placeholder="Nhập câu hỏi của bạn..."></textarea>
              
              <!-- TOOLBAR ROW -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                
                <!-- Left Tools -->
                <div class="flex items-center gap-3">
                  <button type="button" id="btn-add-attachment-plus" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-base flex items-center justify-center transition cursor-pointer" title="Thêm tùy chọn">
                    +
                  </button>

                  <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                    <button type="button" id="btn-toggle-web-search" class="w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${isWebSearchEnabled ? 'bg-crimson' : 'bg-slate-300'}">
                      <div class="w-4 h-4 rounded-full bg-white transition-transform ${isWebSearchEnabled ? 'translate-x-4' : 'translate-x-0'}"></div>
                    </button>
                    <span class="text-xs font-bold text-slate-700 flex items-center gap-1">
                      🌐 Tìm kiếm web
                    </span>
                  </div>

                  <button type="button" id="btn-attach-file" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
                    <span>📎</span> Tệp đính kèm
                  </button>
                </div>

                <!-- Right Tools -->
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <select id="select-ai-model" class="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-2 pl-3 pr-7 rounded-xl outline-none cursor-pointer transition">
                      <option value="GPT-4o" ${selectedModel === 'GPT-4o' ? 'selected' : ''}>⚙️ GPT-4o</option>
                      <option value="GPT-4o Mini" ${selectedModel === 'GPT-4o Mini' ? 'selected' : ''}>⚡ GPT-4o Mini</option>
                      <option value="Claude 3.5" ${selectedModel === 'Claude 3.5' ? 'selected' : ''}>🧠 Claude 3.5 Sonnet</option>
                    </select>
                    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-2xs text-slate-500 pointer-events-none">∨</span>
                  </div>

                  <button type="submit" class="w-9 h-9 rounded-full bg-crimson hover:bg-red-700 text-white flex items-center justify-center text-sm shadow-md hover:shadow-lg transition cursor-pointer transform hover:scale-105 shrink-0" title="Gửi câu hỏi">
                    🚀
                  </button>
                </div>

              </div>
            </form>
          </div>

        </div>

        <!-- RIGHT COLUMN: SUGGESTED QUESTIONS + CHAT HISTORY (4 Cols) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- SECTION 1: GỢI Ý CÂU HỎI -->
          <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <span class="text-amber-500 text-base">💡</span> Gợi ý câu hỏi
              </div>
              <button id="btn-refresh-suggestions" class="text-2xs font-extrabold text-slate-400 hover:text-crimson flex items-center gap-1 transition cursor-pointer">
                <span>🔄</span> Đổi gợi ý
              </button>
            </div>

            <div class="space-y-2.5" id="suggested-prompts-container">
              ${suggestedPrompts.map(prompt => `
                <div class="btn-prompt-row p-3 rounded-2xl bg-slate-50/80 hover:bg-rose-50/70 border border-slate-100 hover:border-rose-200 text-xs font-semibold text-slate-700 hover:text-crimson flex items-center justify-between gap-2 transition cursor-pointer group" data-prompt="${escapeHtml(prompt)}">
                  <span class="leading-snug">${escapeHtml(prompt)}</span>
                  <span class="text-slate-300 group-hover:text-crimson font-bold text-xs transition">›</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SECTION 2: LỊCH SỬ TRÒ CHUYỆN -->
          <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <span class="text-crimson text-base">🕒</span> Lịch sử trò chuyện
              </div>
              <button id="btn-view-all-history" class="text-2xs font-extrabold text-crimson hover:underline cursor-pointer">
                Xem tất cả →
              </button>
            </div>

            <div class="space-y-2">
              ${chatHistory.map(item => `
                <div class="btn-history-item p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer group" data-id="${item.id}" data-query="${escapeHtml(item.query || item.title)}">
                  <div class="flex items-center gap-2.5 overflow-hidden">
                    <span class="text-slate-400 group-hover:text-crimson transition">💬</span>
                    <span class="truncate group-hover:text-slate-900">${escapeHtml(item.title)}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-medium shrink-0 ml-2">${item.timestamp}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;
  };

  const renderChatHTML = () => {
    return `
      <!-- ACTIVE CHAT STREAM VIEW -->
      <div class="space-y-4">
        
        <!-- BACK & CONTROL HEADER BAR -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex-wrap gap-3">
          <button id="btn-back-to-landing" class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer">
            <span>←</span> Quay lại trang tìm kiếm
          </button>

          <div class="flex items-center gap-2">
            <button id="btn-open-official-chatgpt" class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-crimson border border-rose-200 text-xs font-black transition cursor-pointer flex items-center gap-1.5" title="Mở trang web ChatGPT chính thức">
              <span>🌐 Mở ChatGPT.com</span>
              <span>↗</span>
            </button>
            <span class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-2xs font-black border border-rose-200">
              ⚙️ ${selectedModel}
            </span>
            <button id="btn-new-chat-session" class="px-3.5 py-2 rounded-xl bg-crimson hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer">
              ➕ Đoạn chat mới
            </button>
          </div>
        </div>

        <!-- MAIN CHAT STREAM BOX -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[600px]">
          
          <div id="chat-messages-container" class="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
            ${activeMessages.map(msg => {
              const isUser = msg.sender === 'user';
              return `
                <div class="flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in">
                  
                  <div class="w-9 h-9 rounded-2xl ${isUser ? 'bg-slate-800 text-white shadow-slate-300' : 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-rose-200'} flex items-center justify-center text-sm font-black shrink-0 shadow-md">
                    ${isUser ? '👤' : '🤖'}
                  </div>

                  <div class="max-w-[85%] sm:max-w-[75%] space-y-1">
                    <div class="flex items-center gap-2 ${isUser ? 'justify-end' : ''}">
                      <span class="text-2xs font-extrabold ${isUser ? 'text-slate-700' : 'text-crimson'}">
                        ${isUser ? 'Bạn' : 'ChatGPT AI Assistant'}
                      </span>
                      <span class="text-[10px] font-medium text-slate-400">${msg.timestamp}</span>
                    </div>

                    <div class="p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${isUser ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white rounded-tr-xs shadow-md' : 'bg-white border border-rose-100/90 text-slate-800 rounded-tl-xs shadow-2xs'} space-y-2">
                      ${formatMessageText(msg.text)}
                    </div>
                  </div>

                </div>
              `;
            }).join('')}

            ${isGenerating ? `
              <div class="flex items-start gap-3.5 animate-fade-in">
                <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md">
                  🤖
                </div>
                <div class="p-4 rounded-3xl rounded-tl-xs bg-rose-50/60 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2 shadow-2xs">
                  <span class="w-2 h-2 rounded-full bg-crimson animate-ping"></span>
                  <span>ChatGPT đang dịch thuật & suy luận câu trả lời...</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- INPUT FORM BAR -->
          <div class="p-3 sm:p-4 bg-white border-t border-slate-100">
            <form id="chat-input-form" class="flex items-center gap-2">
              <div class="relative flex-1">
                <input type="text" id="chat-user-input" class="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 rounded-2xl px-4 py-3.5 pr-10 outline-none focus:border-crimson focus:bg-white transition" placeholder="Nhập câu hỏi, từ vựng hoặc đoạn văn..." autocomplete="off" />
                <button type="button" id="btn-speech-mic" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-crimson p-1 font-bold transition cursor-pointer" title="Đọc tìm kiếm">
                  🎙️
                </button>
              </div>

              <button type="submit" id="btn-send-chat" class="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-200 hover:shadow-lg transition cursor-pointer flex items-center gap-2 shrink-0">
                <span>Gửi</span>
                <span>🚀</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    `;
  };

  const executeQuery = (query) => {
    if (!query) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    activeMessages.push({
      sender: 'user',
      timestamp: timeStr,
      text: query
    });

    currentViewMode = 'chat';
    isGenerating = true;
    renderView();

    setTimeout(() => {
      const aiAnswer = generateAIAnswer(query);
      activeMessages.push({
        sender: 'ai',
        timestamp: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        text: aiAnswer
      });
      isGenerating = false;
      renderView();
    }, 700);
  };

  const bindEvents = () => {
    // Top Search Input
    const topSearch = container.querySelector('#top-search-input');
    topSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = topSearch.value.trim();
        if (val) executeQuery(val);
      }
    });

    // Refresh Suggested Prompts
    container.querySelector('#btn-refresh-suggestions')?.addEventListener('click', () => {
      currentPromptSetIndex = (currentPromptSetIndex + 1) % suggestedPromptSets.length;
      renderView();
    });

    // Toggle Web Search
    container.querySelector('#btn-toggle-web-search')?.addEventListener('click', () => {
      isWebSearchEnabled = !isWebSearchEnabled;
      renderView();
    });

    // Model Selector Change
    container.querySelector('#select-ai-model')?.addEventListener('change', (e) => {
      selectedModel = e.target.value;
    });

    // Category Tabs
    container.querySelectorAll('.btn-category-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.currentTarget.dataset.cat;
        renderView();
      });
    });

    // Feature Cards
    container.querySelectorAll('.btn-feature-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const prompt = e.currentTarget.dataset.prompt;
        if (prompt) executeQuery(prompt);
      });
    });

    // Suggested Prompt Rows
    container.querySelectorAll('.btn-prompt-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const prompt = e.currentTarget.dataset.prompt;
        if (prompt) executeQuery(prompt);
      });
    });

    // History Items
    container.querySelectorAll('.btn-history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        const query = e.currentTarget.dataset.query;
        const hist = chatHistory.find(h => h.id === id);
        if (query) {
          executeQuery(query);
        } else if (hist) {
          executeQuery(hist.title);
        }
      });
    });

    // Submit Landing Form
    container.querySelector('#landing-input-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = container.querySelector('#landing-user-input');
      const query = input?.value.trim();
      if (query) executeQuery(query);
    });

    // Back to Landing Page
    container.querySelector('#btn-back-to-landing')?.addEventListener('click', () => {
      currentViewMode = 'landing';
      renderView();
    });

    // Open Official ChatGPT
    container.querySelector('#btn-open-official-chatgpt')?.addEventListener('click', () => {
      const lastUserMsg = activeMessages.slice().reverse().find(m => m.sender === 'user');
      const q = lastUserMsg ? lastUserMsg.text : '';
      const url = q ? `https://chatgpt.com/?q=${encodeURIComponent(q)}` : 'https://chatgpt.com';
      window.open(url, '_blank');
    });

    // New Chat Session
    container.querySelector('#btn-new-chat-session')?.addEventListener('click', () => {
      activeMessages = [
        {
          sender: 'ai',
          timestamp: 'Vừa xong',
          text: `你好！Đoạn trò chuyện mới đã sẵn sàng. Bạn muốn đặt câu hỏi gì tiếp theo?`
        }
      ];
      renderView();
    });

    // Submit Active Chat Form
    container.querySelector('#chat-input-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = container.querySelector('#chat-user-input');
      const query = input?.value.trim();
      if (query && !isGenerating) {
        input.value = '';
        executeQuery(query);
      }
    });

    // Speech Mic
    container.querySelector('#btn-speech-mic')?.addEventListener('click', () => {
      alert('Vui lòng nói câu hỏi tiếng Trung hoặc tiếng Việt vào micro thiết bị của bạn!');
    });

    // TTS speaker buttons
    container.querySelectorAll('.btn-speak-text').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.dataset.text;
        if (text) speakChinese(text, 0.85);
      });
    });

    // Attachment buttons
    container.querySelector('#btn-attach-file')?.addEventListener('click', () => {
      alert('Tải lên tệp tài liệu PDF, DOCX, XLSX hoặc ảnh tiếng Trung để AI phân tích.');
    });

    container.querySelector('#btn-add-attachment-plus')?.addEventListener('click', () => {
      alert('Đã mở menu tùy chọn mở rộng: Chụp ảnh trực tiếp, Dịch hình ảnh OCR, Tải file âm thanh.');
    });
  };

  const scrollToBottom = () => {
    const box = container.querySelector('#chat-messages-container');
    if (box) box.scrollTop = box.scrollHeight;
  };

  renderView();
}

function formatMessageText(text) {
  if (!text) return '';
  let formatted = escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  const zhMatches = text.match(/[\u4e00-\u9fa5]{2,}/g);
  if (zhMatches) {
    const uniqueZh = [...new Set(zhMatches)];
    uniqueZh.forEach(zh => {
      const tag = `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-rose-50 text-crimson font-extrabold border border-rose-200 hover:bg-rose-100 transition cursor-pointer btn-speak-text" data-text="${escapeHtml(zh)}" title="Bấm để nghe phát âm"><span>🔊</span>${escapeHtml(zh)}</span>`;
      formatted = formatted.replace(new RegExp(escapeHtml(zh), 'g'), tag);
    });
  }

  return formatted;
}

function generateAIAnswer(query) {
  const q = query.trim().toLowerCase();

  // 1. Translation: "Tôi sẽ đi Trung Quốc vào tháng sau"
  if (q.includes('tôi sẽ đi trung quốc vào tháng sau')) {
    return `### 🔤 Bản dịch Trung - Việt - Anh chuẩn xác:

**Câu gốc**: *"Tôi sẽ đi Trung Quốc vào tháng sau."*

- 🇨🇳 **Tiếng Trung (Giản thể)**: 我下个月要去中国。
- 🗣️ **Phiên âm Pinyin**: Wǒ xià gè yuè yào qù Zhōngguó.
- 🇬🇧 **Tiếng Anh**: I will go to China next month.

👉 **Phân tích từ vựng & cấu trúc**:
- **我 (wǒ)**: Tôi (Chủ ngữ).
- **下个月 (xià gè yuè)**: Tháng sau (Trạng ngữ chỉ thời gian).
- **要 (yào)**: Sẽ / Có kế hoạch (Biểu thị dự định).
- **去 (qù)**: Đi.
- **中国 (Zhōngguó)**: Trung Quốc.`;
  }

  // 2. Translation general
  if (q.includes('dịch') || q.includes('translate')) {
    return `### 🔤 Dịch thuật chuẩn xác từ ChatGPT Hán Ngữ:

**Yêu cầu của bạn**: "${query}"

1. **Bản dịch Tiếng Trung Giản thể**:
   👉 **表达为**: 我会按时完成这项任务。
   *(Wǒ huì ànshí wánchéng zhè xiàng rènwu.)*
   👉 **Dịch nghĩa**: *Tôi sẽ hoàn thành nhiệm vụ này đúng hạn.*

2. **Dịch Tiếng Trung Công sở (Thương mại)**:
   - 商业表达: 我将按照计划推进此项目。
   *(Wǒ jiāng ànzào jìhuà tuījìn cǐ xiàngmù.)*

3. **Từ vựng cốt lõi**:
   - 按时 (ànshí): Đúng giờ / Đúng hạn.
   - 完成 (wánchéng): Hoàn thành.`;
  }

  // 3. Grammar: "Nếu... thì..."
  if (q.includes('如果') || q.includes('就') || q.includes('ngữ pháp')) {
    return `### 📄 Giải thích cấu trúc Ngữ pháp “如果...就...” (Rúguǒ... jiù...):

**Công thức chuẩn**: 
\`Chủ ngữ + 如果 + Điều kiện giả định, Chủ ngữ + 就 + Kết quả\`
*(Nghĩa: Nếu... thì...)*

**3 Ví dụ thực tế giao tiếp & công sở**:
1. 如果你明天有空，我们就一起去喝茶。
   *(Rúguǒ nǐ míngtiān yǒu kòng, wǒmen jiù yìqǐ qù hē chá.)*
   👉 **Nghĩa**: *Nếu ngày mai bạn rảnh, chúng ta sẽ cùng đi uống trà.*
2. 如果客户有疑问，你就给他们发这封邮件。
   *(Rúguǒ kèhù yǒu yíwèn, nǐ jiù gěi tāmen fā zhè fēng yóujiàn.)*
   👉 **Nghĩa**: *Nếu khách hàng có thắc mắc, bạn cứ gửi email này cho họ.*
3. 如果下雨，我们就改天再去。
   *(Rúguǒ xià yǔ, wǒmen jiù gǎi tiān zài qù.)*
   👉 **Nghĩa**: *Nếu trời mưa, chúng ta sẽ chuyển sang ngày khác đi.*`;
  }

  // 4. Vocabulary: "你好"
  if (q.includes('你好') || q.includes('có nghĩa là gì') || q.includes('là gì')) {
    return `### 💡 Phân tích chi tiết câu chào “你好” (nǐ hǎo):

1. **Nghĩa chuẩn**: **Xin chào! / Chào bạn!**
2. **Cấu tạo từ**:
   - 你 (nǐ): Bạn, anh, chị (ngôi thứ 2 số ít).
   - 好 (hǎo): Tốt, an lành.
3. **Các biến thể phổ biến**:
   - 您好 (nín hǎo): Kính chào (chào sếp, khách hàng, người lớn tuổi).
   - 你们好 (nǐmen hǎo): Chào các bạn (số nhiều).
   - 大家好 (dàjiā hǎo): Chào tất cả mọi người.`;
  }

  // Default response
  return `### 🤖 Trả lời từ Hỏi GPT AI Assistant:

Cảm ơn bạn đã đặt câu hỏi về: **"${query}"**

1. **Giải đáp chi tiết**:
   - Thắc mắc của bạn là một chủ đề rất thực tế trong giao tiếp tiếng Trung & Hán Ngữ Công sở.
   - 关于 **"${query}"**，在中文里我们可以这样表达：

2. **Mẫu câu tiếng Trung tham khảo**:
   - 请问这个怎么表达？ *(Qǐngwèn zhège zěnme biǎodá?)* 👉 *Xin hỏi cái này diễn đạt như thế nào?*
   - 非常感谢你的帮助！ *(Fēicháng gǎnxiè nǐ de bāngzhù!)* 👉 *Rất cảm ơn sự giúp đỡ của bạn!*

3. **Gợi ý học tập**: Bấm biểu tượng 🔊 bên dưới để nghe phát âm giọng đọc chuẩn AI!`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
