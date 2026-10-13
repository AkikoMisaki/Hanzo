// adminUsersView.js - Dedicated Admin User & Content Management View (Redesigned 100% matching exact reference mockup)
import { 
  getStoredAccounts, 
  saveStoredAccounts, 
  adminCreateUser, 
  adminUpdateUser,
  toggleLockUserAccount, 
  deleteUserAccount,
  getActiveUser,
  getUserAccountBadgeHTML,
  getUserAccountType
} from '../utils/accountManager.js';

export function renderAdminUsersView(container) {
  const activeUser = getActiveUser();

  // Guard: Ensure user has Admin role
  if (!activeUser || !activeUser.isAdmin) {
    container.innerHTML = `
      <div class="p-10 max-w-2xl mx-auto text-center bg-white rounded-3xl border border-rose-200 shadow-xl my-12 space-y-4">
        <div class="text-6xl animate-bounce">🛡️</div>
        <h2 class="text-2xl font-black text-rose-950">Quyền Truy Cập Bị Từ Chối</h2>
        <p class="text-sm text-slate-600 font-medium">Trang Quản Lý Người Dùng chỉ dành riêng cho tài khoản Quản Trị Viên (Admin). Vui lòng đăng nhập tài khoản Admin để tiếp tục!</p>
        <div class="pt-2">
          <button id="btn-admin-login-guard" class="px-6 py-2.5 rounded-full bg-[#C41E24] hover:bg-red-700 text-white font-bold text-sm shadow-md transition cursor-pointer">
            Đăng Nhập Tài Khoản Admin
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-admin-login-guard')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: 'login' }));
    });
    return;
  }

  let activeSubTab = 'users'; // 'users' or 'content'
  let accountsList = getStoredAccounts();
  let currentSearch = '';
  let currentRoleFilter = 'all';
  let currentStatusFilter = 'all';
  let editingOriginalId = '';

  const renderUI = () => {
    accountsList = getStoredAccounts();
    const totalCount = accountsList.length;
    const adminCount = accountsList.filter(a => a.isAdmin || a.role === 'Admin').length;
    const activeCount = accountsList.filter(a => a.status === 'active' || !a.status).length;
    const lockedCount = accountsList.filter(a => a.status === 'locked').length;

    const filteredAccounts = accountsList.filter(a => {
      const term = currentSearch.toLowerCase().trim();
      const matchesSearch = !term || 
        a.id.toLowerCase().includes(term) || 
        (a.name && a.name.toLowerCase().includes(term)) || 
        (a.email && a.email.toLowerCase().includes(term));

      const matchesRole = currentRoleFilter === 'all' || 
        (currentRoleFilter === 'admin' && (a.isAdmin || a.role === 'Admin')) ||
        (currentRoleFilter === 'student' && (!a.isAdmin && a.role !== 'Admin'));

      const matchesStatus = currentStatusFilter === 'all' || 
        (currentStatusFilter === 'active' && (a.status === 'active' || !a.status)) ||
        (currentStatusFilter === 'locked' && a.status === 'locked');

      return matchesSearch && matchesRole && matchesStatus;
    });

    container.innerHTML = `
      <!-- Integrated Top Banner & Tabs Container (Increased Height for Stunning Landscape Display) -->
      <div class="relative min-h-[230px] sm:min-h-[250px] rounded-3xl overflow-hidden border border-rose-200/90 shadow-md mb-6 bg-gradient-to-r from-rose-50 via-rose-100/40 to-red-50 flex flex-col justify-between">
        <!-- Oriental Artwork Background Overlay (Fits 100% Header Frame Size) -->
        <img src="./images/user_dropdown_bg.png" alt="Header Background" class="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-90" />
        <div class="absolute inset-0 bg-gradient-to-r from-white/90 via-white/35 to-transparent pointer-events-none"></div>

        <div class="relative z-10 p-6 sm:p-10 pb-5 flex flex-col justify-between flex-1">
          <!-- Header Title & Action Button Row -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 sm:mb-12">
            <div class="flex items-center gap-4">
              <!-- Shield Round Badge (Matching User Uploaded Icon Image 100%) -->
              <div class="w-14 h-14 rounded-full bg-[#FFEAEF] flex items-center justify-center shrink-0 shadow-2xs">
                <svg class="w-9 h-10 drop-shadow-sm" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 1.5 L33 6.5 C33 22 25 33.5 18 38.5 C11 33.5 3 22 3 6.5 L18 1.5 Z" fill="url(#redShieldGrad)" stroke="#B8001C" stroke-width="1.2"/>
                  <path d="M18 1.5 L33 6.5 C33 22 25 33.5 18 38.5 V1.5 Z" fill="black" fill-opacity="0.15"/>
                  <path d="M18 13 C19.93 13 21.5 11.43 21.5 9.5 C21.5 7.57 19.93 6 18 6 C16.07 6 14.5 7.57 14.5 9.5 C14.5 11.43 16.07 13 18 13 Z M18 15.5 C15.3 15.5 10 16.8 10 19.5 V22 H26 V19.5 C26 16.8 20.7 15.5 18 15.5 Z" fill="white"/>
                  <defs>
                    <linearGradient id="redShieldGrad" x1="3" y1="1.5" x2="33" y2="38.5" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#ED1C24"/>
                      <stop offset="0.6" stop-color="#C41E24"/>
                      <stop offset="1" stop-color="#990014"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Quản Lý Người Dùng & Phân Quyền
                  </h1>
                  <span class="px-3.5 py-1 rounded-full text-xs font-black bg-[#C41E24] text-white uppercase tracking-wider shadow-xs">
                    ADMIN DASHBOARD
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                  Hệ thống quản lý tài khoản truy cập website và cấu hình phân quyền nội dung theo loại tài khoản
                </p>
              </div>
            </div>
            
            ${activeSubTab === 'users' ? `
              <button id="btn-admin-add-user" class="btn bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold px-6 py-3 rounded-full shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap">
                <span class="text-base font-bold">+</span> <span>Tạo Tài Khoản Mới</span>
              </button>
            ` : ''}
          </div>

          <!-- Tabs Navigation Bar (Matching exact screenshot styling) -->
          <div class="relative flex items-end gap-2.5 pt-4 border-b border-rose-200/70 -mb-6">
            <button class="btn-admin-subtab relative px-7 py-3.5 rounded-t-2xl flex items-center gap-3 font-extrabold text-sm sm:text-base transition cursor-pointer ${activeSubTab === 'users' ? 'bg-gradient-to-r from-[#E60021] via-[#D8001D] to-[#C41E24] text-white shadow-md' : 'bg-[#F0F6FC] text-[#1E293B] hover:bg-slate-100 border border-slate-200/80 border-b-0'}" data-tab="users">
              <svg class="w-5 h-5 fill-current ${activeSubTab === 'users' ? 'text-white' : 'text-[#E60021]'} shrink-0" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span>Quản Lý Tài Khoản</span>
              ${activeSubTab === 'users' ? `
                <div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-white z-20"></div>
              ` : ''}
            </button>

            <button class="btn-admin-subtab relative px-7 py-3.5 rounded-t-2xl flex items-center gap-3 font-extrabold text-sm sm:text-base transition cursor-pointer ${activeSubTab === 'content' ? 'bg-gradient-to-r from-[#E60021] via-[#D8001D] to-[#C41E24] text-white shadow-md' : 'bg-[#F0F6FC] text-[#1E293B] hover:bg-slate-100 border border-slate-200/80 border-b-0'}" data-tab="content">
              <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="3" width="13" height="13" rx="2.5" fill="#FBBF24" opacity="0.9"/>
                <rect x="3" y="6" width="13" height="13" rx="2.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1"/>
                <rect x="5.5" y="8.5" width="8" height="8" rx="2" fill="#2563EB"/>
                <circle cx="9.5" cy="11.5" r="1.2" fill="#FFFFFF"/>
                <rect x="8.8" y="12" width="1.4" height="2.2" rx="0.4" fill="#FFFFFF"/>
              </svg>
              <span>Phân Quyền Nội Dung</span>
              ${activeSubTab === 'content' ? `
                <div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-white z-20"></div>
              ` : ''}
            </button>
          </div>
        </div>
      </div>

      ${activeSubTab === 'users' ? `
        <!-- TAB USER: STATS SUMMARY CARDS (Matching 100% exact Reference Image) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <!-- 1. Total Users -->
          <div class="relative overflow-hidden p-4 sm:p-4.5 rounded-2xl sm:rounded-[20px] border border-rose-100/80 bg-white shadow-xs flex items-center gap-3.5">
            <!-- Background Image overlay from user reference image -->
            <img src="images/stat_card_wave_bg.png" alt="Stat Card Wave Background" class="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-90 rounded-2xl z-0" />
            
            <div class="w-12 h-12 rounded-xl bg-[#FDF0F3]/90 flex items-center justify-center shrink-0 z-10 backdrop-blur-2xs">
              <svg class="w-6 h-6 text-[#ED1C24] fill-current" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div class="z-10">
              <div class="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">TỔNG SỐ TÀI KHOẢN</div>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-0.5">${totalCount}</div>
            </div>
            <!-- Watermark user silhouettes on right side -->
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-rose-400/25 fill-current pointer-events-none z-10" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>

          <!-- 2. Admins -->
          <div class="relative overflow-hidden p-4 sm:p-4.5 rounded-2xl sm:rounded-[20px] border border-amber-100/80 bg-white shadow-xs flex items-center gap-3.5">
            <!-- Background Image overlay from user reference image -->
            <img src="images/stat_card_gold_wave_bg.png" alt="Gold Wave Background" class="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-90 rounded-2xl z-0" />

            <div class="w-12 h-12 rounded-xl bg-[#FEF8EA]/90 flex items-center justify-center shrink-0 z-10 backdrop-blur-2xs">
              <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" fill="url(#grad-crown)"/>
                <path d="M19 19c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z" fill="#D97706"/>
                <defs>
                  <linearGradient id="grad-crown" x1="3" y1="4" x2="21" y2="16">
                    <stop offset="0%" stop-color="#FBBF24"/>
                    <stop offset="100%" stop-color="#D97706"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="z-10">
              <div class="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">QUẢN TRỊ VIÊN (ADMIN)</div>
              <div class="text-2xl sm:text-3xl font-black text-[#ED1C24] font-mono mt-0.5">${adminCount}</div>
            </div>
          </div>

          <!-- 3. Active Users -->
          <div class="relative overflow-hidden p-4 sm:p-4.5 rounded-2xl sm:rounded-[20px] border border-rose-100/80 bg-white shadow-xs flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-[#E8F8F0] flex items-center justify-center shrink-0 z-10">
              <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#34D399] shadow-xs flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-white/60 -mt-1 -ml-1"></div>
              </div>
            </div>
            <div class="z-10">
              <div class="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">ĐANG HOẠT ĐỘNG</div>
              <div class="text-2xl sm:text-3xl font-black text-[#059669] font-mono mt-0.5">${activeCount}</div>
            </div>
            <!-- Green wave line chart background decoration -->
            <svg class="absolute bottom-0 right-0 w-3/4 h-12 pointer-events-none" viewBox="0 0 200 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad-green-wave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.22"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M0 42 Q 50 40, 90 25 T 150 10 T 180 20 T 200 15 L 200 50 L 0 50 Z" fill="url(#grad-green-wave)"/>
              <path d="M0 42 Q 50 40, 90 25 T 150 10 T 180 20 T 200 15" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.4"/>
            </svg>
          </div>

          <!-- 4. Locked Users -->
          <div class="relative overflow-hidden p-4 sm:p-4.5 rounded-2xl sm:rounded-[20px] border border-rose-100/80 bg-white shadow-xs flex items-center gap-3.5">
            <!-- Background Image overlay from user reference image -->
            <img src="images/stat_card_wave_bg.png" alt="Stat Card Wave Background" class="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-90 rounded-2xl z-0" />

            <div class="w-12 h-12 rounded-xl bg-[#FDF0F3]/90 flex items-center justify-center shrink-0 z-10 backdrop-blur-2xs">
              <svg class="w-5 h-5 text-[#ED1C24] fill-current" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <div class="z-10">
              <div class="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">TÀI KHOẢN ĐÃ KHÓA</div>
              <div class="text-2xl sm:text-3xl font-black text-[#ED1C24] font-mono mt-0.5">${lockedCount}</div>
            </div>
            <!-- Watermark lock icon on right side -->
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 text-rose-400/25 fill-current pointer-events-none z-10" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
        </div>

        <!-- SEARCH & FILTER BAR (Pill Toolbar Container Matching Reference Image) -->
        <div class="bg-white rounded-2xl p-3.5 px-5 border border-rose-100/90 shadow-2xs mb-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Search Bar Input -->
          <div class="relative w-full md:w-80">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#ED1C24] text-sm">🔍</span>
            <input type="text" id="admin-user-search-input" class="w-full pl-10 pr-4 py-2 rounded-full bg-[#F8FAFC] border border-slate-200/80 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-red-400 transition" placeholder="Tìm theo ID, Tên, Email..." value="${escapeHtml(currentSearch)}" />
          </div>

          <!-- Filter Dropdown Selects -->
          <div class="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 justify-end">
            <!-- Role Filter Select -->
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 text-xs pointer-events-none">👤</span>
              <select id="admin-role-filter" class="pl-9 pr-8 py-2 rounded-full bg-white border border-slate-200/90 text-xs font-extrabold text-slate-700 outline-none cursor-pointer appearance-none shadow-2xs">
                <option value="all" ${currentRoleFilter === 'all' ? 'selected' : ''}>Tất Cả Vai Trò</option>
                <option value="admin" ${currentRoleFilter === 'admin' ? 'selected' : ''}>Quản Trị Viên (Admin)</option>
                <option value="student" ${currentRoleFilter === 'student' ? 'selected' : ''}>Học Viên</option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[10px]">▼</span>
            </div>

            <!-- Status Filter Select -->
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-2xs pointer-events-none"></span>
              <select id="admin-status-filter" class="pl-9 pr-8 py-2 rounded-full bg-white border border-slate-200/90 text-xs font-extrabold text-slate-700 outline-none cursor-pointer appearance-none shadow-2xs">
                <option value="all" ${currentStatusFilter === 'all' ? 'selected' : ''}>Tất Cả Trạng Thái</option>
                <option value="active" ${currentStatusFilter === 'active' ? 'selected' : ''}>Đang Hoạt Động</option>
                <option value="locked" ${currentStatusFilter === 'locked' ? 'selected' : ''}>Đã Khóa</option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>
        </div>

        <!-- ACCOUNTS MANAGEMENT TABLE (Matching 100% Reference Image) -->
        <div class="bg-white rounded-2xl sm:rounded-[22px] border border-rose-100/90 shadow-2xs overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#FDF0F3] border-b border-rose-100/80 text-[11px] font-black uppercase text-[#C41E24] tracking-wider">
                  <th class="py-3.5 px-3 w-10 text-center"><input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-0 cursor-pointer" id="admin-select-all-checkbox" /></th>
                  <th class="py-3.5 px-3 w-10 text-center text-[#C41E24]">#</th>
                  <th class="py-3.5 px-4 text-[#C41E24]">TÀI KHOẢN (ID)</th>
                  <th class="py-3.5 px-4 text-[#C41E24]">HỌ & TÊN</th>
                  <th class="py-3.5 px-4 text-[#C41E24]">LOẠI TÀI KHOẢN</th>
                  <th class="py-3.5 px-4 text-[#C41E24]">VAI TRÒ</th>
                  <th class="py-3.5 px-4 text-[#C41E24]">TRẠNG THÁI</th>
                  <th class="py-3.5 px-4 text-[#C41E24]">CẤP ĐỘ HSK</th>
                  <th class="py-3.5 px-4 text-center text-[#C41E24]">THAO TÁC ADMIN</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                ${filteredAccounts.map((acc, index) => {
                  const isCurrentActive = acc.id === activeUser.id;
                  const isLocked = acc.status === 'locked';
                  const isAdmin = acc.isAdmin || acc.role === 'Admin';
                  const accountType = getUserAccountType(acc);

                  return `
                    <tr class="hover:bg-rose-50/20 transition">
                      <!-- Checkbox -->
                      <td class="py-3.5 px-3 text-center">
                        <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-0 cursor-pointer" />
                      </td>

                      <!-- Index -->
                      <td class="py-3.5 px-3 text-center font-bold text-slate-400">
                        ${index + 1}
                      </td>

                      <!-- ID & Avatar & Email -->
                      <td class="py-3.5 px-4">
                        <div class="flex items-center gap-3">
                          <div class="relative w-9 h-9 rounded-full border border-rose-300 p-0.5 shrink-0 bg-rose-50 shadow-2xs">
                            <img src="${escapeHtml(acc.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + acc.id)}" alt="Avatar" class="w-full h-full rounded-full object-cover" />
                            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white"></span>
                          </div>
                          <div>
                            <div class="font-mono font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>${escapeHtml(acc.id)}</span>
                              ${isCurrentActive ? '<span class="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold">(Hiện Tại)</span>' : ''}
                            </div>
                            <div class="text-[11px] text-slate-400 font-medium mt-0.5">Email: ${escapeHtml(acc.email || 'N/A')}</div>
                          </div>
                        </div>
                      </td>

                      <!-- Name -->
                      <td class="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ${escapeHtml(acc.name || acc.id)}
                      </td>

                      <!-- Account Type Badge (Premium / Free Pill Badge) -->
                      <td class="py-3.5 px-4">
                        ${accountType === 'Premium' ? `
                          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#FDF0F3] text-[#ED1C24] shadow-2xs">
                            <span class="text-amber-500 text-xs shrink-0">👑</span>
                            <span class="font-extrabold tracking-tight">Tài khoản Premium</span>
                          </span>
                        ` : `
                          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#EFF6FF] text-[#2563EB] shadow-2xs">
                            <span class="text-emerald-500 text-xs shrink-0">🌱</span>
                            <span class="font-extrabold tracking-tight">Tài khoản Free</span>
                          </span>
                        `}
                      </td>

                      <!-- Role Badge -->
                      <td class="py-3.5 px-4">
                        ${isAdmin ? `
                          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#FDF0F3] text-[#ED1C24] shadow-2xs">
                            <span class="text-amber-500 text-xs shrink-0">👑</span> Admin
                          </span>
                        ` : `
                          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#F0F4FF] text-[#3B82F6] shadow-2xs">
                            <span class="text-indigo-600 text-xs shrink-0">🎓</span> ${escapeHtml(acc.role || 'Học viên')}
                          </span>
                        `}
                      </td>

                      <!-- Status Badge -->
                      <td class="py-3.5 px-4">
                        ${isLocked ? `
                          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#FEE2E2] text-[#DC2626]">
                            🔒 Đã Khóa
                          </span>
                        ` : `
                          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#DCFCE7] text-[#15803D]">
                            <span class="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0"></span> Hoạt Động
                          </span>
                        `}
                      </td>

                      <!-- Target HSK Level -->
                      <td class="py-3.5 px-4 font-black text-[#C41E24] text-xs sm:text-sm">
                        ${escapeHtml(acc.targetLevel || 'HSK 1')}
                      </td>

                      <!-- Admin Actions (4 Circular Action Buttons Matching Reference Image) -->
                      <td class="py-3.5 px-4 text-center whitespace-nowrap">
                        <div class="flex items-center justify-center gap-1.5">
                          <!-- Edit Button -->
                          <button class="btn-admin-edit-user w-7 h-7 rounded-full bg-[#F0F4FF] hover:bg-indigo-100 text-[#3B82F6] flex items-center justify-center text-xs transition cursor-pointer shadow-2xs" title="Chỉnh sửa thông tin & Vai trò" data-id="${acc.id}">
                            ✏️
                          </button>

                          <!-- Quick Password Reset -->
                          <button class="btn-admin-reset-pwd w-7 h-7 rounded-full bg-[#FEF8EA] hover:bg-amber-100 text-[#D97706] flex items-center justify-center text-xs transition cursor-pointer shadow-2xs" title="Đặt lại mật khẩu" data-id="${acc.id}">
                            🔑
                          </button>

                          <!-- Lock / Unlock Button -->
                          <button class="btn-admin-toggle-lock w-7 h-7 rounded-full ${isLocked ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' : 'bg-[#FDF0F3] hover:bg-rose-100 text-[#ED1C24]'} flex items-center justify-center text-xs transition cursor-pointer shadow-2xs" title="${isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}" data-id="${acc.id}">
                            ${isLocked ? '🔓' : '🔒'}
                          </button>

                          <!-- Delete Button -->
                          ${acc.id !== 'admin' ? `
                            <button class="btn-admin-delete-user w-7 h-7 rounded-full bg-[#FDF0F3] hover:bg-rose-100 text-[#ED1C24] flex items-center justify-center text-xs transition cursor-pointer shadow-2xs" title="Xóa tài khoản" data-id="${acc.id}">
                              🗑️
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}

                ${filteredAccounts.length === 0 ? `
                  <tr>
                    <td colspan="9" class="py-12 text-center text-slate-400 font-bold">
                      🔍 Không tìm thấy tài khoản nào khớp với điều kiện lọc!
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <!-- Table Footer & Pagination (Matching Reference Image) -->
          <div class="px-5 py-3.5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-400">
            <div>
              Hiển thị 1 - ${filteredAccounts.length} trong tổng số ${totalCount} tài khoản
            </div>
            <div class="flex items-center gap-1.5">
              <button class="w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-400 font-bold hover:bg-slate-50 cursor-pointer transition" disabled>
                &lt;
              </button>
              <button class="w-7 h-7 rounded-md bg-[#ED1C24] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                1
              </button>
              <button class="w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-400 font-bold hover:bg-slate-50 cursor-pointer transition" disabled>
                &gt;
              </button>
            </div>
          </div>
        </div>
      ` : `
        <!-- TAB CONTENT: PERMISSIONS MANAGEMENT PLACEHOLDER -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200/80 shadow-md text-center space-y-4 max-w-3xl mx-auto my-8 animate-fade-in">
          <div class="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 text-red-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
            📂
          </div>
          <h3 class="text-xl font-black text-slate-900">Phân Quyền Nội Dung Truy Cập Theo Loại Tài Khoản</h3>
          <p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
            Tính năng cấu hình phân quyền chi tiết nội dung (từ vựng, bài học, ngữ pháp, âm nhạc, từ điển, công sở) theo từng loại tài khoản (Free / Premium / Admin) sẽ được thiết kế ở các phiên bản tiếp theo.
          </p>
          <div class="pt-2">
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold shadow-2xs">
              <span>🚧</span> <span>Nội dung trống - Tính năng sẽ được thiết kế sau</span>
            </span>
          </div>
        </div>
      `}

      <!-- Admin Add/Edit User Modal -->
      <div id="admin-user-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-auto">
          <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md">
            <div class="flex items-center gap-2 font-bold text-lg">
              <span id="admin-modal-icon">✏️</span> <span id="admin-modal-title">Tạo Mới Tài Khoản</span>
            </div>
            <button id="btn-close-admin-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">&times;</button>
          </div>

          <form id="form-admin-user-save" class="p-6 space-y-4">
            <input type="hidden" id="admin-form-mode" value="create" />

            <div>
              <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">ID Tài Khoản *</label>
              <input type="text" id="admin-form-id" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="v.d. usr_nam" required />
            </div>

            <div>
              <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Họ & Tên Người Dùng *</label>
              <input type="text" id="admin-form-name" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="v.d. Trần Đức Nam" required />
            </div>

            <div>
              <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Địa Chỉ Email *</label>
              <input type="email" id="admin-form-email" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="user@example.com" required />
            </div>

            <div>
              <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Mật Khẩu *</label>
              <div class="relative">
                <input type="password" id="admin-form-pwd" class="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 font-mono" placeholder="Mật khẩu..." required />
                <button type="button" class="btn-toggle-pwd-visibility absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1" title="Hiện/Ẩn Mật Khẩu">👁️</button>
              </div>
            </div>

            <div class="special-char-toolbar flex items-center gap-1 flex-wrap pt-1 text-2xs text-slate-500">
              <span class="font-bold text-slate-400 text-3xs">⚡ Chèn ký tự đặc biệt:</span>
              <div class="flex items-center gap-1 flex-wrap">
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="@">@</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="#">#</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="$">$</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="%">%</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="!">!</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="&">&amp;</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="*">*</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="_">_</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="-">-</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char=".">.</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="?">?</button>
                <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="~">~</button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Loại Tài Khoản (Plan) *</label>
                <select id="admin-form-type" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="Premium">👑 Tài khoản Premium</option>
                  <option value="Free">🌱 Tài khoản Free</option>
                </select>
              </div>

              <div>
                <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Vai Trò (Role) *</label>
                <select id="admin-form-role" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="Học viên">Học viên</option>
                  <option value="Học viên Cao Cấp">Học viên Cao Cấp</option>
                  <option value="Học viên Nhập Môn">Học viên Nhập Môn</option>
                  <option value="Admin">Quản Trị Viên (Admin)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Trạng Thái *</label>
                <select id="admin-form-status" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="active">🟢 Đang Hoạt Động</option>
                  <option value="locked">🔒 Khóa Tài Khoản</option>
                </select>
              </div>

              <div>
                <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Cấp Độ Mục Tiêu HSK</label>
                <select id="admin-form-level" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="HSK 1">HSK 1</option>
                  <option value="HSK 2">HSK 2</option>
                  <option value="HSK 3">HSK 3</option>
                  <option value="HSK 4">HSK 4</option>
                  <option value="HSK 5">HSK 5</option>
                  <option value="HSK 6">HSK 6</option>
                </select>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" id="btn-cancel-admin-modal" class="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition text-xs cursor-pointer">Hủy</button>
              <button type="submit" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-200 transition cursor-pointer flex items-center gap-1.5">
                <span>💾</span> <span id="admin-modal-submit-text">Lưu Tài Khoản</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Sub-Tab Switcher Event Listeners
    container.querySelectorAll('.btn-admin-subtab').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        activeSubTab = e.currentTarget.dataset.tab;
        renderUI();
      });
    });

    if (activeSubTab === 'users') {
      // Attach Event Listeners for Tab User Controls
      const searchInput = container.querySelector('#admin-user-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value;
          renderUI();
        });
      }

      const roleFilter = container.querySelector('#admin-role-filter');
      if (roleFilter) {
        roleFilter.addEventListener('change', (e) => {
          currentRoleFilter = e.target.value;
          renderUI();
        });
      }

      const statusFilter = container.querySelector('#admin-status-filter');
      if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
          currentStatusFilter = e.target.value;
          renderUI();
        });
      }

      // Modal Controls
      const userModal = container.querySelector('#admin-user-modal');
      const modalTitle = container.querySelector('#admin-modal-title');
      const modalIcon = container.querySelector('#admin-modal-icon');
      const modalSubmitText = container.querySelector('#admin-modal-submit-text');
      const formMode = container.querySelector('#admin-form-mode');
      const formId = container.querySelector('#admin-form-id');
      const formName = container.querySelector('#admin-form-name');
      const formEmail = container.querySelector('#admin-form-email');
      const formPwd = container.querySelector('#admin-form-pwd');
      const formType = container.querySelector('#admin-form-type');
      const formRole = container.querySelector('#admin-form-role');
      const formStatus = container.querySelector('#admin-form-status');
      const formLevel = container.querySelector('#admin-form-level');

      const openCreateModal = () => {
        formMode.value = 'create';
        editingOriginalId = '';
        modalTitle.textContent = 'Tạo Mới Tài Khoản';
        modalIcon.textContent = '➕';
        modalSubmitText.textContent = 'Tạo Tài Khoản';
        formId.disabled = false;
        formId.value = '';
        formName.value = '';
        formEmail.value = '';
        formPwd.value = '123456';
        if (formType) formType.value = 'Free';
        formRole.value = 'Học viên';
        formStatus.value = 'active';
        formLevel.value = 'HSK 1';

        userModal.classList.remove('hidden');
        userModal.classList.add('flex');
      };

      const openEditModal = (acc) => {
        formMode.value = 'edit';
        editingOriginalId = acc.id;
        modalTitle.textContent = `Chỉnh Sửa Tài Khoản: ${acc.id}`;
        modalIcon.textContent = '✏️';
        modalSubmitText.textContent = 'Cập Nhật Tài Khoản';
        formId.disabled = false;
        formId.value = acc.id;
        formName.value = acc.name || '';
        formEmail.value = acc.email || '';
        formPwd.value = acc.password || '';
        if (formType) formType.value = getUserAccountType(acc);
        formRole.value = acc.isAdmin ? 'Admin' : (acc.role || 'Học viên');
        formStatus.value = acc.status || 'active';
        formLevel.value = acc.targetLevel || 'HSK 1';

        userModal.classList.remove('hidden');
        userModal.classList.add('flex');
      };

      const closeUserModal = () => {
        userModal?.classList.add('hidden');
        userModal?.classList.remove('flex');
      };

      container.querySelector('#btn-admin-add-user')?.addEventListener('click', openCreateModal);
      container.querySelector('#btn-close-admin-modal')?.addEventListener('click', closeUserModal);
      container.querySelector('#btn-cancel-admin-modal')?.addEventListener('click', closeUserModal);

      // Save Form
      container.querySelector('#form-admin-user-save')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const mode = formMode.value;
        const uid = formId.value.trim();
        const name = formName.value.trim();
        const email = formEmail.value.trim();
        const pwd = formPwd.value;
        const type = formType ? formType.value : 'Free';
        const role = formRole.value;
        const status = formStatus.value;
        const level = formLevel.value;

        if (mode === 'create') {
          const res = adminCreateUser({
            id: uid,
            name,
            email,
            password: pwd,
            accountType: type,
            role,
            status,
            targetLevel: level
          });
          if (res.success) {
            closeUserModal();
            renderUI();
            alert(`🎉 Đã tạo thành công tài khoản "${uid}"!`);
          } else {
            alert(res.error);
          }
        } else {
          // Edit mode
          const res = adminUpdateUser(editingOriginalId, {
            id: uid,
            name,
            email,
            password: pwd,
            accountType: type,
            role,
            status,
            targetLevel: level
          });

          if (res.success) {
            closeUserModal();
            renderUI();
            if (window.appInstance?.updateHeaderStats) {
              window.appInstance.updateHeaderStats();
            }
            alert(`🎉 Đã cập nhật thành công tài khoản "${uid}"!`);
          } else {
            alert(res.error);
          }
        }
      });

      // Table Actions Click Event Listener
      container.querySelector('tbody')?.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-admin-edit-user');
        if (btnEdit) {
          const uid = btnEdit.getAttribute('data-id');
          const acc = accountsList.find(a => a.id === uid);
          if (acc) openEditModal(acc);
          return;
        }

        const btnLock = e.target.closest('.btn-admin-toggle-lock');
        if (btnLock) {
          const uid = btnLock.getAttribute('data-id');
          const res = toggleLockUserAccount(uid);
          if (res.success) {
            renderUI();
            alert(`🔒 Đã ${res.newStatus === 'locked' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản "${uid}"!`);
          } else {
            alert(res.error);
          }
          return;
        }

        const btnReset = e.target.closest('.btn-admin-reset-pwd');
        if (btnReset) {
          const uid = btnReset.getAttribute('data-id');
          const acc = accountsList.find(a => a.id === uid);
          if (acc) {
            const newPwd = prompt(`🔑 Nhập mật khẩu mới cho tài khoản "${acc.id}":`, acc.password || '123456');
            if (newPwd !== null && newPwd.trim() !== '') {
              acc.password = newPwd.trim();
              saveStoredAccounts(accountsList);
              renderUI();
              alert(`🎉 Đã đổi mật khẩu thành công cho tài khoản "${acc.id}"!`);
            }
          }
          return;
        }

        const btnDel = e.target.closest('.btn-admin-delete-user');
        if (btnDel) {
          const uid = btnDel.getAttribute('data-id');
          if (confirm(`⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${uid}" không?`)) {
            if (deleteUserAccount(uid)) {
              renderUI();
              alert(`🗑️ Đã xóa thành công tài khoản "${uid}"!`);
            }
          }
          return;
        }
      });
      setupSpecialCharsAndVisibility(container);
    }
  };

  renderUI();
}

function setupSpecialCharsAndVisibility(container) {
  container.querySelectorAll('.btn-toggle-pwd-visibility').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.parentElement;
      const input = parent ? parent.querySelector('input') : null;
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerText = '🙈';
          btn.title = 'Ẩn Mật Khẩu';
        } else {
          input.type = 'password';
          btn.innerText = '👁️';
          btn.title = 'Hiện Mật Khẩu';
        }
      }
    });
  });

  let lastActiveInput = null;
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
      lastActiveInput = input;
    });
  });

  container.querySelectorAll('.btn-insert-spec-char').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const char = btn.dataset.char;
      const targetInput = lastActiveInput || container.querySelector('input:focus') || container.querySelector('input[type="password"]') || container.querySelector('input[type="text"]');
      
      if (targetInput) {
        targetInput.focus();
        const start = targetInput.selectionStart || targetInput.value.length;
        const end = targetInput.selectionEnd || targetInput.value.length;
        const val = targetInput.value;
        targetInput.value = val.substring(0, start) + char + val.substring(end);
        targetInput.selectionStart = targetInput.selectionEnd = start + char.length;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
