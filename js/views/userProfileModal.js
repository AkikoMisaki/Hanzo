import { 
  getStoredAccounts, 
  getActiveUser, 
  setActiveUser, 
  saveUserAccount, 
  deleteUserAccount,
  logoutUser,
  getPersonalizedRoadmap,
  getUserAccountBadgeHTML
} from '../utils/accountManager.js';
import { getRealTimeStats, getSRSProgress } from '../utils/srs.js';
import { 
  getAvailableMicrophones, 
  getSelectedMicrophoneDeviceId, 
  setSelectedMicrophoneDeviceId, 
  requestMicrophonePermission, 
  testMicrophoneVolume 
} from '../utils/speech.js';

export function renderUserProfileModalContent(container, appInstance, activeTabName = 'profile') {
  let activeUser = getActiveUser();
  let accounts = getStoredAccounts();
  let stats = getRealTimeStats();
  let roadmap = getPersonalizedRoadmap(activeUser);

  let currentTab = activeTabName;

  function renderTabContent() {
    activeUser = getActiveUser();
    accounts = getStoredAccounts();
    stats = getRealTimeStats();
    roadmap = getPersonalizedRoadmap(activeUser);

    const bodyEl = container.querySelector('#user-profile-modal-body');
    if (!bodyEl) return;

    // Update tab active UI (Tông đỏ trắng)
    container.querySelectorAll('.tab-user-profile-btn').forEach(btn => {
      if (btn.dataset.tab === currentTab) {
        btn.classList.add('border-crimson', 'text-crimson');
        btn.classList.remove('border-transparent', 'text-slate-500');
      } else {
        btn.classList.remove('border-crimson', 'text-crimson');
        btn.classList.add('border-transparent', 'text-slate-500');
      }
    });

    if (currentTab === 'profile') {
      bodyEl.innerHTML = getProfileTabHTML(activeUser, accounts);
      bindProfileEvents();
    } else if (currentTab === 'roadmap') {
      bodyEl.innerHTML = getRoadmapTabHTML(activeUser, roadmap);
      bindRoadmapEvents();
    } else if (currentTab === 'results') {
      bodyEl.innerHTML = getResultsTabHTML(activeUser, stats);
    }
  }

  function getProfileTabHTML(user, accountList) {
    return `
      <!-- Active Profile Overview Card (Tông Đỏ Trắng Sang Trọng) -->
      <div class="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-rose-600 to-red-600 text-white rounded-2xl shadow-xl border border-rose-800 flex flex-col sm:flex-row items-center gap-4">
        <!-- Avatar Ring & Green Status Dot -->
        <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white p-0.5 shrink-0 bg-white/20 shadow-md">
          <img src="${user.avatar}" alt="${user.name}" class="w-full h-full rounded-full object-cover" />
          <span class="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"></span>
        </div>

        <div class="flex-1 text-center sm:text-left space-y-1.5">
          <div class="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h4 class="font-extrabold text-base sm:text-lg text-white drop-shadow-xs">${user.name}</h4>
            <span class="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-white text-rose-700 shadow-xs">${user.targetLevel || 'HSK 3'}</span>
            <span class="px-2 py-0.5 rounded-full text-2xs font-bold bg-white/20 text-white">${user.role || 'Học viên'}</span>
          </div>
          <div class="pt-0.5">
            ${getUserAccountBadgeHTML(user, { extraClass: 'bg-white/95 text-rose-700 border-white shadow-xs' })}
          </div>
          <p class="text-2xs text-rose-100 font-medium">${user.email || 'Chưa thiết lập email'}</p>
          <p class="text-xs text-white/90 italic line-clamp-2">"${user.bio || 'Chưa có tiểu sử.'}"</p>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-2">
          <button id="btn-edit-active-profile" class="w-full sm:w-auto px-3.5 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md">
            <span>✏️</span> Sửa Hồ Sơ
          </button>
          <button id="btn-logout-active-profile" class="w-full sm:w-auto px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer">
            <span>🚪</span> Đăng Xuất
          </button>
        </div>
      </div>

      <!-- Inline Edit Profile Form (Hidden by default) -->
      <form id="form-edit-user-profile" class="hidden p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 text-xs">
        <h5 class="font-extrabold text-rose-900 flex items-center gap-2">
          <span>✏️</span> Chỉnh Sửa Thông Tin Tài Khoản
        </h5>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Họ và Tên</label>
            <input type="text" id="edit-user-name" value="${user.name}" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Địa chỉ Email</label>
            <input type="email" id="edit-user-email" value="${user.email || ''}" placeholder="example@domain.com" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white" required />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mục Tiêu Cấp Độ</label>
            <select id="edit-user-target-level" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white font-medium">
              <option value="HSK 1" ${user.targetLevel === 'HSK 1' ? 'selected' : ''}>HSK 1 (Sơ cấp 150 từ)</option>
              <option value="HSK 2" ${user.targetLevel === 'HSK 2' ? 'selected' : ''}>HSK 2 (Sơ cấp 300 từ)</option>
              <option value="HSK 3" ${user.targetLevel === 'HSK 3' ? 'selected' : ''}>HSK 3 (Trung cấp 600 từ)</option>
              <option value="HSK 4" ${user.targetLevel === 'HSK 4' ? 'selected' : ''}>HSK 4 (Trung cấp 1200 từ)</option>
              <option value="HSK 5" ${user.targetLevel === 'HSK 5' ? 'selected' : ''}>HSK 5 (Cao cấp 2500 từ)</option>
              <option value="HSK 6" ${user.targetLevel === 'HSK 6' ? 'selected' : ''}>HSK 6 (Thông thạo 5000 từ)</option>
              <option value="Tiếng Trung Công Sở" ${user.targetLevel === 'Tiếng Trung Công Sở' ? 'selected' : ''}>Tiếng Trung Công Sở & Thương Mại</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Chỉ tiêu từ vựng học/ngày</label>
            <input type="number" id="edit-user-daily-words" min="5" max="100" value="${user.dailyTargetWords || 15}" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white" />
          </div>
        </div>

        <!-- Ảnh Avatar với 2 tùy chọn -->
        <div class="p-3 bg-white border border-rose-200 rounded-xl space-y-2">
          <label class="block font-bold text-slate-800">Ảnh đại diện Avatar</label>
          <div class="flex items-center gap-4 text-2xs font-bold text-slate-600">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="avatar-option" value="url" id="radio-avatar-url" checked class="accent-rose-600" />
              <span>🌐 Nhập đường dẫn URL</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="avatar-option" value="file" id="radio-avatar-file" class="accent-rose-600" />
              <span>💻 Tải ảnh từ máy tính</span>
            </label>
          </div>

          <div id="avatar-url-input-box">
            <input type="text" id="edit-user-avatar-url" value="${user.avatar || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-slate-50 text-xs" placeholder="https://... hoặc ./images/..." />
          </div>

          <div id="avatar-file-input-box" class="hidden">
            <input type="file" id="edit-user-avatar-file" accept="image/*" class="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer" />
            <p id="avatar-file-status" class="mt-1 text-2xs text-rose-600 font-semibold hidden"></p>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Tiểu sử & Mục tiêu cá nhân</label>
          <textarea id="edit-user-bio" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white">${user.bio || ''}</textarea>
        </div>
        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" id="btn-cancel-edit-profile" class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Hủy</button>
          <button type="submit" class="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-md">Lưu Thay Đổi</button>
        </div>
      </form>

      <!-- Microphone Settings Card -->
      <div class="p-4 bg-white border border-rose-200 rounded-2xl space-y-2.5 text-xs shadow-2xs">
        <div class="flex items-center justify-between">
          <h5 class="font-extrabold text-slate-800 flex items-center gap-1.5">
            <span>🎙️</span> CÀI ĐẶT MICROPHONE LUYỆN NÓI
          </h5>
          <span id="profile-mic-status-badge" class="badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-2xs px-2.5 py-0.5 rounded-lg">
            🟢 Đã sẵn sàng
          </span>
        </div>
        <p class="text-2xs text-slate-500">Chọn thiết bị Microphone kết nối với máy tính để sử dụng mặc định cho các bài tập Luyện phát âm tiếng Trung.</p>
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select id="profile-mic-select" class="flex-1 px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 min-w-[200px]">
            <option value="">🔄 Đang tải danh sách Microphone...</option>
          </select>
          <button type="button" id="btn-profile-test-mic" class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200 whitespace-nowrap cursor-pointer">
            🧪 Thử Micro
          </button>
        </div>
        <div id="profile-mic-volume-wrapper" class="hidden items-center gap-2 pt-1">
          <span class="text-2xs font-bold text-slate-500">Âm lượng thu âm:</span>
          <div class="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div id="profile-mic-volume-bar" class="bg-emerald-500 h-full w-0 transition-all duration-75"></div>
          </div>
        </div>
      </div>

      <!-- Accounts Switcher & Deletion List -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h5 class="font-extrabold text-xs uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
            <span>👥</span> DANH SÁCH TÀI KHOẢN TRÊN THIẾT BỊ
          </h5>
          <button id="btn-show-add-account-form" class="text-2xs font-extrabold text-rose-600 hover:underline flex items-center gap-1">
            <span>➕</span> Thêm Tài Khoản
          </button>
        </div>

        <!-- Inline Add Account Form (Hidden by default) -->
        <form id="form-add-new-account" class="hidden p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-3 text-xs">
          <h6 class="font-extrabold text-rose-900 flex items-center gap-1.5">
            <span>👤</span> Tạo Tài Khoản Mới
          </h6>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tên Học Viên</label>
              <input type="text" id="add-account-name" placeholder="Nhập tên học viên..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white" required />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mục Tiêu Cấp Độ</label>
              <select id="add-account-target-level" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white font-medium">
                <option value="HSK 1">HSK 1 (Nhập môn)</option>
                <option value="HSK 2">HSK 2 (Sơ cấp)</option>
                <option value="HSK 3" selected>HSK 3 (Trung cấp)</option>
                <option value="HSK 4">HSK 4 (Trung cấp cao)</option>
                <option value="HSK 5">HSK 5 (Cao cấp)</option>
                <option value="Tiếng Trung Công Sở">Tiếng Trung Công Sở</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Ghi chú mục tiêu học tập</label>
            <input type="text" id="add-account-bio" placeholder="Ví dụ: Học tiếng Trung du học / làm công ty Trung Quốc..." class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-crimson focus:outline-none bg-white" />
          </div>
          <div class="flex items-center justify-end gap-2">
            <button type="button" id="btn-cancel-add-account" class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md">Tạo & Đăng Nhập</button>
          </div>
        </form>

        <div class="space-y-2">
          ${accountList.map(acc => {
            const isActive = acc.id === user.id;
            return `
              <div class="p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${isActive ? 'bg-rose-50/80 border-rose-300 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'}">
                <div class="flex items-center gap-3">
                  <div class="relative w-10 h-10 rounded-full border-2 border-red-500 p-0.5 shrink-0 bg-white shadow-2xs">
                    <img src="${acc.avatar}" alt="${acc.name}" class="w-full h-full rounded-full object-cover" />
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-extrabold text-xs text-slate-900">${acc.name}</span>
                      ${getUserAccountBadgeHTML(acc)}
                      ${isActive ? '<span class="px-2 py-0.5 rounded-full text-3xs font-black bg-rose-600 text-white uppercase tracking-wider">ĐANG ĐĂNG NHẬP</span>' : ''}
                    </div>
                    <p class="text-2xs text-slate-500">${acc.targetLevel || 'HSK 3'} • ${acc.role || 'Học viên'}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  ${!isActive ? `
                    <button class="btn-switch-account px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs" data-id="${acc.id}">
                      Chuyển Tài Khoản ➔
                    </button>
                  ` : `
                    <span class="text-emerald-600 text-xs font-extrabold flex items-center gap-1 mr-1">
                      ✓ Hoạt động
                    </span>
                  `}

                  <!-- Nút Xóa Tài Khoản -->
                  <button class="btn-delete-account text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 px-2.5 py-1.5 rounded-xl text-2xs font-extrabold transition flex items-center gap-1" data-id="${acc.id}" data-name="${acc.name}" title="Xóa tài khoản này khỏi thiết bị">
                    <span>🗑️</span> Xóa
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function getRoadmapTabHTML(user, roadmapObj) {
    return `
      <!-- Roadmap Header (Tông Đỏ Trắng) -->
      <div class="p-4 bg-gradient-to-r from-red-700 via-rose-600 to-red-600 text-white rounded-2xl shadow-md space-y-2">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-white text-rose-700 uppercase shadow-xs">
              Lộ Trình Cá Nhân Hóa
            </span>
            <h4 class="font-extrabold text-base text-white mt-1 drop-shadow-xs">${roadmapObj.title}</h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xs text-rose-100 font-bold">Mục tiêu:</span>
            <select id="roadmap-select-target-level" class="px-2.5 py-1 bg-white text-slate-900 font-extrabold text-xs rounded-xl border border-rose-300 focus:outline-none">
              <option value="HSK 1" ${user.targetLevel === 'HSK 1' ? 'selected' : ''}>HSK 1</option>
              <option value="HSK 2" ${user.targetLevel === 'HSK 2' ? 'selected' : ''}>HSK 2</option>
              <option value="HSK 3" ${user.targetLevel === 'HSK 3' ? 'selected' : ''}>HSK 3</option>
              <option value="HSK 4" ${user.targetLevel === 'HSK 4' ? 'selected' : ''}>HSK 4</option>
              <option value="HSK 5" ${user.targetLevel === 'HSK 5' ? 'selected' : ''}>HSK 5</option>
              <option value="Tiếng Trung Công Sở" ${user.targetLevel === 'Tiếng Trung Công Sở' ? 'selected' : ''}>Công Sở & Thương Mại</option>
            </select>
          </div>
        </div>
        <p class="text-xs text-rose-100">${roadmapObj.subtitle}</p>
      </div>

      <!-- Roadmap Timeline Milestones -->
      <div class="space-y-3">
        <h5 class="font-extrabold text-xs uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
          <span>🚩</span> Tiến Trình Các Cột Mốc Học Tập
        </h5>
        
        <div class="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          ${roadmapObj.milestones.map(m => {
            let statusBadge = '<span class="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-slate-200 text-slate-600">Chưa Mở</span>';
            let iconBg = 'bg-slate-200 text-slate-500';
            if (m.status === 'completed') {
              statusBadge = '<span class="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-100 text-emerald-700">✓ Hoàn Thành</span>';
              iconBg = 'bg-emerald-500 text-white';
            } else if (m.status === 'in_progress') {
              statusBadge = '<span class="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-rose-100 text-rose-800">⏳ Đang Học (' + m.percent + '%)</span>';
              iconBg = 'bg-rose-600 text-white shadow-md animate-pulse';
            }

            return `
              <div class="relative pl-10">
                <div class="absolute left-2 top-1.5 w-6 h-6 rounded-full ${iconBg} flex items-center justify-center text-xs font-black z-10">
                  ${m.status === 'completed' ? '✓' : (m.status === 'in_progress' ? '►' : '🔒')}
                </div>
                <div class="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 hover:border-rose-300 transition">
                  <div class="flex items-center justify-between gap-2">
                    <h6 class="font-extrabold text-xs text-slate-900">${m.title}</h6>
                    ${statusBadge}
                  </div>
                  <p class="text-2xs text-slate-600 leading-snug">${m.desc}</p>
                  ${m.status === 'in_progress' ? `
                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                      <div class="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full" style="width: ${m.percent}%"></div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Recommended Topics for this Level -->
      <div class="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2">
        <h5 class="font-extrabold text-xs text-rose-900 flex items-center gap-1.5">
          <span>💡</span> Chủ Đề Khuyên Dùng Cho Cấp Độ ${user.targetLevel || 'HSK 3'}
        </h5>
        <div class="flex flex-wrap gap-2">
          ${roadmapObj.recommendedTopics.map(t => `
            <span class="px-3 py-1 bg-white border border-rose-200 rounded-full text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5">
              <span>🎯</span> ${t}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  function getResultsTabHTML(user, userStats) {
    const srsMap = getSRSProgress();
    const totalWords = Object.keys(srsMap).length;
    const mastered = Object.values(srsMap).filter(i => i.repetitions >= 3).length;
    const reviewing = Object.values(srsMap).filter(i => i.repetitions === 1 || i.repetitions === 2).length;
    const newOrForgot = Math.max(0, totalWords - mastered - reviewing);

    const masteredPct = totalWords > 0 ? Math.round((mastered / totalWords) * 100) : 0;
    const reviewPct = totalWords > 0 ? Math.round((reviewing / totalWords) * 100) : 0;
    const newPct = totalWords > 0 ? (100 - masteredPct - reviewPct) : 0;

    return `
      <!-- Top Overview Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
          <div class="text-xl">🔥</div>
          <div class="font-black text-lg text-amber-900">${(userStats && typeof userStats.streak === 'number') ? userStats.streak : 0}</div>
          <div class="text-3xs font-extrabold text-amber-700 uppercase">Chuỗi Streak</div>
        </div>
        <div class="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
          <div class="text-xl">📚</div>
          <div class="font-black text-lg text-rose-900">${userStats.learnedWords || 0}</div>
          <div class="text-3xs font-extrabold text-rose-700 uppercase">Từ Đã Học (SRS)</div>
        </div>
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <div class="text-xl">✅</div>
          <div class="font-black text-lg text-emerald-900">${stats.completedTopics}</div>
          <div class="text-3xs font-extrabold text-emerald-700 uppercase">Bài Hoàn Thành</div>
        </div>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
          <div class="text-xl">⏱️</div>
          <div class="font-black text-lg text-blue-900">${userStats.timeFormatted || '0p'}</div>
          <div class="text-3xs font-extrabold text-blue-700 uppercase">Thời Gian Tuần</div>
        </div>
      </div>

      <!-- Memory Strength SRS Breakdown -->
      <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
        <h5 class="font-extrabold text-xs text-slate-800 flex items-center justify-between">
          <span class="flex items-center gap-1.5">🧠 Phân Tích Trí Nhớ Lặp Lại Ngắt Quảng (SRS SM-2)</span>
          <span class="text-2xs text-slate-400 font-medium">Tổng: ${totalWords} từ</span>
        </h5>

        <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div class="bg-emerald-500 h-full" style="width: ${masteredPct}%" title="Đã nhớ lâu dài: ${mastered} từ"></div>
          <div class="bg-amber-400 h-full" style="width: ${reviewPct}%" title="Đang nhớ trung hạn: ${reviewing} từ"></div>
          <div class="bg-rose-400 h-full" style="width: ${newPct}%" title="Mới/Cần ôn lại: ${newOrForgot} từ"></div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-2xs font-bold text-center">
          <div class="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <div>🟢 Đã Nhớ Lâu Dài</div>
            <div class="font-extrabold text-xs mt-0.5">${mastered} từ (${masteredPct}%)</div>
          </div>
          <div class="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
            <div>🟡 Đang Ôn Tập</div>
            <div class="font-extrabold text-xs mt-0.5">${reviewing} từ (${reviewPct}%)</div>
          </div>
          <div class="p-2 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
            <div>🔴 Mới / Ôn Gấp</div>
            <div class="font-extrabold text-xs mt-0.5">${newOrForgot} từ (${newPct}%)</div>
          </div>
        </div>
      </div>

      <!-- 4 Skills Performance Breakdown -->
      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
        <h5 class="font-extrabold text-slate-800 flex items-center gap-1.5">
          <span>🎯</span> Đánh Giá Năng Lực 4 Kỹ Năng (${user.name})
        </h5>

        <div class="space-y-2.5">
          <div>
            <div class="flex items-center justify-between font-bold text-2xs text-slate-700 mb-1">
              <span>👂 Nghe Hiểu (Listening)</span>
              <span class="text-emerald-600 font-extrabold">85% (Rất Tốt)</span>
            </div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-full rounded-full" style="width: 85%"></div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between font-bold text-2xs text-slate-700 mb-1">
              <span>👄 Phát Âm & Nói (Speaking)</span>
              <span class="text-amber-600 font-extrabold">72% (Khá)</span>
            </div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="bg-amber-500 h-full rounded-full" style="width: 72%"></div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between font-bold text-2xs text-slate-700 mb-1">
              <span>📖 Đọc Hiểu & Ngữ Pháp (Reading)</span>
              <span class="text-blue-600 font-extrabold">90% (Xuất Sắc)</span>
            </div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full" style="width: 90%"></div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between font-bold text-2xs text-slate-700 mb-1">
              <span>✍️ Viết Chữ Hán & Bộ Thủ (Writing)</span>
              <span class="text-purple-600 font-extrabold">68% (Đang Cải Thiện)</span>
            </div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="bg-purple-500 h-full rounded-full" style="width: 68%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindProfileEvents() {
    let uploadedAvatarBase64 = null;

    // Populate Mic Selector & Handle Mic Switch in Profile
    const profileMicSelect = container.querySelector('#profile-mic-select');
    const profileMicBadge = container.querySelector('#profile-mic-status-badge');
    const btnProfileTestMic = container.querySelector('#btn-profile-test-mic');
    const profileVolWrapper = container.querySelector('#profile-mic-volume-wrapper');
    const profileVolBar = container.querySelector('#profile-mic-volume-bar');

    const updateProfileMicList = async () => {
      const mics = await getAvailableMicrophones();
      const currentSelectedId = getSelectedMicrophoneDeviceId();

      if (profileMicSelect) {
        if (mics.length === 0) {
          profileMicSelect.innerHTML = `<option value="">🎙️ Microphone mặc định hệ thống</option>`;
        } else {
          profileMicSelect.innerHTML = mics.map(m => `
            <option value="${m.deviceId}" ${m.deviceId === currentSelectedId ? 'selected' : ''}>
              ${m.label}
            </option>
          `).join('');
        }
      }
    };

    if (typeof requestMicrophonePermission === 'function') {
      requestMicrophonePermission().then(res => {
        if (profileMicBadge) {
          if (res && res.success) {
            profileMicBadge.className = 'badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-2xs px-2.5 py-0.5 rounded-lg';
            profileMicBadge.innerText = '🟢 Đã sẵn sàng';
          } else {
            profileMicBadge.className = 'badge bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-2xs px-2.5 py-0.5 rounded-lg';
            profileMicBadge.innerText = '🔴 Chưa cấp quyền';
          }
        }
        updateProfileMicList();
      });
    }

    profileMicSelect?.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      setSelectedMicrophoneDeviceId(selectedId);
      if (profileMicBadge) {
        profileMicBadge.className = 'badge bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-2xs px-2.5 py-0.5 rounded-lg';
        profileMicBadge.innerText = '🔄 Đang kết nối...';
      }
      requestMicrophonePermission(selectedId).then(res => {
        if (profileMicBadge) {
          if (res && res.success) {
            profileMicBadge.className = 'badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-2xs px-2.5 py-0.5 rounded-lg';
            profileMicBadge.innerText = '🟢 Đã kết nối';
          } else {
            profileMicBadge.className = 'badge bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-2xs px-2.5 py-0.5 rounded-lg';
            profileMicBadge.innerText = '🔴 Thất bại';
          }
        }
        updateProfileMicList();
      });
    });

    btnProfileTestMic?.addEventListener('click', () => {
      if (profileVolWrapper) profileVolWrapper.classList.remove('hidden');
      testMicrophoneVolume((vol) => {
        if (profileVolBar) profileVolBar.style.width = `${vol}%`;
      }, 6000);
    });

    container.querySelector('#btn-edit-active-profile')?.addEventListener('click', () => {
      const form = container.querySelector('#form-edit-user-profile');
      if (form) form.classList.toggle('hidden');
    });

    container.querySelector('#btn-logout-active-profile')?.addEventListener('click', () => {
      logoutUser();
      const modal = document.getElementById('user-profile-modal');
      if (modal) modal.classList.add('hidden');
      if (appInstance) {
        appInstance.updateHeaderStats();
        appInstance.switchTab('dashboard');
      }
      alert('👋 Bạn đã đăng xuất thành công!');
    });

    container.querySelector('#btn-cancel-edit-profile')?.addEventListener('click', () => {
      container.querySelector('#form-edit-user-profile')?.classList.add('hidden');
    });

    // Toggle Avatar Option Radio Buttons
    const radioUrl = container.querySelector('#radio-avatar-url');
    const radioFile = container.querySelector('#radio-avatar-file');
    const urlBox = container.querySelector('#avatar-url-input-box');
    const fileBox = container.querySelector('#avatar-file-input-box');

    radioUrl?.addEventListener('change', () => {
      urlBox?.classList.remove('hidden');
      fileBox?.classList.add('hidden');
    });

    radioFile?.addEventListener('change', () => {
      fileBox?.classList.remove('hidden');
      urlBox?.classList.add('hidden');
    });

    // File input reader
    const fileInput = container.querySelector('#edit-user-avatar-file');
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          uploadedAvatarBase64 = evt.target.result;
          const status = container.querySelector('#avatar-file-status');
          if (status) {
            status.innerText = `✓ Đã chọn ảnh: ${file.name}`;
            status.classList.remove('hidden');
          }
        };
        reader.readAsDataURL(file);
      }
    });

    container.querySelector('#form-edit-user-profile')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#edit-user-name').value.trim();
      const email = container.querySelector('#edit-user-email').value.trim();
      const targetLevel = container.querySelector('#edit-user-target-level').value;
      const dailyTargetWords = parseInt(container.querySelector('#edit-user-daily-words').value, 10) || 15;
      const bio = container.querySelector('#edit-user-bio').value.trim();

      const isFileOption = container.querySelector('#radio-avatar-file')?.checked;
      let avatar = activeUser.avatar;

      if (isFileOption && uploadedAvatarBase64) {
        avatar = uploadedAvatarBase64;
      } else {
        const urlVal = container.querySelector('#edit-user-avatar-url')?.value.trim();
        if (urlVal) avatar = urlVal;
      }

      saveUserAccount({
        id: activeUser.id,
        name,
        email,
        targetLevel,
        dailyTargetWords,
        avatar,
        bio
      });

      if (appInstance) {
        appInstance.updateHeaderStats();
        if (appInstance.renderCurrentView) appInstance.renderCurrentView();
        else if (appInstance.render) appInstance.render();
      }
      renderTabContent();
    });

    container.querySelector('#btn-show-add-account-form')?.addEventListener('click', () => {
      const form = container.querySelector('#form-add-new-account');
      if (form) form.classList.toggle('hidden');
    });

    container.querySelector('#btn-cancel-add-account')?.addEventListener('click', () => {
      container.querySelector('#form-add-new-account')?.classList.add('hidden');
    });

    container.querySelector('#form-add-new-account')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#add-account-name').value.trim();
      const targetLevel = container.querySelector('#add-account-target-level').value;
      const bio = container.querySelector('#add-account-bio').value.trim();

      const newAcc = {
        id: `usr_${Date.now()}`,
        name,
        role: 'Học viên',
        targetLevel,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@hanzo.edu.vn`,
        dailyTargetWords: 15,
        joinedDate: new Date().toLocaleDateString('vi-VN'),
        bio: bio || `Học viên mới theo đuổi mục tiêu ${targetLevel}.`
      };

      saveUserAccount(newAcc);
      setActiveUser(newAcc.id);
      if (appInstance) {
        appInstance.updateHeaderStats();
        if (appInstance.renderCurrentView) appInstance.renderCurrentView();
        else if (appInstance.render) appInstance.render();
      }
      renderTabContent();
    });

    // Switch account
    container.querySelectorAll('.btn-switch-account').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        setActiveUser(id);
        if (appInstance) {
          appInstance.updateHeaderStats();
          if (appInstance.renderCurrentView) appInstance.renderCurrentView();
          else if (appInstance.render) appInstance.render();
        }
        renderTabContent();
      });
    });

    // Delete account from device
    container.querySelectorAll('.btn-delete-account').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi thiết bị?\nTất cả dữ liệu tiến độ học của tài khoản này sẽ bị xóa khỏi bộ nhớ.`)) {
          const success = deleteUserAccount(id);
          if (success) {
            if (appInstance) {
              appInstance.updateHeaderStats();
              if (appInstance.renderCurrentView) appInstance.renderCurrentView();
              else if (appInstance.render) appInstance.render();
            }
            renderTabContent();
          }
        }
      });
    });
  }

  function bindRoadmapEvents() {
    container.querySelector('#roadmap-select-target-level')?.addEventListener('change', (e) => {
      const newLevel = e.target.value;
      saveUserAccount({ id: activeUser.id, targetLevel: newLevel });
      if (appInstance) {
        appInstance.updateHeaderStats();
        if (appInstance.renderCurrentView) appInstance.renderCurrentView();
        else if (appInstance.render) appInstance.render();
      }
      renderTabContent();
    });
  }

  container.querySelectorAll('.tab-user-profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentTab = e.currentTarget.dataset.tab;
      renderTabContent();
    });
  });

  renderTabContent();
}
