// Module 1: Quản lý & Tạo Bộ Chủ Đề Từ Vựng Tùy Chỉnh & HSK (topicsView.js)
import { getAllTopicsList, saveCustomTopic, deleteCustomTopic, resetPresetTopic, markPresetDeleted, syncTopicWordsToDictionary } from '../utils/srs.js';
import { speakChinese } from '../utils/speech.js';
import { normalizePinyin, lookupPinyinForHanzi, lookupHanVietForHanzi } from '../utils/pinyinUtils.js';

const ICON_LIBRARY_CATEGORIES = [
  {
    title: '📚 Học Tập & Thi Cử',
    icons: ['📚', '🎓', '✍️', '📖', '📝', '🎯', '💡', '🏫', '🏆', '📑', '🧠', '🔬', '📊', '📅', '📌']
  },
  {
    title: '💬 Giao Tiếp & Đời Sống',
    icons: ['💬', '🗣️', '🤝', '🏠', '☕', '🍎', '🛒', '🚗', '✈️', '🏨', '🍲', '🍜', '🧋', '🎁', '🎉']
  },
  {
    title: '⛩️ Văn Hóa & Du Lịch Trung Hoa',
    icons: ['⛩️', '🏮', '🐉', '🥮', '🍵', '🇨🇳', '🗺️', '🧳', '🏙️', '⛰️', '📸', '🎫', '🚂', '🌊', '🌸']
  },
  {
    title: '🏢 Công Sở & Kinh Doanh',
    icons: ['💼', '📈', '🖥️', '✉️', '💰', '🏢', '📞', '⚖️', '💳', '🗂️', '🖊️', '🔍', '⚙️', '🔒', '🔑']
  },
  {
    title: '🎵 Giải Trí & Nghệ Thuật',
    icons: ['🎵', '🎨', '🎬', '🎮', '🧧', '✨', '⭐', '🔥', '❤️', '🌟', '🎧', '🎤', '🎪', '⚽', '🍀']
  }
];

export function renderTopicsView(container, onStartPracticeCallback) {
  const allTopics = getAllTopicsList();
  const categories = getUniqueCategories(allTopics);

  container.innerHTML = `
    <div class="view-header flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
      <div>
        <h1 class="text-gradient flex items-center gap-2.5">
          <svg class="w-8 h-8 text-red-600 shrink-0 inline-block align-middle" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <span>Bộ chủ đề từ vựng</span>
        </h1>
        <p class="text-slate-500 text-xs mt-1 font-medium">Khám phá, quản lý và tìm kiếm bộ từ vựng học tiếng Trung theo chủ đề</p>
      </div>
      <div class="flex gap-2 flex-wrap items-center">
        <button id="btn-sync-all-topics-to-hsk" class="btn btn-secondary shadow-xs font-bold text-xs bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer transition" title="Tự động đồng bộ toàn bộ từ vựng chủ đề vào Từ điển HSK">
          <span>🔄 Cập Nhật Từ Vựng Vào Từ Điển HSK</span>
        </button>
        <button id="btn-create-topic" class="btn btn-primary shadow-glow">
          <span class="icon">✨</span> Tạo Bộ Từ Vựng Mới
        </button>
        <input type="file" id="file-modal-excel-input" accept=".xlsx, .xls, .csv" style="display: none;" />
      </div>
    </div>

    <!-- Search & Filter Controls Toolbar -->
    <div class="glass-panel p-3.5 md:p-4 mb-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white/90 backdrop-blur-md">
      <!-- Search Input Box -->
      <div class="relative flex-1 min-w-[260px]">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <input type="text" id="input-search-topic" class="form-control pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 w-full transition bg-slate-50/50 hover:bg-white focus:bg-white" placeholder="🔍 Tìm kiếm theo tên bộ từ vựng, mô tả, tag (HSK, Giao tiếp...)" />
        <button type="button" id="btn-clear-search-topic" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-600 transition cursor-pointer font-bold text-sm" title="Xóa từ khóa">
          ✕
        </button>
      </div>

      <!-- Tag Filter Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0" id="topic-filter-chips-container">
        ${categories.map((cat, idx) => `
          <button type="button" class="topic-filter-chip ${idx === 0 ? 'active' : ''} px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border select-none" data-cat="${escapeHtml(cat)}">
            ${cat === 'Tất cả' ? '🌟 Tất cả' : (cat === 'HSK' ? '📌 HSK' : (cat === 'Tùy chỉnh' ? '⚙️ Tùy chỉnh' : `🏷️ ${escapeHtml(cat)}`))}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Search Status Bar -->
    <div class="flex justify-between items-center mb-4 px-1 text-xs text-slate-500 font-medium" id="search-status-bar">
      <div>
        Hiển thị <span id="visible-topics-count" class="font-bold text-red-600">${allTopics.length}</span> / <span id="total-topics-count" class="font-bold text-slate-800">${allTopics.length}</span> bộ chủ đề
      </div>
      <div id="search-keyword-badge" class="hidden items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-2xs shadow-2xs">
        <span>Từ khóa:</span> <span id="search-keyword-text" class="text-red-600"></span>
      </div>
    </div>

    <!-- Topic Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="topics-grid">
      ${allTopics.map(t => renderTopicCard(t)).join('')}
    </div>

    <!-- Modal Tạo / Chỉnh Sửa Topic -->
    <div id="topic-modal" class="modal-overlay hidden">
      <div class="modal-card w-[96vw] max-w-6xl h-[92vh] max-h-[92vh] flex flex-col p-5 md:p-6 shadow-2xl">
        <div class="modal-header flex justify-between align-center border-b border-slate-200 pb-3 mb-3 shrink-0">
          <h2 id="modal-title" class="text-lg md:text-xl font-black text-slate-900">✨ Tạo Bộ Từ Vựng Tùy Chỉnh</h2>
          <button class="btn-close text-slate-400 hover:text-red-600 text-2xl font-bold cursor-pointer" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
          <form id="topic-form" class="flex flex-col flex-1 min-h-0 h-full">
            <input type="hidden" id="form-topic-id" />
            
            <!-- Row 1: Tên bộ từ vựng, Tag nhận diện, Biểu tượng Icon xếp cùng 1 hàng -->
            <div class="form-row-compact shrink-0 mb-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div class="form-group-name">
                <label class="form-label font-bold text-xs mb-1 block text-slate-700">Tên bộ từ vựng *</label>
                <input type="text" id="form-topic-name" class="form-control form-control-sm font-bold text-red-600" placeholder="Ví dụ: HSK 1 - Bài 2..." required />
              </div>

              <div class="form-group-tag">
                <label class="form-label font-bold text-xs mb-1 block text-slate-700">Tag nhận diện</label>
                <input type="text" id="form-topic-category" class="form-control form-control-sm font-medium" placeholder="Ví dụ: Giáo trình..." />
              </div>

              <div class="form-group-icon">
                <label class="form-label font-bold text-xs mb-1 block text-slate-700">Biểu tượng (Icon)</label>
                <div class="flex align-center gap-1.5">
                  <div id="icon-preview-display" class="topic-icon cursor-pointer hover:scale-105 transition-transform bg-white rounded-lg border border-slate-200 flex items-center justify-center" style="width: 34px; height: 34px; font-size: 1.1rem; flex-shrink: 0;" title="Bấm để mở thư viện icon">
                    📑
                  </div>
                  <input type="hidden" id="form-topic-icon" value="📑" />
                  <button type="button" id="btn-toggle-icon-picker" class="btn btn-sm btn-secondary font-bold text-xs px-2.5 py-1.5 whitespace-nowrap" style="flex: 1;">
                    🎨 Thư Viện
                  </button>
                </div>
              </div>

              <div class="w-full mt-2">
                <label class="form-label font-bold text-xs mb-1 block text-slate-700">Mô tả ngắn</label>
                <input type="text" id="form-topic-desc" class="form-control form-control-sm text-xs" placeholder="Mô tả bộ từ vựng..." />
              </div>
            </div>

            <!-- Icon Picker Grid Popover -->
            <div id="icon-picker-grid" class="hidden shrink-0 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-52 overflow-y-auto space-y-2">
              ${ICON_LIBRARY_CATEGORIES.map(cat => `
                <div>
                  <h5 class="text-xs font-bold text-amber-700 mb-1">${escapeHtml(cat.title)}</h5>
                  <div class="flex flex-wrap gap-1">
                    ${cat.icons.map(icon => `
                      <button type="button" class="icon-chip-btn" data-icon="${escapeHtml(icon)}" style="width: 32px; height: 32px; font-size: 1.1rem;" title="Chọn icon ${escapeHtml(icon)}">
                        ${escapeHtml(icon)}
                      </button>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Section: Danh sách từ vựng -->
            <div class="form-group flex-1 min-h-0 flex flex-col mb-2">
              <div class="flex justify-between items-center mb-2 shrink-0">
                <label class="form-label font-black text-xs md:text-sm text-slate-800 mb-0 flex items-center gap-1.5">
                  <span>📖 Danh sách từ vựng trong bộ này</span>
                </label>
                <div class="flex gap-2">
                  <button type="button" id="btn-modal-template-excel" class="btn btn-sm btn-secondary text-xs font-bold" title="Tải file mẫu Excel (.xlsx)">📄 Mẫu Excel</button>
                  <button type="button" id="btn-modal-import-excel" class="btn btn-sm btn-secondary text-xs font-bold">📊 Nhập từ Excel</button>
                  <button type="button" id="btn-add-word-row" class="btn btn-sm btn-primary text-xs font-black shadow-xs">+ Thêm Từ Mới</button>
                </div>
              </div>

              <div class="flex gap-2 text-xs font-black text-red-600 mb-2 pl-3.5 pr-8 shrink-0 items-center">
                <span style="flex: 1; min-width: 0;" class="px-1 truncate">Chữ Hán (漢字) *</span>
                <span style="flex: 1; min-width: 0;" class="px-1 truncate">Phiên âm (Pinyin)</span>
                <span style="flex: 1; min-width: 0;" class="px-1 truncate">Hán Việt</span>
                <span style="flex: 1.2; min-width: 0;" class="px-1 truncate">Nghĩa tiếng Việt *</span>
                <span style="width: 32px; flex-shrink: 0;"></span>
              </div>

              <div id="words-inputs-container" class="flex-1 min-h-[300px] overflow-y-auto space-y-2 pr-2 p-2 bg-slate-50/70 rounded-2xl border border-slate-200">
                <!-- Rows will be added dynamically -->
              </div>
            </div>

            <div class="modal-footer flex justify-end gap-3 pt-3 shrink-0 border-t border-slate-200">
              <button type="button" class="btn btn-secondary font-bold text-xs px-5 py-2" id="modal-cancel-btn">Hủy</button>
              <button type="submit" class="btn btn-primary font-black text-xs px-7 py-2 shadow-md hover:shadow-lg transition cursor-pointer">Lưu Bộ Từ Vựng</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Gán Sự Kiện (Event Listeners)
  setupTopicEvents(container, onStartPracticeCallback, allTopics);
}

function renderTopicCard(topic) {
  const isCustom = !topic.isPreset;
  const isEdited = !!topic.isEdited;
  const wordCount = topic.words ? topic.words.length : 0;
  const tagText = topic.category ? topic.category.trim() : (topic.isPreset ? 'HSK' : 'Tùy chỉnh');

  let badgeHtml = '';
  if (isCustom) {
    badgeHtml = '<span class="badge badge-amber">Tùy chỉnh</span>';
  } else if (isEdited) {
    badgeHtml = '<span class="badge badge-amber" style="background-color: #d97706; color: #fff;">HSK (Đã sửa)</span>';
  } else {
    badgeHtml = '<span class="badge badge-red">Có sẵn</span>';
  }

  const tagBadgeHtml = tagText ? `<span class="badge" style="background-color: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; font-weight: 700; text-transform: none;">🏷️ ${escapeHtml(tagText)}</span>` : '';

  // Build pink word chips matching sample image style
  const previewWords = (topic.words || []).slice(0, 4);
  const wordChipsHtml = previewWords.map(w => {
    const py = w.pinyin || '';
    const hv = w.hanviet ? w.hanviet.toUpperCase() : '';
    let subParts = [];
    if (py) subParts.push('<span class="pinyin-text font-pinyin">' + escapeHtml(py) + '</span>');
    if (hv) subParts.push('<span>' + escapeHtml(hv) + '</span>');
    const sub = subParts.join(' · ');
    return '<span class="word-chip-card" onclick="event.stopPropagation();window.speakZh(\'' + escapeHtml(w.hanzi) + '\')" title="Nghe phát âm">'
      + '<strong class="hanzi-font">' + escapeHtml(w.hanzi) + '</strong>'
      + (sub ? '<span class="word-chip-sub"> (' + sub + ')</span>' : '')
      + '</span>';
  }).join('');

  return `
    <div class="topic-card glass-panel flex flex-col justify-between" data-id="${topic.id}" data-cat="${escapeHtml(topic.category || 'Tùy chỉnh')}">
      <div>
        <div class="flex justify-between align-center mb-2">
          <span class="topic-icon">${topic.icon || '📌'}</span>
          <div class="flex align-center gap-1.5 flex-wrap justify-end">
            ${tagBadgeHtml}
            ${badgeHtml}
          </div>
        </div>
        <h3 class="topic-title text-xl font-bold mb-1">${escapeHtml(topic.name)}</h3>
        <p class="topic-desc text-sm text-muted mb-3">${escapeHtml(topic.description || '')}</p>

        <!-- Meta badges -->
        <div class="flex align-center gap-3 mb-3">
          <span class="topic-meta-badge"><span class="topic-meta-icon">📝</span> ${wordCount} từ vựng</span>
          <span class="topic-meta-badge"><span class="topic-meta-icon">⚡</span> SRS Luyện tập</span>
        </div>

        <!-- Preview words – pink chip grid -->
        <div class="word-chips-grid">
          ${wordChipsHtml}
          ${wordCount > 4 ? '<span class="word-chip-more">+' + (wordCount - 4) + ' từ nữa</span>' : ''}
        </div>
      </div>

      <div class="topic-actions flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
        <button class="btn-start-practice btn-3d-play flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-full text-white cursor-pointer select-none" data-id="${topic.id}">
          <span class="play-badge-icon">
            <svg class="w-3.5 h-3.5 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </span>
          <span class="text-xs font-black tracking-wide drop-shadow-2xs whitespace-nowrap">Luyện Tập Ngay</span>
          <svg class="w-4 h-4 text-white shrink-0 stroke-current ml-0.5" fill="none" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div class="flex items-center gap-1.5">
          <button class="btn-card-action btn-sync-topic-hsk w-9 h-9 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-700 hover:bg-amber-600 hover:text-white hover:border-amber-600 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer" data-id="${topic.id}" title="Tự động cập nhật toàn bộ từ vựng bộ này vào Từ điển HSK">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button class="btn-card-action btn-topic-stats w-9 h-9 rounded-xl bg-rose-50/90 border border-rose-200/90 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer" data-id="${topic.id}" title="Xem thống kê & tiến độ bộ từ vựng">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 13h3v6H5v-6zm5-5h3v11h-3V8zm5-4h3v15h-3V4z"/>
              <rect x="4" y="20" width="16" height="2" rx="1"/>
            </svg>
          </button>
          <button class="btn-card-action btn-export-excel w-9 h-9 rounded-xl bg-rose-50/90 border border-rose-200/90 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer" data-id="${topic.id}" title="Xuất file Excel (.xlsx)">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              <circle cx="17" cy="17" r="3.5" class="fill-red-600 stroke-none"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 19v-4m0 0l-1.5 1.5M17 15l1.5 1.5" class="stroke-white" stroke-width="1.8"/>
            </svg>
          </button>
          <button class="btn-card-action btn-edit-topic w-9 h-9 rounded-xl bg-rose-50/90 border border-rose-200/90 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer" data-id="${topic.id}" title="Chỉnh sửa bộ từ vựng">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              <rect x="4" y="21" width="16" height="1.5" rx="0.75" class="opacity-40"/>
            </svg>
          </button>
          <button class="btn-card-action btn-delete-topic w-9 h-9 rounded-xl bg-rose-50/90 border border-rose-200/90 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer" data-id="${topic.id}" title="${topic.isPreset ? (isEdited ? 'Khôi phục / Xóa bộ HSK' : 'Ẩn / Xóa bộ HSK') : 'Xóa bộ từ vựng'}">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              <path d="M9 10v7M12 10v7M15 10v7" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function setupTopicEvents(container, onStartPracticeCallback, allTopics) {
  window.speakZh = (text) => speakChinese(text);

  // Search & Filter Logic
  const inputSearch = container.querySelector('#input-search-topic');
  const btnClearSearch = container.querySelector('#btn-clear-search-topic');
  const filterChips = container.querySelectorAll('.topic-filter-chip');
  const visibleCountEl = container.querySelector('#visible-topics-count');
  const totalCountEl = container.querySelector('#total-topics-count');
  const keywordBadge = container.querySelector('#search-keyword-badge');
  const keywordText = container.querySelector('#search-keyword-text');
  const topicsGrid = container.querySelector('#topics-grid');

  let activeCategory = 'Tất cả';

  function performFilter() {
    const rawQuery = inputSearch ? inputSearch.value.trim() : '';
    const normQuery = removeVietnameseTones(rawQuery.toLowerCase());

    // Show/Hide Clear button
    if (btnClearSearch) {
      if (rawQuery.length > 0) {
        btnClearSearch.classList.remove('hidden');
      } else {
        btnClearSearch.classList.add('hidden');
      }
    }

    // Update keyword badge
    if (keywordBadge && keywordText) {
      if (rawQuery.length > 0) {
        keywordText.innerText = rawQuery;
        keywordBadge.classList.remove('hidden');
        keywordBadge.classList.add('flex');
      } else {
        keywordBadge.classList.add('hidden');
        keywordBadge.classList.remove('flex');
      }
    }

    const cards = container.querySelectorAll('.topic-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const topicId = card.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (!topic) return;

      const isCustom = !topic.isPreset;
      const catText = topic.category ? topic.category.trim() : (topic.isPreset ? 'HSK' : 'Tùy chỉnh');

      // 1. Tag / Category match
      let matchCat = false;
      if (activeCategory === 'Tất cả') {
        matchCat = true;
      } else if (activeCategory === 'Tùy chỉnh') {
        matchCat = isCustom || catText.toLowerCase().includes('tùy chỉnh');
      } else if (activeCategory === 'HSK') {
        matchCat = topic.isPreset || catText.toLowerCase().includes('hsk');
      } else {
        matchCat = catText.toLowerCase() === activeCategory.toLowerCase();
      }

      // 2. Keyword Search match (Name, Description, Tag/Category, or Word details)
      let matchKeyword = true;
      if (normQuery.length > 0) {
        const nameNorm = removeVietnameseTones((topic.name || '').toLowerCase());
        const descNorm = removeVietnameseTones((topic.description || '').toLowerCase());
        const tagNorm = removeVietnameseTones(catText.toLowerCase());

        // Also search in topic words (hanzi, pinyin, meaning, hanviet)
        const wordMatch = (topic.words || []).some(w => {
          const h = (w.hanzi || '').toLowerCase();
          const py = (w.pinyin || '').toLowerCase();
          const m = removeVietnameseTones((w.meaning || '').toLowerCase());
          const hv = removeVietnameseTones((w.hanviet || '').toLowerCase());
          return h.includes(normQuery) || py.includes(normQuery) || m.includes(normQuery) || hv.includes(normQuery);
        });

        matchKeyword = nameNorm.includes(normQuery) ||
                       descNorm.includes(normQuery) ||
                       tagNorm.includes(normQuery) ||
                       wordMatch;
      }

      if (matchCat && matchKeyword) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCountEl) visibleCountEl.innerText = visibleCount;
    if (totalCountEl) totalCountEl.innerText = allTopics.length;

    // Handle Empty State
    let emptyStateEl = topicsGrid.querySelector('#topics-empty-state');
    if (visibleCount === 0) {
      if (!emptyStateEl) {
        emptyStateEl = document.createElement('div');
        emptyStateEl.id = 'topics-empty-state';
        emptyStateEl.className = 'col-span-full py-12 px-4 text-center bg-slate-50/80 rounded-3xl border-2 border-dashed border-slate-200 my-4 shadow-2xs';
        topicsGrid.appendChild(emptyStateEl);
      }
      emptyStateEl.innerHTML = `
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">🔍</div>
        <h3 class="font-black text-slate-800 text-base mb-1">Không tìm thấy bộ chủ đề phù hợp</h3>
        <p class="text-slate-500 text-xs mb-4">Không có bộ từ vựng nào khớp với từ khóa "<span class="font-bold text-red-600">${escapeHtml(rawQuery)}</span>" ${activeCategory !== 'Tất cả' ? `thuộc tag "<span class="font-bold text-amber-600">${escapeHtml(activeCategory)}</span>"` : ''}</p>
        <button type="button" id="btn-reset-topic-search" class="btn btn-secondary font-bold text-xs py-2 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 transition shadow-2xs cursor-pointer">
          🔄 Xóa bộ lọc & Tìm lại
        </button>
      `;
      emptyStateEl.classList.remove('hidden');

      emptyStateEl.querySelector('#btn-reset-topic-search')?.addEventListener('click', () => {
        if (inputSearch) inputSearch.value = '';
        activeCategory = 'Tất cả';
        filterChips.forEach(c => {
          if (c.dataset.cat === 'Tất cả') {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
        performFilter();
      });
    } else if (emptyStateEl) {
      emptyStateEl.classList.add('hidden');
    }
  }

  // Event Listeners for Search Input
  if (inputSearch) {
    inputSearch.addEventListener('input', performFilter);
    inputSearch.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        inputSearch.value = '';
        performFilter();
      }
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (inputSearch) inputSearch.value = '';
      performFilter();
      inputSearch?.focus();
    });
  }

  // Event Listeners for Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat || 'Tất cả';
      performFilter();
    });
  });

  // Start Practice
  container.querySelectorAll('.btn-start-practice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (topic && onStartPracticeCallback) {
        onStartPracticeCallback(topic);
      }
    });
  });

  // Modal controls
  const modal = container.querySelector('#topic-modal');
  const btnCreate = container.querySelector('#btn-create-topic');
  const btnClose = container.querySelector('#modal-close-btn');
  const btnCancel = container.querySelector('#modal-cancel-btn');
  const form = container.querySelector('#topic-form');
  const wordsContainer = container.querySelector('#words-inputs-container');
  const btnAddWordRow = container.querySelector('#btn-add-word-row');

  const openModal = (isEdit = false, topicData = null) => {
    modal.classList.remove('hidden');
    container.querySelector('#modal-title').innerText = isEdit ? `✏️ Chỉnh Sửa Bộ Từ Vựng${topicData?.isPreset ? ' (HSK)' : ''}` : '✨ Tạo Bộ Từ Vựng Tùy Chỉnh';
    wordsContainer.innerHTML = '';
    const iconPickerGrid = container.querySelector('#icon-picker-grid');
    iconPickerGrid?.classList.add('hidden');

    const icon = topicData?.icon || '📑';
    container.querySelector('#form-topic-icon').value = icon;
    container.querySelector('#icon-preview-display').innerText = icon;

    if (topicData) {
      container.querySelector('#form-topic-id').value = topicData.id || '';
      container.querySelector('#form-topic-name').value = topicData.name || '';
      container.querySelector('#form-topic-category').value = topicData.category || (topicData.isPreset ? 'HSK' : 'Tùy chỉnh');
      container.querySelector('#form-topic-desc').value = topicData.description || '';
      (topicData.words || []).forEach(w => addWordInputRow(wordsContainer, w.hanzi, w.pinyin, w.meaning, w.hanviet));
    } else {
      container.querySelector('#form-topic-id').value = '';
      form.reset();
      container.querySelector('#form-topic-category').value = 'Tùy chỉnh';
      container.querySelector('#form-topic-icon').value = '📑';
      container.querySelector('#icon-preview-display').innerText = '📑';
      addWordInputRow(wordsContainer, '', '', '', '');
      addWordInputRow(wordsContainer, '', '', '', '');
      addWordInputRow(wordsContainer, '', '', '', '');
    }
  };

  // Icon Library Picker events
  const btnToggleIconPicker = container.querySelector('#btn-toggle-icon-picker');
  const iconPickerGrid = container.querySelector('#icon-picker-grid');
  const iconPreviewDisplay = container.querySelector('#icon-preview-display');
  const formTopicIcon = container.querySelector('#form-topic-icon');

  btnToggleIconPicker?.addEventListener('click', (e) => {
    e.preventDefault();
    iconPickerGrid?.classList.toggle('hidden');
  });

  iconPreviewDisplay?.addEventListener('click', (e) => {
    e.preventDefault();
    iconPickerGrid?.classList.toggle('hidden');
  });

  iconPickerGrid?.querySelectorAll('.icon-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedIcon = e.currentTarget.dataset.icon;
      if (selectedIcon) {
        formTopicIcon.value = selectedIcon;
        iconPreviewDisplay.innerText = selectedIcon;
        iconPickerGrid.querySelectorAll('.icon-chip-btn').forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
      }
    });
  });

  const closeModal = () => modal.classList.add('hidden');

  btnCreate.addEventListener('click', () => openModal(false));
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  btnAddWordRow.addEventListener('click', () => {
    addWordInputRow(wordsContainer, '', '', '', '');
    setTimeout(() => {
      wordsContainer.scrollTop = wordsContainer.scrollHeight;
    }, 50);
  });

  // Modal Excel Template button
  const btnModalTemplateExcel = container.querySelector('#btn-modal-template-excel');
  btnModalTemplateExcel?.addEventListener('click', () => exportExcelTemplate());

  // Modal Excel Import button
  const btnModalImportExcel = container.querySelector('#btn-modal-import-excel');
  const fileModalExcelInput = container.querySelector('#file-modal-excel-input');
  btnModalImportExcel?.addEventListener('click', () => fileModalExcelInput.click());
  fileModalExcelInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseExcelFile(file, (words) => {
      words.forEach(w => addWordInputRow(wordsContainer, w.hanzi, w.pinyin, w.meaning, w.hanviet));
      setTimeout(() => {
        wordsContainer.scrollTop = wordsContainer.scrollHeight;
      }, 50);
      alert(`🎉 Đã thêm ${words.length} từ vựng từ file Excel vào danh sách!`);
      fileModalExcelInput.value = '';
    });
  });

  // Sync all topics to HSK Dictionary Header Button
  container.querySelector('#btn-sync-all-topics-to-hsk')?.addEventListener('click', () => {
    const res = syncTopicWordsToDictionary();
    alert(`🎉 Đã tự động cập nhật từ vựng từ tất cả Bộ chủ đề vào Từ điển HSK!\n\n✨ Thêm mới vào từ điển: ${res.addedCount} từ vựng\n✨ Cập nhật thông tin: ${res.updatedCount} từ vựng\n✨ Tổng cộng: ${res.totalSynced} từ vựng đã được đồng bộ.`);
  });

  // Sync specific topic to HSK Dictionary Card Button
  container.querySelectorAll('.btn-sync-topic-hsk').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) {
        const res = syncTopicWordsToDictionary([topic]);
        alert(`🎉 Đã tự động cập nhật từ vựng bộ chủ đề "${topic.name}" vào Từ điển HSK!\n\n✨ Thêm mới: ${res.addedCount} từ vựng\n✨ Cập nhật: ${res.updatedCount} từ vựng\n✨ Tổng số từ vựng bộ này: ${res.totalSynced} từ.`);
      }
    });
  });

  // Form Submit (Save Topic - Custom or Preset HSK)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const topicId = container.querySelector('#form-topic-id').value;
    const existingTopic = allTopics.find(t => t.id === topicId);

    const id = topicId || `custom_${Date.now()}`;
    const name = container.querySelector('#form-topic-name').value.trim();
    const category = container.querySelector('#form-topic-category').value.trim() || (existingTopic?.isPreset ? 'HSK' : 'Tùy chỉnh');
    const description = container.querySelector('#form-topic-desc').value.trim();
    const icon = container.querySelector('#form-topic-icon').value.trim() || '📑';

    const wordRows = wordsContainer.querySelectorAll('.word-input-row');
    const words = [];
    wordRows.forEach(row => {
      const hanzi = row.querySelector('.inp-hanzi').value.trim();
      let pinyin = row.querySelector('.inp-pinyin').value.trim();
      let hanviet = row.querySelector('.inp-hanviet').value.trim();
      const meaning = row.querySelector('.inp-meaning').value.trim();
      
      pinyin = normalizePinyin(pinyin);
      if (!pinyin && hanzi) {
        pinyin = lookupPinyinForHanzi(hanzi);
      }
      if (!hanviet && hanzi) {
        hanviet = lookupHanVietForHanzi(hanzi);
      }

      if (hanzi && (meaning || pinyin)) {
        words.push({ hanzi, pinyin: pinyin || hanzi, hanviet: hanviet || '', meaning: meaning || hanzi });
      }
    });

    if (words.length === 0) {
      alert('Vui lòng thêm ít nhất 1 từ vựng có Chữ Hán và Nghĩa tiếng Việt!');
      return;
    }

    const isPreset = existingTopic ? !!existingTopic.isPreset : false;

    const topicObj = {
      id,
      name,
      description,
      icon,
      category,
      isPreset,
      words
    };

    saveCustomTopic(topicObj);
    const syncRes = syncTopicWordsToDictionary([topicObj]);

    closeModal();
    renderTopicsView(container, onStartPracticeCallback);

    alert(`✨ Đã lưu bộ từ vựng "${name}" và tự động cập nhật vào Từ điển HSK (${syncRes.addedCount} từ mới, ${syncRes.updatedCount} từ được cập nhật)!`);
  });

  // Edit Topic (Custom or Preset HSK)
  container.querySelectorAll('.btn-edit-topic').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) openModal(true, topic);
    });
  });

  // Delete / Reset Topic
  container.querySelectorAll('.btn-delete-topic').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (!topic) return;

      if (topic.isPreset) {
        if (topic.isEdited) {
          if (confirm(`Bộ từ vựng HSK "${topic.name}" đã được chỉnh sửa.\n\nBạn có muốn KHÔI PHỤC BỘ TỪ VỰNG HSK NÀY về danh sách gốc mặc định ban đầu không?`)) {
            resetPresetTopic(topicId);
            renderTopicsView(container, onStartPracticeCallback);
          }
        } else {
          if (confirm(`Bạn có chắc chắn muốn ẩn bộ từ vựng HSK "${topic.name}" khỏi danh sách không?`)) {
            markPresetDeleted(topicId);
            renderTopicsView(container, onStartPracticeCallback);
          }
        }
      } else {
        if (confirm(`Bạn có chắc chắn muốn xóa bộ từ vựng tùy chỉnh "${topic.name}" không?`)) {
          deleteCustomTopic(topicId);
          renderTopicsView(container, onStartPracticeCallback);
        }
      }
    });
  });

  // Export Excel for Topic Card
  container.querySelectorAll('.btn-export-excel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) exportTopicToExcel(topic);
    });
  });

  // Export Excel for Topic Card
  container.querySelectorAll('.btn-export-excel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) exportTopicToExcel(topic);
    });
  });

  // Export JSON
  container.querySelectorAll('.btn-export-topic').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const topicId = e.currentTarget.dataset.id;
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(topic, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${topic.name.replace(/\s+/g, '_')}_topic.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    });
  });
}

function exportExcelTemplate() {
  const templateData = [
    ['Chữ Hán', 'Pinyin', 'Hán Việt', 'Nghĩa tiếng Việt'],
    ['你好', 'nǐ hǎo', 'Nễ Hảo', 'Xin chào'],
    ['谢谢', 'xiè xie', 'Tạ Tạ', 'Cảm ơn'],
    ['学习', 'xué xí', 'Học Tập', 'Học tập']
  ];

  if (window.XLSX) {
    const ws = window.XLSX.utils.aoa_to_sheet(templateData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "TuVungMau");
    window.XLSX.writeFile(wb, "Mau_Tu_Vung_Hanzo.xlsx");
  } else {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + templateData.map(e => e.map(x => `"${x}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Mau_Tu_Vung_Hanzo.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function exportTopicToExcel(topic) {
  if (!topic || !topic.words || topic.words.length === 0) {
    alert('Bộ từ vựng này chưa có từ vựng để xuất!');
    return;
  }

  const rows = [
    ['Chữ Hán', 'Pinyin', 'Hán Việt', 'Nghĩa tiếng Việt'],
    ...topic.words.map(w => [w.hanzi || '', w.pinyin || '', w.hanviet || '', w.meaning || ''])
  ];

  const filename = `${(topic.name || 'TuVung').replace(/[^\w\s\u4e00-\u9fa5]/gi, '').replace(/\s+/g, '_')}_Hanzo.xlsx`;

  if (window.XLSX) {
    const ws = window.XLSX.utils.aoa_to_sheet(rows);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Từ Vựng");
    window.XLSX.writeFile(wb, filename);
  } else {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.map(x => `"${(x||'').replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", filename.replace('.xlsx', '.csv'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function parseExcelFile(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const words = [];
      if (window.XLSX) {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let hanziIdx = 0, pinyinIdx = 1, hanvietIdx = -1, meaningIdx = 2;
        if (jsonRows.length > 0) {
          const header = jsonRows[0].map(c => String(c).toLowerCase().trim());
          const hIdx = header.findIndex(h => h.includes('hán') || h.includes('hanzi') || h.includes('chữ'));
          const pIdx = header.findIndex(h => h.includes('pinyin') || h.includes('phiên âm'));
          const hvIdx = header.findIndex(h => (h.includes('hán việt') || h.includes('hanviet') || h.includes('sino')) && !h.includes('chữ'));
          const mIdx = header.findIndex(h => h.includes('nghĩa') || h.includes('meaning') || h.includes('dịch'));

          if (hIdx !== -1) hanziIdx = hIdx;
          if (pIdx !== -1) pinyinIdx = pIdx;
          if (hvIdx !== -1) hanvietIdx = hvIdx;
          if (mIdx !== -1) {
            meaningIdx = mIdx;
          } else if (hanvietIdx !== -1 && jsonRows[0].length >= 4) {
            meaningIdx = 3;
          }
        }

        const startRow = (jsonRows.length > 0 && typeof jsonRows[0][hanziIdx] === 'string' && (jsonRows[0][hanziIdx].toLowerCase().includes('hán') || jsonRows[0][hanziIdx].toLowerCase().includes('chữ'))) ? 1 : 0;

        for (let i = startRow; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;
          const hanzi = String(row[hanziIdx] || '').trim();
          let pinyin = String(row[pinyinIdx] || '').trim();
          let hanviet = hanvietIdx !== -1 ? String(row[hanvietIdx] || '').trim() : '';
          const meaning = String(row[meaningIdx] || '').trim();
          
          pinyin = normalizePinyin(pinyin);
          if ((!pinyin || pinyin === hanzi) && hanzi) {
            pinyin = lookupPinyinForHanzi(hanzi);
          }
          if (!hanviet && hanzi) {
            hanviet = lookupHanVietForHanzi(hanzi);
          }

          if (hanzi && (meaning || pinyin)) {
            words.push({ hanzi, pinyin: pinyin || hanzi, hanviet: hanviet || '', meaning: meaning || hanzi });
          }
        }
      } else {
        const text = new TextDecoder().decode(e.target.result);
        const lines = text.split(/\r?\n/);
        lines.forEach((line, idx) => {
          if (!line.trim()) return;
          const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
          if (idx === 0 && (parts[0].toLowerCase().includes('hán') || parts[0].toLowerCase().includes('hanzi'))) return;
          const hanzi = parts[0] || '';
          let pinyin = normalizePinyin(parts[1] || '');
          if ((!pinyin || pinyin === hanzi) && hanzi) {
            pinyin = lookupPinyinForHanzi(hanzi);
          }
          let hanviet = parts.length >= 4 ? parts[2] : lookupHanVietForHanzi(hanzi);
          const meaning = parts.length >= 4 ? parts[3] : (parts[2] || parts[0]);
          if (hanzi) {
            words.push({ hanzi, pinyin: pinyin || hanzi, hanviet: hanviet || '', meaning });
          }
        });
      }

      if (words.length === 0) {
        alert('Không tìm thấy từ vựng hợp lệ trong file Excel. Vui lòng kiểm tra định dạng file!');
        return;
      }

      callback(words);
    } catch (err) {
      alert('Lỗi khi đọc file Excel: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

function addWordInputRow(container, hanzi = '', pinyin = '', meaning = '', hanviet = '') {
  let initialPinyin = normalizePinyin(pinyin);
  if (!initialPinyin && hanzi) {
    initialPinyin = lookupPinyinForHanzi(hanzi);
  }
  let initialHanViet = hanviet || '';
  if (!initialHanViet && hanzi) {
    initialHanViet = lookupHanVietForHanzi(hanzi);
  }

  const row = document.createElement('div');
  row.className = 'word-input-row flex gap-2 items-center mb-2';
  row.innerHTML = `
    <input type="text" class="form-control inp-hanzi" placeholder="Chữ Hán (v.d 你好)" value="${escapeHtml(hanzi)}" style="flex: 1; min-width: 0;" />
    <input type="text" class="form-control inp-pinyin" placeholder="Pinyin (v.d nǐ hǎo)" value="${escapeHtml(initialPinyin)}" style="flex: 1; min-width: 0;" />
    <input type="text" class="form-control inp-hanviet" placeholder="Hán Việt (v.d Nễ Hảo)" value="${escapeHtml(initialHanViet)}" style="flex: 1; min-width: 0;" />
    <input type="text" class="form-control inp-meaning" placeholder="Nghĩa tiếng Việt" value="${escapeHtml(meaning)}" style="flex: 1.2; min-width: 0;" />
    <button type="button" class="btn-icon text-slate-400 hover:text-red-600 btn-remove-row rounded-lg flex items-center justify-center shrink-0 font-bold text-lg" style="width: 32px; height: 32px; flex-shrink: 0;" title="Xóa dòng">&times;</button>
  `;

  const inpHanzi = row.querySelector('.inp-hanzi');
  const inpPinyin = row.querySelector('.inp-pinyin');
  const inpHanViet = row.querySelector('.inp-hanviet');

  inpHanzi.addEventListener('input', () => {
    const val = inpHanzi.value.trim();
    if (val) {
      if (!inpPinyin.value.trim() || inpPinyin.dataset.autoFilled === 'true') {
        const autoPy = lookupPinyinForHanzi(val);
        if (autoPy) {
          inpPinyin.value = autoPy;
          inpPinyin.dataset.autoFilled = 'true';
        }
      }
      if (!inpHanViet.value.trim() || inpHanViet.dataset.autoFilled === 'true') {
        const autoHv = lookupHanVietForHanzi(val);
        if (autoHv) {
          inpHanViet.value = autoHv;
          inpHanViet.dataset.autoFilled = 'true';
        }
      }
    }
  });

  inpPinyin.addEventListener('change', () => {
    inpPinyin.dataset.autoFilled = 'false';
    inpPinyin.value = normalizePinyin(inpPinyin.value);
  });

  inpPinyin.addEventListener('blur', () => {
    if (inpPinyin.value.trim()) {
      inpPinyin.value = normalizePinyin(inpPinyin.value);
    }
  });

  inpHanViet.addEventListener('change', () => {
    inpHanViet.dataset.autoFilled = 'false';
  });

  row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function removeVietnameseTones(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function getUniqueCategories(topics) {
  const defaultCats = ['Tất cả', 'HSK', 'Giao tiếp', 'Tùy chỉnh'];
  const customCats = new Set();
  
  (topics || []).forEach(t => {
    if (t.category && t.category.trim()) {
      const trimmed = t.category.trim();
      if (!defaultCats.includes(trimmed)) {
        customCats.add(trimmed);
      }
    }
  });

  return [...defaultCats, ...Array.from(customCats)];
}


