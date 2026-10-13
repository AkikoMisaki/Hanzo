// Module 6: Lịch Học Tập & Giám Sát Tiến Độ Học (scheduleView.js)
import { 
  getAllTopicsList, 
  getSRSProgress, 
  getUserStats, 
  getScheduleGoals, 
  saveScheduleGoals, 
  getDailyLogs, 
  getRealTimeStats 
} from '../utils/srs.js';
import { getScopedStorageKey, getActiveUser } from '../utils/accountManager.js';

function getScheduleKey() {
  return typeof getScopedStorageKey === 'function' ? getScopedStorageKey('hanzo_custom_schedule_list') : 'hanzo_custom_schedule_list';
}

export function getDayOfWeekFromDate(dateStr) {
  if (!dateStr) return null;
  
  let year, month, day;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(s => s.trim());
    if (parts.length === 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-').map(s => s.trim());
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  }

  if (!year || isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  const d = new Date(year, month, day);
  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return dayNames[d.getDay()];
}

export function getRealTimeWeekDays(referenceDate = new Date()) {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const dayOfWeek = now.getDay();
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distToMonday);

  const daysInfo = [
    { day: 'Thứ 2', defaultTime: '08:00 - 08:30' },
    { day: 'Thứ 3', defaultTime: '19:00 - 19:50' },
    { day: 'Thứ 4', defaultTime: '19:30 - 20:15' },
    { day: 'Thứ 5', defaultTime: '08:00 - 08:45' },
    { day: 'Thứ 6', defaultTime: '19:00 - 19:40' },
    { day: 'Thứ 7', defaultTime: '09:00 - 09:45' },
    { day: 'Chủ Nhật', defaultTime: '10:00 - 10:30' }
  ];

  return daysInfo.map((item, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dayStr = d.getDate().toString().padStart(2, '0');
    const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
    const yearStr = d.getFullYear();
    return {
      day: item.day,
      date: `${dayStr}/${monthStr}/${yearStr}`,
      defaultTime: item.defaultTime
    };
  });
}

function formatDateToVN(dateStr) {
  if (!dateStr) {
    const now = new Date();
    const dStr = now.getDate().toString().padStart(2, '0');
    const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${dStr}/${mStr}/${now.getFullYear()}`;
  }
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function formatDateToInput(dateStr) {
  const now = new Date();
  const dStr = now.getDate().toString().padStart(2, '0');
  const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const defaultIso = `${now.getFullYear()}-${mStr}-${dStr}`;

  if (!dateStr) return defaultIso;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dateStr;
}

function isScheduleOverdue(item) {
  if (!item || item.status === 'completed') return false;
  if (item.status === 'overdue') return true;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDateStr = item.endDate || item.date;
    if (checkDateStr && checkDateStr.includes('-') && checkDateStr.includes('/')) {
      const parts = checkDateStr.split('-').map(s => s.trim());
      if (parts.length === 2 && parts[1].includes('/')) {
        checkDateStr = parts[1];
      }
    }

    if (checkDateStr && checkDateStr.includes('/')) {
      const p = checkDateStr.split('/');
      if (p.length === 3) {
        const itemDate = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        return today > itemDate;
      }
    }
  } catch (e) {}

  return false;
}

function getDefaultScheduleItems(allTopics = []) {
  if (!allTopics || allTopics.length === 0) {
    allTopics = getAllTopicsList();
  }

  const colors = ['#22C55E', '#F97316', '#3B82F6', '#EC4899', '#22C55E', '#A855F7'];
  const realWeekDays = getRealTimeWeekDays();

  // Multi-session default items configuration
  const defaultConfigs = [
    { topicIdx: 0, dayIdx: 0, time: '08:00 - 08:45', status: 'in_progress', targetReps: 3, currentReps: 2 },
    { topicIdx: 1, dayIdx: 0, time: '19:00 - 19:45', status: 'not_started', targetReps: 3, currentReps: 0 },
    { topicIdx: 2, dayIdx: 1, time: '19:00 - 19:50', status: 'completed', targetReps: 3, currentReps: 3 },
    { topicIdx: 3, dayIdx: 2, time: '19:30 - 20:15', status: 'not_started', targetReps: 5, currentReps: 0 },
    { topicIdx: 4, dayIdx: 3, time: '08:00 - 08:45', status: 'completed', targetReps: 3, currentReps: 3 }
  ];

  return defaultConfigs.map((cfg, idx) => {
    const t = allTopics[cfg.topicIdx % allTopics.length] || allTopics[0];
    const dayInfo = realWeekDays[cfg.dayIdx % realWeekDays.length];
    const firstWord = (t.words && t.words.length > 0) ? t.words[0] : { hanzi: '学习', pinyin: 'xuéxí' };

    return {
      id: `sch_${t.id}_${idx}`,
      accentColor: colors[idx % colors.length],
      day: dayInfo.day,
      date: dayInfo.date,
      time: cfg.time,
      topicId: t.id,
      topicName: t.name,
      hanzi: firstWord.hanzi,
      pinyin: firstWord.pinyin,
      vocabCount: (t.words || []).length,
      skills: ['quiz', 'speak', 'read', 'write'],
      targetReps: cfg.targetReps,
      currentReps: cfg.currentReps,
      status: cfg.status
    };
  });
}

export function getStoredScheduleItems(allTopics = []) {
  try {
    const activeUser = typeof getActiveUser === 'function' ? getActiveUser() : { id: 'usr_minhanh' };
    const data = localStorage.getItem(getScheduleKey());
    const stored = data ? JSON.parse(data) : [];
    if (!stored || stored.length === 0) {
      if (activeUser.id === 'usr_minhanh') {
        return getDefaultScheduleItems(allTopics);
      }
      return [];
    }

    const realWeekDays = getRealTimeWeekDays();
    stored.forEach((item, idx) => {
      const dateToCheck = item.startDate || item.date;
      const computedDay = getDayOfWeekFromDate(dateToCheck);

      if (computedDay) {
        item.day = computedDay;
      } else if (!item.day || !realWeekDays.some(w => w.day === item.day)) {
        item.day = realWeekDays[idx % realWeekDays.length].day;
      }

      if (item.scheduleType !== 'by_range') {
        const matchedRealDay = realWeekDays.find(w => w.day === item.day);
        if (matchedRealDay) {
          item.date = matchedRealDay.date;
        }
      }
    });

    return stored;
  } catch (e) {
    return [];
  }
}

function saveStoredScheduleItems(items) {
  try {
    localStorage.setItem(getScheduleKey(), JSON.stringify(items));
  } catch (e) {}
}

export function renderScheduleView(container, onStartPracticeCallback) {
  const allTopics = getAllTopicsList();
  let scheduleItems = getStoredScheduleItems(allTopics);
  let currentFilter = 'all';
  let currentPage = 1;
  let currentMonthOffset = 0;

  function renderView() {
    const realStats = getRealTimeStats();

    const referenceDate = new Date();
    referenceDate.setMonth(referenceDate.getMonth() + currentMonthOffset);
    const monthYearStr = `Tháng ${referenceDate.getMonth() + 1}/${referenceDate.getFullYear()}`;

    const WEEK_DAYS = getRealTimeWeekDays(referenceDate);

    const now = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const todayDayName = dayNames[now.getDay()];
    const todayFormattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const inProgressCount = scheduleItems.filter(i => i.status === 'in_progress').length;
    const completedCount = scheduleItems.filter(i => i.status === 'completed').length;
    const notStartedCount = scheduleItems.filter(i => i.status === 'not_started').length;
    const overdueCount = scheduleItems.filter(i => isScheduleOverdue(i)).length;

    const filteredDays = WEEK_DAYS.filter(dayInfo => {
      const itemsForDay = scheduleItems.filter(i => i.day === dayInfo.day);
      if (currentFilter === 'all') return true;
      return itemsForDay.some(item => {
        if (currentFilter === 'overdue') return isScheduleOverdue(item);
        return item.status === currentFilter;
      });
    });

    const pageSize = 4;
    const totalPages = Math.max(1, Math.ceil(filteredDays.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedDays = filteredDays.slice(startIndex, startIndex + pageSize);
    const displayStart = filteredDays.length > 0 ? startIndex + 1 : 0;
    const displayEnd = Math.min(startIndex + pageSize, filteredDays.length);

    // Circular Donut stroke calculation
    const percent = realStats.progressPercent || 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const todayItem = scheduleItems.find(i => i.day === todayDayName) || scheduleItems.find(i => i.status === 'in_progress') || scheduleItems.find(i => i.status === 'not_started') || scheduleItems[0];
    const todayTopic = allTopics.find(t => t.id === (todayItem ? todayItem.topicId : '')) || allTopics[0];

    container.innerHTML = `
      <div class="schedule-view-wrapper w-full max-w-none space-y-4">

        <!-- HERO HEADER with Decorative Background -->
        <div class="relative overflow-hidden rounded-2xl shadow-md" style="min-height:112px; background: linear-gradient(135deg, #fff5f5 0%, #ffe4e4 40%, #ffd6d6 100%);">
          <!-- Decorative background image (sakura/mountain scene) -->
          <div class="absolute inset-0 pointer-events-none select-none" style="overflow:hidden;">
            <img src="./assets/schedule_header_bg.png" alt="" aria-hidden="true"
              style="position:absolute;right:0;top:0;height:100%;width:55%;object-fit:cover;object-position:left center;opacity:0.88;mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.2) 12%,rgba(0,0,0,1) 36%);-webkit-mask-image:linear-gradient(to right,transparent 0%,rgba(0,0,0,0.2) 12%,rgba(0,0,0,1) 36%);" />
          </div>

          <!-- Left content -->
          <div class="relative z-10 flex items-center gap-4 p-5 sm:p-6">
            <div class="w-14 h-14 rounded-2xl bg-white/80 border-2 border-rose-200 text-rose-600 flex items-center justify-center text-3xl shadow-md shrink-0 backdrop-blur-xs">
              📅
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-[#C41E24] tracking-tight leading-tight drop-shadow-sm">Lên lịch học</h1>
              <p class="text-xs text-rose-700/80 font-semibold mt-0.5">Tạo và quản lý lịch học các chủ đề từ vựng theo mục tiêu của bạn</p>
            </div>
          </div>

          <!-- Create button – top-right corner overlay -->
          <div class="absolute top-1/2 right-5 -translate-y-1/2 z-10">
            <button id="btn-open-create-modal" class="btn-crimson px-5 py-2.5 shadow-lg flex items-center gap-2 text-xs font-bold cursor-pointer">
              <span class="text-base leading-none">+</span> Tạo lịch học mới
            </button>
          </div>
        </div>

        <!-- FILTER TAB PILLS & MONTH PICKER BAR -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Tất cả -->
            <button class="sch-tab-pill ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Tất cả <span class="pill-count">${scheduleItems.length}</span>
            </button>
            <!-- Đang học -->
            <button class="sch-tab-pill sch-pill-green ${currentFilter === 'in_progress' ? 'active' : ''}" data-filter="in_progress">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Đang học <span class="pill-count">${inProgressCount}</span>
            </button>
            <!-- Đã hoàn thành -->
            <button class="sch-tab-pill sch-pill-blue ${currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Đã hoàn thành <span class="pill-count">${completedCount}</span>
            </button>
            <!-- Chưa bắt đầu -->
            <button class="sch-tab-pill sch-pill-amber ${currentFilter === 'not_started' ? 'active' : ''}" data-filter="not_started">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Chưa bắt đầu <span class="pill-count">${notStartedCount}</span>
            </button>
            <!-- Quá hạn -->
            <button class="sch-tab-pill sch-pill-red ${currentFilter === 'overdue' ? 'active' : ''}" data-filter="overdue">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Quá hạn <span class="pill-count bg-rose-600 text-white border-rose-600">${overdueCount}</span>
            </button>
          </div>

          <!-- Month Picker -->
          <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs text-xs font-bold text-slate-700 shrink-0">
            <svg class="w-3.5 h-3.5 text-rose-500 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span class="font-extrabold">${monthYearStr}</span>
            <div class="flex items-center gap-0.5 ml-1">
              <button id="sch-month-prev" class="w-6 h-6 rounded-md hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 font-bold cursor-pointer transition-colors" title="Tháng trước">&lt;</button>
              <button id="sch-month-next" class="w-6 h-6 rounded-md hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 font-bold cursor-pointer transition-colors" title="Tháng sau">&gt;</button>
            </div>
          </div>
        </div>

        <!-- MAIN 2-COLUMN WORKSPACE GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full items-stretch">
          
          <!-- LEFT COLUMN: SCHEDULE MAIN TABLE (Cols 8) -->
          <div class="lg:col-span-8 flex flex-col w-full h-full">
            <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden w-full h-full flex flex-col justify-between">
              <div class="overflow-x-auto flex-1">
                <table class="w-full text-left border-separate border-spacing-y-2 text-xs">
                  <thead>
                    <tr class="text-slate-400 font-bold uppercase tracking-wider" style="font-size:0.6rem; letter-spacing:0.07em;">
                      <th class="pb-3 text-center w-10">#</th>
                      <th class="pb-3 pl-4 text-left" style="min-width:130px">Thời gian</th>
                      <th class="pb-3 pl-2 text-left" style="min-width:160px">Chủ đề từ vựng</th>
                      <th class="pb-3 text-center" style="min-width:130px">Kỹ năng luyện tập</th>
                      <th class="pb-3 text-center" style="min-width:70px">Số LN</th>
                      <th class="pb-3 text-center" style="min-width:100px">Tiến độ</th>
                      <th class="pb-3 text-center" style="min-width:150px">Trạng thái</th>
                      <th class="pb-3 pr-4 text-center" style="min-width:90px">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${paginatedDays.length === 0 ? `
                      <tr>
                        <td colspan="8" class="text-center py-8 text-slate-400 font-bold text-xs">
                          Không tìm thấy lịch học nào khớp với bộ lọc
                        </td>
                      </tr>
                    ` : paginatedDays.map((dayInfo, dayIdx) => {
                      const itemsForDay = scheduleItems.filter(i => i.day === dayInfo.day);
                      const matchingItems = itemsForDay.filter(item => {
                        if (currentFilter === 'all') return true;
                        if (currentFilter === 'overdue') return isScheduleOverdue(item);
                        return item.status === currentFilter;
                      });

                      if (matchingItems.length === 0) {
                        if (currentFilter !== 'all') return '';

                        const globalIdx = startIndex + dayIdx + 1;
                        return `
                          <tr class="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <td class="pl-2.5 pr-2 font-black text-slate-400 text-xs w-10" style="border-left: 4px solid #CBD5E1; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">
                              ${globalIdx}
                            </td>
                            <td class="py-3 pl-4">
                              <div class="font-extrabold text-slate-700 text-xs">${dayInfo.day}</div>
                              <div class="text-2xs text-slate-400 font-medium">${dayInfo.date}</div>
                              <div class="text-2xs text-slate-400 font-medium">${dayInfo.defaultTime}</div>
                            </td>
                            <td class="py-3">
                              <div class="flex items-center gap-2.5">
                                <div class="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-lg shrink-0 font-bold">
                                  ⚪
                                </div>
                                <div>
                                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-extrabold text-2xs">
                                    Chưa có lịch học
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 text-center text-slate-300 font-bold text-xs">--</td>
                            <td class="py-3 text-center text-slate-300 font-bold text-xs">--</td>
                            <td class="py-3 text-slate-300 font-bold text-2xs">--</td>
                            <td class="py-3 text-center align-middle">
                              <div class="flex items-center justify-center">
                                <span class="status-badge-not-started text-slate-400 bg-slate-50 border-slate-200">⚪ Chưa có lịch</span>
                              </div>
                            </td>
                            <td class="py-3 pr-4 text-center" style="border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
                              <button class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#C41E24] border border-rose-200 font-extrabold text-2xs shadow-2xs btn-add-day-sch cursor-pointer" data-day="${dayInfo.day}">
                                + Thêm lịch
                              </button>
                            </td>
                          </tr>
                        `;
                      }

                      return matchingItems.map((item, subIdx) => {
                        const globalIdx = `${startIndex + dayIdx + 1}${matchingItems.length > 1 ? `.${subIdx + 1}` : ''}`;
                        const topicObj = allTopics.find(t => String(t.id) === String(item.topicId) || t.name === item.topicName) || allTopics[0];
                        const topicIcon = topicObj ? (topicObj.icon || '📚') : '📚';
                        const accent = item.accentColor || '#C41E24';
                        const progressPct = Math.min(100, Math.round((item.currentReps / item.targetReps) * 100));
                        const isOverdue = isScheduleOverdue(item);

                        let statusBadge = `<span class="status-badge-not-started">🕒 Chưa bắt đầu</span>`;
                        if (item.status === 'completed') {
                          const dateInfo = item.completedDate ? ` (${item.completedDate})` : '';
                          if (item.wasOverdue) {
                            statusBadge = `<span class="status-badge-completed text-amber-800 bg-amber-50 border-amber-200" title="Hoàn thành quá hạn ngày ${item.completedDate || ''}">✔ Hoàn thành${dateInfo}</span>`;
                          } else {
                            statusBadge = `<span class="status-badge-completed" title="Hoàn thành ngày ${item.completedDate || ''}">✔ Hoàn thành${dateInfo}</span>`;
                          }
                        } else if (isOverdue) {
                          statusBadge = `<span class="status-badge-overdue">⚠️ Quá hạn</span>`;
                        } else if (item.status === 'in_progress') {
                          statusBadge = `<span class="status-badge-in-progress">► Đang học</span>`;
                        }

                        return `
                          <tr style="--row-accent: ${accent}" class="bg-white hover:bg-slate-50/80 transition-colors">
                            <td class="pl-2.5 pr-2 font-black text-slate-700 text-xs w-10" style="border-left: 4px solid ${accent}; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">
                              ${globalIdx}
                            </td>
                            <td class="py-3 pl-4">
                              ${item.scheduleType === 'by_range' ? `
                                <div class="font-extrabold text-rose-600 text-2xs flex items-center gap-1">
                                  <span>⏳</span> ${item.startDate || dayInfo.date} ➔ ${item.endDate || dayInfo.date}
                                </div>
                                <div class="text-3xs text-slate-400 font-semibold mt-0.5">${dayInfo.day} (${dayInfo.date})</div>
                                <div class="text-3xs text-slate-400 font-medium">${item.time || 'Cả ngày'}</div>
                              ` : `
                                <div class="font-extrabold text-slate-800 text-xs flex items-center justify-between gap-1">
                                  <span>${dayInfo.day}</span>
                                  ${matchingItems.length > 1 ? `<span class="text-3xs bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md font-extrabold border border-rose-100">Ca ${subIdx + 1}</span>` : ''}
                                </div>
                                <div class="text-2xs text-slate-400 font-medium">${dayInfo.date}</div>
                                <div class="text-2xs text-slate-400 font-medium">${item.time}</div>
                              `}
                            </td>
                            <td class="py-3">
                              <div class="flex items-center gap-2.5">
                                <div class="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-slate-800 flex items-center justify-center text-xl shadow-2xs shrink-0 font-bold">
                                  ${topicIcon}
                                </div>
                                <div>
                                  <div class="font-extrabold text-slate-800 text-xs">${item.topicName}</div>
                                  <div class="text-2xs text-slate-400 font-medium hanzi-font">${item.hanzi} <span class="pinyin-text font-pinyin">${item.pinyin}</span></div>
                                  <span class="inline-block px-2 py-0.5 mt-0.5 rounded-full text-3xs font-extrabold bg-rose-50 text-rose-600 border border-rose-100">${item.vocabCount} từ vựng</span>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 text-center">
                              <div class="flex items-center justify-center gap-1">
                                <span class="skill-icon-circle ${(item.skills || ['quiz','speak','read','write']).includes('quiz') ? 'skill-circle-quiz' : 'bg-slate-100 text-slate-300 opacity-40'}" title="Nghe / Trắc nghiệm">
                                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 3.5-1.5 6.5-3.5 9-1.2 1.5-2 2-3 2s-1.5-1-1.5-2.5c0-1.5 1-2.5 2-2.5"/><path d="M11 9a2 2 0 0 1 2 2"/></svg>
                                </span>
                                <span class="skill-icon-circle ${(item.skills || ['quiz','speak','read','write']).includes('speak') ? 'skill-circle-speak' : 'bg-slate-100 text-slate-300 opacity-40'}" title="Nói / Phát âm">
                                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 12c3-3 6-3 10 0 4-3 7-3 10 0-3 5-7 7-10 7S5 17 2 12z"/><path d="M7 12c2.5 2 7.5 2 10 0"/></svg>
                                </span>
                                <span class="skill-icon-circle ${(item.skills || ['quiz','speak','read','write']).includes('read') ? 'skill-circle-read' : 'bg-slate-100 text-slate-300 opacity-40'}" title="Đọc hiểu">
                                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                </span>
                                <span class="skill-icon-circle ${(item.skills || ['quiz','speak','read','write']).includes('write') ? 'skill-circle-write' : 'bg-slate-100 text-slate-300 opacity-40'}" title="Tập viết">
                                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </span>
                              </div>
                            </td>
                            <td class="py-3 text-center">
                              <select class="sch-reps-select bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-2xs font-bold text-slate-700 cursor-pointer" data-id="${item.id}">
                                ${[1,2,3,4,5].map(n => `<option value="${n}" ${item.targetReps === n ? 'selected' : ''}>${n}</option>`).join('')}
                              </select>
                            </td>
                            <td class="py-3 text-center align-middle">
                              <div class="w-24 mx-auto">
                                <div class="flex justify-between text-3xs text-slate-400 mb-0.5">
                                  <span class="font-semibold">Progress</span>
                                  <span class="font-extrabold text-slate-700">${item.currentReps}/${item.targetReps}</span>
                                </div>
                                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div class="h-1.5 rounded-full ${item.status === 'completed' ? 'bg-emerald-500' : (item.currentReps > 0 ? 'bg-emerald-500' : 'bg-slate-200')}" style="width: ${progressPct}%"></div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 text-center align-middle">
                              <div class="flex items-center justify-center">
                                ${statusBadge}
                              </div>
                            </td>
                            <td class="py-3 pr-4 text-center" style="border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
                              <div class="flex items-center justify-center gap-1.5">
                                <button class="btn-crimson-sm btn-start-practice cursor-pointer" data-topic-id="${item.topicId}" data-topic-name="${item.topicName}">Xem</button>
                                <div class="relative inline-block text-left sch-menu-wrapper">
                                  <button class="text-slate-400 hover:text-slate-700 px-1 text-base font-bold btn-toggle-row-menu cursor-pointer" data-id="${item.id}" title="Tùy chọn">⋮</button>
                                  <div class="sch-dropdown-popover hidden absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs text-left" id="popover-${item.id}">
                                    <button class="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 btn-edit-schedule-row cursor-pointer" data-id="${item.id}">
                                      <span>✏️</span> Chỉnh sửa
                                    </button>
                                    <button class="w-full text-left px-3 py-1.5 text-[#C41E24] hover:bg-rose-50 font-bold flex items-center gap-2 btn-add-day-sch cursor-pointer" data-day="${dayInfo.day}">
                                      <span>➕</span> Thêm ca học
                                    </button>
                                    <button class="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 btn-delete-schedule-row cursor-pointer" data-id="${item.id}">
                                      <span>🗑️</span> Xóa lịch học
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('');
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- TABLE FOOTER PAGINATION -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2 px-1">
                <div class="text-slate-400 font-semibold" style="font-size:0.68rem;">
                  Hiển thị <span class="font-extrabold text-slate-600">${displayStart} – ${displayEnd}</span> / <span class="font-extrabold text-slate-600">${filteredDays.length}</span> lịch học trong tháng
                </div>
                <div class="flex items-center gap-1" id="schedule-pagination-wrap">
                  <!-- First page -->
                  <button id="sch-page-first" class="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 font-bold text-xs flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer ${currentPage <= 1 ? 'opacity-30 pointer-events-none' : ''}" title="Trang đầu">&#171;</button>
                  <!-- Prev -->
                  <button id="sch-page-prev" class="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 font-bold text-xs flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer ${currentPage <= 1 ? 'opacity-30 pointer-events-none' : ''}" title="Trang trước">&#8249;</button>
                  <!-- Page numbers -->
                  ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                    <button class="sch-page-num w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer font-bold ${p === currentPage ? 'bg-[#C41E24] text-white shadow-sm border border-[#C41E24]' : 'border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}" data-page="${p}">${p}</button>
                  `).join('')}
                  <!-- Next -->
                  <button id="sch-page-next" class="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 font-bold text-xs flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer ${currentPage >= totalPages ? 'opacity-30 pointer-events-none' : ''}" title="Trang sau">&#8250;</button>
                  <!-- Last page -->
                  <button id="sch-page-last" class="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 font-bold text-xs flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer ${currentPage >= totalPages ? 'opacity-30 pointer-events-none' : ''}" title="Trang cuối">&#187;</button>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: STATS, TODAY SCHEDULE & SETTINGS (Cols 4) -->
          <div class="lg:col-span-4 flex flex-col gap-5">
            
            <!-- WIDGET 1: TIẾN ĐỘ HỌC TẬP -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-rose-600 text-base">📊</span>
                  <h3 class="font-extrabold text-slate-900 text-sm">Tiến độ học tập</h3>
                </div>
                <a href="#" id="btn-view-stat-details" class="text-3xs font-extrabold text-rose-600 hover:underline">Xem chi tiết ➔</a>
              </div>

              <div class="grid grid-cols-12 gap-3 items-center">
                <!-- Circular Donut Chart -->
                <div class="col-span-5 flex justify-center">
                  <div class="relative w-24 h-24 flex items-center justify-center">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="${radius}" stroke="#F1F5F9" stroke-width="12" fill="transparent" />
                      <circle cx="50" cy="50" r="${radius}" stroke="#C41E24" stroke-width="12" fill="transparent"
                              stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" />
                    </svg>
                    <div class="absolute text-center leading-none">
                      <div class="text-xl font-black text-[#C41E24]">${percent}%</div>
                      <div class="text-3xs text-slate-400 font-medium mt-0.5 leading-tight" style="font-size:0.55rem;">Hoàn thành<br/>kế hoạch tuần</div>
                    </div>
                  </div>
                </div>

                <!-- Stats Rows -->
                <div class="col-span-7 space-y-2 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-rose-500 text-xs">📖</span>
                    <div>
                      <span class="font-black text-slate-900 text-xs mr-1">${realStats.learnedWords || 120}</span>
                      <span class="text-3xs text-slate-500 font-medium">Từ vựng đã học</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-amber-500 text-xs">🎯</span>
                    <div>
                      <span class="font-black text-slate-900 text-xs mr-1">${realStats.completedTopics}</span>
                      <span class="text-3xs text-slate-500 font-medium">Chủ đề đã hoàn thành</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-rose-600 text-xs">⏱️</span>
                    <div>
                      <span class="font-black text-slate-900 text-xs mr-1">${realStats.streak || 5}</span>
                      <span class="text-3xs text-slate-500 font-medium">Ngày học liên tiếp</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-blue-500 text-xs">⏱️</span>
                    <div>
                      <span class="font-black text-slate-900 text-xs mr-1">${realStats.timeFormattedLong || '2 giờ 30 phút'}</span>
                      <span class="text-3xs text-slate-500 font-medium block">Thời gian học tuần này</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 2: LỊCH HỌC HÔM NAY -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-rose-600 text-base">📅</span>
                  <h3 class="font-extrabold text-slate-900 text-sm">Hôm nay</h3>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-3xs font-extrabold text-rose-600">${todayItem ? todayItem.day : todayDayName}, ${todayItem ? (todayItem.scheduleType === 'by_range' ? `${todayItem.startDate} ➔ ${todayItem.endDate}` : todayItem.date) : todayFormattedDate}</span>
                  ${todayItem ? `
                    <button class="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#C41E24] border border-rose-200 font-extrabold text-3xs shadow-2xs btn-edit-today-sch cursor-pointer" data-id="${todayItem.id}">
                      ✏️ Sửa
                    </button>
                  ` : ''}
                </div>
              </div>

              ${isScheduleOverdue(todayItem) ? `
                <div class="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-2.5 flex items-center gap-2 text-2xs font-extrabold">
                  <span class="text-base">⚠️</span>
                  <span>Lịch học này đã quá hạn hoàn thành! Hãy tranh thủ học ngay.</span>
                </div>
              ` : (overdueCount > 0 ? `
                <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-2.5 flex items-center gap-2 text-2xs font-extrabold">
                  <span class="text-base">⚠️</span>
                  <span>Có ${overdueCount} lịch học quá hạn chưa hoàn thành!</span>
                </div>
              ` : '')}

              <!-- Topic Preview Card -->
              <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div class="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-2xl shadow-2xs shrink-0 font-bold">
                  ${todayTopic ? (todayTopic.icon || '📚') : '🥟'}
                </div>
                <div>
                  <div class="font-extrabold text-slate-900 text-xs">${todayItem ? todayItem.topicName : 'Chủ đề từ vựng'}</div>
                  <div class="text-2xs text-slate-400 font-medium hanzi-font">${todayItem ? todayItem.hanzi : ''} <span class="pinyin-text font-pinyin">${todayItem ? todayItem.pinyin : ''}</span></div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-rose-100 text-rose-600">${todayItem ? todayItem.vocabCount : 15} từ vựng</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 3: CÀI ĐẶT LỊCH HỌC -->
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/></svg>
                  <h3 class="font-extrabold text-slate-900 text-sm">Cài đặt lịch học</h3>
                </div>
                <a href="#" id="btn-customize-settings" class="text-3xs font-extrabold text-rose-600 hover:underline">Tùy chỉnh →</a>
              </div>

              <div class="space-y-3.5">
                <!-- Nhắc nhở -->
                <div class="flex items-center justify-between">
                  <span class="flex items-center gap-2 font-semibold text-slate-700" style="font-size:0.7rem;">
                    <span class="text-rose-500 text-sm">🔔</span> Nhắc nhở trước khi học
                  </span>
                  <label class="sch-toggle-switch">
                    <input type="checkbox" id="toggle-reminder" checked />
                    <span class="sch-slider"></span>
                  </label>
                </div>

                <!-- Lặp lại -->
                <div class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 font-semibold text-slate-700 shrink-0" style="font-size:0.7rem;">
                    <span class="text-rose-500 text-sm">📅</span> Lặp lại hàng tuần
                  </span>
                  <select id="select-repeat-days" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 cursor-pointer" style="font-size:0.65rem; max-width:130px;">
                    <option value="t2_t3_t4">Thứ 2, Thứ 3, Thứ 4</option>
                    <option value="daily">Mỗi ngày</option>
                    <option value="weekdays">Thứ 2 - Thứ 6</option>
                  </select>
                </div>

                <!-- Số lần mặc định -->
                <div class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 font-semibold text-slate-700 shrink-0" style="font-size:0.7rem;">
                    <span class="text-rose-500 text-sm">📑</span> Số lần mặc định mỗi nhiệm vụ
                  </span>
                  <select id="select-default-reps" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 cursor-pointer" style="font-size:0.65rem;">
                    <option value="3" selected>3 lần</option>
                    <option value="4">4 lần</option>
                    <option value="5">5 lần</option>
                  </select>
                </div>

                <!-- Thời lượng mặc định -->
                <div class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 font-semibold text-slate-700 shrink-0" style="font-size:0.7rem;">
                    <span class="text-rose-500 text-sm">⏱️</span> Thời lượng mặc định
                  </span>
                  <select id="select-default-duration" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 cursor-pointer" style="font-size:0.65rem;">
                    <option value="30">30 phút</option>
                    <option value="45" selected>45 phút</option>
                    <option value="60">60 phút</option>
                    <option value="90">90 phút</option>
                  </select>
                </div>

                <!-- Màu hiển thị -->
                <div class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 font-semibold text-slate-700 shrink-0" style="font-size:0.7rem;">
                    <span class="text-rose-500 text-sm">🎨</span> Màu hiển thị
                  </span>
                  <div class="flex items-center gap-1.5">
                    <button class="w-5 h-5 rounded-full bg-[#C41E24] border-2 border-white shadow ring-2 ring-[#C41E24] ring-offset-1 sch-color-swatch active-color cursor-pointer transition-transform hover:scale-110" data-color="#C41E24" title="Đỏ"></button>
                    <button class="w-5 h-5 rounded-full bg-[#EC4899] border-2 border-white shadow sch-color-swatch cursor-pointer transition-transform hover:scale-110" data-color="#EC4899" title="Hồng"></button>
                    <button class="w-5 h-5 rounded-full bg-[#22C55E] border-2 border-white shadow sch-color-swatch cursor-pointer transition-transform hover:scale-110" data-color="#22C55E" title="Xanh lá"></button>
                    <button class="w-5 h-5 rounded-full bg-[#EAB308] border-2 border-white shadow sch-color-swatch cursor-pointer transition-transform hover:scale-110" data-color="#EAB308" title="Vàng"></button>
                    <button class="w-5 h-5 rounded-full bg-[#3B82F6] border-2 border-white shadow sch-color-swatch cursor-pointer transition-transform hover:scale-110" data-color="#3B82F6" title="Xanh dương"></button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        <!-- MODAL TẠO LỊCH HỌC MỚI -->
        <div id="create-schedule-modal" class="modal-overlay hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div class="bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-auto">
            
            <!-- HEADER -->
            <div class="flex items-start justify-between pb-2 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-rose-100/70 text-[#C41E24] flex items-center justify-center text-lg font-bold shrink-0 shadow-2xs">
                  ➕
                </div>
                <div>
                  <h2 class="font-black text-xl text-slate-900 tracking-tight">Tạo Lịch Học Mới</h2>
                  <p class="text-xs text-slate-400 font-medium mt-0.5">Thiết lập ca học, chọn chủ đề, khung giờ và các kỹ năng luyện tập</p>
                </div>
              </div>
              <button id="modal-create-close" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 font-bold flex items-center justify-center transition-colors text-sm cursor-pointer">&times;</button>
            </div>

            <!-- FORM CONTENT -->
            <form id="form-create-schedule" class="space-y-6 text-xs">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                <!-- LEFT COLUMN -->
                <div class="space-y-5">
                  
                  <!-- CHỦ ĐỀ TỪ VỰNG -->
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">🌱 CHỦ ĐỀ TỪ VỰNG *</label>
                    <div class="relative">
                      <select id="form-topic-id" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-extrabold text-slate-800 text-xs focus:border-[#C41E24] focus:ring-1 focus:ring-[#C41E24] outline-none cursor-pointer appearance-none pr-9 shadow-2xs" required>
                        ${allTopics.map(t => `<option value="${t.id}">${t.icon || '🌱'} ${t.name} (${t.words ? t.words.length : 15} từ vựng)</option>`).join('')}
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600 font-bold text-xs">▼</div>
                    </div>
                  </div>

                  <!-- HÌNH THỨC ĐẶT THỜI GIAN -->
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">⏱️ HÌNH THỨC ĐẶT THỜI GIAN *</label>
                    <div class="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                      <button type="button" class="py-2.5 px-3 rounded-xl font-extrabold text-2xs transition-all btn-create-mode-tab active bg-white text-[#C41E24] shadow-xs cursor-pointer" data-mode="by_day">
                        📅 Theo Thứ & Khung giờ
                      </button>
                      <button type="button" class="py-2.5 px-3 rounded-xl font-extrabold text-2xs transition-all btn-create-mode-tab text-slate-500 hover:text-slate-700 cursor-pointer" data-mode="by_range">
                        ⏳ Từ ngày ➔ Ngày hoàn thành
                      </button>
                    </div>
                    <input type="hidden" id="form-create-schedule-type" value="by_day" />
                  </div>

                  <!-- OPTION 1: THEO KHUNG GIỜ CỤ THỂ CỦA NGÀY CỤ THỂ -->
                  <div id="create-mode-by-day-container" class="grid grid-cols-2 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Thứ trong tuần *</label>
                      <select id="form-day" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs">
                        <option value="Thứ 2">Thứ 2</option>
                        <option value="Thứ 3">Thứ 3</option>
                        <option value="Thứ 4">Thứ 4</option>
                        <option value="Thứ 5">Thứ 5</option>
                        <option value="Thứ 6">Thứ 6</option>
                        <option value="Thứ 7">Thứ 7</option>
                        <option value="Chủ Nhật">Chủ Nhật</option>
                      </select>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Khung giờ *</label>
                      <input type="text" id="form-time" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs" value="19:00 - 19:45" placeholder="19:00 - 19:45" />
                    </div>
                  </div>

                  <!-- OPTION 2: THEO NGÀY BẮT ĐẦU VÀ NGÀY PHẢI HOÀN THÀNH -->
                  <div id="create-mode-by-range-container" class="grid grid-cols-2 gap-3 hidden bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Ngày bắt đầu *</label>
                      <input type="date" id="form-create-start-date" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs" value="${formatDateToInput()}" />
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Ngày phải hoàn thành *</label>
                      <input type="date" id="form-create-end-date" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs" value="${formatDateToInput()}" />
                    </div>
                  </div>

                </div>

                <!-- RIGHT COLUMN -->
                <div class="space-y-5">
                  
                  <!-- KỸ NĂNG LUYỆN TẬP -->
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">🎯 KỸ NĂNG LUYỆN TẬP *</label>
                    <div class="grid grid-cols-2 gap-3" id="create-form-skills-group">
                      
                      <!-- NGHE -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="create-skills" value="quiz" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 3.5-1.5 6.5-3.5 9-1.2 1.5-2 2-3 2s-1.5-1-1.5-2.5c0-1.5 1-2.5 2-2.5"/><path d="M11 9a2 2 0 0 1 2 2"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Nghe</span>
                        </div>
                      </label>

                      <!-- NÓI -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="create-skills" value="speak" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 12c3-3 6-3 10 0 4-3 7-3 10 0-3 5-7 7-10 7S5 17 2 12z"/><path d="M7 12c2.5 2 7.5 2 10 0"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Nói</span>
                        </div>
                      </label>

                      <!-- ĐỌC -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="create-skills" value="read" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Đọc</span>
                        </div>
                      </label>

                      <!-- VIẾT -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="create-skills" value="write" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Viết</span>
                        </div>
                      </label>

                    </div>
                  </div>

                  <!-- MỤC TIÊU SỐ LẦN & TRẠNG THÁI BAN ĐẦU -->
                  <div class="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">🎯 MỤC TIÊU SỐ LẦN *</label>
                      <div class="relative">
                        <select id="form-target-reps" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#C41E24] outline-none appearance-none pr-8 cursor-pointer shadow-2xs">
                          <option value="1">1 lần</option>
                          <option value="2">2 lần</option>
                          <option value="3" selected>3 lần</option>
                          <option value="4">4 lần</option>
                          <option value="5">5 lần</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold text-2xs">▼</div>
                      </div>
                    </div>

                    <div>
                      <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">📌 TRẠNG THÁI *</label>
                      <div class="relative">
                        <select id="form-create-status" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#C41E24] outline-none appearance-none pr-8 cursor-pointer shadow-2xs">
                          <option value="not_started" selected>🕒 Chưa bắt đầu</option>
                          <option value="in_progress">► Đang học</option>
                          <option value="completed">✔ Hoàn thành</option>
                          <option value="overdue">⚠️ Quá hạn</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold text-2xs">▼</div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              <!-- FOOTER BUTTONS -->
              <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
                <button type="button" id="modal-create-cancel" class="px-8 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs bg-white cursor-pointer">Hủy</button>
                <button type="submit" class="px-9 py-2.5 rounded-full bg-[#C41E24] hover:bg-red-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all text-xs cursor-pointer">Lưu Lịch Học</button>
              </div>

            </form>
          </div>
        </div>

        <!-- MODAL CHỈNH SỬA LỊCH HỌC -->
        <div id="edit-schedule-modal" class="modal-overlay hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div class="bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-auto">
            
            <!-- HEADER -->
            <div class="flex items-start justify-between pb-2 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-rose-100/70 text-[#C41E24] flex items-center justify-center text-lg font-bold shrink-0 shadow-2xs">
                  ✏️
                </div>
                <div>
                  <h2 class="font-black text-xl text-slate-900 tracking-tight">Chỉnh Sửa Lịch Học</h2>
                  <p class="text-xs text-slate-400 font-medium mt-0.5">Tùy chỉnh thông số ca học, khung giờ và các kỹ năng luyện tập</p>
                </div>
              </div>
              <button id="modal-edit-close" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 font-bold flex items-center justify-center transition-colors text-sm cursor-pointer">&times;</button>
            </div>

            <!-- FORM CONTENT -->
            <form id="form-edit-schedule" class="space-y-6 text-xs">
              <input type="hidden" id="form-edit-id" />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                <!-- LEFT COLUMN -->
                <div class="space-y-5">
                  
                  <!-- CHỦ ĐỀ TỪ VỰNG -->
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">🌱 CHỦ ĐỀ TỪ VỰNG *</label>
                    <div class="relative">
                      <select id="form-edit-topic-id" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-extrabold text-slate-800 text-xs focus:border-[#C41E24] focus:ring-1 focus:ring-[#C41E24] outline-none cursor-pointer appearance-none pr-9 shadow-2xs" required>
                        ${allTopics.map(t => `<option value="${t.id}">${t.icon || '🌱'} ${t.name} (${t.words ? t.words.length : 15} từ vựng)</option>`).join('')}
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600 font-bold text-xs">▼</div>
                    </div>
                  </div>

                  <!-- HÌNH THỨC ĐẶT THỜI GIAN -->
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">⏱️ HÌNH THỨC ĐẶT THỜI GIAN *</label>
                    <div class="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                      <button type="button" class="py-2.5 px-3 rounded-xl font-extrabold text-2xs transition-all btn-edit-mode-tab active bg-white text-[#C41E24] shadow-xs cursor-pointer" data-mode="by_day">
                        📅 Theo Thứ & Khung giờ
                      </button>
                      <button type="button" class="py-2.5 px-3 rounded-xl font-extrabold text-2xs transition-all btn-edit-mode-tab text-slate-500 hover:text-slate-700 cursor-pointer" data-mode="by_range">
                        ⏳ Từ ngày ➔ Ngày hoàn thành
                      </button>
                    </div>
                    <input type="hidden" id="form-edit-schedule-type" value="by_day" />
                  </div>

                  <!-- OPTION 1: THEO KHUNG GIỜ CỤ THỂ CỦA NGÀY CỤ THỂ -->
                  <div id="edit-mode-by-day-container" class="grid grid-cols-2 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Thứ trong tuần *</label>
                      <select id="form-edit-day" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs">
                        <option value="Thứ 2">Thứ 2</option>
                        <option value="Thứ 3">Thứ 3</option>
                        <option value="Thứ 4">Thứ 4</option>
                        <option value="Thứ 5">Thứ 5</option>
                        <option value="Thứ 6">Thứ 6</option>
                        <option value="Thứ 7">Thứ 7</option>
                        <option value="Chủ Nhật">Chủ Nhật</option>
                      </select>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Khung giờ *</label>
                      <input type="text" id="form-edit-time" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs" value="19:00 - 19:45" />
                    </div>
                  </div>

                  <!-- OPTION 2: THEO NGÀY BẮT ĐẦU VÀ NGÀY PHẢI HOÀN THÀNH -->
                  <div id="edit-mode-by-range-container" class="grid grid-cols-2 gap-3 hidden bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Ngày bắt đầu *</label>
                      <input type="date" id="form-edit-start-date" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs" value="2026-09-27" />
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 mb-1.5 text-2xs">Ngày phải hoàn thành *</label>
                      <input type="date" id="form-edit-end-date" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none text-xs shadow-2xs" value="2026-09-30" />
                    </div>
                  </div>

                </div>

                <!-- RIGHT COLUMN -->
                <div class="space-y-5">
                  
                  <!-- KỸ NĂNG LUYỆN TẬP -->
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">🎯 KỸ NĂNG LUYỆN TẬP *</label>
                    <div class="grid grid-cols-2 gap-3" id="edit-form-skills-group">
                      
                      <!-- NGHE -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="edit-skills" value="quiz" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 3.5-1.5 6.5-3.5 9-1.2 1.5-2 2-3 2s-1.5-1-1.5-2.5c0-1.5 1-2.5 2-2.5"/><path d="M11 9a2 2 0 0 1 2 2"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Nghe</span>
                        </div>
                      </label>

                      <!-- NÓI -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="edit-skills" value="speak" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M2 12c3-3 6-3 10 0 4-3 7-3 10 0-3 5-7 7-10 7S5 17 2 12z"/><path d="M7 12c2.5 2 7.5 2 10 0"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Nói</span>
                        </div>
                      </label>

                      <!-- ĐỌC -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="edit-skills" value="read" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Đọc</span>
                        </div>
                      </label>

                      <!-- VIẾT -->
                      <label class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200 cursor-pointer hover:bg-rose-50/50 hover:border-rose-200 transition-all shadow-2xs">
                        <div class="flex items-center gap-2.5">
                          <input type="checkbox" name="edit-skills" value="write" class="form-checkbox h-4 w-4 text-[#C41E24] rounded border-slate-300 accent-[#C41E24] cursor-pointer" checked />
                          <div class="w-7 h-7 rounded-full bg-[#C41E24] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          </div>
                          <span class="text-xs font-extrabold text-slate-800">Viết</span>
                        </div>
                      </label>

                    </div>
                  </div>

                  <!-- MỤC TIÊU SỐ LẦN & TRẠNG THÁI -->
                  <div class="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">🎯 MỤC TIÊU SỐ LẦN *</label>
                      <div class="relative">
                        <select id="form-edit-target-reps" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#C41E24] outline-none appearance-none pr-8 cursor-pointer shadow-2xs">
                          <option value="1">1 lần</option>
                          <option value="2">2 lần</option>
                          <option value="3">3 lần</option>
                          <option value="4">4 lần</option>
                          <option value="5">5 lần</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold text-2xs">▼</div>
                      </div>
                    </div>

                    <div>
                      <label class="block font-extrabold text-slate-700 mb-2 text-2xs uppercase tracking-wider">📌 TRẠNG THÁI *</label>
                      <div class="relative">
                        <select id="form-edit-status" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 focus:border-[#C41E24] outline-none appearance-none pr-8 cursor-pointer shadow-2xs">
                          <option value="in_progress">► Đang học</option>
                          <option value="not_started">🕒 Chưa bắt đầu</option>
                          <option value="completed">✔ Hoàn thành</option>
                          <option value="overdue">⚠️ Quá hạn</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 font-bold text-2xs">▼</div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              <!-- FOOTER BUTTONS -->
              <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
                <button type="button" id="modal-edit-cancel" class="px-8 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs bg-white cursor-pointer">Hủy</button>
                <button type="submit" class="px-9 py-2.5 rounded-full bg-[#C41E24] hover:bg-red-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all text-xs cursor-pointer">Lưu Thay Đổi</button>
              </div>

            </form>
          </div>
        </div>

      </div>
    `;

    setupEvents();
  }

  function setupEvents() {
    // Tab filter pills
    container.querySelectorAll('.sch-tab-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentFilter = e.currentTarget.dataset.filter;
        currentPage = 1;
        renderView();
      });
    });

    // Month Navigation
    container.querySelector('#sch-month-prev')?.addEventListener('click', () => {
      currentMonthOffset--;
      currentPage = 1;
      renderView();
    });

    container.querySelector('#sch-month-next')?.addEventListener('click', () => {
      currentMonthOffset++;
      currentPage = 1;
      renderView();
    });

    // Pagination Handlers
    container.querySelectorAll('.sch-page-num').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.currentTarget.dataset.page, 10);
        if (page && page !== currentPage) {
          currentPage = page;
          renderView();
        }
      });
    });

    container.querySelector('#sch-page-prev')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderView();
      }
    });

    container.querySelector('#sch-page-next')?.addEventListener('click', () => {
      const referenceDate = new Date();
      referenceDate.setMonth(referenceDate.getMonth() + currentMonthOffset);
      const WEEK_DAYS = getRealTimeWeekDays(referenceDate);
      const filteredDays = WEEK_DAYS.filter(dayInfo => {
        const item = scheduleItems.find(i => i.day === dayInfo.day);
        if (currentFilter === 'all') return true;
        if (currentFilter === 'overdue') return item && isScheduleOverdue(item);
        return item && item.status === currentFilter;
      });
      const totalPages = Math.max(1, Math.ceil(filteredDays.length / 4));
      if (currentPage < totalPages) {
        currentPage++;
        renderView();
      }
    });

    container.querySelector('#sch-page-first')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage = 1;
        renderView();
      }
    });

    container.querySelector('#sch-page-last')?.addEventListener('click', () => {
      const referenceDate = new Date();
      referenceDate.setMonth(referenceDate.getMonth() + currentMonthOffset);
      const WEEK_DAYS = getRealTimeWeekDays(referenceDate);
      const filteredDays = WEEK_DAYS.filter(dayInfo => {
        const item = scheduleItems.find(i => i.day === dayInfo.day);
        if (currentFilter === 'all') return true;
        if (currentFilter === 'overdue') return item && isScheduleOverdue(item);
        return item && item.status === currentFilter;
      });
      const totalPages = Math.max(1, Math.ceil(filteredDays.length / 4));
      if (currentPage < totalPages) {
        currentPage = totalPages;
        renderView();
      }
    });

    // Color Swatch Selection
    container.querySelectorAll('.sch-color-swatch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.sch-color-swatch').forEach(b => {
          b.classList.remove('active-color', 'ring-2', 'ring-offset-1');
        });
        const color = e.currentTarget.dataset.color;
        e.currentTarget.classList.add('active-color', 'ring-2', 'ring-offset-1');
        if (typeof window.showToast === 'function') {
          window.showToast(`🎨 Đã đổi màu chủ đề lịch học: ${color}`);
        }
      });
    });

    // Start practice buttons ("Xem")
    container.querySelectorAll('.btn-start-practice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const topicId = e.currentTarget.dataset.topicId;
        const topicObj = allTopics.find(t => t.id === topicId) || allTopics[0];
        if (onStartPracticeCallback) {
          onStartPracticeCallback(topicObj);
        } else {
          document.querySelector('[data-tab="practice"]')?.click();
        }
      });
    });

    // Big CTA Button "Bắt đầu học ngay"
    container.querySelector('#btn-start-today-now')?.addEventListener('click', () => {
      const now = new Date();
      const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const todayDayName = dayNames[now.getDay()];
      const todayItem = scheduleItems.find(i => i.day === todayDayName) || scheduleItems.find(i => i.status === 'in_progress') || scheduleItems.find(i => i.status === 'not_started') || scheduleItems[0];
      const activeTopic = allTopics.find(t => t.id === (todayItem ? todayItem.topicId : '')) || allTopics[0];

      if (onStartPracticeCallback) {
        onStartPracticeCallback(activeTopic);
      } else {
        document.querySelector('[data-tab="practice"]')?.click();
      }
    });

    // Widget 1 "Xem chi tiết ➔" Handler
    container.querySelector('#btn-view-stat-details')?.addEventListener('click', (e) => {
      e.preventDefault();
      const realStats = getRealTimeStats();
      if (typeof window.showToast === 'function') {
        window.showToast(`📊 Tiến độ: ${realStats.progressPercent}% | Đã học ${realStats.learnedWords} từ vựng, streak ${realStats.streak} ngày!`);
      }
    });

    // Toggle Row Options Popover
    container.querySelectorAll('.btn-toggle-row-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const popover = container.querySelector(`#popover-${id}`);
        
        container.querySelectorAll('.sch-dropdown-popover').forEach(p => {
          if (p !== popover) p.classList.add('hidden');
        });

        popover?.classList.toggle('hidden');
      });
    });

    // Mode tabs switching in Edit Modal
    container.querySelectorAll('#edit-schedule-modal .btn-edit-mode-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        container.querySelector('#form-edit-schedule-type').value = mode;

        container.querySelectorAll('#edit-schedule-modal .btn-edit-mode-tab').forEach(b => {
          if (b.dataset.mode === mode) {
            b.classList.add('bg-white', 'text-[#C41E24]', 'shadow-2xs');
            b.classList.remove('text-slate-500');
          } else {
            b.classList.remove('bg-white', 'text-[#C41E24]', 'shadow-2xs');
            b.classList.add('text-slate-500');
          }
        });

        const byDayContainer = container.querySelector('#edit-mode-by-day-container');
        const byRangeContainer = container.querySelector('#edit-mode-by-range-container');

        if (mode === 'by_range') {
          byDayContainer?.classList.add('hidden');
          byRangeContainer?.classList.remove('hidden');
        } else {
          byDayContainer?.classList.remove('hidden');
          byRangeContainer?.classList.add('hidden');
        }
      });
    });

    // Clean up previous Popover handler before adding new
    if (container._closePopoversHandler) {
      document.removeEventListener('click', container._closePopoversHandler);
    }
    container._closePopoversHandler = (e) => {
      if (!e.target.closest('.sch-menu-wrapper')) {
        container.querySelectorAll('.sch-dropdown-popover').forEach(p => p.classList.add('hidden'));
      }
    };
    document.addEventListener('click', container._closePopoversHandler);

    const closePopovers = () => {
      container.querySelectorAll('.sch-dropdown-popover').forEach(p => p.classList.add('hidden'));
    };

    // Helper function to open Edit Schedule Modal for any item
    const openEditModal = (item) => {
      if (!item) return;
      closePopovers();

      const editModal = container.querySelector('#edit-schedule-modal');
      if (editModal) {
        container.querySelector('#form-edit-id').value = item.id;
        
        const topicSelect = container.querySelector('#form-edit-topic-id');
        if (topicSelect) {
          topicSelect.value = item.topicId;
          if (!topicSelect.value && (item.topicId || item.topicName)) {
            const matched = allTopics.find(t => String(t.id) === String(item.topicId) || t.name === item.topicName);
            if (matched) topicSelect.value = matched.id;
          }
        }

        container.querySelector('#form-edit-day').value = item.day || 'Thứ 2';
        container.querySelector('#form-edit-time').value = item.time || '19:00 - 19:45';
        container.querySelector('#form-edit-target-reps').value = item.targetReps || 3;
        container.querySelector('#form-edit-status').value = item.status || 'not_started';

        const itemSkills = (item.skills && item.skills.length > 0) ? item.skills : ['quiz', 'speak', 'read', 'write'];
        container.querySelectorAll('#edit-schedule-modal input[name="edit-skills"]').forEach(chk => {
          chk.checked = itemSkills.includes(chk.value);
        });

        // Select Mode
        const mode = item.scheduleType || (item.startDate ? 'by_range' : 'by_day');
        const tabToClick = container.querySelector(`#edit-schedule-modal .btn-edit-mode-tab[data-mode="${mode}"]`);
        if (tabToClick) tabToClick.click();

        if (item.startDate) {
          container.querySelector('#form-edit-start-date').value = formatDateToInput(item.startDate);
        }
        if (item.endDate) {
          container.querySelector('#form-edit-end-date').value = formatDateToInput(item.endDate);
        }

        editModal.classList.remove('hidden');
      }
    };

    // Edit Row Event Handler
    container.querySelectorAll('.btn-edit-schedule-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const item = scheduleItems.find(i => i.id === id);
        openEditModal(item);
      });
    });

    // Edit Today's Schedule Widget Handler
    container.querySelectorAll('.btn-edit-today-sch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const item = scheduleItems.find(i => i.id === id);
        openEditModal(item);
      });
    });

    // Widget 3 Customize Settings Handler
    container.querySelector('#btn-customize-settings')?.addEventListener('click', (e) => {
      e.preventDefault();
      const createModal = container.querySelector('#create-schedule-modal');
      if (createModal) createModal.classList.remove('hidden');
    });

    // Delete Row Event Handler
    container.querySelectorAll('.btn-delete-schedule-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa lịch học này không?')) {
          scheduleItems = scheduleItems.filter(i => i.id !== id);
          saveStoredScheduleItems(scheduleItems);
          closePopovers();
          renderView();
        }
      });
    });

    // Mode tabs switching in Create Modal
    container.querySelectorAll('#create-schedule-modal .btn-create-mode-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        container.querySelector('#form-create-schedule-type').value = mode;

        container.querySelectorAll('#create-schedule-modal .btn-create-mode-tab').forEach(b => {
          if (b.dataset.mode === mode) {
            b.classList.add('bg-white', 'text-[#C41E24]', 'shadow-2xs');
            b.classList.remove('text-slate-500');
          } else {
            b.classList.remove('bg-white', 'text-[#C41E24]', 'shadow-2xs');
            b.classList.add('text-slate-500');
          }
        });

        const byDayContainer = container.querySelector('#create-mode-by-day-container');
        const byRangeContainer = container.querySelector('#create-mode-by-range-container');

        if (mode === 'by_range') {
          byDayContainer?.classList.add('hidden');
          byRangeContainer?.classList.remove('hidden');
        } else {
          byDayContainer?.classList.remove('hidden');
          byRangeContainer?.classList.add('hidden');
        }
      });
    });

    // Add Day Schedule Handler
    container.querySelectorAll('.btn-add-day-sch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const day = e.currentTarget.dataset.day;
        const createModal = container.querySelector('#create-schedule-modal');
        if (createModal) {
          const daySelect = container.querySelector('#form-day');
          if (daySelect) daySelect.value = day;

          const byDayTab = container.querySelector('#create-schedule-modal .btn-create-mode-tab[data-mode="by_day"]');
          if (byDayTab) byDayTab.click();

          createModal.classList.remove('hidden');
        }
      });
    });

    // Reps Select change in table
    container.querySelectorAll('.sch-reps-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.currentTarget.dataset.id;
        const val = parseInt(e.currentTarget.value, 10);
        const item = scheduleItems.find(i => i.id === id);
        if (item) {
          item.targetReps = val;
          const wasOverdue = isScheduleOverdue(item) || item.status === 'overdue' || item.wasOverdue;

          if (item.currentReps >= item.targetReps) {
            item.currentReps = item.targetReps;
            item.status = 'completed';
            const now = new Date();
            const dStr = now.getDate().toString().padStart(2, '0');
            const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
            item.completedDate = `${dStr}/${mStr}/${now.getFullYear()}`;
            if (wasOverdue) item.wasOverdue = true;
          } else {
            if (wasOverdue) {
              item.status = 'overdue';
              item.wasOverdue = true;
            } else if (item.currentReps > 0) {
              item.status = 'in_progress';
            } else {
              item.status = 'not_started';
            }
          }
          saveStoredScheduleItems(scheduleItems);
          renderView();
        }
      });
    });

    // Modal Create Handlers
    const modal = container.querySelector('#create-schedule-modal');
    container.querySelector('#btn-open-create-modal')?.addEventListener('click', () => modal?.classList.remove('hidden'));
    container.querySelector('#modal-create-close')?.addEventListener('click', () => modal?.classList.add('hidden'));
    container.querySelector('#modal-create-cancel')?.addEventListener('click', () => modal?.classList.add('hidden'));

    container.querySelector('#form-create-schedule')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const topicId = container.querySelector('#form-topic-id').value;
      const topicObj = allTopics.find(t => String(t.id) === String(topicId) || t.name === topicId) || allTopics[0];
      const scheduleType = container.querySelector('#form-create-schedule-type')?.value || 'by_day';
      const day = container.querySelector('#form-day').value || 'Thứ 2';
      const time = container.querySelector('#form-time').value.trim() || '19:00 - 19:45';
      const targetReps = parseInt(container.querySelector('#form-target-reps').value, 10) || 3;
      const status = container.querySelector('#form-create-status')?.value || 'not_started';
      const selectedSkills = Array.from(container.querySelectorAll('#create-schedule-modal input[name="create-skills"]:checked')).map(chk => chk.value);
      const finalSkills = selectedSkills.length > 0 ? selectedSkills : ['quiz', 'speak', 'read', 'write'];

      const colors = ['#22C55E', '#F97316', '#3B82F6', '#EC4899', '#A855F7'];

      let updatedFields = {};
      if (scheduleType === 'by_range') {
        const rawStart = container.querySelector('#form-create-start-date').value;
        const rawEnd = container.querySelector('#form-create-end-date').value;
        const startDate = formatDateToVN(rawStart);
        const endDate = formatDateToVN(rawEnd);
        const computedStartDay = getDayOfWeekFromDate(startDate) || day;

        updatedFields = {
          scheduleType: 'by_range',
          startDate: startDate,
          endDate: endDate,
          day: computedStartDay,
          date: `${startDate} - ${endDate}`,
          time: `Hạn chót: ${endDate}`
        };
      } else {
        const freshWeekDays = getRealTimeWeekDays();
        updatedFields = {
          scheduleType: 'by_day',
          day: day,
          date: freshWeekDays.find(w => w.day === day)?.date || new Date().toLocaleDateString('vi-VN'),
          time: time,
          startDate: null,
          endDate: null
        };
      }

      let completedDate = null;
      let wasOverdue = false;
      let currentReps = 0;

      if (status === 'completed') {
        currentReps = targetReps;
        const now = new Date();
        const dStr = now.getDate().toString().padStart(2, '0');
        const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
        completedDate = `${dStr}/${mStr}/${now.getFullYear()}`;
      } else if (status === 'in_progress') {
        currentReps = 1;
      } else if (status === 'overdue') {
        wasOverdue = true;
      }

      const firstWord = (topicObj.words && topicObj.words.length > 0) ? topicObj.words[0] : { hanzi: '学习', pinyin: 'xuéxí' };

      const newItem = {
        id: `sch_${Date.now()}`,
        accentColor: colors[Math.floor(Math.random() * colors.length)],
        ...updatedFields,
        topicId: topicObj.id,
        topicName: topicObj.name,
        hanzi: firstWord.hanzi,
        pinyin: firstWord.pinyin,
        vocabCount: topicObj.words ? topicObj.words.length : 15,
        skills: finalSkills,
        targetReps: targetReps,
        currentReps: currentReps,
        status: status,
        completedDate: completedDate,
        wasOverdue: wasOverdue
      };

      scheduleItems.push(newItem);
      saveStoredScheduleItems(scheduleItems);
      modal?.classList.add('hidden');
      renderView();
    });

    // Modal Edit Handlers
    const editModal = container.querySelector('#edit-schedule-modal');
    container.querySelector('#modal-edit-close')?.addEventListener('click', () => editModal?.classList.add('hidden'));
    container.querySelector('#modal-edit-cancel')?.addEventListener('click', () => editModal?.classList.add('hidden'));

    container.querySelector('#form-edit-schedule')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = container.querySelector('#form-edit-id').value;
      const topicId = container.querySelector('#form-edit-topic-id').value;
      const topicObj = allTopics.find(t => String(t.id) === String(topicId) || t.name === topicId) || allTopics[0];
      const scheduleType = container.querySelector('#form-edit-schedule-type').value || 'by_day';
      const targetReps = parseInt(container.querySelector('#form-edit-target-reps').value, 10) || 3;
      const status = container.querySelector('#form-edit-status').value || 'not_started';
      const selectedSkills = Array.from(container.querySelectorAll('#edit-schedule-modal input[name="edit-skills"]:checked')).map(chk => chk.value);
      const finalSkills = selectedSkills.length > 0 ? selectedSkills : ['quiz', 'speak', 'read', 'write'];

      const itemIdx = scheduleItems.findIndex(i => i.id === id);
      if (itemIdx >= 0) {
        const firstWord = (topicObj.words && topicObj.words.length > 0) ? topicObj.words[0] : { hanzi: '学习', pinyin: 'xuéxí' };

        const day = container.querySelector('#form-edit-day').value || scheduleItems[itemIdx].day || 'Thứ 2';

        let updatedFields = {};
        if (scheduleType === 'by_range') {
          const rawStart = container.querySelector('#form-edit-start-date').value;
          const rawEnd = container.querySelector('#form-edit-end-date').value;
          const startDate = formatDateToVN(rawStart);
          const endDate = formatDateToVN(rawEnd);
          const computedStartDay = getDayOfWeekFromDate(startDate) || day;

          updatedFields = {
            scheduleType: 'by_range',
            startDate: startDate,
            endDate: endDate,
            day: computedStartDay,
            date: `${startDate} - ${endDate}`,
            time: `Hạn chót: ${endDate}`
          };
        } else {
          const time = container.querySelector('#form-edit-time').value.trim() || '19:00 - 19:45';
          const freshWeekDays = getRealTimeWeekDays();
          updatedFields = {
            scheduleType: 'by_day',
            day: day,
            time: time,
            date: freshWeekDays.find(w => w.day === day)?.date || new Date().toLocaleDateString('vi-VN'),
            startDate: null,
            endDate: null
          };
        }

        let completedDate = scheduleItems[itemIdx].completedDate || null;
        let wasOverdue = scheduleItems[itemIdx].wasOverdue || false;

        if (status === 'completed') {
          if (!completedDate) {
            const now = new Date();
            const dStr = now.getDate().toString().padStart(2, '0');
            const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
            completedDate = `${dStr}/${mStr}/${now.getFullYear()}`;
          }
          if (isScheduleOverdue(scheduleItems[itemIdx]) || scheduleItems[itemIdx].status === 'overdue') {
            wasOverdue = true;
          }
        }

        scheduleItems[itemIdx] = {
          ...scheduleItems[itemIdx],
          ...updatedFields,
          topicId: topicObj.id,
          topicName: topicObj.name,
          hanzi: firstWord.hanzi,
          pinyin: firstWord.pinyin,
          vocabCount: (topicObj.words || []).length,
          skills: finalSkills,
          targetReps: targetReps,
          status: status,
          completedDate: completedDate,
          wasOverdue: wasOverdue,
          currentReps: status === 'completed' ? targetReps : (status === 'in_progress' ? Math.min(scheduleItems[itemIdx].currentReps || 1, targetReps) : 0)
        };
        saveStoredScheduleItems(scheduleItems);
      }

      editModal?.classList.add('hidden');
      renderView();
    });
  }

  renderView();
}
