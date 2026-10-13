(function() { 'use strict';
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global JS Error:", message, lineno, colno, error);
  const errDiv = document.getElementById('js-error-catch') || document.body;
  if (errDiv) {
    const errBox = document.createElement('div');
    errBox.className = 'js-runtime-error-box';
    errBox.style.cssText = 'color:red; background:#fee; padding:16px; margin:16px; border:2px solid red; font-family:monospace; z-index:999999; relative;';
    errBox.innerHTML = '<b>JS ERROR:</b> ' + message + ' at line ' + lineno + ':' + colno + '<br><pre>' + (error ? error.stack : '') + '</pre>';
    errDiv.appendChild(errBox);
  }
};


class AppController {
  constructor() {
    console.log('AppController constructor start');
    this.appRoot = document.getElementById('app-root');
    this.activeTab = 'dashboard';
    this.activeTopic = getAllTopicsList()[0];
    window.appInstance = this;
    this.init();
  }

  init() {
    console.log('AppController init starting...');
    this.setupNavigation();
    this.setupGlobalPopupHandlers();
    this.setupMascotToggle();
    this.setupNotificationBell();
    this.setupUserProfileModal();
    this.updateHeaderStats();
    this.renderCurrentView();
    console.log('AppController init completed.');
  }

  setupUserProfileModal() {
    const profileBtn = document.getElementById('header-user-profile-btn');
    const modal = document.getElementById('user-profile-modal');
    const closeBtn = document.getElementById('btn-close-user-profile-modal');

    if (profileBtn && modal) {
      profileBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        renderUserProfileModalContent(modal, this);
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
  }

  setupNotificationBell() {
    const bellBtn = document.getElementById('header-notification-btn');
    const popover = document.getElementById('header-notification-popover');
    const closeBtn = document.getElementById('btn-close-notification-popover');
    const markReadBtn = document.getElementById('btn-mark-all-notifications-read');
    const clearAllBtn = document.getElementById('btn-clear-all-notifications');

    if (bellBtn && popover) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = popover.classList.toggle('hidden');
        if (!isHidden) {
          this.renderNotificationList();
        }
      });
    }

    if (closeBtn && popover) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.add('hidden');
      });
    }

    if (markReadBtn) {
      markReadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        localStorage.setItem('hanzo_notifs_read', 'true');
        this.updateNotificationBadge();
        this.renderNotificationList();
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentNotifs = getSystemNotifications();
        let deleted = [];
        try {
          const raw = localStorage.getItem('hanzo_deleted_notif_ids');
          deleted = raw ? JSON.parse(raw) : [];
        } catch (err) {}
        currentNotifs.forEach(n => {
          if (!deleted.includes(n.id)) deleted.push(n.id);
        });
        localStorage.setItem('hanzo_deleted_notif_ids', JSON.stringify(deleted));
        this.updateNotificationBadge();
        this.renderNotificationList();
      });
    }
  }

  updateNotificationBadge() {
    const badgeEl = document.getElementById('header-notification-badge');
    const countEl = document.getElementById('popover-notification-count');
    const notifs = getSystemNotifications();
    const isRead = localStorage.getItem('hanzo_notifs_read') === 'true';

    if (countEl) countEl.innerText = notifs.length;

    if (badgeEl) {
      if (notifs.length > 0 && !isRead) {
        badgeEl.innerText = notifs.length > 99 ? '99+' : notifs.length;
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }
  }

  renderNotificationList() {
    const listContainer = document.getElementById('header-notification-list');
    const timeEl = document.getElementById('popover-notification-time');
    if (!listContainer) return;

    if (timeEl) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      timeEl.innerText = `Cập nhật: ${hours}:${mins} - ${day}/${month}/${year}`;
    }

    const notifications = getSystemNotifications();
    if (notifications.length === 0) {
      listContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400">
          <div class="text-3xl mb-2">🎉</div>
          <p class="font-bold text-slate-600 text-xs">Không có thông báo mới!</p>
          <p class="text-2xs text-slate-400 mt-1">Bạn đã hoàn thành tất cả các khóa học đúng hạn.</p>
        </div>
      `;
      return;
    }

    const isRead = localStorage.getItem('hanzo_notifs_read') === 'true';

    listContainer.innerHTML = notifications.map(n => `
      <div class="notification-card-item p-2.5 rounded-xl border ${n.cardBg} cursor-pointer space-y-1.5 transition ${isRead ? 'opacity-75' : ''}" data-topic-id="${n.topicObj ? n.topicObj.id : ''}">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-extrabold border ${n.badgeClass}">
            <span>${n.icon}</span> ${n.badgeLabel}
          </span>
          <div class="flex items-center gap-1.5">
            <span class="text-2xs text-slate-400 font-medium">${n.dateText}</span>
            <button class="btn-delete-notif p-0.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-rose-100/80 transition cursor-pointer" data-id="${n.id}" title="Xóa thông báo này">
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="font-bold text-slate-800 text-xs flex items-center justify-between">
          <span>${escapeHtml(n.title)}</span>
          <span class="text-crimson font-black text-xs hover:translate-x-1 transition">➔</span>
        </div>
        <p class="text-2xs text-slate-600 leading-snug">${escapeHtml(n.message)}</p>
      </div>
    `).join('');

    listContainer.querySelectorAll('.btn-delete-notif').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const notifId = btn.dataset.id;
        let deleted = [];
        try {
          const raw = localStorage.getItem('hanzo_deleted_notif_ids');
          deleted = raw ? JSON.parse(raw) : [];
        } catch (err) {}
        if (!deleted.includes(notifId)) {
          deleted.push(notifId);
          localStorage.setItem('hanzo_deleted_notif_ids', JSON.stringify(deleted));
        }
        this.updateNotificationBadge();
        this.renderNotificationList();
      });
    });

    listContainer.querySelectorAll('.notification-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const popover = document.getElementById('header-notification-popover');
        if (popover) popover.classList.add('hidden');

        const topicId = card.dataset.topicId;
        const allTopics = getAllTopicsList();
        const targetTopic = allTopics.find(t => t.id === topicId) || allTopics[0];

        if (targetTopic) {
          this.startPracticeWithTopic(targetTopic);
        } else {
          this.switchTab('schedule');
        }
      });
    });
  }

  setupMascotToggle() {
    const toggleBtn = document.getElementById('btn-toggle-mascot');
    const mascotWrapper = document.getElementById('mascot-image-wrapper');
    const toggleIcon = document.getElementById('mascot-toggle-icon');

    if (toggleBtn && mascotWrapper) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = mascotWrapper.classList.toggle('collapsed');
        if (toggleIcon) {
          toggleIcon.innerText = isCollapsed ? '❮' : '❯';
        }
        toggleBtn.setAttribute('title', isCollapsed ? 'Hiện Mascot' : 'Ẩn Mascot');
      });
    }
  }

  setupGlobalPopupHandlers() {
    // 1. Đóng Popup / Modal khi nhấn phím ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        const openModals = document.querySelectorAll('.modal-overlay:not(.hidden), div[id$="-modal"]:not(.hidden)');
        openModals.forEach(modal => {
          const closeBtn = modal.querySelector('.btn-close, #modal-close-btn, #modal-cancel-btn, #word-modal-close, #dict-modal-close, #song-modal-close, #song-modal-cancel, #btn-close-date-range-modal');
          if (closeBtn) {
            closeBtn.click();
          } else {
            modal.classList.add('hidden');
          }
        });

        // Đóng icon picker & notification popover nếu đang mở
        const popovers = document.querySelectorAll('#icon-picker-grid:not(.hidden), .popover:not(.hidden), #header-notification-popover:not(.hidden)');
        popovers.forEach(p => p.classList.add('hidden'));
      }
    });

    // 2. Đóng Popup khi click ra ngoài
    window.addEventListener('click', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
        const closeBtn = e.target.querySelector('.btn-close, #modal-close-btn, #modal-cancel-btn, #word-modal-close, #dict-modal-close, #song-modal-close, #song-modal-cancel, #btn-close-date-range-modal');
        if (closeBtn) {
          closeBtn.click();
        } else {
          e.target.classList.add('hidden');
        }
      }

      // Đóng notification popover khi click ngoài wrapper
      const notifWrapper = document.getElementById('notification-bell-wrapper');
      const popover = document.getElementById('header-notification-popover');
      if (notifWrapper && popover && !popover.classList.contains('hidden')) {
        if (!notifWrapper.contains(e.target)) {
          popover.classList.add('hidden');
        }
      }
    });
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab('dashboard');
    });
  }

  switchTab(tabName, options = {}) {
    this.activeTab = tabName;
    
    // Update navbar active state UI
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.tab === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    this.renderCurrentView();
    this.updateHeaderStats();

    if (options && options.openCreateModal) {
      setTimeout(() => {
        document.getElementById('create-schedule-modal')?.classList.remove('hidden');
      }, 50);
    }
  }

  updateHeaderStats() {
    const activeUser = getActiveUser();
    const avatarEl = document.getElementById('header-user-avatar');
    if (avatarEl && activeUser.avatar) avatarEl.src = activeUser.avatar;

    const nameEl = document.getElementById('header-user-name');
    if (nameEl) nameEl.innerText = activeUser.name;

    const roleEl = document.getElementById('header-user-role');
    if (roleEl) roleEl.innerText = `${activeUser.role || 'Học viên'} • ${activeUser.targetLevel || 'HSK 3'}`;

    const realStats = getRealTimeStats();
    const streakText = document.getElementById('streak-text-content');
    const streakEl = document.getElementById('user-streak-display');
    if (streakText) {
      streakText.innerText = `${realStats.streak} Ngày`;
    } else if (streakEl) {
      streakEl.innerText = `🔥 ${realStats.streak} Ngày`;
    }
    const wordsEl = document.getElementById('header-stat-words');
    if (wordsEl) {
      wordsEl.innerText = realStats.learnedWords;
    }
    const topicsEl = document.getElementById('header-stat-topics');
    if (topicsEl) {
      topicsEl.innerText = realStats.completedTopics;
    }
    const timeEl = document.getElementById('header-stat-time');
    if (timeEl) {
      timeEl.innerText = realStats.timeFormatted;
    }
    const progressEl = document.getElementById('header-stat-progress');
    if (progressEl) {
      progressEl.innerText = `${realStats.progressPercent}%`;
    }

    this.updateNotificationBadge();
  }

  startPracticeWithTopic(topicObj) {
    this.activeTopic = topicObj;
    this.switchTab('practice');
  }

  renderCurrentView() {
    if (!this.appRoot) return;
    this.appRoot.innerHTML = '';

    switch (this.activeTab) {
      case 'dashboard':
        renderHomeDashboardView(
          this.appRoot,
          (topic) => this.startPracticeWithTopic(topic),
          (tab, opts) => this.switchTab(tab, opts)
        );
        break;
      case 'topics':
        renderTopicsView(this.appRoot, (topic) => this.startPracticeWithTopic(topic));
        break;
      case 'practice':
        renderPracticeView(this.appRoot, this.activeTopic);
        break;
      case 'dictionary':
        renderDictionaryView(this.appRoot);
        break;
      case 'chatgpt':
        renderChatGPTView(this.appRoot);
        break;
      case 'music':
        renderMusicView(this.appRoot);
        break;
      case 'game':
        renderGameView(this.appRoot, () => this.switchTab('dashboard'));
        break;
      case 'schedule':
        renderScheduleView(this.appRoot, (topic) => this.startPracticeWithTopic(topic));
        break;
      case 'analytics':
        renderAnalyticsView(this.appRoot, (topic) => this.startPracticeWithTopic(topic));
        break;
      case 'grammar':
        renderGrammarView(this.appRoot);
        break;
      case 'settings':
        renderDictionaryView(this.appRoot);
        break;
      default:
        renderHomeDashboardView(
          this.appRoot,
          (topic) => this.startPracticeWithTopic(topic),
          (tab, opts) => this.switchTab(tab, opts)
        );
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getSystemNotifications() {
  const allTopics = typeof getAllTopicsList === 'function' ? getAllTopicsList() : [];
  let scheduleItems = [];
  try {
    const raw = localStorage.getItem('hanzo_custom_schedule_list');
    scheduleItems = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  if (!scheduleItems || scheduleItems.length === 0) {
    const statuses = ['in_progress', 'not_started', 'completed', 'not_started', 'completed'];
    scheduleItems = allTopics.slice(0, 5).map((t, idx) => ({
      id: `sch_${t.id}`,
      topicId: t.id,
      topicName: t.name,
      day: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'][idx % 5],
      date: '15/09/2026',
      time: '08:00 - 08:30',
      targetReps: statuses[idx % 5] === 'completed' ? 3 : 5,
      currentReps: statuses[idx % 5] === 'completed' ? 3 : (statuses[idx % 5] === 'in_progress' ? 2 : 0),
      status: statuses[idx % 5]
    }));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications = [];

  scheduleItems.forEach((item) => {
    if (item.status === 'completed') return;

    let isOverdue = item.status === 'overdue';
    if (!isOverdue && (item.endDate || item.date)) {
      try {
        let checkDateStr = item.endDate || item.date;
        if (checkDateStr.includes('-') && checkDateStr.includes('/')) {
          const parts = checkDateStr.split('-').map(s => s.trim());
          if (parts.length === 2 && parts[1].includes('/')) checkDateStr = parts[1];
        }
        if (checkDateStr.includes('/')) {
          const p = checkDateStr.split('/');
          if (p.length === 3) {
            const itemDate = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
            if (today > itemDate) isOverdue = true;
          }
        }
      } catch (e) {}
    }

    const topicObj = allTopics.find(t => t.id === item.topicId) || { id: item.topicId, name: item.topicName || item.day };

    if (isOverdue) {
      notifications.push({
        id: `notif_overdue_${item.id || item.topicId}`,
        type: 'overdue',
        badgeLabel: 'CẢNH BÁO QUÁ HẠN',
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
        cardBg: 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/80',
        title: `Bài học đã quá hạn: ${item.topicName || item.day}`,
        message: `Đã quá hạn hoàn thành (${item.endDate || item.date || item.day}). Vui lòng hoàn thành ngay!`,
        dateText: item.endDate || item.date || item.day,
        icon: '🚨',
        topicObj: topicObj,
        item: item,
        priority: 1
      });
    } else {
      const done = item.currentReps || 0;
      const target = item.targetReps || 5;
      const pct = Math.min(100, Math.round((done / target) * 100));
      notifications.push({
        id: `notif_uncompleted_${item.id || item.topicId}`,
        type: 'uncompleted',
        badgeLabel: 'CHƯA HOÀN THÀNH',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        cardBg: 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/70',
        title: `Bài học chưa hoàn thành: ${item.topicName || item.day}`,
        message: `Tiến độ: ${done}/${target} lượt học (${pct}%). Lịch: ${item.time || item.day}`,
        dateText: item.date || item.day,
        icon: '⏳',
        topicObj: topicObj,
        item: item,
        priority: 2
      });
    }
  });

  let deletedIds = [];
  try {
    const rawD = localStorage.getItem('hanzo_deleted_notif_ids');
    deletedIds = rawD ? JSON.parse(rawD) : [];
  } catch (e) {}

  const activeNotifs = notifications.filter(n => !deletedIds.includes(n.id));
  activeNotifs.sort((a, b) => a.priority - b.priority);
  return activeNotifs;
}

// Global window helper cho TTS
window.speakZh = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
};

// Khởi tạo App khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new AppController();
  });
} else {
  window.appInstance = new AppController();
}
})();