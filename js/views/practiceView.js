import { speakChinese, ChineseSpeechRecognizer, evaluatePronunciation, requestMicrophonePermission, getAvailableMicrophones, getSelectedMicrophoneDeviceId, setSelectedMicrophoneDeviceId, testMicrophoneVolume } from '../utils/speech.js';
import { HanziPracticePad } from '../utils/hanziCanvas.js';
import { updateWordSRS, getSRSProgress, getAllTopicsList, recordTopicPracticeProgress } from '../utils/srs.js';

export function renderPracticeView(container, activeTopic) {
  const allTopics = getAllTopicsList();

  let currentTopic = activeTopic;
  if (!currentTopic || !currentTopic.words || currentTopic.words.length === 0) {
    if (allTopics.length > 0 && allTopics[0].words && allTopics[0].words.length > 0) {
      currentTopic = allTopics[0];
    }
  }

  if (!currentTopic || !currentTopic.words || currentTopic.words.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center py-12">
        <h2 class="text-2xl font-bold mb-3 text-amber-400">⚠️ Chưa Có Bộ Từ Vựng Nào</h2>
        <p class="text-muted mb-6">Vui lòng tạo hoặc chọn một bộ chủ đề từ vựng ở trang "Bộ Chủ Đề" để bắt đầu luyện tập 4 kỹ năng.</p>
        <button id="btn-go-topics" class="btn btn-primary">📚 Đi đến Danh Sách Chủ Đề</button>
      </div>
    `;
    container.querySelector('#btn-go-topics')?.addEventListener('click', () => {
      document.querySelector('[data-tab="topics"]')?.click();
    });
    return;
  }

  // State bài học & Danh sách từ chọn ôn tập chủ động
  let selectedHanzis = new Set((currentTopic.words || []).map(w => w.hanzi));
  let currentSkill = 'listening'; // 'listening' | 'speaking' | 'reading' | 'writing'
  let currentIndex = 0;
  let showPinyin = true;
  let autoPlayListeningAudio = true;
  let sessionResults = {}; // Lưu kết quả đánh giá { hanzi: { quality, isPassed, hanzi, pinyin, meaning } }
  let skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };

  // --- Shuffle State ---
  let isShuffleEnabled = false;
  let shuffledOrder = []; // Mảng index đã được xáo trộn (Fisher-Yates)

  // Thuật toán Fisher-Yates shuffle
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Tạo lại thứ tự shuffle dựa trên danh sách từ hiện tại
  function applyShuffleIfEnabled() {
    if (isShuffleEnabled) {
      const rawList = (currentTopic.words || []).filter(w => selectedHanzis.has(w.hanzi));
      const sourceList = rawList.length > 0 ? rawList : (currentTopic.words || []);
      shuffledOrder = shuffleArray(sourceList.map((_, i) => i));
    } else {
      shuffledOrder = [];
    }
  }

  function getActiveWords() {
    const rawList = (currentTopic.words || []).filter(w => selectedHanzis.has(w.hanzi));
    const list = rawList.length > 0 ? rawList : (currentTopic.words || []);
    if (isShuffleEnabled && shuffledOrder.length === list.length) {
      return shuffledOrder.map(i => list[i]);
    }
    return list;
  }

  const triggerCompletionScreen = () => {
    const activeWords = getActiveWords();
    activeWords.forEach((w, idx) => {
      const quizPassed = skillQuizResults[currentSkill]?.[w.hanzi];
      if (quizPassed !== undefined) {
        if (!sessionResults[w.hanzi]) {
          sessionResults[w.hanzi] = {
            hanzi: w.hanzi,
            pinyin: w.pinyin,
            hanviet: w.hanviet || '',
            meaning: w.meaning,
            quality: quizPassed ? 4 : 1,
            isPassed: quizPassed,
            index: idx
          };
        }
      }
    });

    recordTopicPracticeProgress(currentTopic);

    renderCompletionScreen(
      container,
      activeWords,
      sessionResults,
      skillQuizResults,
      currentSkill,
      currentTopic,
      // Callback: Ôn lại từ chưa thuộc
      () => {
        const unmasteredList = activeWords.filter(w => {
          const srsPass = sessionResults[w.hanzi]?.isPassed;
          const skillPass = skillQuizResults[currentSkill]?.[w.hanzi];
          return !(skillPass !== undefined ? skillPass : srsPass);
        });
        if (unmasteredList.length > 0) {
          selectedHanzis = new Set(unmasteredList.map(w => w.hanzi));
        }
        sessionResults = {};
        skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };
        currentIndex = 0;
        applyShuffleIfEnabled(); // Re-shuffle khi ôn lại từ chưa thuộc
        renderCurrentSkillView();
      },
      // Callback: Luyện tập lại toàn bộ
      () => {
        sessionResults = {};
        skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };
        currentIndex = 0;
        applyShuffleIfEnabled(); // Re-shuffle khi luyện tập lại toàn bộ
        renderCurrentSkillView();
      },
      // Callback: Trở về trang luyện tập
      () => {
        renderCurrentSkillView();
      }
    );
  };

  const renderCurrentSkillView = () => {
    const activeWords = getActiveWords();
    const srsProgress = getSRSProgress();

    if (currentIndex >= activeWords.length) {
      currentIndex = activeWords.length - 1;
    }
    if (currentIndex < 0) currentIndex = 0;

    const word = activeWords[currentIndex];
    const totalWords = activeWords.length;

    container.innerHTML = `
      <!-- Header Trang Luyện Tập -->
      <div class="practice-header mb-4">
        <div class="flex flex-col md:flex-row justify-between align-start md:align-center gap-3 mb-3">
          <div>
            <div class="flex align-center gap-2">
              <h1 class="text-2xl font-black text-gradient">🎯 Luyện Tập 4 Kỹ Năng</h1>
              <span class="badge badge-red font-extrabold text-2xs">SRS SM-2</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">Ôn luyện ngắt quãng Nghe - Nói - Đọc - Viết ghi nhớ từ vựng tự nhiên</p>
          </div>

          <!-- Tabs chọn 4 Kỹ Năng -->
          <div class="skill-tabs-nav">
            <button class="skill-tab-btn ${currentSkill === 'listening' ? 'active' : ''}" data-skill="listening" title="Luyện kỹ năng Nghe">
              <span class="skill-tab-badge">
                <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9v6c0 3.31 2.69 6 6 6s6-2.69 6-6v-1.5c0-.83-.67-1.5-1.5-1.5S14 12.67 14 13.5V15c0 1.66-1.34 3-3 3s-3-1.34-3-3V9c0-2.21 1.79-4 4-4s4 1.79 4 4v1h2V9c0-3.87-3.13-7-7-7z"/></svg>
              </span>
              <span class="skill-tab-divider"></span>
              <span class="skill-tab-label">Nghe</span>
            </button>
            <button class="skill-tab-btn ${currentSkill === 'speaking' ? 'active' : ''}" data-skill="speaking" title="Luyện kỹ năng Nói">
              <span class="skill-tab-badge">
                <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
              </span>
              <span class="skill-tab-divider"></span>
              <span class="skill-tab-label">Nói</span>
            </button>
            <button class="skill-tab-btn ${currentSkill === 'reading' ? 'active' : ''}" data-skill="reading" title="Luyện kỹ năng Đọc">
              <span class="skill-tab-badge">
                <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.35-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>
              </span>
              <span class="skill-tab-divider"></span>
              <span class="skill-tab-label">Đọc</span>
            </button>
            <button class="skill-tab-btn ${currentSkill === 'writing' ? 'active' : ''}" data-skill="writing" title="Luyện kỹ năng Viết">
              <span class="skill-tab-badge">
                <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </span>
              <span class="skill-tab-divider"></span>
              <span class="skill-tab-label">Viết</span>
            </button>
          </div>
        </div>

        <!-- Thanh Công Cụ Luyện Tập (Topic Select & Quản lý Từ) -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div class="flex items-center gap-2.5 flex-wrap md:flex-nowrap w-full md:w-auto">
            <label for="practice-topic-select" class="text-xs font-bold text-slate-700 whitespace-nowrap shrink-0 flex items-center gap-1" style="white-space: nowrap !important; flex-shrink: 0 !important;">
              <span>📚 Bộ từ vựng:</span>
            </label>
            <select id="practice-topic-select" class="form-control text-xs font-bold py-1.5 px-3 rounded-xl border border-red-200 bg-white text-slate-800 shadow-2xs cursor-pointer focus:outline-none shrink-0 min-w-[200px]">
              ${allTopics.map(t => `
                <option value="${t.id}" ${t.id === currentTopic.id ? 'selected' : ''}>
                  ${t.icon || '📌'} ${escapeHtml(t.name)} (${t.words ? t.words.length : 0} từ)
                </option>
              `).join('')}
            </select>

            <button id="btn-open-word-select" class="btn btn-sm btn-secondary text-xs font-bold whitespace-nowrap shrink-0 border border-slate-200 shadow-2xs hover:bg-slate-100 transition" title="Chọn từ ôn luyện chủ động">
              ⚙️ Chọn Từ Ôn Luyện (${activeWords.length}/${currentTopic.words.length})
            </button>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
            <span class="badge-red text-xs font-extrabold px-3 py-1.5 rounded-xl border border-red-200 shadow-2xs whitespace-nowrap">
              Từ ${currentIndex + 1} / ${totalWords}
            </span>
          </div>
        </div>
      </div>

      <!-- Skill Content Body -->
      <div class="glass-panel p-6 mb-4 relative" id="skill-card-body">
        <!-- Rendered based on skill -->
      </div>

      <!-- SRS Assessment Footer Controls -->
      <div class="srs-footer-bar glass-panel p-4 flex flex-col md:flex-row justify-between align-center gap-3 mb-5">
        <div class="flex align-center gap-3">
          <button id="btn-prev-word" class="btn-nav-prev" ${currentIndex === 0 ? 'disabled' : ''}>
            <span class="w-9 h-9 rounded-full bg-[#FFF0F2] flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#E60021]" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7 7l-7-7 7-7"/>
              </svg>
            </span>
            <span class="text-base font-black text-[#E60021] tracking-wide whitespace-nowrap">Từ Trước</span>
          </button>
          ${currentIndex === totalWords - 1 ? `
            <button id="btn-finish-practice" class="btn-nav-finish" title="Hoàn thành bài tập và xem báo cáo kết quả">
              <span class="text-sm font-black text-white tracking-wide whitespace-nowrap">🏆 Hoàn Thành & Xem Điểm</span>
              <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-5 h-5 text-[#E60021]" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
                </svg>
              </span>
            </button>
          ` : `
            <button id="btn-next-word" class="btn-nav-next">
              <span class="text-base font-black text-white tracking-wide whitespace-nowrap">Từ Tiếp Theo</span>
              <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-5 h-5 text-[#E60021]" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
                </svg>
              </span>
            </button>
          `}
          <button id="btn-toggle-shuffle" class="btn-nav-next" title="${isShuffleEnabled ? 'Tắt xáo trộn thứ tự từ vựng' : 'Bật xáo trộn ngẫu nhiên thứ tự từ vựng'}" style="${isShuffleEnabled ? 'background: linear-gradient(135deg,#f59e0b,#d97706); box-shadow:0 4px 18px rgba(245,158,11,0.45);' : 'background: linear-gradient(135deg,#94a3b8,#64748b); box-shadow:0 4px 12px rgba(100,116,139,0.25); opacity:0.8;'}">
            <span class="text-base font-black text-white tracking-wide whitespace-nowrap">${isShuffleEnabled ? '🔀 Xáo Trộn: Bật' : '🔀 Xáo Trộn: Tắt'}</span>
            <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-5 h-5" style="color:${isShuffleEnabled ? '#d97706' : '#64748b'}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
              </svg>
            </span>
          </button>
        </div>

        <div class="srs-rating-buttons flex align-center gap-2 flex-wrap justify-center md:justify-end">
          <span class="text-xs font-bold text-slate-600 mr-1">Đánh giá độ nhớ (SRS):</span>
          <button class="btn-srs srs-again" data-q="1" title="Chưa nhớ (Ôn lại ngay)">🔴 Quên (1)</button>
          <button class="btn-srs srs-hard" data-q="3" title="Hơi khó (Ôn ngày mai)">🟡 Khó (3)</button>
          <button class="btn-srs srs-good" data-q="4" title="Nhớ tốt (Ôn sau 3 ngày)">🟢 Tốt (4)</button>
          <button class="btn-srs srs-easy" data-q="5" title="Rất dễ (Ôn sau 6 ngày)">🔵 Rất Dễ (5)</button>
        </div>
      </div>

      <!-- Bảng Lịch Sử Đánh Giá Phiên Học -->
      ${(() => {
        const evaluatedWordsList = Object.values(sessionResults);
        const evaluatedCount = evaluatedWordsList.length;
        const goodCount = evaluatedWordsList.filter(r => r.quality >= 4).length;
        const hardCount = evaluatedWordsList.filter(r => r.quality === 3).length;
        const againCount = evaluatedWordsList.filter(r => r.quality === 1).length;

        return `
          <div class="session-history-panel p-4 mb-4">
            <div class="flex justify-between align-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div class="flex align-center gap-2">
                <h4 class="font-bold text-sm text-slate-800 flex align-center gap-1">
                  <span>📊 Lịch Sử Đánh Giá Phiên Học</span>
                </h4>
                <span class="badge ${evaluatedCount > 0 ? 'badge-amber' : 'badge-red'} font-bold text-xs">${evaluatedCount} / ${totalWords} từ đã đánh giá</span>
              </div>

              ${evaluatedCount > 0 ? `
                <div class="flex align-center gap-2 text-xs font-bold">
                  <span class="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">🟢 Tốt/Dễ: ${goodCount}</span>
                  <span class="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">🟡 Khó: ${hardCount}</span>
                  <span class="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">🔴 Quên: ${againCount}</span>
                </div>
              ` : ''}
            </div>

            ${evaluatedCount === 0 ? `
              <div class="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p class="text-xs text-slate-400 italic">
                  💡 Chưa có từ nào được đánh giá trong phiên này. Hãy bấm nút đánh giá độ nhớ SRS ở trên để bắt đầu ghi nhận lịch sử.
                </p>
              </div>
            ` : `
              <div class="history-items-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                ${evaluatedWordsList.map((item, idx) => {
                  const q = item.quality;
                  const badgeClass = q === 5 ? 'bg-sky-100 text-sky-700 border-sky-300' : q === 4 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : q === 3 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-rose-100 text-rose-700 border-rose-300';
                  const borderClass = q >= 4 ? 'border-emerald-200 bg-emerald-50/40' : q === 3 ? 'border-amber-200 bg-amber-50/40' : 'border-rose-200 bg-rose-50/40';
                  const label = q === 5 ? '🔵 Rất Dễ' : q === 4 ? '🟢 Tốt' : q === 3 ? '🟡 Khó' : '🔴 Quên';
                  const activeHighlight = item.index === currentIndex ? 'ring-2 ring-red-500 shadow-md' : '';

                  return `
                    <div class="history-item-chip flex justify-between align-center p-2.5 rounded-xl border ${borderClass} ${activeHighlight} cursor-pointer hover:shadow-sm" data-idx="${item.index}" title="Bấm để xem lại từ này">
                      <div class="flex align-center gap-2 overflow-hidden">
                        <span class="text-xs font-bold text-slate-400 shrink-0">#${idx + 1}</span>
                        <div class="truncate">
                          <span class="font-bold text-sm text-slate-800">${escapeHtml(item.hanzi)}</span>
                          <span class="text-xs text-slate-500 ml-0.5">(<span class="pinyin-text font-pinyin">${escapeHtml(item.pinyin)}</span>${item.hanviet ? ` · ${escapeHtml(item.hanviet)}` : ''})</span>
                          <div class="text-xs text-slate-600 truncate">${escapeHtml(item.meaning)}</div>
                        </div>
                      </div>
                      <span class="badge ${badgeClass} font-bold text-2xs px-2 py-0.5 border shrink-0">${label}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        `;
      })()}

      <!-- Bảng Danh Sách Từ Vựng Bộ Chủ Đề & Đánh Giá Mức Độ Thành Thạo SRS -->
      ${(() => {
        const srsProgress = getSRSProgress();
        const totalWordsInTopic = (currentTopic.words || []).length;
        const masteredWordsCount = (currentTopic.words || []).filter(w => (srsProgress[w.hanzi]?.repetitions || 0) >= 3).length;
        const topicMasteryPercent = totalWordsInTopic > 0 ? Math.round((masteredWordsCount / totalWordsInTopic) * 100) : 0;

        return `
          <div class="topic-mastery-panel glass-panel p-4 rounded-2xl border border-slate-200 mb-6">
            <div class="flex flex-col md:flex-row justify-between align-start md:align-center mb-3 pb-3 border-b border-slate-200 gap-3">
              <div>
                <h3 class="font-bold text-base text-slate-800 flex align-center gap-2">
                  <span>📋 Danh Sách Từ Vựng Bộ Chủ Đề & Mức Độ Thành Thạo SRS</span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Theo dõi chi tiết tiến trình ghi nhớ lặp lại ngắt quãng (SM-2) của từng từ vựng.</p>
              </div>

              <!-- Thanh Tiến Độ Thành Thạo Chủ Đề -->
              <div class="flex align-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full md:w-auto">
                <div class="text-right shrink-0">
                  <div class="text-xs font-bold text-slate-700">Độ Thành Thạo Chủ Đề</div>
                  <div class="text-sm font-black text-emerald-600">${masteredWordsCount} / ${totalWordsInTopic} từ (${topicMasteryPercent}%)</div>
                </div>
                <div class="w-24 bg-slate-200 rounded-full h-3 overflow-hidden shrink-0">
                  <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${topicMasteryPercent}%;"></div>
                </div>
              </div>
            </div>

            <!-- Danh Sách Từ Vựng Vấn Đáp & Badge Độ Thành Thạo (Lấp đầy chiều rộng - Multi-column Responsive Grid) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto pr-1 p-0.5" id="topic-words-mastery-list">
              ${(currentTopic.words || []).map((w, index) => {
                const prog = srsProgress[w.hanzi] || { repetitions: 0, interval: 1, easeFactor: 2.5 };
                const reps = prog.repetitions || 0;

                let statusLabel = '🔴 Chưa Thuộc';
                let statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                let progressPercent = 15;
                let barColor = 'bg-rose-500';

                if (reps >= 3) {
                  statusLabel = `🟢 Thành Thạo (${reps}L)`;
                  statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  progressPercent = 100;
                  barColor = 'bg-emerald-500';
                } else if (reps >= 1) {
                  statusLabel = `🔵 Đang Học (${prog.interval || 1}d)`;
                  statusBadgeClass = 'bg-sky-100 text-sky-800 border-sky-200';
                  progressPercent = reps === 2 ? 75 : 45;
                  barColor = 'bg-sky-500';
                }

                const isCurrentActive = activeWords[currentIndex]?.hanzi === w.hanzi;

                return `
                  <div class="mastery-word-card flex flex-col justify-between p-3 rounded-xl border bg-white hover:border-red-400 hover:shadow-md transition-all gap-2 ${isCurrentActive ? 'ring-2 ring-red-500 bg-red-50/30 border-red-400 shadow-sm' : 'border-slate-200'}">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center justify-between gap-1.5">
                        <div class="flex items-center gap-1.5 min-w-0">
                          <span class="text-xs font-bold text-slate-400 shrink-0">#${index + 1}</span>
                          <button type="button" class="btn-icon text-xs btn-speak-word shrink-0 p-1 hover:bg-slate-100 rounded" data-hanzi="${escapeHtml(w.hanzi)}" title="Nghe đọc âm mẫu">🔊</button>
                          <div class="truncate">
                            <span class="font-bold text-base text-slate-900 leading-tight">${escapeHtml(w.hanzi)}</span>
                            <span class="text-xs font-semibold text-slate-500 ml-1">(<span class="pinyin-text font-pinyin">${escapeHtml(w.pinyin)}</span>${w.hanviet ? ` · ${escapeHtml(w.hanviet)}` : ''})</span>
                          </div>
                        </div>
                        <button type="button" class="btn btn-xs ${isCurrentActive ? 'btn-primary' : 'btn-secondary'} btn-jump-word text-xs shrink-0 font-semibold px-2 py-1" data-hanzi="${escapeHtml(w.hanzi)}" title="Ôn tập từ này">
                          ${isCurrentActive ? '👉 Đang Ôn' : '▶️ Ôn từ'}
                        </button>
                      </div>

                      <div class="text-xs text-slate-600 truncate px-0.5" title="${escapeHtml(w.meaning)}">
                        ${escapeHtml(w.meaning)}
                      </div>
                    </div>

                    <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 mt-1">
                      <span class="badge ${statusBadgeClass} text-2xs font-bold px-2 py-0.5 border rounded-md shrink-0">
                        ${statusLabel}
                      </span>
                      <div class="flex items-center gap-1.5 w-20 shrink-0">
                        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                          <div class="${barColor} h-full rounded-full transition-all duration-300" style="width: ${progressPercent}%;"></div>
                        </div>
                        <span class="text-2xs font-bold text-slate-400 w-6 text-right">${progressPercent}%</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      })()}

      <!-- Modal Chọn Từ Ôn Luyện Chủ Động -->
      <div id="word-selection-modal" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header flex justify-between items-center border-b border-slate-200 pb-3 mb-4 shrink-0">
            <div>
              <h3 class="font-black text-xl text-slate-900 flex items-center gap-2">
                <span class="text-2xl">⚙️</span> Chọn Từ Ôn Luyện Chủ Động
              </h3>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Tùy chỉnh chọn từ vựng muốn tập trung luyện tập sâu trong phiên này</p>
            </div>
            <button class="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center font-black text-xl transition-colors cursor-pointer" id="word-modal-close" title="Đóng">&times;</button>
          </div>
          <div class="modal-body flex-1 flex flex-col min-h-0">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 shrink-0">
              <!-- Quick Filter Actions -->
              <div class="flex gap-2 flex-wrap items-center">
                <button type="button" id="btn-select-all-words" class="btn btn-sm bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition">
                  ✅ Chọn Tất Cả
                </button>
                <button type="button" id="btn-deselect-all-words" class="btn btn-sm bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition">
                  ❌ Bỏ Chọn
                </button>
                <button type="button" id="btn-select-weak-words" class="btn btn-sm bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-rose-200 shadow-2xs transition" title="Chỉ chọn các từ chưa thuộc theo hệ thống SRS">
                  🔥 Từ Chưa Thuộc (SRS)
                </button>
              </div>

              <!-- Quick Search Input -->
              <div class="relative min-w-[240px]">
                <input type="text" id="word-search-input" placeholder="🔍 Tìm kiếm (Pinyin, Nghĩa)..." class="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 bg-white shadow-2xs transition" />
              </div>
            </div>

            <!-- Spacious Grid of Words -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1" id="word-select-list">
              ${(currentTopic.words || []).map((w) => {
                const prog = srsProgress[w.hanzi] || { repetitions: 0, interval: 1, easeFactor: 2.5 };
                const reps = prog.repetitions || 0;

                let statusLabel = '🔴 Chưa Thuộc';
                let statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';

                if (reps >= 3) {
                  statusLabel = `🟢 Thành Thạo (${reps}L)`;
                  statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                } else if (reps >= 1) {
                  statusLabel = `🔵 Đang Học (${prog.interval || 1}d)`;
                  statusBadgeClass = 'bg-sky-100 text-sky-800 border-sky-200';
                }

                return `
                  <label class="word-select-row flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 cursor-pointer gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <input type="checkbox" class="inp-word-check w-4.5 h-4.5 shrink-0 accent-red-600 cursor-pointer" data-hanzi="${escapeHtml(w.hanzi)}" ${selectedHanzis.has(w.hanzi) ? 'checked' : ''} />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="word-hanzi-text font-black text-slate-900 text-lg leading-snug">${escapeHtml(w.hanzi)}</span>
                          <span class="text-xs text-slate-500 font-bold">(<span class="pinyin-text font-pinyin">${escapeHtml(w.pinyin)}</span>${w.hanviet ? ` · ${escapeHtml(w.hanviet)}` : ''})</span>
                        </div>
                        <div class="text-xs text-slate-600 font-medium truncate mt-0.5" title="${escapeHtml(w.meaning)}">${escapeHtml(w.meaning)}</div>
                      </div>
                    </div>
                    <span class="badge ${statusBadgeClass} text-2xs font-extrabold px-2.5 py-1 border rounded-lg shrink-0">
                      ${statusLabel}
                    </span>
                  </label>
                `;
              }).join('')}
            </div>

            <div class="modal-footer flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200 shrink-0">
              <span class="text-xs font-black text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200" id="selected-words-count-badge">
                Đã chọn: ${selectedHanzis.size} / ${currentTopic.words.length} từ vựng
              </span>
              <button type="button" id="btn-apply-word-selection" class="btn-nav-next text-sm font-black px-6 py-2.5 shadow-md">
                <span>🚀 Bắt Đầu Ôn Luyện</span>
                <span class="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
                  <svg class="w-4 h-4 text-[#E60021]" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Sub-view cho kỹ năng
    const cardBody = container.querySelector('#skill-card-body');
    if (currentSkill === 'listening') renderListeningSkill(cardBody, word);
    else if (currentSkill === 'speaking') renderSpeakingSkill(cardBody, word);
    else if (currentSkill === 'reading') renderReadingSkill(cardBody, word, showPinyin);
    else if (currentSkill === 'writing') renderWritingSkill(cardBody, word);

    setupEvents();
  };

  // Cập nhật giao diện Lịch Sử Đánh Giá Phiên Học & Danh Sách Từ Vựng trực tiếp trong DOM
  function updateSessionHistoryDOM() {
    const historyContainer = container.querySelector('.session-history-panel');
    if (!historyContainer) return;

    const evaluatedWordsList = Object.values(sessionResults);
    const evaluatedCount = evaluatedWordsList.length;
    const goodCount = evaluatedWordsList.filter(r => r.quality >= 4).length;
    const hardCount = evaluatedWordsList.filter(r => r.quality === 3).length;
    const againCount = evaluatedWordsList.filter(r => r.quality === 1).length;
    const activeWords = getActiveWords();
    const totalWords = activeWords.length;

    historyContainer.innerHTML = `
      <div class="flex justify-between align-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex align-center gap-2">
          <h4 class="font-bold text-sm text-slate-800 flex align-center gap-1">
            <span>📊 Lịch Sử Đánh Giá Phiên Học</span>
          </h4>
          <span class="badge ${evaluatedCount > 0 ? 'badge-amber' : 'badge-red'} font-bold text-xs">${evaluatedCount} / ${totalWords} từ đã đánh giá</span>
        </div>

        ${evaluatedCount > 0 ? `
          <div class="flex align-center gap-2 text-xs font-bold">
            <span class="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">🟢 Tốt/Dễ: ${goodCount}</span>
            <span class="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">🟡 Khó: ${hardCount}</span>
            <span class="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">🔴 Quên: ${againCount}</span>
          </div>
        ` : ''}
      </div>

      ${evaluatedCount === 0 ? `
        <div class="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p class="text-xs text-slate-400 italic">
            💡 Chưa có từ nào được đánh giá trong phiên này. Hãy chọn đáp án hoặc bấm nút đánh giá độ nhớ SRS để bắt đầu ghi nhận lịch sử.
          </p>
        </div>
      ` : `
        <div class="history-items-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
          ${evaluatedWordsList.map((item, idx) => {
            const q = item.quality;
            const badgeClass = q === 5 ? 'bg-sky-100 text-sky-700 border-sky-300' : q === 4 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : q === 3 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-rose-100 text-rose-700 border-rose-300';
            const borderClass = q >= 4 ? 'border-emerald-200 bg-emerald-50/40' : q === 3 ? 'border-amber-200 bg-amber-50/40' : 'border-rose-200 bg-rose-50/40';
            const label = q === 5 ? '🔵 Rất Dễ' : q === 4 ? '🟢 Tốt' : q === 3 ? '🟡 Khó' : '🔴 Quên';
            const activeHighlight = item.index === currentIndex ? 'ring-2 ring-red-500 shadow-md' : '';

            return `
              <div class="history-item-chip flex justify-between align-center p-2.5 rounded-xl border ${borderClass} ${activeHighlight} cursor-pointer hover:shadow-sm" data-idx="${item.index}" title="Bấm để xem lại từ này">
                <div class="flex align-center gap-2 overflow-hidden">
                  <span class="text-xs font-bold text-slate-400 shrink-0">#${idx + 1}</span>
                  <div class="truncate">
                    <span class="font-bold text-sm text-slate-800">${escapeHtml(item.hanzi)}</span>
                    <span class="text-xs text-slate-500 ml-0.5">(<span class="pinyin-text font-pinyin">${escapeHtml(item.pinyin)}</span>${item.hanviet ? ` · ${escapeHtml(item.hanviet)}` : ''})</span>
                    <div class="text-xs text-slate-600 truncate">${escapeHtml(item.meaning)}</div>
                  </div>
                </div>
                <span class="badge ${badgeClass} font-bold text-2xs px-2 py-0.5 border shrink-0">${label}</span>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    historyContainer.querySelectorAll('.history-item-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.dataset.idx, 10);
        if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < activeWords.length) {
          currentIndex = targetIdx;
          renderCurrentSkillView();
        }
      });
    });
  }

  // SKILL 1: NGHE
  function renderListeningSkill(body, word) {
    const distractors = currentTopic.words.filter(w => w.hanzi !== word.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [word, ...distractors].sort(() => 0.5 - Math.random());

    body.innerHTML = `
      <div class="text-center py-4">
        <div class="audio-pulse-wrapper mb-4">
          <button id="btn-play-audio" class="btn-play-large shadow-glow-amber">
            🔊 Bấm Để Nghe Phát Âm Tiếng Trung
          </button>

          <!-- Hiển thị Pinyin từ vựng luyện tập ngay dưới nút Bấm nghe -->
          <div class="pinyin-listening-box mt-3 mb-2 flex items-center justify-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-red-200 shadow-2xs hover:border-red-300 transition-all">
              <span class="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">Pinyin</span>
              <span class="text-slate-300 font-light">|</span>
              <span class="pinyin-display font-pinyin text-2xl font-black text-red-600 tracking-wide" id="listening-pinyin-display">${escapeHtml(word.pinyin)}</span>
              ${word.hanviet ? `<span class="text-xs font-bold text-red-700 bg-red-50/90 px-2 py-0.5 rounded-lg border border-red-100">(${escapeHtml(word.hanviet)})</span>` : ''}
              <button type="button" id="btn-toggle-listening-pinyin" class="btn-icon-xs text-xs text-slate-400 hover:text-red-600 transition ml-1 p-1 rounded-md cursor-pointer" title="Ẩn/Hiện Pinyin">
                👁️
              </button>
            </div>
          </div>

          <div class="flex justify-center flex-wrap gap-2 mt-2">
            <button class="btn-speed active" data-speed="0.85">0.85x (Chuẩn)</button>
            <button class="btn-speed" data-speed="0.6">0.6x (Chậm)</button>
            <button id="btn-toggle-autoplay" class="btn-speed ${autoPlayListeningAudio ? 'active' : ''}" title="Tự động phát âm thanh khi chuyển từ">
              ${autoPlayListeningAudio ? '🔊 Tự động phát: Bật' : '🔇 Tự động phát: Tắt'}
            </button>
          </div>
        </div>

        <p class="text-muted mb-6">Lắng nghe phát âm và chọn đáp án nghĩa tiếng Việt chính xác:</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto" id="listening-options">
          ${options.map(opt => `
            <button class="btn-quiz-option p-4 text-lg font-medium glass-button" data-correct="${opt.hanzi === word.hanzi}">
              ${escapeHtml(opt.meaning)}
            </button>
          `).join('')}
        </div>

        <div id="listening-feedback" class="mt-4 text-lg font-bold min-h-8"></div>
      </div>
    `;

    let currentSpeed = 0.85;
    const playAudio = () => speakChinese(word.hanzi, currentSpeed);

    if (autoPlayListeningAudio) {
      setTimeout(playAudio, 300);
    }
    body.querySelector('#btn-play-audio')?.addEventListener('click', playAudio);

    body.querySelector('#btn-toggle-autoplay')?.addEventListener('click', (e) => {
      autoPlayListeningAudio = !autoPlayListeningAudio;
      const btn = e.currentTarget;
      if (autoPlayListeningAudio) {
        btn.classList.add('active');
        btn.innerHTML = '🔊 Tự động phát: Bật';
        playAudio();
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '🔇 Tự động phát: Tắt';
      }
    });

    let isPinyinShown = true;
    body.querySelector('#btn-toggle-listening-pinyin')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isPinyinShown = !isPinyinShown;
      const pinyinEl = body.querySelector('#listening-pinyin-display');
      const toggleBtn = body.querySelector('#btn-toggle-listening-pinyin');
      if (pinyinEl) {
        if (isPinyinShown) {
          pinyinEl.style.display = '';
          if (toggleBtn) toggleBtn.innerText = '👁️';
        } else {
          pinyinEl.style.display = 'none';
          if (toggleBtn) toggleBtn.innerText = '🙈';
        }
      }
    });

    body.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSpeed = parseFloat(btn.dataset.speed);
        playAudio();
      });
    });

    const quizBtns = body.querySelectorAll('.btn-quiz-option');
    quizBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clickedBtn = e.currentTarget;
        const isCorrect = clickedBtn.dataset.correct === 'true';
        const feedbackEl = body.querySelector('#listening-feedback');

        // Reset trạng thái màu sắc của toàn bộ các nút đáp án trước khi áp dụng lựa chọn mới
        quizBtns.forEach(b => {
          b.classList.remove('btn-selected-correct', 'btn-selected-wrong', 'bg-emerald-600', 'bg-rose-600', 'text-white');
          b.style.background = '';
          b.style.color = '';
          b.style.borderColor = '';
        });

        if (isCorrect) {
          clickedBtn.classList.add('btn-selected-correct');
        } else {
          clickedBtn.classList.add('btn-selected-wrong');
        }

        // Ghi nhận kết quả trả lời kỹ năng Nghe
        if (!skillQuizResults.listening) skillQuizResults.listening = {};
        skillQuizResults.listening[word.hanzi] = isCorrect;

        // Đồng bộ SRS & Session Results ngay khi chọn đáp án
        const defaultQuality = isCorrect ? 4 : 1;
        updateWordSRS(word.hanzi, defaultQuality);
        sessionResults[word.hanzi] = {
          hanzi: word.hanzi,
          pinyin: word.pinyin,
          hanviet: word.hanviet || '',
          meaning: word.meaning,
          quality: defaultQuality,
          isPassed: isCorrect,
          index: currentIndex
        };

        // Cập nhật Lịch Sử Đánh Giá Phiên Học trực tiếp ngay trên trang
        updateSessionHistoryDOM();

        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <div class="p-4 rounded-2xl ${isCorrect ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'} shadow-sm my-3 animate-fade-in text-left">
              <div class="text-base font-extrabold mb-2 flex items-center justify-between gap-2">
                <span>${isCorrect ? `🎉 Chính xác! "${word.hanzi}" (<span class="pinyin-text font-pinyin">${word.pinyin}</span>${word.hanviet ? ` · ${word.hanviet}` : ''}) = ${word.meaning}` : `❌ Chưa chính xác! Đáp án đúng là: "${word.hanzi}" (<span class="pinyin-text font-pinyin">${word.pinyin}</span>${word.hanviet ? ` · ${word.hanviet}` : ''}) = ${word.meaning}`}</span>
                <span class="badge ${isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'} text-xs px-2.5 py-1 font-bold rounded-lg shrink-0">
                  ${isCorrect ? '🟢 Tốt (+4)' : '🔴 Chưa đúng (+1)'}
                </span>
              </div>

              <!-- Thanh Đánh giá mức độ ghi nhớ SRS trực tiếp ngay sau khi chọn đáp án -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t ${isCorrect ? 'border-emerald-200' : 'border-rose-200'} pt-3 mt-2">
                <div class="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                  <span class="text-xs font-bold text-slate-700 mr-1">Tùy chỉnh SRS độ nhớ:</span>
                  <button type="button" class="btn-srs-quiz btn btn-xs ${defaultQuality === 1 ? 'ring-2 ring-rose-500 font-black' : ''} bg-rose-500 text-white hover:bg-rose-600 rounded-lg px-2.5 py-1" data-q="1" title="Chưa nhớ (Ôn lại ngay)">🔴 Quên (1)</button>
                  <button type="button" class="btn-srs-quiz btn btn-xs ${defaultQuality === 3 ? 'ring-2 ring-amber-500 font-black' : ''} bg-amber-500 text-white hover:bg-amber-600 rounded-lg px-2.5 py-1" data-q="3" title="Hơi khó (Ôn ngày mai)">🟡 Khó (3)</button>
                  <button type="button" class="btn-srs-quiz btn btn-xs ${defaultQuality === 4 ? 'ring-2 ring-emerald-500 font-black' : ''} bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg px-2.5 py-1" data-q="4" title="Nhớ tốt (Ôn sau 3 ngày)">🟢 Tốt (4)</button>
                  <button type="button" class="btn-srs-quiz btn btn-xs ${defaultQuality === 5 ? 'ring-2 ring-sky-500 font-black' : ''} bg-sky-600 text-white hover:bg-sky-700 rounded-lg px-2.5 py-1" data-q="5" title="Rất dễ (Ôn sau 6 ngày)">🔵 Rất Dễ (5)</button>
                </div>

                <div>
                  ${currentIndex < activeWords.length - 1 ? `
                    <button type="button" id="btn-quiz-next" class="btn btn-sm btn-primary font-bold px-4 py-1.5 shadow-sm">
                      Từ Tiếp Theo ➡️
                    </button>
                  ` : `
                    <button type="button" id="btn-quiz-finish" class="btn btn-sm btn-primary font-extrabold px-5 py-1.5 shadow-glow animate-bounce">
                      🏆 Xem Báo Cáo Kỹ Năng Nghe ➡️
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;

          feedbackEl.querySelectorAll('.btn-srs-quiz').forEach(srsBtn => {
            srsBtn.addEventListener('click', (evt) => {
              const q = parseInt(evt.currentTarget.dataset.q, 10);
              const isP = q >= 4;
              updateWordSRS(word.hanzi, q);
              sessionResults[word.hanzi] = {
                hanzi: word.hanzi,
                pinyin: word.pinyin,
                hanviet: word.hanviet || '',
                meaning: word.meaning,
                quality: q,
                isPassed: isP,
                index: currentIndex
              };
              skillQuizResults.listening[word.hanzi] = isP;
              updateSessionHistoryDOM();

              if (currentIndex < activeWords.length - 1) {
                currentIndex++;
                renderCurrentSkillView();
              } else {
                triggerCompletionScreen();
              }
            });
          });

          feedbackEl.querySelector('#btn-quiz-next')?.addEventListener('click', () => {
            if (currentIndex < activeWords.length - 1) {
              currentIndex++;
              renderCurrentSkillView();
            }
          });

          feedbackEl.querySelector('#btn-quiz-finish')?.addEventListener('click', () => {
            triggerCompletionScreen();
          });
        }
      });
    });
  }

  // SKILL 2: NÓI
  function renderSpeakingSkill(body, word) {
    const activeWords = getActiveWords();
    body.innerHTML = `
      <div class="text-center py-4">
        <!-- Microphone Device Selector & Pre-authorization Status Bar -->
        <div class="mic-settings-card p-3 mb-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs max-w-2xl mx-auto">
          <div class="flex items-center gap-2 w-full sm:w-auto min-w-0">
            <span class="text-base shrink-0">🎙️</span>
            <label for="practice-mic-select" class="font-bold text-slate-700 whitespace-nowrap shrink-0">Microphone:</label>
            <select id="practice-mic-select" class="form-control text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 shadow-2xs focus:border-red-500 focus:ring-1 focus:ring-red-200 shrink-0 flex-1 sm:flex-initial min-w-[200px] truncate">
              <option value="">🔄 Đang tải danh sách Microphone...</option>
            </select>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <!-- Audio Volume Meter Bar -->
            <div id="mic-test-volume-wrapper" class="hidden items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              <span class="text-2xs font-bold text-slate-500">Âm lượng:</span>
              <div class="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div id="mic-volume-bar" class="bg-emerald-500 h-full w-0 transition-all duration-75"></div>
              </div>
            </div>

            <button type="button" id="btn-test-mic" class="btn btn-xs bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 flex items-center gap-1 cursor-pointer transition shadow-2xs whitespace-nowrap">
              🧪 Thử Micro
            </button>

            <span id="mic-status-badge" class="badge bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-2xs px-2.5 py-1 rounded-xl whitespace-nowrap">
              ⏳ Đang kết nối Micro...
            </span>
          </div>
        </div>

        ${window.location.protocol === 'file:' ? `
          <div class="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-medium text-left max-w-2xl mx-auto shadow-xs">
            <div class="flex items-start gap-2">
              <span class="text-base shrink-0">💡</span>
              <div>
                <p class="font-extrabold text-amber-950 mb-0.5">Hướng dẫn lưu VĨNH VIỄN quyền Micro trên Chrome / Edge:</p>
                <p class="text-2xs text-amber-800 leading-snug">
                  1. Khi xuất hiện hộp thoại <b>"This file wants to Use your microphones"</b>, hãy chọn <b>"Allow while visiting the site"</b>.<br/>
                  2. Để trình duyệt lưu quyền VĨNH VIỄN không bao giờ hỏi lại, hãy chạy ứng dụng bằng <b>Chay_Ung_Dung_Hanzo.bat</b> (hoặc truy cập qua <b>http://localhost:8088/</b>).
                </p>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="character-hero p-6 bg-gradient-to-b from-red-50/60 to-white rounded-2xl border border-red-100 mb-5 flex flex-col align-center justify-center shadow-xs">
          <span class="hanzi-display text-6xl font-black text-red-600 mb-2 drop-shadow-xs cursor-pointer" id="btn-speak-hanzi-title" title="Bấm để phát âm">${escapeHtml(word.hanzi)}</span>
          <p class="pinyin-display text-2xl text-slate-800 font-bold tracking-wide">${escapeHtml(word.pinyin)}${word.hanviet ? ` <span class="text-red-700 text-lg font-extrabold">(${escapeHtml(word.hanviet)})</span>` : ''}</p>
          <p class="meaning-display text-emerald-700 font-bold text-lg mt-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">💡 Nghĩa: ${escapeHtml(word.meaning)}</p>
        </div>

        <div class="flex justify-center align-center gap-3 my-4">
          <button id="btn-listen-sample" class="btn btn-secondary font-bold">
            🔊 Nghe Âm Mẫu
          </button>
          <button id="btn-record-speech" class="btn btn-primary btn-lg shadow-glow font-bold">
            🎙️ Bấm Thu Âm Phát Âm
          </button>
        </div>

        <div id="speech-status" class="status-indicator text-sm font-semibold text-slate-500 mb-3">
          Nhấn nút micro để bắt đầu phát âm...
        </div>

        <div id="speech-result-card" class="speech-card p-4 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto hidden shadow-sm">
          <p class="text-xs text-slate-500 mb-1 font-semibold">Kết quả nhận diện giọng đọc của bạn:</p>
          <div id="recognized-text" class="text-2xl font-black text-red-600 mb-2">""</div>
          <div id="pronunciation-feedback" class="text-sm font-bold"></div>
        </div>
      </div>
    `;

    body.querySelector('#btn-speak-hanzi-title')?.addEventListener('click', () => speakChinese(word.hanzi, 0.8));
    body.querySelector('#btn-listen-sample')?.addEventListener('click', () => speakChinese(word.hanzi, 0.8));

    const recBtn = body.querySelector('#btn-record-speech');
    const statusEl = body.querySelector('#speech-status');
    const resultCard = body.querySelector('#speech-result-card');
    const recognizedTextEl = body.querySelector('#recognized-text');
    const feedbackEl = body.querySelector('#pronunciation-feedback');

    const micSelect = body.querySelector('#practice-mic-select');
    const micStatusBadge = body.querySelector('#mic-status-badge');
    const btnTestMic = body.querySelector('#btn-test-mic');
    const volumeWrapper = body.querySelector('#mic-test-volume-wrapper');
    const volumeBar = body.querySelector('#mic-volume-bar');

    const loadMicrophoneList = async () => {
      const mics = await getAvailableMicrophones();
      const currentSelectedId = getSelectedMicrophoneDeviceId();

      if (micSelect) {
        if (mics.length === 0) {
          micSelect.innerHTML = `<option value="">🎙️ Microphone mặc định</option>`;
        } else {
          micSelect.innerHTML = mics.map(m => `
            <option value="${m.deviceId}" ${m.deviceId === currentSelectedId ? 'selected' : ''}>
              ${escapeHtml(m.label)}
            </option>
          `).join('');
        }
      }
    };

    const initMicPermission = (deviceId = null) => {
      if (typeof requestMicrophonePermission === 'function') {
        requestMicrophonePermission(deviceId).then(res => {
          if (res && res.success) {
            if (micStatusBadge) {
              micStatusBadge.className = 'badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-2xs px-2.5 py-1 rounded-xl whitespace-nowrap';
              micStatusBadge.innerText = '🟢 Micro đã sẵn sàng (Đã cấp quyền)';
            }
            if (statusEl && (!recognizer || !recognizer.isListening)) {
              statusEl.innerText = '🎙️ Micro đã sẵn sàng! Nhấn nút bên dưới để bắt đầu thu âm.';
            }
            loadMicrophoneList();
          } else {
            if (micStatusBadge) {
              micStatusBadge.className = 'badge bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-2xs px-2.5 py-1 rounded-xl whitespace-nowrap';
              micStatusBadge.innerText = '🔴 Chưa cấp quyền Micro';
            }
            if (statusEl) {
              statusEl.innerText = '⚠️ Vui lòng chọn "Allow / Cho phép" sử dụng Micro trên trình duyệt để luyện nói!';
            }
          }
        });
      }
    };

    initMicPermission();

    micSelect?.addEventListener('change', (e) => {
      const selectedDeviceId = e.target.value;
      setSelectedMicrophoneDeviceId(selectedDeviceId);
      if (micStatusBadge) {
        micStatusBadge.className = 'badge bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-2xs px-2.5 py-1 rounded-xl whitespace-nowrap';
        micStatusBadge.innerText = '🔄 Đang kết nối Microphone...';
      }
      initMicPermission(selectedDeviceId);
    });

    btnTestMic?.addEventListener('click', () => {
      if (volumeWrapper) volumeWrapper.classList.remove('hidden');
      testMicrophoneVolume((vol) => {
        if (volumeBar) volumeBar.style.width = `${vol}%`;
      }, 6000);
    });

    const recognizer = new ChineseSpeechRecognizer(
      (res) => {
        resultCard.classList.remove('hidden');
        recognizedTextEl.innerText = `"${res.transcript}"`;
        const evalRes = evaluatePronunciation(res.transcript, word.hanzi, word.pinyin);
        feedbackEl.innerText = evalRes.feedback;
        feedbackEl.className = evalRes.isPass ? 'text-emerald-600 font-bold text-base' : 'text-rose-600 font-bold text-base';

        // Ghi nhận kết quả phát âm kỹ năng Nói
        if (!skillQuizResults.speaking) skillQuizResults.speaking = {};
        skillQuizResults.speaking[word.hanzi] = evalRes.isPass;

        // Đồng bộ SRS & Session Results ngay khi phát âm
        const defaultQuality = evalRes.isPass ? 4 : 1;
        updateWordSRS(word.hanzi, defaultQuality);
        sessionResults[word.hanzi] = {
          hanzi: word.hanzi,
          pinyin: word.pinyin,
          hanviet: word.hanviet || '',
          meaning: word.meaning,
          quality: defaultQuality,
          isPassed: evalRes.isPass,
          index: currentIndex
        };

        let srsBar = resultCard.querySelector('#speaking-srs-bar');
        if (!srsBar) {
          srsBar = document.createElement('div');
          srsBar.id = 'speaking-srs-bar';
          srsBar.className = 'mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-left';
          srsBar.innerHTML = `
            <div class="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span class="text-xs font-bold text-slate-700 mr-1">Đánh giá độ nhớ (SRS):</span>
              <button type="button" class="btn-srs-speak btn btn-xs ${defaultQuality === 1 ? 'ring-2 ring-rose-500 font-black' : ''} bg-rose-500 text-white hover:bg-rose-600 rounded-lg px-2.5 py-1" data-q="1">🔴 Quên</button>
              <button type="button" class="btn-srs-speak btn btn-xs ${defaultQuality === 3 ? 'ring-2 ring-amber-500 font-black' : ''} bg-amber-500 text-white hover:bg-amber-600 rounded-lg px-2.5 py-1" data-q="3">🟡 Khó</button>
              <button type="button" class="btn-srs-speak btn btn-xs ${defaultQuality === 4 ? 'ring-2 ring-emerald-500 font-black' : ''} bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg px-2.5 py-1" data-q="4">🟢 Tốt</button>
              <button type="button" class="btn-srs-speak btn btn-xs ${defaultQuality === 5 ? 'ring-2 ring-sky-500 font-black' : ''} bg-sky-600 text-white hover:bg-sky-700 rounded-lg px-2.5 py-1" data-q="5">🔵 Rất Dễ</button>
            </div>
            <div>
              ${currentIndex < activeWords.length - 1 ? `
                <button type="button" id="btn-speak-next" class="btn btn-sm btn-primary font-bold px-4 py-1.5">
                  Từ Tiếp Theo ➡️
                </button>
              ` : `
                <button type="button" id="btn-speaking-finish" class="btn btn-sm btn-primary font-extrabold px-5 py-1.5 shadow-glow">
                  🏆 Xem Báo Cáo Kỹ Năng Nói ➡️
                </button>
              `}
            </div>
          `;
          resultCard.appendChild(srsBar);

          srsBar.querySelectorAll('.btn-srs-speak').forEach(srsBtn => {
            srsBtn.addEventListener('click', (evt) => {
              const q = parseInt(evt.currentTarget.dataset.q, 10);
              const isP = q >= 4;
              updateWordSRS(word.hanzi, q);
              sessionResults[word.hanzi] = {
                hanzi: word.hanzi,
                pinyin: word.pinyin,
                hanviet: word.hanviet || '',
                meaning: word.meaning,
                quality: q,
                isPassed: isP,
                index: currentIndex
              };
              skillQuizResults.speaking[word.hanzi] = isP;

              if (currentIndex < activeWords.length - 1) {
                currentIndex++;
                renderCurrentSkillView();
              } else {
                triggerCompletionScreen();
              }
            });
          });

          srsBar.querySelector('#btn-speak-next')?.addEventListener('click', () => {
            if (currentIndex < activeWords.length - 1) {
              currentIndex++;
              renderCurrentSkillView();
            }
          });

          srsBar.querySelector('#btn-speaking-finish')?.addEventListener('click', () => {
            triggerCompletionScreen();
          });
        }
      },
      (err) => {
        statusEl.innerText = `⚠️ Không nhận diện được: ${err}. Hãy đọc to và rõ ràng hơn!`;
        recBtn.classList.remove('pulse-recording');
      },
      (status) => {
        if (status === 'listening') {
          statusEl.innerText = '🔴 Đang lắng nghe... Hãy phát âm chữ Hán trên!';
          recBtn.classList.add('pulse-recording');
        } else {
          statusEl.innerText = '⏹️ Đã dừng thu âm.';
          recBtn.classList.remove('pulse-recording');
        }
      }
    );

    recBtn.addEventListener('click', () => {
      if (recognizer.isListening) {
        recognizer.stop();
      } else {
        recognizer.start();
      }
    });
  }

  // SKILL 3: ĐỌC
  function renderReadingSkill(body, word, isPinyinVisible) {
    const activeWords = getActiveWords();
    const currentSRSRes = sessionResults[word.hanzi];
    const currentQuality = currentSRSRes ? currentSRSRes.quality : null;

    body.innerHTML = `
      <div class="py-2">
        <div class="flex justify-between align-center mb-4 border-b border-slate-200 pb-3">
          <div>
            <h3 class="font-extrabold text-lg text-red-700">📖 Luyện Đọc Nhận Diện Chữ Hán</h3>
            <p class="text-xs text-slate-500">Luyện đọc chữ Hán để tăng khả năng nhận diện mặt chữ nhanh chóng.</p>
          </div>
          <button id="btn-toggle-pinyin" class="btn btn-sm ${isPinyinVisible ? 'btn-primary' : 'btn-secondary'} font-bold">
            ${isPinyinVisible ? '👁️ Pinyin: BẬT' : '🙈 Pinyin: TẮT'}
          </button>
        </div>

        <div class="reading-card text-center py-6 bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl mb-4 p-6 shadow-xs">
          <div class="reading-info text-center">
            <div class="hanzi-huge text-7xl font-black text-red-600 mb-3 cursor-pointer hover:scale-105 transition-transform" id="reading-hanzi" title="Bấm để nghe đọc">
              ${escapeHtml(word.hanzi)}
            </div>
            <div class="pinyin-badge text-2xl font-bold text-slate-800 mb-2 ${isPinyinVisible ? '' : 'invisible'}" id="reading-pinyin" style="${isPinyinVisible ? '' : 'visibility: hidden !important; opacity: 0 !important;'}">
              ${escapeHtml(word.pinyin)}${word.hanviet ? ` <span class="text-red-700 font-extrabold text-lg">(${escapeHtml(word.hanviet)})</span>` : ''}
            </div>
            <div class="meaning-box inline-block mt-2 text-lg font-bold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
              💡 Nghĩa: ${escapeHtml(word.meaning)}
            </div>
          </div>

          <!-- Đánh giá mức độ ghi nhớ SRS trực tiếp trong thẻ Đọc -->
          <div class="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span class="text-xs font-bold text-slate-700 mr-1">Đánh giá độ nhớ (SRS):</span>
              <button type="button" class="btn-srs-read btn btn-xs ${currentQuality === 1 ? 'ring-2 ring-rose-500 font-black' : ''} bg-rose-500 text-white hover:bg-rose-600 rounded-lg px-2.5 py-1" data-q="1" title="Chưa nhớ (Ôn lại ngay)">🔴 Quên (1)</button>
              <button type="button" class="btn-srs-read btn btn-xs ${currentQuality === 3 ? 'ring-2 ring-amber-500 font-black' : ''} bg-amber-500 text-white hover:bg-amber-600 rounded-lg px-2.5 py-1" data-q="3" title="Hơi khó (Ôn ngày mai)">🟡 Khó (3)</button>
              <button type="button" class="btn-srs-read btn btn-xs ${currentQuality === 4 ? 'ring-2 ring-emerald-500 font-black' : ''} bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg px-2.5 py-1" data-q="4" title="Nhớ tốt (Ôn sau 3 ngày)">🟢 Tốt (4)</button>
              <button type="button" class="btn-srs-read btn btn-xs ${currentQuality === 5 ? 'ring-2 ring-sky-500 font-black' : ''} bg-sky-600 text-white hover:bg-sky-700 rounded-lg px-2.5 py-1" data-q="5" title="Rất dễ (Ôn sau 6 ngày)">🔵 Rất Dễ (5)</button>
            </div>
            <div>
              ${currentIndex < activeWords.length - 1 ? `
                <button type="button" id="btn-read-next" class="btn btn-sm btn-primary font-bold px-4 py-1.5">Từ Tiếp Theo ➡️</button>
              ` : `
                <button type="button" id="btn-read-finish" class="btn btn-sm btn-primary font-extrabold px-5 py-1.5 shadow-glow">🏆 Xem Báo Cáo Kỹ Năng Đọc ➡️</button>
              `}
            </div>
          </div>
        </div>

        <div class="context-sentence p-4 bg-red-50/50 rounded-xl border border-red-200">
          <span class="badge badge-red mb-2 font-bold">Ví dụ đọc hiểu</span>
          <p class="text-2xl font-black text-slate-900 mb-1">${escapeHtml(word.hanzi)} 很 重要。</p>
          <p class="pinyin-display font-pinyin text-base text-slate-600 font-semibold mb-1 ${isPinyinVisible ? '' : 'invisible'}" style="${isPinyinVisible ? '' : 'visibility: hidden !important; opacity: 0 !important;'}">${escapeHtml(word.pinyin)} hěn zhòngyào.</p>
          <p class="text-base text-emerald-700 font-bold">"${escapeHtml(word.meaning)} rất quan trọng."</p>
        </div>
      </div>
    `;

    body.querySelector('#reading-hanzi')?.addEventListener('click', () => speakChinese(word.hanzi));
    body.querySelector('#btn-toggle-pinyin')?.addEventListener('click', () => {
      showPinyin = !showPinyin;
      renderCurrentSkillView();
    });

    body.querySelectorAll('.btn-srs-read').forEach(srsBtn => {
      srsBtn.addEventListener('click', (evt) => {
        const q = parseInt(evt.currentTarget.dataset.q, 10);
        const isP = q >= 4;
        updateWordSRS(word.hanzi, q);
        sessionResults[word.hanzi] = {
          hanzi: word.hanzi,
          pinyin: word.pinyin,
          hanviet: word.hanviet || '',
          meaning: word.meaning,
          quality: q,
          isPassed: isP,
          index: currentIndex
        };
        if (!skillQuizResults.reading) skillQuizResults.reading = {};
        skillQuizResults.reading[word.hanzi] = isP;
        updateSessionHistoryDOM();

        if (currentIndex < activeWords.length - 1) {
          currentIndex++;
          renderCurrentSkillView();
        } else {
          triggerCompletionScreen();
        }
      });
    });

    body.querySelector('#btn-read-next')?.addEventListener('click', () => {
      if (currentIndex < activeWords.length - 1) {
        currentIndex++;
        renderCurrentSkillView();
      }
    });

    body.querySelector('#btn-read-finish')?.addEventListener('click', () => {
      triggerCompletionScreen();
    });
  }

  // SKILL 4: VIẾT
  function renderWritingSkill(body, word) {
    const charCount = Array.from((word.hanzi || '').trim()).length;
    const boxSize = charCount >= 4 ? 130 : charCount === 3 ? 150 : 180;

    body.innerHTML = `
      <div class="py-2">
        <div class="flex justify-between align-center mb-4 border-b border-slate-200 pb-3 flex-wrap gap-2">
          <div>
            <h3 class="font-extrabold text-lg text-red-700">✍️ Hướng Dẫn Thứ Tự Nét Vẽ Chữ Hán</h3>
            <p class="text-xs text-slate-500">Quan sát hoạt ảnh thứ tự nét vẽ (Stroke Order Animation) chuẩn quy tắc.</p>
          </div>
          <button id="btn-animate-stroke" class="btn btn-sm btn-primary font-bold shadow-xs">
            ▶️ Xem Lại Nét Vẽ
          </button>
        </div>

        <div class="flex flex-col items-center justify-center gap-5 p-6 bg-white rounded-2xl border border-slate-200 max-w-3xl mx-auto text-center shadow-xs">
          <!-- Hàng 1: Hướng dẫn viết chữ (Stroke order animation boxes ngang) -->
          <div id="writer-container" class="hanzi-writer-box w-full min-h-[220px] flex items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto"></div>
          
          <!-- Hàng 2: Từ tiếng Trung | Pinyin | Hán Việt -->
          <div class="flex items-center justify-center flex-wrap gap-3 text-lg md:text-xl font-bold text-slate-800">
            <span class="text-3xl font-black text-red-600">${escapeHtml(word.hanzi)}</span>
            <span class="text-slate-300 font-normal">|</span>
            <span class="text-slate-700">Phiên âm: <span class="text-red-700 font-extrabold pinyin-text font-pinyin">${escapeHtml(word.pinyin)}</span></span>
            ${word.hanviet ? `
              <span class="text-slate-300 font-normal">|</span>
              <span class="text-slate-700">Hán Việt: <span class="text-red-700 font-bold">${escapeHtml(word.hanviet)}</span></span>
            ` : ''}
          </div>

          <!-- Hàng 3: Nghĩa tiếng Việt -->
          <div>
            <span class="text-base text-emerald-700 font-bold bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-200 inline-block shadow-2xs">💡 Nghĩa: ${escapeHtml(word.meaning)}</span>
          </div>
        </div>
      </div>
    `;

    const pad = new HanziPracticePad(null, 'writer-container');
    pad.renderWriter(word.hanzi, boxSize, boxSize);
    body.querySelector('#btn-animate-stroke')?.addEventListener('click', () => pad.animateStrokes());
  }

  // Gán Sự Kiện & Modal
  function setupEvents() {
    const activeWords = getActiveWords();

    // Chọn topic
    container.querySelector('#practice-topic-select')?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const found = allTopics.find(t => t.id === selectedId);
      if (found) {
        currentTopic = found;
        selectedHanzis = new Set((found.words || []).map(w => w.hanzi));
        sessionResults = {};
        skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };
        if (window.appInstance) {
          window.appInstance.activeTopic = found;
        }
        currentIndex = 0;
        applyShuffleIfEnabled(); // Re-shuffle khi chuyển topic
        renderCurrentSkillView();
      }
    });

    // Toggle shuffle thứ tự từ vựng
    container.querySelector('#btn-toggle-shuffle')?.addEventListener('click', () => {
      isShuffleEnabled = !isShuffleEnabled;
      applyShuffleIfEnabled();
      currentIndex = 0;
      sessionResults = {};
      skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };
      renderCurrentSkillView();
    });

    // Modal chọn từ ôn luyện chủ động
    const modal = container.querySelector('#word-selection-modal');
    container.querySelector('#btn-open-word-select')?.addEventListener('click', () => {
      modal?.classList.remove('hidden');
    });
    container.querySelector('#word-modal-close')?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    // Quick selection buttons in modal
    const wordChecks = container.querySelectorAll('.inp-word-check');
    const updateCountBadge = () => {
      const count = container.querySelectorAll('.inp-word-check:checked').length;
      const badge = container.querySelector('#selected-words-count-badge');
      if (badge) badge.innerText = `Đã chọn: ${count} / ${currentTopic.words.length} từ`;
    };

    container.querySelector('#btn-select-all-words')?.addEventListener('click', () => {
      wordChecks.forEach(ch => ch.checked = true);
      updateCountBadge();
    });

    container.querySelector('#btn-deselect-all-words')?.addEventListener('click', () => {
      wordChecks.forEach(ch => ch.checked = false);
      updateCountBadge();
    });

    container.querySelector('#btn-select-weak-words')?.addEventListener('click', () => {
      const srsProgress = getSRSProgress();
      wordChecks.forEach(ch => {
        const hanzi = ch.dataset.hanzi;
        const prog = srsProgress[hanzi];
        // Chọn các từ chưa thuộc (chưa ôn hoặc repetitions <= 1 hoặc interval <= 1)
        if (!prog || prog.repetitions <= 1 || (prog.interval && prog.interval <= 1)) {
          ch.checked = true;
        } else {
          ch.checked = false;
        }
      });
      updateCountBadge();
    });

    wordChecks.forEach(ch => ch.addEventListener('change', updateCountBadge));

    container.querySelector('#word-search-input')?.addEventListener('input', (evt) => {
      const q = evt.target.value.trim().toLowerCase();
      container.querySelectorAll('#word-select-list .word-select-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });

    container.querySelector('#btn-apply-word-selection')?.addEventListener('click', () => {
      const checkedHanzi = Array.from(container.querySelectorAll('.inp-word-check:checked')).map(c => c.dataset.hanzi);
      if (checkedHanzi.length === 0) {
        alert('Vui lòng chọn ít nhất 1 từ vựng để bắt đầu luyện tập!');
        return;
      }
      selectedHanzis = new Set(checkedHanzi);
      sessionResults = {};
      skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };
      currentIndex = 0;
      applyShuffleIfEnabled(); // Re-shuffle khi áp dụng chọn từ mới
      modal?.classList.add('hidden');
      renderCurrentSkillView();
    });

    // Skill tabs
    container.querySelectorAll('.skill-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentSkill = e.currentTarget.dataset.skill;
        renderCurrentSkillView();
      });
    });

    // Điều hướng từ
    container.querySelector('#btn-prev-word')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentSkillView();
      }
    });

    container.querySelector('#btn-next-word')?.addEventListener('click', () => {
      if (currentIndex < activeWords.length - 1) {
        currentIndex++;
        renderCurrentSkillView();
      }
    });

    container.querySelector('#btn-finish-practice')?.addEventListener('click', () => {
      triggerCompletionScreen();
    });

    // Luyện tập lại từ từ đầu tiên
    const handleRestartPractice = () => {
      currentIndex = 0;
      sessionResults = {};
      skillQuizResults = { listening: {}, speaking: {}, reading: {}, writing: {} };
      applyShuffleIfEnabled(); // Re-shuffle mỗi lần restart
      renderCurrentSkillView();
    };
    container.querySelector('#btn-restart-practice')?.addEventListener('click', handleRestartPractice);
    container.querySelector('#btn-restart-practice-footer')?.addEventListener('click', handleRestartPractice);

    // Sự kiện bấm vào các thẻ từ vựng trong Bảng Lịch Sử Đánh Giá Phiên Học để xem lại từ đó
    container.querySelectorAll('.history-item-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.dataset.idx, 10);
        if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < activeWords.length) {
          currentIndex = targetIdx;
          renderCurrentSkillView();
        }
      });
    });

    // Sự kiện bấm nút nghe phát âm từ vựng trong Bảng Đánh Giá Mức Độ Thành Thạo
    container.querySelectorAll('.btn-speak-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hanzi = e.currentTarget.dataset.hanzi;
        if (hanzi) speakChinese(hanzi);
      });
    });

    // Sự kiện bấm nút 'Ôn từ này' để nhảy ngay đến từ đó trong bài luyện tập
    container.querySelectorAll('.btn-jump-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetHanzi = e.currentTarget.dataset.hanzi;
        if (targetHanzi) {
          if (!selectedHanzis.has(targetHanzi)) {
            selectedHanzis.add(targetHanzi);
          }
          const updatedActiveWords = getActiveWords();
          const targetIndex = updatedActiveWords.findIndex(w => w.hanzi === targetHanzi);
          if (targetIndex !== -1) {
            currentIndex = targetIndex;
            renderCurrentSkillView();
          }
        }
      });
    });

    // SRS Assessment & Chấm điểm hoàn thành
    container.querySelectorAll('.btn-srs').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const quality = parseInt(e.currentTarget.dataset.q);
        const word = activeWords[currentIndex];
        const isPassed = quality >= 4;

        // Cập nhật SRS & Lưu kết quả lượt luyện tập
        updateWordSRS(word.hanzi, quality);
        sessionResults[word.hanzi] = {
          hanzi: word.hanzi,
          pinyin: word.pinyin,
          hanviet: word.hanviet || '',
          meaning: word.meaning,
          quality,
          isPassed,
          index: currentIndex
        };

        // Ghi nhận kết quả kỹ năng hiện tại nếu chưa có kết quả tương tác
        if (!skillQuizResults[currentSkill]) skillQuizResults[currentSkill] = {};
        if (skillQuizResults[currentSkill][word.hanzi] === undefined) {
          skillQuizResults[currentSkill][word.hanzi] = isPassed;
        }

        // Chuyển từ tiếp theo hoặc hoàn thành bài test
        if (currentIndex < activeWords.length - 1) {
          currentIndex++;
          renderCurrentSkillView();
        } else {
          triggerCompletionScreen();
        }
      });
    });
  }

  renderCurrentSkillView();
}

// Màn Hình Đánh Giá Chấm Điểm & Báo Cáo Hoàn Thành Luyện Tập Theo Kỹ Năng
function renderCompletionScreen(container, activeWords, sessionResults, skillQuizResults, currentSkill, currentTopic, onRePracticeUnmastered, onRestartAll, onGoTopics) {
  const total = activeWords.length;
  // Báo cáo riêng 3 kỹ năng Nghe, Nói, Đọc (KHÔNG đánh giá kết quả luyện viết)
  const skillsList = [
    { id: 'listening', name: 'Nghe (Listening)', shortName: 'Nghe', icon: '👂' },
    { id: 'speaking', name: 'Nói (Speaking)', shortName: 'Nói', icon: '🗣️' },
    { id: 'reading', name: 'Đọc (Reading)', shortName: 'Đọc', icon: '📖' }
  ];

  // Tính điểm số & % đúng cho 3 kỹ năng
  const skillStats = {};
  skillsList.forEach(sk => {
    let correctCount = 0;
    let assessedCount = 0;
    const isPracticed = (sk.id === currentSkill) || (skillQuizResults[sk.id] && Object.keys(skillQuizResults[sk.id]).length > 0);

    activeWords.forEach(w => {
      const rec = skillQuizResults?.[sk.id]?.[w.hanzi];
      if (rec !== undefined) {
        assessedCount++;
        if (rec) correctCount++;
      } else if (sk.id === currentSkill && sessionResults[w.hanzi] !== undefined) {
        assessedCount++;
        if (sessionResults[w.hanzi].isPassed) correctCount++;
      }
    });

    const percent = assessedCount > 0 ? Math.round((correctCount / assessedCount) * 100) : 0;
    skillStats[sk.id] = { correct: correctCount, total, assessedCount, percent, isPracticed };
  });

  const activeStat = skillStats[currentSkill] || skillStats['listening'];
  const activeSkillObj = skillsList.find(s => s.id === currentSkill) || skillsList[0];

  let stars = '⭐️⭐️⭐️';
  let titleText = '🎉 Hoàn Thành Luyện Tập Xuất Sắc!';

  if (!activeStat.isPracticed || activeStat.percent < 60) {
    stars = '⭐️';
    titleText = '💪 Hãy Kiên Trì Ôn Luyện!';
  } else if (activeStat.percent < 85) {
    stars = '⭐️⭐️';
    titleText = '👏 Kết Quả Rất Tốt!';
  }

  const unmasteredCount = total - activeStat.correct;

  container.innerHTML = `
    <div class="completion-card glass-panel my-6 p-6 md:p-8 animate-fade-in max-w-4xl mx-auto rounded-3xl shadow-xl border border-slate-200">
      <div class="text-center mb-6">
        <div class="completion-stars text-4xl mb-2">${stars}</div>
        <h2 class="text-3xl md:text-4xl font-extrabold text-gradient mb-1">${titleText}</h2>
        <p class="subtitle text-sm text-slate-500">
          Bộ từ vựng: <span class="font-bold text-slate-800">${escapeHtml(currentTopic ? currentTopic.name : 'Chủ đề')}</span> (${total} từ vựng)
        </p>
      </div>

      <!-- Khung Điểm Số Trọng Tâm Kỹ Năng Hiện Tại -->
      <div class="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 text-white p-6 rounded-2xl mb-8 shadow-lg relative overflow-hidden text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <span>🎯 Báo Cáo Kết Quả Kỹ Năng: ${activeSkillObj.icon} ${activeSkillObj.name}</span>
        </div>
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 my-2">
          <div class="bg-white text-slate-900 rounded-2xl p-4 min-w-[150px] shadow-inner text-center">
            <div class="text-4xl font-black text-red-600">${activeStat.isPracticed ? activeStat.correct : 0} / ${total}</div>
            <div class="text-xs font-bold text-slate-500 uppercase mt-1">Câu Trả Lời Đúng</div>
          </div>
          <div class="bg-white text-slate-900 rounded-2xl p-4 min-w-[150px] shadow-inner text-center">
            <div class="text-4xl font-black text-emerald-600">${activeStat.isPracticed ? `${activeStat.percent}%` : 'N/A'}</div>
            <div class="text-xs font-bold text-slate-500 uppercase mt-1">Tỷ Lệ Đạt Đúng</div>
          </div>
        </div>
        <p class="text-xs md:text-sm text-amber-100 font-medium max-w-lg mx-auto mt-3">
          ${!activeStat.isPracticed
            ? '💡 Chọn các tùy chọn bài tập hoặc đánh giá SRS để tính điểm cho kỹ năng này.'
            : activeStat.percent >= 85
            ? '🔥 Bạn đã làm chủ xuất sắc bài tập kỹ năng này! Hãy tiếp tục phát huy.'
            : activeStat.percent >= 60
            ? '👍 Bạn đạt kết quả khá tốt. Ôn lại một số câu chưa đúng để đạt 100% nhé.'
            : '💡 Hãy nhấn "Ôn Lại Các Từ Chưa Đúng" phía dưới để nâng cao điểm số!'}
        </p>
      </div>

      <!-- Báo Cáo Chấm Điểm 3 Kỹ Năng Nghe - Nói - Đọc -->
      <div class="mb-8">
        <h3 class="font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
          <span>📊 Điểm Số & Tỷ Lệ Hoàn Thành Cho Từng Kỹ Năng (Nghe - Nói - Đọc)</span>
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${skillsList.map(sk => {
            const stat = skillStats[sk.id];
            const isActive = sk.id === currentSkill;
            let barBg = stat.percent >= 80 ? 'bg-emerald-500' : stat.percent >= 60 ? 'bg-amber-500' : 'bg-rose-500';
            let badgeBg = stat.percent >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : stat.percent >= 60 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200';
            let badgeText = stat.percent >= 80 ? '🟢 Đạt Giỏi' : stat.percent >= 60 ? '🟡 Đạt Khá' : '🔴 Cần Ôn';

            if (!stat.isPracticed) {
              badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
              badgeText = '⚪ Chưa Tập';
              barBg = 'bg-slate-300';
            }

            return `
              <div class="p-3.5 rounded-2xl border transition-all ${isActive ? 'ring-2 ring-red-500 bg-red-50/20 border-red-300 shadow-sm' : 'border-slate-200 bg-white'}">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <span>${sk.icon}</span> ${sk.shortName}
                  </span>
                  <span class="badge ${badgeBg} text-2xs font-bold px-2 py-0.5 rounded-md border">${badgeText}</span>
                </div>
                <div class="flex items-baseline justify-between mb-1.5">
                  <span class="text-xl font-black text-slate-900">${stat.isPracticed ? `${stat.correct}/${stat.total}` : '—'} <span class="text-xs font-normal text-slate-500">câu</span></span>
                  <span class="text-sm font-bold text-slate-700">${stat.isPracticed ? `${stat.percent}%` : 'N/A'}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div class="${barBg} h-full rounded-full transition-all duration-500" style="width: ${stat.isPracticed ? stat.percent : 0}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Bảng Thống Kê Chi Tiết Từng Từ Vựng & Kỹ Năng -->
      <div class="text-left mb-8">
        <h3 class="font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
          <span>📋 Bảng Điểm Chi Tiết Từng Từ Vựng</span>
        </h3>
        <div class="space-y-2 max-h-72 overflow-y-auto pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50">
          ${activeWords.map((w, index) => {
            const getSkillBadge = (skId, icon, label) => {
              const quizRes = skillQuizResults[skId]?.[w.hanzi];

              let isPassed = false;
              let isEvaluated = false;

              if (quizRes !== undefined) {
                isEvaluated = true;
                isPassed = quizRes;
              } else if (skId === currentSkill && sessionResults[w.hanzi] !== undefined) {
                isEvaluated = true;
                isPassed = sessionResults[w.hanzi].isPassed;
              }

              if (!isEvaluated) {
                return `
                  <span class="badge bg-slate-100 text-slate-500 border-slate-200 text-2xs font-medium px-2 py-0.5 border" title="Kỹ năng ${label} chưa thực hiện">
                    ${icon} Chưa tập
                  </span>
                `;
              }

              return `
                <span class="badge ${isPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'} text-2xs font-bold px-2 py-0.5 border" title="Kỹ năng ${label}">
                  ${icon} ${isPassed ? 'Đúng' : 'Chưa đúng'}
                </span>
              `;
            };

            const activeOk = skillQuizResults[currentSkill]?.[w.hanzi] ?? sessionResults[w.hanzi]?.isPassed ?? false;

            return `
              <div class="result-word-item flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-xl bg-white border ${activeOk ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-xs font-bold text-slate-400 shrink-0">#${index + 1}</span>
                  <div class="truncate">
                    <span class="font-bold text-base text-slate-900">${escapeHtml(w.hanzi)}</span>
                    <span class="text-xs text-slate-500 ml-1">(<span class="pinyin-text font-pinyin">${escapeHtml(w.pinyin)}</span>${w.hanviet ? ` · ${escapeHtml(w.hanviet)}` : ''})</span>
                    <div class="text-xs text-slate-600 font-medium truncate">${escapeHtml(w.meaning)}</div>
                  </div>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  ${getSkillBadge('listening', '👂', 'Nghe')}
                  ${getSkillBadge('speaking', '🗣️', 'Nói')}
                  ${getSkillBadge('reading', '📖', 'Đọc')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Action Footer Buttons -->
      <div class="flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-6">
        ${unmasteredCount > 0 ? `
          <button id="btn-re-practice-unmastered" class="btn btn-primary shadow-glow">
            🔄 Ôn Lại ${unmasteredCount} Từ Chưa Đúng
          </button>
        ` : ''}
        <button id="btn-restart-all" class="btn btn-secondary font-bold">
          ▶️ Ôn Lại Toàn Bộ (${total} Từ)
        </button>
        <button id="btn-back-topics" class="btn btn-secondary font-bold">
          🎯 Trở Về Trang Luyện Tập
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-re-practice-unmastered')?.addEventListener('click', onRePracticeUnmastered);
  container.querySelector('#btn-restart-all')?.addEventListener('click', onRestartAll);
  container.querySelector('#btn-back-topics')?.addEventListener('click', onGoTopics);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
