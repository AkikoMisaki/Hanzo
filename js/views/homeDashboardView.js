import { getAllTopicsList, getSRSProgress, getUserStats, getDailyLogs, getRealTimeStats } from '../utils/srs.js';
import { getActiveUser } from '../utils/accountManager.js';
import { getStoredScheduleItems } from './scheduleView.js';

// Dữ liệu ca học mẫu linh hoạt theo ngày
const defaultScheduleDataByDay = {
  'T2': [
    { time: '08:00 – 08:30', title: 'Chủ đề: Chào hỏi', desc: 'Học 15 từ vựng cơ bản', type: 'video', isStart: true },
    { time: '19:00 – 19:20', title: 'Luyện hội thoại 1', desc: 'Sử dụng cấu trúc Chào hỏi', type: 'doc', isStart: false },
    { time: '20:00 – 20:15', title: 'Kiểm tra từ mới', desc: 'Flashcard 15 câu', type: 'check', isStart: false }
  ],
  'T3': [
    { time: '08:00 – 08:30', title: 'Chủ đề: Gia đình', desc: 'Học 20 từ vựng mới', type: 'video', isStart: true },
    { time: '19:00 – 19:20', title: 'Luyện mẫu câu', desc: 'Sử dụng từ vựng chủ đề Gia đình', type: 'doc', isStart: false },
    { time: '19:30 – 19:50', title: 'Luyện nghe', desc: 'Hội thoại ngắn', type: 'audio', isStart: false },
    { time: '20:00 – 20:15', title: 'Ôn tập nhanh', desc: 'Flashcard + Kiểm tra 10 câu', type: 'check', isStart: false }
  ],
  'T4': [
    { time: '08:00 – 08:30', title: 'Chủ đề: Trường học', desc: 'Học 20 từ vựng mới', type: 'video', isStart: true },
    { time: '19:00 – 19:20', title: 'Luyện tập viết chữ', desc: 'Tập viết 10 từ vựng mới', type: 'doc', isStart: false },
    { time: '19:30 – 19:50', title: 'Luyện nghe phát âm', desc: 'Thanh điệu Hán ngữ', type: 'audio', isStart: false }
  ],
  'T5': [
    { time: '08:00 – 08:30', title: 'Chủ đề: Ẩm thực', desc: 'Học 25 từ vựng mới', type: 'video', isStart: true },
    { time: '19:30 – 19:50', title: 'Luyện nghe gọi món', desc: 'Hội thoại nhà hàng Trung Hoa', type: 'audio', isStart: false }
  ],
  'T6': [
    { time: '08:00 – 08:30', title: 'Chủ đề: Du lịch', desc: 'Học 20 từ vựng mới', type: 'video', isStart: true },
    { time: '20:00 – 20:30', title: 'Luyện nói phản xạ', desc: 'Hỏi đường và giao tiếp', type: 'audio', isStart: false }
  ],
  'T7': [
    { time: '09:00 – 09:40', title: 'Ôn tập tổng hợp', desc: '80 từ vựng đã học trong tuần', type: 'check', isStart: true },
    { time: '15:00 – 15:30', title: 'Chủ đề: Sức khỏe', desc: 'Học 20 từ vựng mới về Y tế & Sức khỏe', type: 'video', isStart: false },
    { time: '20:00 – 20:30', title: 'Luyện nghe hội thoại', desc: 'Nghe 3 bài khóa ngắn HSK3', type: 'audio', isStart: false }
  ],
  'CN': [
    { time: '10:00 – 10:30', title: 'Thư giãn nghe nhạc Hán ngữ', desc: 'Luyện nghe qua bài hát', type: 'audio', isStart: true }
  ]
};

export function renderHomeDashboardView(container, onStartPracticeCallback, onSwitchTabCallback) {
  const realStats = getRealTimeStats();
  const totalLearnedWords = realStats.learnedWords;
  const streakDays = realStats.streak;
  const completedTopicsCount = realStats.completedTopics;
  const weeklyStudyTimeFormatted = realStats.timeFormattedLong;
  const weeklyProgressPercent = realStats.progressPercent;

  // Tính toán ngày thực tế theo tuần hiện tại (Real-time Date Calculation)
  function getCurrentWeekDays() {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const dayKeys = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const week = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayKey = dayKeys[i];
      const dateNum = d.getDate();
      const isToday = d.toDateString() === now.toDateString();

      week.push({
        key: dayKey,
        dateNum: dateNum,
        isToday: isToday
      });
    }

    return week;
  }

  const currentWeekDays = getCurrentWeekDays();
  const todayItem = currentWeekDays.find(w => w.isToday) || currentWeekDays[0];
  let activeDayKey = todayItem.key;

  function getUserScheduleDataByDay() {
    const activeUser = typeof getActiveUser === 'function' ? getActiveUser() : { id: 'usr_minhanh' };
    const storedItems = typeof getStoredScheduleItems === 'function' ? getStoredScheduleItems() : [];
    
    const dayMap = {
      'Thứ 2': 'T2', 'T2': 'T2',
      'Thứ 3': 'T3', 'T3': 'T3',
      'Thứ 4': 'T4', 'T4': 'T4',
      'Thứ 5': 'T5', 'T5': 'T5',
      'Thứ 6': 'T6', 'T6': 'T6',
      'Thứ 7': 'T7', 'T7': 'T7',
      'Chủ Nhật': 'CN', 'CN': 'CN'
    };

    const result = { 'T2': [], 'T3': [], 'T4': [], 'T5': [], 'T6': [], 'T7': [], 'CN': [] };

    if (storedItems && storedItems.length > 0) {
      storedItems.forEach(item => {
        const key = dayMap[item.day] || 'T2';
        result[key].push({
          time: item.time || '08:00 – 08:30',
          title: item.topicName ? `Chủ đề: ${item.topicName}` : (item.title || 'Ca học'),
          desc: item.hanzi ? `Từ mẫu: ${item.hanzi} (${item.pinyin || ''})` : (item.desc || 'Luyện tập từ vựng'),
          type: item.skills && item.skills.includes('audio') ? 'audio' : (item.skills && item.skills.includes('quiz') ? 'check' : 'video'),
          isStart: item.status === 'in_progress' || item.status === 'not_started'
        });
      });
    }

    if (Object.values(result).every(arr => arr.length === 0)) {
      return JSON.parse(JSON.stringify(defaultScheduleDataByDay));
    }

    return result;
  }

  let currentScheduleData = getUserScheduleDataByDay();

  function renderDatePillsHTML() {
    return currentWeekDays.map(item => {
      const isActive = item.key === activeDayKey;
      const activeClasses = isActive ? 'active bg-[#C41E24] text-white shadow-md' : 'bg-[#F8F9FA]';
      const textTopClass = isActive ? 'text-xs font-semibold opacity-90' : 'text-xs font-semibold text-slate-400';
      const textNumClass = isActive ? 'text-base font-bold mt-0.5' : 'text-base font-bold text-slate-700 mt-0.5';
      
      const hasSchedule = currentScheduleData[item.key] && currentScheduleData[item.key].length > 0;
      const dotColor = isActive ? 'bg-white' : (hasSchedule ? 'bg-[#C41E24]' : 'bg-transparent');

      return `
        <div data-day="${item.key}" class="date-pill-item ${isActive ? 'active' : ''} px-3.5 py-2.5 rounded-2xl ${activeClasses} text-center min-w-[46px] cursor-pointer hover:bg-slate-100 transition-all relative">
          <div class="${textTopClass}">${item.key}</div>
          <div class="${textNumClass}">${item.dateNum}</div>
          <div class="w-1.5 h-1.5 ${dotColor} rounded-full mx-auto mt-1 dot-indicator"></div>
        </div>`;
    }).join('');
  }

  function renderIconBadge(type) {
    if (type === 'video') {
      return `
        <div class="w-12 h-12 rounded-2xl bg-[#FFF0F2] flex items-center justify-center shrink-0">
          <div class="w-7 h-5 rounded-md bg-[#C41E24] flex items-center justify-center shadow-xs">
            <svg class="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>`;
    } else if (type === 'doc') {
      return `
        <div class="w-12 h-12 rounded-2xl bg-[#FFF0F2] flex items-center justify-center shrink-0">
          <div class="w-7 h-7 rounded-md bg-[#C41E24] flex items-center justify-center shadow-xs">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
        </div>`;
    } else if (type === 'audio') {
      return `
        <div class="w-12 h-12 rounded-2xl bg-[#FFF0F2] flex items-center justify-center shrink-0">
          <svg class="w-6 h-6 text-[#C41E24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm18 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z"/>
          </svg>
        </div>`;
    } else {
      return `
        <div class="w-12 h-12 rounded-2xl bg-[#FFF0F2] flex items-center justify-center shrink-0">
          <div class="w-7 h-7 rounded-md bg-[#C41E24] flex items-center justify-center shadow-xs">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>`;
    }
  }

  function getScheduleListHTML(dayKey) {
    const list = currentScheduleData[dayKey] || [];
    if (list.length === 0) {
      return `
        <div class="py-8 text-center text-slate-400 font-medium text-sm">
          Chưa có ca học nào cho ngày này. Bấm <strong>+ Tạo lịch học</strong> để thêm!
        </div>`;
    }
    return list.map((item, index) => {
      const isStartBtn = item.isStart || index === 0;
      const btnClass = isStartBtn
        ? 'bg-[#C41E24] text-white shadow-sm hover:bg-[#A3181D] btn-action-start'
        : 'bg-[#FFF0F2] text-[#C41E24] border border-[#FFCCD5] hover:bg-[#FDE2E6] btn-action-continue';
      const btnLabel = isStartBtn ? 'Bắt đầu' : 'Tiếp tục';

      return `
        <div class="py-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-5 min-w-0 flex-1">
            <div class="w-32 sm:w-36 shrink-0 border-r border-slate-100 pr-4 py-1">
              <span class="text-sm font-semibold text-slate-600">${item.time}</span>
            </div>
            ${renderIconBadge(item.type)}
            <div class="truncate">
              <div class="font-bold text-base text-slate-900 leading-snug">${item.title}</div>
              <div class="text-xs text-slate-400 font-medium truncate mt-0.5">${item.desc}</div>
            </div>
          </div>
          <button class="btn font-bold px-7 py-2.5 text-xs sm:text-sm rounded-full transition-colors shrink-0 ${btnClass}">
            ${btnLabel}
          </button>
        </div>`;
    }).join('');
  }

  container.innerHTML = `
    <!-- HERO BANNER (HIỂN THỊ TRỌN VẸN 100% CHỮ KHÔNG BỊ CHE) -->
    <div class="oriental-hero-banner relative overflow-hidden rounded-3xl mb-6 shadow-md cursor-pointer group w-full" id="hero-banner-card">
      <img src="./images/hero_banner.png" alt="Cùng bạn chinh phục tiếng Trung mỗi ngày" class="w-full h-auto block rounded-3xl group-hover:scale-[1.002] transition-transform duration-300" />
      <button id="btn-hero-start" class="absolute left-[13%] bottom-[16%] opacity-0 w-44 h-11 cursor-pointer z-20" title="Bắt đầu học ngay"></button>
    </div>

    <!-- MAIN DASHBOARD GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      <!-- CỘT TRÁI (7 COLS): Lịch học của bạn -->
      <div class="lg:col-span-7 flex flex-col">
        <div class="card-glass p-6 rounded-3xl shadow-sm border border-slate-100 bg-white h-full flex flex-col justify-between">
          <div>
            <!-- Header Lịch Học Của Bạn -->
            <div class="flex justify-between items-center mb-6">
              <h2 class="font-extrabold text-lg text-slate-900 flex items-center gap-2.5">
                <svg class="w-6 h-6 text-[#C41E24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" stroke-linecap="round"></line>
                  <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" stroke-linecap="round"></line>
                  <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"></line>
                </svg>
                <span>Lịch học của bạn</span>
              </h2>
              <button id="btn-dashboard-view-all-schedule" class="text-sm font-semibold text-[#C41E24] hover:text-[#A3181D] hover:underline transition-colors">
                Xem tất cả
              </button>
            </div>

            <!-- Thanh Chọn Thứ + Nút + Tạo lịch học -->
            <div class="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <div class="flex items-center gap-2 flex-1 justify-between overflow-x-auto pb-1" id="schedule-date-pills">
                ${renderDatePillsHTML()}
              </div>

              <button id="btn-dashboard-add-schedule" class="btn text-sm font-bold text-[#C41E24] bg-[#FFF0F2] border border-[#FFCCD5] hover:bg-[#FDE2E6] rounded-full px-4 py-2 shrink-0 flex items-center gap-1.5 transition-all">
                <span class="text-base font-bold leading-none">+</span> Tạo lịch học
              </button>
            </div>

            <!-- Danh sách Ca Học Timeline (Render động theo ngày được chọn) -->
            <div class="divide-y divide-slate-100" id="schedule-timeline-list">
              ${getScheduleListHTML(activeDayKey)}
            </div>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI (5 COLS): Thống Kê & Tiến Độ -->
      <div class="lg:col-span-5 flex flex-col">

        <!-- CARD: Tiến độ học tập (Tự động kéo dài bằng chiều cao Lịch Học Của Bạn) -->
        <div class="card-glass p-6 rounded-3xl shadow-sm border border-slate-100 bg-white h-full flex flex-col justify-between space-y-4">
          <h2 class="font-extrabold text-base text-slate-900 flex align-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex align-center justify-center text-xs font-bold">📊</span>
            <span>Tiến độ học tập</span>
          </h2>

          <div class="flex items-center gap-6 my-auto py-2">
            <div class="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-slate-100" stroke-width="3.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="text-[#C41E24] stroke-current" stroke-width="3.8" stroke-dasharray="${weeklyProgressPercent}, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-2xl font-black text-[#C41E24]">${weeklyProgressPercent}%</span>
                <span class="text-2xs text-slate-400 font-semibold" style="font-size:0.65rem;">Hoàn thành<br/>kế hoạch tuần</span>
              </div>
            </div>

            <div class="space-y-3.5 flex-1">
              <div class="stat-pill-card w-full">
                <div class="stat-pill-icon">
                  <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div class="stat-pill-divider"></div>
                <div class="stat-pill-content">
                  <span class="stat-pill-val">${totalLearnedWords}</span>
                  <span class="stat-pill-label">Từ vựng đã học</span>
                </div>
              </div>

              <div class="stat-pill-card w-full">
                <div class="stat-pill-icon">
                  <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
                <div class="stat-pill-divider"></div>
                <div class="stat-pill-content">
                  <span class="stat-pill-val">${completedTopicsCount}</span>
                  <span class="stat-pill-label">Chủ đề đã hoàn thành</span>
                </div>
              </div>

              <div class="stat-pill-card w-full">
                <div class="stat-pill-icon">
                  <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 1.5s0 2.5-2.5 4.5c-2.5 2-4.5 4.5-4.5 8 0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-4-3-7.5-8-12.5zm1 18c-2.48 0-4.5-2.02-4.5-4.5 0-1.8 1.12-3.36 2.5-4 0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5c.88.92 1.5 2.15 1.5 3.5 0 2.48-2.02 4.5-4.5 4.5z"/>
                  </svg>
                </div>
                <div class="stat-pill-divider"></div>
                <div class="stat-pill-content">
                  <span class="stat-pill-val">${streakDays} ngày</span>
                  <span class="stat-pill-label">Ngày học liên tiếp</span>
                </div>
              </div>

              <div class="stat-pill-card w-full">
                <div class="stat-pill-icon">
                  <svg class="w-5 h-5 text-[#E60021]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                  </svg>
                </div>
                <div class="stat-pill-divider"></div>
                <div class="stat-pill-content">
                  <span class="stat-pill-val">${weeklyStudyTimeFormatted}</span>
                  <span class="stat-pill-label">Thời gian học tuần này</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- MODAL TẠO LỊCH HỌC MỚI -->
    <div id="modal-add-schedule" class="hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all scale-100">
        <div class="flex justify-between items-center mb-5">
          <h3 class="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <span class="text-[#C41E24]">📅</span> Tạo ca học mới
          </h3>
          <button id="btn-close-schedule-modal" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors">✕</button>
        </div>

        <form id="form-add-schedule" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Khung giờ học</label>
            <input type="text" id="input-schedule-time" placeholder="VD: 20:30 – 21:00" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#C41E24] focus:ring-1 focus:ring-[#C41E24] outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tên ca học</label>
            <input type="text" id="input-schedule-title" placeholder="VD: Luyện đọc HSK3" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#C41E24] focus:ring-1 focus:ring-[#C41E24] outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
            <input type="text" id="input-schedule-desc" placeholder="VD: Học 15 từ vựng mới" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#C41E24] focus:ring-1 focus:ring-[#C41E24] outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Loại nội dung</label>
            <select id="select-schedule-type" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#C41E24] outline-none bg-white">
              <option value="video">▶ Chủ đề / Video học</option>
              <option value="doc">📄 Luyện mẫu câu / Viết</option>
              <option value="audio">🎧 Luyện nghe hội thoại</option>
              <option value="check">☑️ Ôn tập / Flashcard</option>
            </select>
          </div>

          <div class="pt-2 flex gap-3">
            <button type="button" id="btn-cancel-schedule-modal" class="flex-1 py-3 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">Hủy</button>
            <button type="submit" class="flex-1 py-3 rounded-full font-bold text-white bg-[#C41E24] hover:bg-[#A3181D] text-sm shadow-md transition-colors">Tạo ca học</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupEvents();

  function setupEvents() {
    const timelineContainer = container.querySelector('#schedule-timeline-list');
    const modal = container.querySelector('#modal-add-schedule');

    // Chuyển đổi ngày trong Lịch học (Date Pill Selector)
    container.querySelectorAll('#schedule-date-pills .date-pill-item').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const selectedDay = e.currentTarget.dataset.day;
        if (!selectedDay) return;
        activeDayKey = selectedDay;

        // Reset tất cả pills về inactive
        container.querySelectorAll('#schedule-date-pills .date-pill-item').forEach(item => {
          item.classList.remove('active', 'bg-[#C41E24]', 'text-white', 'shadow-md');
          item.classList.add('bg-[#F8F9FA]');
          const textTop = item.querySelector('div:first-child');
          const textNum = item.querySelector('div:nth-child(2)');
          const dot = item.querySelector('.dot-indicator');
          if (textTop) textTop.className = 'text-xs font-semibold text-slate-400';
          if (textNum) textNum.className = 'text-base font-bold text-slate-700 mt-0.5';

          const hasSched = currentScheduleData[item.dataset.day] && currentScheduleData[item.dataset.day].length > 0;
          if (dot) {
            dot.className = `w-1.5 h-1.5 ${hasSched ? 'bg-[#C41E24]' : 'bg-transparent'} rounded-full mx-auto mt-1 dot-indicator`;
          }
        });

        // Kích hoạt pill được chọn
        const targetPill = e.currentTarget;
        targetPill.classList.add('active', 'bg-[#C41E24]', 'text-white', 'shadow-md');
        targetPill.classList.remove('bg-[#F8F9FA]');

        const activeTextTop = targetPill.querySelector('div:first-child');
        const activeTextNum = targetPill.querySelector('div:nth-child(2)');
        const activeDot = targetPill.querySelector('.dot-indicator');

        if (activeTextTop) activeTextTop.className = 'text-xs font-semibold opacity-90';
        if (activeTextNum) activeTextNum.className = 'text-base font-bold mt-0.5';
        if (activeDot) activeDot.className = 'w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1 dot-indicator';

        // Render danh sách ca học của ngày được chọn
        if (timelineContainer) {
          timelineContainer.innerHTML = getScheduleListHTML(activeDayKey);
          bindTimelineButtons();
        }
      });
    });

    // Mở Modal Tạo lịch học (Chuyển sang trang Lên lịch học và mở Cửa sổ Tạo Lịch Học đầy đủ tính năng)
    container.querySelector('#btn-dashboard-add-schedule')?.addEventListener('click', () => {
      if (typeof onSwitchTabCallback === 'function') {
        onSwitchTabCallback('schedule', { openCreateModal: true });
      } else {
        modal?.classList.remove('hidden');
      }
    });

    container.querySelector('#btn-close-schedule-modal')?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    container.querySelector('#btn-cancel-schedule-modal')?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    // Xử lý Form Tạo lịch học mới
    container.querySelector('#form-add-schedule')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const timeVal = container.querySelector('#input-schedule-time').value.trim();
      const titleVal = container.querySelector('#input-schedule-title').value.trim();
      const descVal = container.querySelector('#input-schedule-desc').value.trim();
      const typeVal = container.querySelector('#select-schedule-type').value;

      if (!timeVal || !titleVal || !descVal) return;

      if (!currentScheduleData[activeDayKey]) {
        currentScheduleData[activeDayKey] = [];
      }

      currentScheduleData[activeDayKey].push({
        time: timeVal,
        title: titleVal,
        desc: descVal,
        type: typeVal,
        isStart: currentScheduleData[activeDayKey].length === 0
      });

      // Thêm chấm đỏ báo có lịch học
      const activePill = container.querySelector(`#schedule-date-pills [data-day="${activeDayKey}"]`);
      if (activePill) {
        const dot = activePill.querySelector('.dot-indicator');
        if (dot) dot.classList.remove('bg-transparent');
      }

      // Re-render
      if (timelineContainer) {
        timelineContainer.innerHTML = getScheduleListHTML(activeDayKey);
        bindTimelineButtons();
      }

      modal?.classList.add('hidden');
      container.querySelector('#form-add-schedule').reset();
    });

    function bindTimelineButtons() {
      container.querySelectorAll('.btn-action-start, .btn-action-continue').forEach(btn => {
        btn.addEventListener('click', () => {
          onSwitchTabCallback('practice');
        });
      });
    }

    bindTimelineButtons();

    // Chuyển tab từ các vị trí khác
    container.querySelector('#hero-banner-card')?.addEventListener('click', () => {
      onSwitchTabCallback('practice');
    });
    container.querySelector('#btn-hero-start')?.addEventListener('click', (e) => {
      e.stopPropagation();
      onSwitchTabCallback('practice');
    });
    container.querySelector('#btn-dashboard-view-all-schedule')?.addEventListener('click', () => {
      onSwitchTabCallback('schedule');
    });
  }
}
