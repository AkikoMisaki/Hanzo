/* ==========================================================================
   Hanzo - Standalone Bundle Script
   Generated at 2026-10-06 00:09:58
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // MODULE: js\utils\accountManager.js
  // --------------------------------------------------------------------------
// Module Quản Lý Tài Khoản, Lộ Trình Học Cá Nhân Hóa & Kết Quả Học Tập (accountManager.js)

const DEFAULT_ACCOUNTS = [
  {
    id: 'admin',
    password: '123',
    name: 'Quản Trị Viên Admin',
    role: 'Admin',
    isAdmin: true,
    accountType: 'Premium',
    targetLevel: 'HSK 6',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    email: 'duongchithanhutc@gmail.com',
    dailyTargetWords: 30,
    joinedDate: '01/01/2026',
    status: 'active',
    bio: 'Quản trị viên hệ thống Hanzo Hanyu.'
  },
  {
    id: 'usr_minhanh',
    password: '123',
    name: 'Nguyễn Minh Anh',
    role: 'Học viên',
    isAdmin: false,
    accountType: 'Free',
    targetLevel: 'HSK 3',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    email: 'minhanh.nguyen@example.com',
    dailyTargetWords: 15,
    joinedDate: '15/01/2026',
    status: 'active',
    bio: 'Đang chuẩn bị phỏng vấn vào doanh nghiệp Trung Quốc, tập trung HSK 3 & Giao tiếp Công sở.'
  },
  {
    id: 'usr_ducnam',
    password: '123',
    name: 'Trần Đức Nam',
    role: 'Học viên Cao Cấp',
    isAdmin: false,
    accountType: 'Premium',
    targetLevel: 'HSK 5',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    email: 'ducnam.tran@example.com',
    dailyTargetWords: 25,
    joinedDate: '01/11/2025',
    status: 'active',
    bio: 'Chuyên viên XNK. Luyện đọc báo chí, đàm phán hợp đồng & Tiếng Trung Thương Mại.'
  },
  {
    id: 'usr_thuha',
    password: '123',
    name: 'Lê Thu Hà',
    role: 'Học viên Nhập Môn',
    isAdmin: false,
    accountType: 'Free',
    targetLevel: 'HSK 1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    email: 'thuha.le@example.com',
    dailyTargetWords: 10,
    joinedDate: '20/09/2026',
    status: 'active',
    bio: 'Người mới bắt đầu học phát âm Pinyin, nét chữ Hán và các câu giao tiếp cơ bản.'
  }
];

const STORAGE_KEYS = {
  ACCOUNTS_LIST: 'hanzo_user_accounts_list',
  ACTIVE_USER_ID: 'hanzo_active_user_id',
  PENDING_REGISTRATION: 'hanzo_pending_registration_otp',
  PENDING_RESET: 'hanzo_pending_reset_otp'
};

function getUserAccountType(user) {
  if (!user || user.id === 'guest') return 'Free';
  if (user.accountType) return user.accountType;
  if (user.isAdmin || user.role === 'Admin' || user.role === 'Học viên Cao Cấp') return 'Premium';
  return 'Free';
}

function getUserAccountBadgeHTML(user, options = {}) {
  const type = getUserAccountType(user);
  const extra = options.extraClass || '';

  if (type === 'Premium') {
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100/90 text-red-600 border border-rose-200/90 shadow-2xs ${extra}">
        <span class="text-red-500 text-xs shrink-0">👑</span>
        <span class="text-red-700 font-extrabold tracking-tight">Tài khoản Premium</span>
      </span>
    `;
  } else {
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs ${extra}">
        <span class="text-emerald-600 text-xs shrink-0">🌱</span>
        <span class="text-slate-600 font-extrabold tracking-tight">Tài khoản Free</span>
      </span>
    `;
  }
}

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_LIST);
    let list = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    // Ensure admin account ALWAYS exists
    let hasAdmin = list.some(a => a.id === 'admin');
    if (!hasAdmin) {
      list.unshift(DEFAULT_ACCOUNTS[0]);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(list));
    }

    // Ensure all accounts have required fields
    let modified = false;
    list.forEach(acc => {
      if (!acc.status) { acc.status = 'active'; modified = true; }
      if (acc.password === undefined) { acc.password = '123'; modified = true; }
      if (!acc.accountType) {
        acc.accountType = (acc.isAdmin || acc.role === 'Admin' || acc.role === 'Học viên Cao Cấp') ? 'Premium' : 'Free';
        modified = true;
      }
      if (acc.id === 'admin') { 
        acc.isAdmin = true; 
        acc.role = 'Admin'; 
        acc.accountType = 'Premium';
        if (acc.email !== 'duongchithanhutc@gmail.com') {
          acc.email = 'duongchithanhutc@gmail.com';
          modified = true;
        }
      }
    });
    if (modified) saveStoredAccounts(list);
    return list;
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accounts));
  } catch (e) {}
}

function getActiveUser() {
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  if (!activeId || activeId === 'guest') {
    return {
      id: 'guest',
      name: 'Khách',
      role: 'Chưa Đăng Nhập',
      isAdmin: false,
      targetLevel: 'HSK 1',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      email: '',
      status: 'guest',
      bio: 'Vui lòng đăng nhập để lưu trữ tiến độ học tập cá nhân.'
    };
  }
  const accounts = getStoredAccounts();
  const found = accounts.find(a => a.id === activeId);
  if (found) return found;
  return accounts[0] || DEFAULT_ACCOUNTS[0];
}

function setActiveUser(userId) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
}

function logoutUser() {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'guest');
  return true;
}

function authenticateUser(idOrEmail, password) {
  const accounts = getStoredAccounts();
  const term = idOrEmail.trim().toLowerCase();
  let user = accounts.find(a => 
    a.id.toLowerCase() === term || 
    (a.email && a.email.toLowerCase() === term) ||
    (a.email && a.email.toLowerCase().split('@')[0] === term)
  );

  // Fallback for admin if missing from stored list
  if (!user && (term === 'admin' || term === 'duongchithanhutc' || term === 'duongchithanhutc@gmail.com')) {
    user = DEFAULT_ACCOUNTS[0];
    const list = getStoredAccounts();
    if (!list.some(a => a.id === 'admin')) {
      list.unshift(user);
      saveStoredAccounts(list);
    }
  }

  if (!user) {
    return { success: false, error: '⚠️ Tài khoản (ID hoặc Email) không tồn tại trên hệ thống!' };
  }

  if (user.password && user.password !== password) {
    return { success: false, error: '⚠️ Mật khẩu không chính xác! Vui lòng thử lại.' };
  }

  if (user.status === 'locked') {
    return { success: false, error: '🔒 Tài khoản này đã bị khóa bởi Quản trị viên (Admin). Vui lòng liên hệ hỗ trợ!' };
  }

  setActiveUser(user.id);
  return { success: true, user };
}

// Generate 6-digit OTP code for Email verification simulation
function generateOTPCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function requestRegisterEmailVerification(id, email, password, name) {
  const accounts = getStoredAccounts();
  const cleanId = id.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (accounts.some(a => a.id.toLowerCase() === cleanId.toLowerCase())) {
    return { success: false, error: '⚠️ ID Tài khoản này đã được sử dụng! Vui lòng chọn ID khác.' };
  }
  if (accounts.some(a => a.email && a.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: '⚠️ Email này đã được đăng ký! Vui lòng dùng email khác hoặc sử dụng Quên mật khẩu.' };
  }

  const otp = generateOTPCode();
  const pendingData = {
    id: cleanId,
    email: cleanEmail,
    password: password,
    name: name.trim() || cleanId,
    otp: otp,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_REGISTRATION, JSON.stringify(pendingData));
  } catch (e) {}

  return { success: true, pendingData, otp };
}

function confirmRegisterOTP(enteredOTP) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_REGISTRATION);
    if (!raw) return { success: false, error: '⚠️ Thông tin đăng ký đã hết hạn. Vui lòng đăng ký lại!' };
    
    const pending = JSON.parse(raw);
    if (pending.otp !== enteredOTP.trim()) {
      return { success: false, error: '❌ Mã OTP xác thực email không chính xác! Vui lòng kiểm tra lại.' };
    }

    const newUser = {
      id: pending.id,
      password: pending.password,
      name: pending.name,
      email: pending.email,
      role: 'Học viên',
      isAdmin: false,
      targetLevel: 'HSK 1',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${pending.id}`,
      dailyTargetWords: 15,
      joinedDate: new Date().toLocaleDateString('vi-VN'),
      status: 'active',
      bio: 'Tài khoản mới tạo.'
    };

    saveUserAccount(newUser);
    setActiveUser(newUser.id);
    localStorage.removeItem(STORAGE_KEYS.PENDING_REGISTRATION);

    return { success: true, user: newUser };
  } catch (e) {
    return { success: false, error: '❌ Có lỗi xảy ra khi xác thực OTP: ' + e.message };
  }
}

function requestPasswordResetOTP(email) {
  const accounts = getStoredAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const user = accounts.find(a => a.email && a.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: '⚠️ Không tìm thấy tài khoản nào liên kết với Email này!' };
  }

  const otp = generateOTPCode();
  const pendingReset = {
    userId: user.id,
    email: cleanEmail,
    otp: otp,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_RESET, JSON.stringify(pendingReset));
  } catch (e) {}

  return { success: true, user, otp };
}

function resetPasswordWithOTP(enteredOTP, newPassword) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_RESET);
    if (!raw) return { success: false, error: '⚠️ Yêu cầu đặt lại mật khẩu đã hết hạn. Vui lòng thực hiện lại!' };

    const pending = JSON.parse(raw);
    if (pending.otp !== enteredOTP.trim()) {
      return { success: false, error: '❌ Mã xác nhận OTP không đúng!' };
    }

    const accounts = getStoredAccounts();
    const userIndex = accounts.findIndex(a => a.id === pending.userId);
    if (userIndex === -1) {
      return { success: false, error: '⚠️ Không tìm thấy tài khoản để đặt lại mật khẩu!' };
    }

    accounts[userIndex].password = newPassword;
    saveStoredAccounts(accounts);
    localStorage.removeItem(STORAGE_KEYS.PENDING_RESET);

    return { success: true, user: accounts[userIndex] };
  } catch (e) {
    return { success: false, error: '❌ Có lỗi xảy ra khi đổi mật khẩu: ' + e.message };
  }
}

function saveUserAccount(accountObj) {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex(a => a.id === accountObj.id);
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...accountObj };
  } else {
    accounts.push(accountObj);
  }
  saveStoredAccounts(accounts);
  return accounts;
}

function adminCreateUser(userObj) {
  const accounts = getStoredAccounts();
  const cleanId = userObj.id.trim();

  if (accounts.some(a => a.id.toLowerCase() === cleanId.toLowerCase())) {
    return { success: false, error: `⚠️ ID Tài khoản "${cleanId}" đã tồn tại!` };
  }

  const newUser = {
    id: cleanId,
    password: userObj.password || '123456',
    name: userObj.name || cleanId,
    email: userObj.email || `${cleanId}@hanzo.edu.vn`,
    role: userObj.role || 'Học viên',
    isAdmin: userObj.role === 'Admin',
    accountType: userObj.accountType || (userObj.role === 'Admin' || userObj.role === 'Học viên Cao Cấp' ? 'Premium' : 'Free'),
    targetLevel: userObj.targetLevel || 'HSK 1',
    avatar: userObj.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}`,
    dailyTargetWords: 15,
    joinedDate: new Date().toLocaleDateString('vi-VN'),
    status: userObj.status || 'active',
    bio: userObj.bio || 'Tài khoản được khởi tạo bởi Admin.'
  };

  accounts.unshift(newUser);
  saveStoredAccounts(accounts);
  return { success: true, user: newUser };
}

function adminUpdateUser(oldId, userObj) {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex(a => a.id === oldId);
  if (idx === -1) {
    return { success: false, error: `⚠️ Không tìm thấy tài khoản với ID "${oldId}"!` };
  }

  const newId = (userObj.id || oldId).trim();
  if (newId.toLowerCase() !== oldId.toLowerCase()) {
    if (accounts.some(a => a.id.toLowerCase() === newId.toLowerCase())) {
      return { success: false, error: `⚠️ ID Tài Khoản mới "${newId}" đã được sử dụng bởi một tài khoản khác!` };
    }
  }

  const activeUser = getActiveUser();
  const isCurrentActive = activeUser && activeUser.id === oldId;

  const updatedAccountType = userObj.accountType || (userObj.role === 'Admin' || userObj.role === 'Học viên Cao Cấp' ? 'Premium' : (accounts[idx].accountType || 'Free'));

  accounts[idx] = {
    ...accounts[idx],
    ...userObj,
    id: newId,
    isAdmin: userObj.role === 'Admin' || userObj.isAdmin || false,
    accountType: updatedAccountType
  };

  saveStoredAccounts(accounts);

  if (isCurrentActive) {
    setActiveUser(newId);
  }

  return { success: true, user: accounts[idx] };
}

function toggleLockUserAccount(userId) {
  const accounts = getStoredAccounts();
  const user = accounts.find(a => a.id === userId);
  if (!user) return { success: false, error: 'Không tìm thấy tài khoản!' };

  if (user.id === 'admin') {
    return { success: false, error: '⚠️ Không thể khóa tài khoản Admin tối cao!' };
  }

  user.status = user.status === 'locked' ? 'active' : 'locked';
  saveStoredAccounts(accounts);
  return { success: true, user, newStatus: user.status };
}

function deleteUserAccount(userId) {
  let accounts = getStoredAccounts();
  if (userId === 'admin') {
    alert('⚠️ Không thể xóa tài khoản Admin hệ thống!');
    return false;
  }

  if (accounts.length <= 1) {
    alert('Không thể xóa tài khoản này! Cần duy trì ít nhất 1 tài khoản trên thiết bị.');
    return false;
  }

  accounts = accounts.filter(a => a.id !== userId);
  saveStoredAccounts(accounts);

  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  if (activeId === userId) {
    setActiveUser(accounts[0].id);
  }

  try {
    const keysToRemove = [
      `hanzo_srs_progress_${userId}`,
      `hanzo_user_stats_${userId}`,
      `hanzo_custom_schedule_list_${userId}`,
      `hanzo_schedule_goals_${userId}`,
      `hanzo_daily_study_logs_${userId}`,
      `hanzo_custom_topics_${userId}`,
      `hanzo_deleted_preset_ids_${userId}`,
      `hanzo_custom_songs_${userId}`,
      `hanzo_deleted_preset_songs_${userId}`,
      `hanzo_dict_favorites_${userId}`,
      `hanzo_dict_notes_${userId}`,
      `hanzo_notifs_read_${userId}`
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}

  return true;
}

function getScopedStorageKey(baseKey) {
  const activeUser = getActiveUser();
  const scopedKey = `${baseKey}_${activeUser.id}`;
  
  try {
    if (activeUser.id === 'usr_minhanh') {
      if (!localStorage.getItem(scopedKey) && localStorage.getItem(baseKey)) {
        localStorage.setItem(scopedKey, localStorage.getItem(baseKey));
      }
    } else {
      const baseVal = localStorage.getItem(baseKey);
      const scopedVal = localStorage.getItem(scopedKey);
      if (baseVal && scopedVal === baseVal) {
        if (
          baseKey === 'hanzo_srs_progress' || 
          baseKey === 'hanzo_custom_schedule_list' || 
          baseKey === 'hanzo_user_stats' ||
          baseKey === 'hanzo_custom_topics' ||
          baseKey === 'hanzo_custom_songs'
        ) {
          localStorage.removeItem(scopedKey);
        }
      }
    }
  } catch (e) {}

  return scopedKey;
}

function getFavoriteDictWords() {
  try {
    const key = getScopedStorageKey('hanzo_dict_favorites');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function toggleFavoriteDictWord(wordId) {
  const key = getScopedStorageKey('hanzo_dict_favorites');
  const favs = getFavoriteDictWords();
  const idx = favs.indexOf(wordId);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(wordId);
  try {
    localStorage.setItem(key, JSON.stringify(favs));
  } catch (e) {}
  return favs;
}

// Lộ trình học tập cá nhân hóa theo từng cấp độ (Roadmap System)
function getPersonalizedRoadmap(userObj) {
  const user = userObj || getActiveUser();
  const level = user.targetLevel || 'HSK 3';

  if (level.includes('1') || level.includes('2')) {
    return {
      title: `Lộ Trình Nhập Môn & Sơ Cấp (${level})`,
      subtitle: 'Xây dựng nền tảng Pinyin, bộ thủ chữ Hán & câu giao tiếp đời sống',
      milestones: [
        { id: 'm1', title: 'Cột mốc 1: Phiên âm Pinyin & 214 Bộ Thủ', status: 'completed', percent: 100, desc: 'Nắm vững phát âm, thanh điệu & các nét chữ Hán cơ bản' },
        { id: 'm2', title: 'Cột mốc 2: Chào hỏi, Bản thân & Gia đình', status: 'in_progress', percent: 65, desc: 'Giao tiếp hàng ngày, mua sắm & hỏi đường căn bản' },
        { id: 'm3', title: 'Cột mốc 3: Thời gian, Đồ ăn & Sinh hoạt', status: 'locked', percent: 0, desc: 'Mở rộng 150 từ vựng HSK 1 & 30 cấu trúc ngữ pháp' },
        { id: 'm4', title: 'Cột mốc 4: Đánh giá & Chinh phục HSK 1', status: 'locked', percent: 0, desc: 'Thi thử mock-test & cấp chứng chỉ sơ cấp' }
      ],
      recommendedTopics: ['Lớp Học & Đồ Dùng', 'Gia Đình & Bạn Bè', 'Thời Gian & Thời Tiết']
    };
  } else if (level.includes('4') || level.includes('5') || level.includes('6')) {
    return {
      title: `Lộ Trình Cao Cấp & Tiếng Trung Thương Mại (${level})`,
      subtitle: 'Đột phá từ vựng chuyên ngành, văn bản chính luận & phản xạ tự nhiên',
      milestones: [
        { id: 'm1', title: 'Cột mốc 1: HSK 4 Toàn diện & Từ vựng Chuyên ngành', status: 'completed', percent: 100, desc: 'Làm chủ 1200 từ vựng & phản xạ giao tiếp tốc độ cao' },
        { id: 'm2', title: 'Cột mốc 2: Đàm phán Thương Mại & Viết Email', status: 'in_progress', percent: 45, desc: 'Soạn thảo hợp đồng, báo cáo tài chính & thương thảo giá' },
        { id: 'm3', title: 'Cột mốc 3: Đọc báo chí & Phân tích Kinh tế', status: 'locked', percent: 0, desc: 'Hiểu 90% tin tức truyền hình & văn bản chính trị - xã hội' },
        { id: 'm4', title: 'Cột mốc 4: Chinh phục HSK 5/6 & Luận văn', status: 'locked', percent: 0, desc: 'Viết luận 500 từ & thuyết trình chuyên nghiệp' }
      ],
      recommendedTopics: ['Tiếng Trung Công Sở', 'Tuyển Dụng & Phỏng Vấn', 'Đàm Phán & Hợp Đồng']
    };
  } else {
    return {
      title: `Lộ Trình Trung Cấp & Giao Tiếp Công Sở (${level})`,
      subtitle: 'Luyện 600 từ vựng HSK 3, kỹ năng làm việc văn phòng & phỏng vấn',
      milestones: [
        { id: 'm1', title: 'Cột mốc 1: Giao tiếp Văn phòng & Phỏng vấn', status: 'completed', percent: 100, desc: 'Giới thiệu kinh nghiệm làm việc & chào đón đối tác' },
        { id: 'm2', title: 'Cột mốc 2: Đột phá HSK 3 - Ngữ pháp & Từ vựng', status: 'in_progress', percent: 75, desc: 'Luyện ngắt ngắc câu, đọc hiểu đoạn văn & viết nhật ký' },
        { id: 'm3', title: 'Cột mốc 3: Viết Email Công tác & Báo cáo', status: 'locked', percent: 0, desc: 'Kỹ năng gửi mail chuyên nghiệp & báo cáo tiến độ công việc' },
        { id: 'm4', title: 'Cột mốc 4: Chinh phục HSK 3 & Phản xạ 4 Kỹ năng', status: 'locked', percent: 0, desc: 'Thi đấu từ vựng SRS & hoàn thành chứng chỉ HSK 3' }
      ],
      recommendedTopics: ['Phỏng Vấn & Tuyển Dụng', 'Giao Tiếp Văn Phòng', 'Mua Sắm & Đặt Hàng']
    };
  }
}

// System Content Access Permissions Matrix Config
const DEFAULT_PERMISSIONS = {
  Free: {
    topics: { name: 'Chủ đề từ vựng', access: true, hskMax: 'HSK 2', customTopics: false, exportExcel: false },
    grammar: { name: 'Học ngữ pháp', access: true, hskMax: 'HSK 2', practiceExams: false },
    reading: { name: 'Đọc & dịch', access: true, maxDocLength: 1000, pdfUpload: false },
    schedule: { name: 'Lên lịch học', access: true, srsAuto: true, dailyGoalMax: 20 },
    practice: { name: 'Ôn tập & Kiểm Tra', access: true, examTest: false, audioListening: true },
    music: { name: 'Học Hát', access: true, songLimit: 5, pinyinLyrics: true },
    dictionary: { name: 'Từ điển HSK', access: true, hanziWriterAnimation: true, strokeTracing: false },
    gptSearch: { name: 'Tìm Kiếm GPT', access: true, dailyLimit: 5, aiRoleplay: false }
  },
  Premium: {
    topics: { name: 'Chủ đề từ vựng', access: true, hskMax: 'HSK 6', customTopics: true, exportExcel: true },
    grammar: { name: 'Học ngữ pháp', access: true, hskMax: 'HSK 6', practiceExams: true },
    reading: { name: 'Đọc & dịch', access: true, maxDocLength: 50000, pdfUpload: true },
    schedule: { name: 'Lên lịch học', access: true, srsAuto: true, dailyGoalMax: 100 },
    practice: { name: 'Ôn tập & Kiểm Tra', access: true, examTest: true, audioListening: true },
    music: { name: 'Học Hát', access: true, songLimit: 999, pinyinLyrics: true },
    dictionary: { name: 'Từ điển HSK', access: true, hanziWriterAnimation: true, strokeTracing: true },
    gptSearch: { name: 'Tìm Kiếm GPT', access: true, dailyLimit: 999, aiRoleplay: true }
  },
  Admin: {
    topics: { name: 'Chủ đề từ vựng', access: true, hskMax: 'HSK 6', customTopics: true, exportExcel: true },
    grammar: { name: 'Học ngữ pháp', access: true, hskMax: 'HSK 6', practiceExams: true },
    reading: { name: 'Đọc & dịch', access: true, maxDocLength: 999999, pdfUpload: true },
    schedule: { name: 'Lên lịch học', access: true, srsAuto: true, dailyGoalMax: 999 },
    practice: { name: 'Ôn tập & Kiểm Tra', access: true, examTest: true, audioListening: true },
    music: { name: 'Học Hát', access: true, songLimit: 999, pinyinLyrics: true },
    dictionary: { name: 'Từ điển HSK', access: true, hanziWriterAnimation: true, strokeTracing: true },
    gptSearch: { name: 'Tìm Kiếm GPT', access: true, dailyLimit: 9999, aiRoleplay: true }
  }
};

function getContentPermissionsConfig() {
  try {
    const data = localStorage.getItem('hanzo_content_permissions_config');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
}

function saveContentPermissionsConfig(config) {
  try {
    localStorage.setItem('hanzo_content_permissions_config', JSON.stringify(config));
    return true;
  } catch (e) {
    return false;
  }
}


  // --------------------------------------------------------------------------
  // MODULE: js\data\dictionaryData.js
  // --------------------------------------------------------------------------
const dictionaryData = [
  {
    id: 'dict_1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    pinyinNoTone: 'ni hao',
    hanviet: 'Nễ Hảo',
    meaning: 'Xin chào',
    hskLevel: 1,
    radical: '亻 (Nhân đứng)',
    strokeCount: 13,
    type: 'Cụm từ giao tiếp',
    tags: ['Giao tiếp hàng ngày', 'Chào hỏi', 'HSK1'],
    usageContext: 'Dùng để chào hỏi một người trong lần đầu gặp mặt hoặc giao tiếp thông thường.',
    examples: [
      {
        zh: '你好！很高兴认识你。',
        py: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
        vi: 'Xin chào! Rất vui được quen biết bạn.',
        scenario: 'Giao tiếp lần đầu gặp mặt'
      },
      {
        zh: '王经理，你好！',
        py: 'Wáng jīnglǐ, nǐ hǎo!',
        vi: 'Giám đốc Vương, xin chào ông!',
        scenario: 'Chào hỏi trong công sở'
      }
    ],
    synonyms: ['您好 (trọng thị)', '嗨 (thân mật)'],
    collocations: ['你好吗 (Bạn khỏe không)', '你好呀 (Chào nhé)']
  },
  {
    id: 'dict_2',
    hanzi: '谢谢',
    pinyin: 'xiè xie',
    pinyinNoTone: 'xie xie',
    hanviet: 'Tạ Tạ',
    meaning: 'Cảm ơn',
    hskLevel: 1,
    radical: '讠 (Ngôn)',
    strokeCount: 24,
    type: 'Động từ / Cụm từ',
    tags: ['Giao tiếp hàng ngày', 'Lịch sự', 'HSK1'],
    usageContext: 'Dùng để bày tỏ sự cảm ơn khi ai đó giúp đỡ hoặc tặng quà.',
    examples: [
      {
        zh: '非常感谢你的帮助！',
        py: 'Fēicháng gǎnxiè nǐ de bāngzhù!',
        vi: 'Rất cảm ơn sự giúp đỡ của bạn!',
        scenario: 'Cảm ơn sự giúp đỡ nhiệt tình'
      },
      {
        zh: '谢谢你送我的礼物。',
        py: 'Xièxiè nǐ sòng wǒ de lǐwù.',
        vi: 'Cảm ơn bạn đã tặng tôi món quà.',
        scenario: 'Nhận quà tặng'
      }
    ],
    synonyms: ['感谢', '多谢'],
    collocations: ['谢谢你', '太谢谢了', '不用谢 (Không có gì)']
  },
  {
    id: 'dict_3',
    hanzi: '工作',
    pinyin: 'gōng zuò',
    pinyinNoTone: 'gong zuo',
    hanviet: 'Công Tác',
    meaning: 'Công việc / Làm việc',
    hskLevel: 1,
    radical: '工 (Công)',
    strokeCount: 10,
    type: 'Danh từ / Động từ',
    tags: ['Công sở', 'Đời sống', 'HSK1'],
    usageContext: 'Vừa là động từ (đi làm, làm việc) vừa là danh từ (nghề nghiệp, công việc).',
    examples: [
      {
        zh: '你在哪儿工作？',
        py: 'Nǐ zài nǎr gōngzuò?',
        vi: 'Bạn làm việc ở đâu?',
        scenario: 'Hỏi thăm công việc'
      },
      {
        zh: '最近工作很忙，但是很有 ý 义。',
        py: 'Zuìjìn gōngzuò hěn máng, dànshì hěn yǒu yìyì.',
        vi: 'Dạo này công việc rất bận nhưng rất có ý nghĩa.',
        scenario: 'Chia sẻ tiến độ công việc'
      }
    ],
    synonyms: ['上班 (đi làm)', '职业 (nghề nghiệp)'],
    collocations: ['找工作 (Tìm việc)', '工作安排 (Phân công công việc)', '工作效率 (Hiệu suất làm việc)']
  },
  {
    id: 'dict_4',
    hanzi: '会议',
    pinyin: 'huì yì',
    pinyinNoTone: 'hui yi',
    hanviet: 'Hội Nghị',
    meaning: 'Cuộc họp / Hội nghị',
    hskLevel: 3,
    radical: '人 (Nhân)',
    strokeCount: 12,
    type: 'Danh từ',
    tags: ['Công sở', 'Họp hành', 'HSK3'],
    usageContext: 'Dùng trong môi trường văn phòng để chỉ buổi họp nội bộ hoặc hội nghị đối tác.',
    examples: [
      {
        zh: '我们下午两点在三楼会议室开会。',
        py: 'Wǒmen xiàwǔ liǎng diǎn zài sān lóu huìyìshì kāihuì.',
        vi: 'Chúng ta 2 giờ chiều họp ở phòng họp tầng 3.',
        scenario: 'Thông báo lịch họp công ty'
      },
      {
        zh: '请把会议纪要发给大家。',
        py: 'Qǐng bǎ huìyì jìyào fā gěi dàjiā.',
        vi: 'Xin hãy gửi biên bản cuộc họp cho mọi người.',
        scenario: 'Giao việc sau cuộc họp'
      }
    ],
    synonyms: ['开会', '研讨会'],
    collocations: ['开会议 (Mở cuộc họp)', '会议纪要 (Biên bản họp)', '主持会议 (Chủ trì cuộc họp)']
  },
  {
    id: 'dict_5',
    hanzi: '邮件',
    pinyin: 'yóu jiàn',
    pinyinNoTone: 'you jian',
    hanviet: 'Bưu Kiện',
    meaning: 'Thư bưu điện / Email công việc',
    hskLevel: 4,
    radical: '阝 (Phụ/Ấp)',
    strokeCount: 15,
    type: 'Danh từ',
    tags: ['Công sở', 'Email', 'HSK4'],
    usageContext: 'Trong giao tiếp công sở modern, 邮件 thường dùng chỉ Email công việc.',
    examples: [
      {
        zh: '我已经把报价单通过邮件发送给客户了。',
        py: 'Wǒ yǐjīng bǎ bàojià dān tōngguò yóujiàn fāsòng gěi kèhù le.',
        vi: 'Tôi đã gửi bảng báo giá qua email cho khách hàng rồi.',
        scenario: 'Báo cáo công việc qua Email'
      },
      {
        zh: '请查收我发给您的电子邮件。',
        py: 'Qǐng cháluō wǒ fā gěi nín de diànzǐ yóujiàn.',
        vi: 'Vui lòng kiểm tra email tôi đã gửi cho ông/bà.',
        scenario: 'Nhắc khách hàng check mail'
      }
    ],
    synonyms: ['电子邮件 (Email)', '信件'],
    collocations: ['发邮件 (Gửi email)', '查收邮件 (Kiểm tra email)', '邮件附件 (Tệp đính kèm email)']
  },
  {
    id: 'dict_6',
    hanzi: '合作',
    pinyin: 'hé zuò',
    pinyinNoTone: 'he zuo',
    hanviet: 'Hợp Tác',
    meaning: 'Hợp tác / Cùng làm việc',
    hskLevel: 4,
    radical: '口 (Khẩu)',
    strokeCount: 14,
    type: 'Động từ / Danh từ',
    tags: ['Công sở', 'Thương lượng', 'HSK4'],
    usageContext: 'Dùng khi bàn luận về mối quan hệ kinh doanh, đối tác hoặc phối hợp nhóm.',
    examples: [
      {
        zh: '祝我们合作愉快！',
        py: 'Zhù wǒmen hézuò yúkuài!',
        vi: 'Chúc hợp tác giữa chúng ta thành công tốt đẹp!',
        scenario: 'Ký kết hợp đồng / Kết thúc đàm phán'
      },
      {
        zh: '我们公司非常期待与贵公司的合作。',
        py: 'Wǒmen gōngsī fēicháng qīdài yǔ guì gōngsī de hézuò.',
        vi: 'Công ty chúng tôi rất mong chờ được hợp tác với quý công ty.',
        scenario: 'Chào hàng & Kết nối kinh doanh'
      }
    ],
    synonyms: ['协作 (Phối hợp)', '联合'],
    collocations: ['合作愉快 (Hợp tác vui vẻ)', '合作伙伴 (Đối tác hợp tác)', '深化合作 (Đẩy mạnh hợp tác)']
  },
  {
    id: 'dict_7',
    hanzi: '学习',
    pinyin: 'xué xí',
    pinyinNoTone: 'xue xi',
    hanviet: 'Học Tập',
    meaning: 'Học tập / Học hỏi',
    hskLevel: 1,
    radical: '子 (Tử)',
    strokeCount: 11,
    type: 'Động từ',
    tags: ['Giao tiếp hàng ngày', 'Giáo dục', 'HSK1'],
    usageContext: 'Dùng khi nói về việc tiếp thu kiến thức, ngoại ngữ hoặc kỹ năng mới.',
    examples: [
      {
        zh: '我每天坚持学习汉语。',
        py: 'Wǒ měitiān jiānchí xuéxí hànyǔ.',
        vi: 'Tôi kiên trì học tiếng Trung mỗi ngày.',
        scenario: 'Chia sẻ mục tiêu cá nhân'
      },
      {
        zh: '向优秀同事学习，提升自我。',
        py: 'Xiàng yōuxiù tóngshì xuéxí, tíshēng zìwǒ.',
        vi: 'Học hỏi từ các đồng nghiệp xuất sắc để nâng cao bản thân.',
        scenario: 'Tinh thần làm việc công sở'
      }
    ],
    synonyms: ['研读', '请教'],
    collocations: ['学习汉语 (Học tiếng Trung)', '学习态度 (Thái độ học tập)', '终身学习 (Học tập suốt đời)']
  },
  {
    id: 'dict_8',
    hanzi: '面试',
    pinyin: 'miàn shì',
    pinyinNoTone: 'mian shi',
    hanviet: 'Diện Thí',
    meaning: 'Phỏng vấn xin việc',
    hskLevel: 4,
    radical: '面 (Diện)',
    strokeCount: 18,
    type: 'Động từ / Danh từ',
    tags: ['Công sở', 'Phỏng vấn', 'HSK4'],
    usageContext: 'Dùng trong ngữ cảnh tuyển dụng, xin việc hoặc đánh giá nhân sự.',
    examples: [
      {
        zh: '明天上午九点我有一个重要面试。',
        py: 'Míngtiān shàngwǔ jiǔ diǎn wǒ yǒu yí gè zhòngyào miànshì.',
        vi: 'Sáng mai 9 giờ tôi có một buổi phỏng vấn quan trọng.',
        scenario: 'Xin việc làm'
      },
      {
        zh: '面试官对我提出的专业问题很满意。',
        py: 'Miànshìguān duì wǒ tíchū de zhuānyè wèntí hěn mǎnyì.',
        vi: 'Người phỏng vấn rất hài lòng với các câu trả lời chuyên môn của tôi.',
        scenario: 'Chia sẻ trải nghiệm phỏng vấn'
      }
    ],
    synonyms: ['应聘 (Ứng tuyển)', '笔试 (Thi viết)'],
    collocations: ['参加面试 (Tham gia phỏng vấn)', '面试官 (Người phỏng vấn)', 'Passing miànshì (Đỗ phỏng vấn)']
  },
  {
    id: 'dict_9',
    hanzi: '项目',
    pinyin: 'xiàng mù',
    pinyinNoTone: 'xiang mu',
    hanviet: 'Hạng Mục',
    meaning: 'Dự án / Hạng mục công việc',
    hskLevel: 4,
    radical: '页 (Hiệt)',
    strokeCount: 14,
    type: 'Danh từ',
    tags: ['Công sở', 'Quản lý dự án', 'HSK4'],
    usageContext: 'Rất phổ biến trong công ty để chỉ nhiệm vụ, kế hoạch hoặc hợp đồng đang thực hiện.',
    examples: [
      {
        zh: '这个项目必须在月底前完成。',
        py: 'Zhè ge xiàngmù bìxū zài yuèdǐ qián wánchéng.',
        vi: 'Dự án này bắt buộc phải hoàn thành trước cuối tháng.',
        scenario: 'Quản lý tiến độ dự án'
      },
      {
        zh: '他是我们软件开发项目的负责人。',
        py: 'Tā shì wǒmen ruǎnjiān kāifā xiàngmù de fùzérén.',
        vi: 'Anh ấy là người phụ trách dự án phát triển phần mềm của chúng tôi.',
        scenario: 'Giới thiệu nhân sự dự án'
      }
    ],
    synonyms: ['工程 (Công trình)', '课题'],
    collocations: ['项目经理 (Quản lý dự án)', '项目进度 (Tiến độ dự án)', '负责项目 (Phụ trách dự án)']
  },
  {
    id: 'dict_10',
    hanzi: '合同',
    pinyin: 'hé tong',
    pinyinNoTone: 'he tong',
    hanviet: 'Hợp Đồng',
    meaning: 'Hợp đồng thương mại',
    hskLevel: 4,
    radical: '口 (Khẩu)',
    strokeCount: 12,
    type: 'Danh từ',
    tags: ['Công sở', 'Pháp lý / Thương lượng', 'HSK4'],
    usageContext: 'Dùng khi giao dịch mua bán, hợp tác kinh doanh, ký kết văn bản pháp lý.',
    examples: [
      {
        zh: '双方代表正式签署了商务合同。',
        py: 'Shuāngfāng dàibiǎo zhèngshì qiānshǔ le shāngwù hétong.',
        vi: 'Đại diện hai bên đã chính thức ký kết hợp đồng thương mại.',
        scenario: 'Lễ ký kết hợp đồng'
      },
      {
        zh: '在签合同之前，请仔细核对各项条款。',
        py: 'Zài qiān hétong zhīqián, qǐng zǐxì héduì gè xiàng tiáokuǎn.',
        vi: 'Trước khi ký hợp đồng, vui lòng đối soát kỹ từng điều khoản.',
        scenario: 'Cảnh báo pháp lý công sở'
      }
    ],
    synonyms: ['协议 (Hiệp nghị/Thỏa thuận)'],
    collocations: ['签合同 (Ký hợp đồng)', '合同条款 (Điều khoản hợp đồng)', '违反合同 (Vi phạm hợp đồng)']
  },
  {
    id: 'dict_11',
    hanzi: '咖啡',
    pinyin: 'kā fēi',
    pinyinNoTone: 'ka fei',
    hanviet: 'Cà Phê',
    meaning: 'Cà phê',
    hskLevel: 2,
    radical: '口 (Khẩu)',
    strokeCount: 16,
    type: 'Danh từ',
    tags: ['Giao tiếp hàng ngày', 'Ẩm thực', 'HSK2'],
    usageContext: 'Dùng khi gọi đồ uống, nghỉ giải lao giữa giờ hoặc hẹn hò bạn bè.',
    examples: [
      {
        zh: '下午茶时间，我们要不要喝杯咖啡？',
        py: 'Xiàwǔchá shíjiān, wǒmen yào bú yào hē bēi kāfēi?',
        vi: 'Giờ trà chiều, chúng ta uống một ly cà phê nhé?',
        scenario: 'Nghỉ giải lao văn phòng'
      }
    ],
    synonyms: [],
    collocations: ['美式咖啡 (Americano)', '拿铁 (Latte)', '冰咖啡 (Cà phê đá)']
  },
  {
    id: 'dict_12',
    hanzi: '出差',
    pinyin: 'chū chāi',
    pinyinNoTone: 'chu chai',
    hanviet: 'Xuất Sai',
    meaning: 'Đi công tác',
    hskLevel: 4,
    radical: '凵 (Khảm)',
    strokeCount: 15,
    type: 'Động từ',
    tags: ['Công sở', 'Hành chính', 'HSK4'],
    usageContext: 'Chỉ việc nhân viên di chuyển đến thành phố hoặc quốc gia khác để làm việc.',
    examples: [
      {
        zh: '张经理下周要去上海出差三天。',
        py: 'Zhāng jīnglǐ xià zhōu yào qù Shànghǎi chūchāi sān tiān.',
        vi: 'Giám đốc Trương tuần sau sẽ đi công tác Thượng Hải 3 ngày.',
        scenario: 'Lịch trình làm việc'
      }
    ],
    synonyms: ['公干'],
    collocations: ['出差补贴 (Phụ cấp công tác)', '出差计划 (Kế hoạch công tác)']
  }
];


  // --------------------------------------------------------------------------
  // MODULE: js\data\hskTopicsData.js
  // --------------------------------------------------------------------------
// Bộ chủ đề từ vựng mẫu có sẵn và cấu trúc quản lý topic tùy chỉnh (dctHanyu)

const initialTopicsData = [
  {
    id: 'topic_hsk1',
    name: 'HSK 1 - Từ Vựng Căn Bản',
    description: '150 từ vựng nền tảng HSK 1 cho người mới bắt đầu học tiếng Trung.',
    icon: '🌱',
    category: 'HSK',
    isPreset: true,
    words: [
      { hanzi: '你好', pinyin: 'nǐ hǎo', hanviet: 'Nễ Hảo', meaning: 'Xin chào', audio: '' },
      { hanzi: '谢谢', pinyin: 'xiè xie', hanviet: 'Tạ Tạ', meaning: 'Cảm ơn', audio: '' },
      { hanzi: '再见', pinyin: 'zài jiàn', hanviet: 'Tái Kiến', meaning: 'Tạm biệt', audio: '' },
      { hanzi: '中国', pinyin: 'zhōng guó', hanviet: 'Trung Quốc', meaning: 'Trung Quốc', audio: '' },
      { hanzi: '汉语', pinyin: 'hàn yǔ', hanviet: 'Hán Ngữ', meaning: 'Tiếng Trung', audio: '' },
      { hanzi: '朋友', pinyin: 'péng you', hanviet: 'Bằng Hữu', meaning: 'Bạn bè', audio: '' },
      { hanzi: '老师', pinyin: 'lǎo shī', hanviet: 'Lão Sư', meaning: 'Thầy / Cô giáo', audio: '' },
      { hanzi: '学生', pinyin: 'xué sheng', hanviet: 'Học Sinh', meaning: 'Học sinh / Sinh viên', audio: '' },
      { hanzi: '高兴', pinyin: 'gāo xìng', hanviet: 'Cao Hứng', meaning: 'Vui vẻ', audio: '' },
      { hanzi: '学习', pinyin: 'xué xí', hanviet: 'Học Tập', meaning: 'Học tập', audio: '' }
    ]
  },
  {
    id: 'topic_hsk2',
    name: 'HSK 2 - Giao Tiếp Thông Dụng',
    description: '300 từ vựng nâng cao nhẹ cho giao tiếp đời sống hàng ngày.',
    icon: '🌿',
    category: 'HSK',
    isPreset: true,
    words: [
      { hanzi: '准备', pinyin: 'zhǔn bèi', hanviet: 'Chuẩn Bị', meaning: 'Chuẩn bị', audio: '' },
      { hanzi: '已经', pinyin: 'yǐ jīng', hanviet: 'Dĩ Kinh', meaning: 'Đã / Đã rồi', audio: '' },
      { hanzi: '咖啡', pinyin: 'kā fēi', hanviet: 'Cà Phê', meaning: 'Cà phê', audio: '' },
      { hanzi: '运动', pinyin: 'yùn dòng', hanviet: 'Vận Động', meaning: 'Thể thao / Vận động', audio: '' },
      { hanzi: '时间', pinyin: 'shí jiān', hanviet: 'Thời Gian', meaning: 'Thời gian', audio: '' },
      { hanzi: '希望', pinyin: 'xī wàng', hanviet: 'Hy Vọng', meaning: 'Hy vọng', audio: '' },
      { hanzi: '意思', pinyin: 'yì si', hanviet: 'Ý Tư', meaning: 'Ý nghĩa / Ý định', audio: '' },
      { hanzi: '问题', pinyin: 'wèn tí', hanviet: 'Vấn Đề', meaning: 'Vấn đề / Câu hỏi', audio: '' }
    ]
  },
  {
    id: 'topic_hsk3',
    name: 'HSK 3 - Trung Cấp Đời Sống',
    description: 'Từ vựng trung cấp giúp bạn tự tin làm việc và đi du lịch.',
    icon: '🌳',
    category: 'HSK',
    isPreset: true,
    words: [
      { hanzi: '会议', pinyin: 'huì yì', hanviet: 'Hội Nghị', meaning: 'Cuộc họp', audio: '' },
      { hanzi: '选择', pinyin: 'xuǎn zé', hanviet: 'Tuyển Trạch', meaning: 'Lựa chọn', audio: '' },
      { hanzi: '方便', pinyin: 'fāng biàn', hanviet: 'Phương Tiện', meaning: 'Thuận tiện', audio: '' },
      { hanzi: '环境', pinyin: 'huán jìng', hanviet: 'Hoàn Cảnh', meaning: 'Môi trường', audio: '' },
      { hanzi: '机会', pinyin: 'jī huì', hanviet: 'Cơ Hội', meaning: 'Cơ hội', audio: '' },
      { hanzi: '根据', pinyin: 'gēn jù', hanviet: 'Căn Cứ', meaning: 'Căn cứ vào', audio: '' },
      { hanzi: '清楚', pinyin: 'qīng chu', hanviet: 'Thanh Sở', meaning: 'Rõ ràng', audio: '' }
    ]
  },
  {
    id: 'topic_travel',
    name: 'Du Lịch & Phương Tiện',
    description: 'Từ vựng và câu giao tiếp khi đi máy bay, khách sạn, di chuyển.',
    icon: '✈️',
    category: 'Giao tiếp',
    isPreset: true,
    words: [
      { hanzi: '护照', pinyin: 'hù zhào', hanviet: 'Hộ Chiếu', meaning: 'Hộ chiếu (Passport)', audio: '' },
      { hanzi: '机场', pinyin: 'jī chǎng', hanviet: 'Cơ Trường', meaning: 'Sân bay', audio: '' },
      { hanzi: '酒店', pinyin: 'jiǔ diàn', hanviet: 'Tửu Điếm', meaning: 'Khách sạn', audio: '' },
      { hanzi: '出租车', pinyin: 'chū zū chē', hanviet: 'Xuất Tô Xa', meaning: 'Xe Taxi', audio: '' },
      { hanzi: '多少钱', pinyin: 'duō shao qián', hanviet: 'Đa Thiểu Tiền', meaning: 'Bao nhiêu tiền', audio: '' },
      { hanzi: '行李', pinyin: 'xíng li', hanviet: 'Hành Lý', meaning: 'Hành lý', audio: '' },
      { hanzi: '订房', pinyin: 'dìng fáng', hanviet: 'Đặt Phòng', meaning: 'Đặt phòng', audio: '' }
    ]
  },
  {
    id: 'topic_dining',
    name: 'Ẩm Thực & Nhà Hàng',
    description: 'Từ vựng gọi món, thanh toán, tên các món ăn Trung Hoa nổi tiếng.',
    icon: '🥟',
    category: 'Giao tiếp',
    isPreset: true,
    words: [
      { hanzi: '服务员', pinyin: 'fú wù yuán', hanviet: 'Phục Vụ Viên', meaning: 'Phục vụ viên', audio: '' },
      { hanzi: '买单', pinyin: 'mǎi dān', hanviet: 'Mãi Đơn', meaning: 'Thanh toán tiền', audio: '' },
      { hanzi: '菜单', pinyin: 'cài dān', hanviet: 'Thái Đơn', meaning: 'Thực đơn (Menu)', audio: '' },
      { hanzi: '饺子', pinyin: 'jiǎo zi', hanviet: 'Giảo Tử', meaning: 'Bánh há cảo / Bánh xếp', audio: '' },
      { hanzi: '米饭', pinyin: 'mǐ fàn', hanviet: 'Mễ Phạn', meaning: 'Cơm trắng', audio: '' },
      { hanzi: '好吃的', pinyin: 'hǎo chī de', hanviet: 'Hảo Chinh', meaning: 'Món ăn ngon', audio: '' },
      { hanzi: '辣的', pinyin: 'là de', hanviet: 'Lạt', meaning: 'Vị cay', audio: '' }
    ]
  }
];


  // --------------------------------------------------------------------------
  // MODULE: js\data\musicData.js
  // --------------------------------------------------------------------------
// Danh sách bài hát tiếng Trung mẫu có sẵn (Hanzo Music Module)

const initialMusicData = [
  {
    id: 'song_houlai',
    title: '后来',
    pinyin: 'Hòu lái',
    titleVi: 'Sau này',
    artist: '刘若英 (Lưu Nhược Anh)',
    category: 'Pop, Ballad',
    duration: '5:19',
    youtubeUrl: 'https://www.youtube.com/watch?v=l3R5T0jP83o',
    coverIcon: '🎵',
    lyrics: [
      { hanzi: '后来 我总算学会了如何去爱', pinyin: 'Hòu lái wǒ zǒng suàn xué huì le rú hé qù ài', meaning: 'Sau này, cuối cùng em cũng đã học được cách để yêu' },
      { hanzi: '可惜 你早已远去 消失在人海', pinyin: 'Kě xī nǐ zǎo yǐ yuǎn qù xiāo shī zài rén hǎi', meaning: 'Chi tiếc rằng anh đã sớm rời xa, biến mất giữa biển người' },
      { hanzi: '后来 终于在眼泪中明白', pinyin: 'Hòu lái zhōng yú zài yǎn lèi zhōng míng bái', meaning: 'Sau này, cuối cùng em cũng hiểu ra trong nước mắt' },
      { hanzi: '有些人 一旦错过就不在', pinyin: 'Yǒu xiē rén yī dàn cuò guò jiù bù zài', meaning: 'Có những người, một khi đã bỏ lỡ thì không còn lại nữa' },
      { hanzi: '后来 我总算学会了如何去爱', pinyin: 'Hòu lái wǒ zǒng suàn xué huì le rú hé qù ài', meaning: 'Sau này, cuối cùng em cũng đã học được cách để yêu' },
      { hanzi: '可惜 你早已远去 消失在人海', pinyin: 'Kě xī nǐ zǎo yǐ yuǎn qù xiāo shī zài rén hǎi', meaning: 'Chi tiếc rằng anh đã sớm rời xa, biến mất giữa biển người' }
    ]
  },
  {
    id: 'song_qingtian',
    title: '晴天',
    pinyin: 'Qíng tiān',
    titleVi: 'Ngày nắng đẹp',
    artist: '周杰伦 (Châu Kiệt Luân)',
    category: 'Pop',
    duration: '4:29',
    youtubeUrl: 'https://www.youtube.com/watch?v=DYptgVvkVLQ',
    coverIcon: '☀️',
    lyrics: [
      { hanzi: '故事的小黄花 从出生那年就飘着', pinyin: 'Gù shì de xiǎo huáng huā cóng chū shēng nà nián jiù piāo zhe', meaning: 'Bông hoa vàng nhỏ trong câu chuyện đã bay từ năm sinh ra' },
      { hanzi: '童年的荡秋千 随记忆一直晃到现在', pinyin: 'Tóng nián de dàng qiū qiān suí jì yì yī zhí huàng dào xiàn zài', meaning: 'Xích đu thời thơ ấu đung đưa cùng ký ức cho đến tận bây giờ' },
      { hanzi: '为你刮风下雨 为你弹奏吉他', pinyin: 'Wèi nǐ guā fēng xià yǔ wèi nǐ tán zòu jí tā', meaning: 'Gió mưa vì em, gảy đàn guitar vì em' }
    ]
  },
  {
    id: 'song_gaobaiqiqiu',
    title: '告白气球',
    pinyin: 'Gào bái qì qiú',
    titleVi: 'Khinh khí cầu tỏ tình',
    artist: '周杰伦 (Châu Kiệt Luân)',
    category: 'Pop',
    duration: '3:35',
    youtubeUrl: 'https://www.youtube.com/watch?v=BUcp83zJIiU',
    coverIcon: '🎈',
    lyrics: [
      { hanzi: '塞纳河畔 左岸的咖啡', pinyin: 'Sāi nà hé pàn zuǒ àn de kā fēi', meaning: 'Cà phê bên bờ trái sông Seine' },
      { hanzi: '我手捧着一杯 品尝你的美', pinyin: 'Wǒ shǒu pěng zhe yī bēi pǐn cháng nǐ de měi', meaning: 'Anh cầm trên tay một ly, thưởng thức vẻ đẹp của em' },
      { hanzi: '亲爱的 爱上你 从那天起', pinyin: 'Qīn ài de ài shàng nǐ cóng nà tiān qǐ', meaning: 'Người yêu ơi, yêu em từ ngày đó' }
    ]
  },
  {
    id: 'song_suiyueshentou',
    title: '岁月神偷',
    pinyin: 'Suì yuè shēn tōu',
    titleVi: 'Kẻ trộm thời gian',
    artist: '金玟岐 (Kim Mân Kỳ)',
    category: 'Pop, Ballad',
    duration: '4:12',
    youtubeUrl: 'https://www.youtube.com/watch?v=yW6UeF5g-W8',
    coverIcon: '⌛',
    lyrics: [
      { hanzi: '能够握紧的就别放开', pinyin: 'Néng gòu wò jǐn de jiù bié fàng kāi', meaning: 'Những gì có thể nắm chặt thì đừng buông tay' },
      { hanzi: '能够拥抱的就大胆爱', pinyin: 'Néng gòu yōng bào de jiù dà dǎn ài', meaning: 'Những gì có thể ôm lấy thì hãy dũng cảm yêu' },
      { hanzi: '时间是让人猝不及防的贼', pinyin: 'Shí jiān shì ràng rén cù bù jí fáng de zéi', meaning: 'Thời gian là tên trộm khiến người ta không kịp đề phòng' }
    ]
  },
  {
    id: 'song_xiaoxinging',
    title: '小幸运',
    pinyin: 'Xiǎo xìng yùn',
    titleVi: 'May mắn nhỏ bé',
    artist: '田馥甄 (Điền Phức Trân)',
    category: 'Pop',
    duration: '4:26',
    youtubeUrl: 'https://www.youtube.com/watch?v=_sQSXwdtlYY',
    coverIcon: '🍀',
    lyrics: [
      { hanzi: '我听见雨滴落在青青草地', pinyin: 'Wǒ tīng jiàn yǔ dī luò zài qīng qīng cǎo dì', meaning: 'Tôi nghe thấy hạt mưa rơi trên bãi cỏ xanh' },
      { hanzi: '我听见远方下课钟声响起', pinyin: 'Wǒ tīng jiàn yuǎn fāng xià kè zhōng shēng xiǎng qǐ', meaning: 'Tôi nghe thấy tiếng chuông tan học vội vã vang lên ở phương xa' },
      { hanzi: '原来你是我最想留住的幸运', pinyin: 'Yuán lái nǐ shì wǒ zuì xiǎng liú zhù de xìng yùn', meaning: 'Hóa ra anh lại là may mắn mà em muốn giữ lại nhất' }
    ]
  },
  {
    id: 'song_tonghua',
    title: '童话',
    pinyin: 'Tóng huà',
    titleVi: 'Đồng thoại',
    artist: '光良 (Quang Lương)',
    category: 'Trữ tình',
    duration: '4:05',
    youtubeUrl: 'https://www.youtube.com/watch?v=eR8gLpM-wls',
    coverIcon: '🎹',
    lyrics: [
      { hanzi: '忘了有多久 再没听到你', pinyin: 'Wàng le yǒu duō jiǔ, zài méi tīng dào nǐ', meaning: 'Đã quên bao lâu rồi, không còn nghe thấy em' },
      { hanzi: '对我说你最爱的故事', pinyin: 'Duì wǒ shuō nǐ zuì ài de gù shì', meaning: 'Nói với anh về câu chuyện em yêu thích nhất' },
      { hanzi: '我想了很久 我开始慌了', pinyin: 'Wǒ xiǎng le hěn jiǔ, wǒ kāi shǐ huāng le', meaning: 'Anh đã nghĩ rất lâu, anh bắt đầu hoảng sợ' },
      { hanzi: '是不是我又做错了什么', pinyin: 'Shì bú shì wǒ yòu zuò cuò le shén me', meaning: 'Phải chăng anh lại làm sai điều gì' }
    ]
  }
];


  // --------------------------------------------------------------------------
  // MODULE: js\utils\pinyinUtils.js
  // --------------------------------------------------------------------------
// Utility Chuyển Đổi & Chuẩn Hóa Pinyin Tiếng Trung (js/utils/pinyinUtils.js)

// Bảng tra từ vựng Hán tự -> Pinyin mở rộng
const HANZI_PINYIN_DICT = {
  '你好': 'nǐ hǎo',
  '谢谢': 'xiè xie',
  '再见': 'zài jiàn',
  '中国': 'zhōng guó',
  '汉语': 'hàn yǔ',
  '朋友': 'péng you',
  '老师': 'lǎo shī',
  '学生': 'xué sheng',
  '高兴': 'gāo xìng',
  '学习': 'xué xí',
  '家': 'jiā',
  '爸爸': 'bà ba',
  '妈妈': 'mā ma',
  '医生': 'yī shēng',
  '医院': 'yī yuàn',
  '学校': 'xué xiào',
  '商店': 'shāng diàn',
  '北京': 'běi jīng',
  '猫': 'māo',
  '狗': 'gǒu',
  '水': 'shuǐ',
  '茶': 'chá',
  '米饭': 'mǐ fàn',
  '苹果': 'píng guǒ',
  '衣服': 'yī fu',
  '漂亮': 'piào liang',
  '钱': 'qián',
  '买': 'mǎi',
  '卖': 'mài',
  '打电话': 'dǎ diàn huà',
  '看书': 'kàn shū',
  '听': 'tīng',
  '写': 'xiě',
  '说话': 'shuō huà',
  '睡觉': 'shuì jiào',
  '喜欢': 'xǐ huan',
  '准备': 'zhǔn bèi',
  '已经': 'yǐ jīng',
  '咖啡': 'kā fēi',
  '运动': 'yùn dòng',
  '时间': 'shí jiān',
  '希望': 'xī wàng',
  '意思': 'yì si',
  '问题': 'wèn tí',
  '会议': 'huì yì',
  '选择': 'xuǎn zé',
  '方便': 'fāng biàn',
  '环境': 'huán jìng',
  '机会': 'jī huì',
  '根据': 'gēn jù',
  '清楚': 'qīng chu',
  '工作': 'gōng zuò',
  '邮件': 'yóu jiàn',
  '合作': 'hé zuò',
  '护照': 'hù zhào',
  '机场': 'jī chǎng',
  '酒店': 'jiǔ diàn',
  '出租车': 'chū zū chē',
  '多少钱': 'duō shao qián',
  '行李': 'xíng li',
  '订房': 'dìng fáng',
  '服务员': 'fú wù yuán',
  '买单': 'mǎi dān',
  '菜单': 'cài dān',
  '饺子': 'jiǎo zi',
  '好吃的': 'hǎo chī de',
  '辣的': 'là de',
  '同事': 'tóng shì',
  '领导': 'lǐng dǎo',
  '打卡': 'dǎ kǎ',
  '加班': 'jiā bān',
  '请假': 'qǐng jià',
  '主持人': 'zhǔ chí rén',
  '议程': 'yì chéng',
  '面试': 'miàn shì',
  '项目': 'xiàng mù',
  '合同': 'hé tong',
  '出差': 'chū chāi',
  '你': 'nǐ',
  '好': 'hǎo',
  '谢': 'xiè',
  '再': 'zài',
  '见': 'jiàn',
  '中': 'zhōng',
  '国': 'guó',
  '汉': 'hàn',
  '语': 'yǔ',
  '朋': 'péng',
  '友': 'you',
  '老': 'lǎo',
  '师': 'shī',
  '学': 'xué',
  '生': 'shēng',
  '高': 'gāo',
  '兴': 'xìng',
  '习': 'xí',
  '爸': 'bà',
  '妈': 'mā',
  '医': 'yī',
  '院': 'yuàn',
  '校': 'xiào',
  '商': 'shāng',
  '店': 'diàn',
  '北': 'běi',
  '京': 'jīng',
  '做': 'zuò',
  '吃': 'chī',
  '喝': 'hē',
  '去': 'qù',
  '来': 'lái',
  '想': 'xiǎng',
  '要': 'yào',
  '能': 'néng',
  '会': 'huì',
  '多': 'duō',
  '少': 'shǎo',
  '大': 'dà',
  '小': 'xiǎo',
  '是': 'shì',
  '不': 'bù',
  '有': 'yǒu',
  '没': 'méi',
  '人': 'rén',
  '我': 'wǒ',
  '他': 'tā',
  '她': 'tā',
  '们': 'men'
};

// Bảng tra từ vựng / Hán tự -> Từ Hán Việt
const HANZI_HANVIET_DICT = {
  '你好': 'Nễ Hảo',
  '谢谢': 'Tạ Tạ',
  '再见': 'Tái Kiến',
  '中国': 'Trung Quốc',
  '汉语': 'Hán Ngữ',
  '朋友': 'Bằng Hữu',
  '老师': 'Lão Sư',
  '学生': 'Học Sinh',
  '高兴': 'Cao Hứng',
  '学习': 'Học Tập',
  '家': 'Gia',
  '爸爸': 'Bả Bả',
  '妈妈': 'Mã Mã',
  '医生': 'Y Sinh',
  '医院': 'Y Viện',
  '学校': 'Học Hiệu',
  '商店': 'Thương Điếm',
  '北京': 'Bắc Kinh',
  '猫': 'Miêu',
  '狗': 'Cẩu',
  '水': 'Thủy',
  '茶': 'Trà',
  '米饭': 'Mễ Phạn',
  '苹果': 'Tần Quả',
  '衣服': 'Y Phục',
  '漂亮': 'Phiêu Lượng',
  '钱': 'Tiền',
  '买': 'Mãi',
  '卖': 'Mại',
  '打电话': 'Đả Điện Thoại',
  '看书': 'Khán Thư',
  '听': 'Thính',
  '写': 'Tả',
  '说话': 'Thuyết Thoại',
  '睡觉': 'Thụy Giác',
  '喜欢': 'Hỷ Hoan',
  '准备': 'Chuẩn Bị',
  '已经': 'Dĩ Kinh',
  '咖啡': 'Cà Phê',
  '运动': 'Vận Động',
  '时间': 'Thời Gian',
  '希望': 'Hy Vọng',
  '意思': 'Ý Tư',
  '问题': 'Vấn Đề',
  '会议': 'Hội Nghị',
  '选择': 'Tuyển Trạch',
  '方便': 'Phương Tiện',
  '环境': 'Hoàn Cảnh',
  '机会': 'Cơ Hội',
  '根据': 'Căn Cứ',
  '清楚': 'Thanh Sở',
  '工作': 'Công Tác',
  '邮件': 'Bưu Kiện',
  '合作': 'Hợp Tác',
  '护照': 'Hộ Chiếu',
  '机场': 'Cơ Trường',
  '酒店': 'Tửu Điếm',
  '出租车': 'Xuất Tô Xa',
  '多少钱': 'Đa Thiểu Tiền',
  '行李': 'Hành Lý',
  '订房': 'Đặt Phòng',
  '服务员': 'Phục Vụ Viên',
  '买单': 'Mãi Đơn',
  '菜单': 'Thái Đơn',
  '饺子': 'Giảo Tử',
  '好吃的': 'Hảo Chinh',
  '辣的': 'Lạt',
  '同事': 'Đồng Sự',
  '领导': 'Lãnh Đạo',
  '打卡': 'Đả Tạp',
  '加班': 'Gia Ban',
  '请假': 'Thỉnh Giả',
  '主持人': 'Chủ Trì Nhân',
  '议程': 'Nghị Trình',
  '面试': 'Diện Thí',
  '项目': 'Hạng Mục',
  '合同': 'Hợp Đồng',
  '出差': 'Xuất Sai',
  '你': 'Nễ',
  '好': 'Hảo',
  '谢': 'Tạ',
  '再': 'Tái',
  '见': 'Kiến',
  '中': 'Trung',
  '国': 'Quốc',
  '汉': 'Hán',
  '语': 'Ngữ',
  '朋': 'Bằng',
  '友': 'Hữu',
  '老': 'Lão',
  '师': 'Sư',
  '学': 'Học',
  '生': 'Sinh',
  '高': 'Cao',
  '兴': 'Hứng',
  '习': 'Tập',
  '爸': 'Bả',
  '妈': 'Mã',
  '医': 'Y',
  '院': 'Viện',
  '校': 'Hiệu',
  '商': 'Thương',
  '店': 'Điếm',
  '北': 'Bắc',
  '京': 'Kinh',
  '做': 'Tố',
  '吃': 'Khiết',
  '喝': 'Hát',
  '去': 'Khứ',
  '来': 'Lai',
  '想': 'Tưởng',
  '要': 'Yếu',
  '能': 'Năng',
  '会': 'Hội',
  '多': 'Đa',
  '少': 'Thiểu',
  '大': 'Đại',
  '小': 'Tiểu',
  '是': 'Thị',
  '不': 'Bất',
  '有': 'Hữu',
  '没': 'Một',
  '人': 'Nhân',
  '我': 'Ngã',
  '他': 'Tha',
  '她': 'Tha',
  '们': 'Môn'
};

/**
 * Chuyển Pinyin có số (vd: ni3 hao3, xue2 xi2, xie4xie, lv4) thành Pinyin có dấu thanh chuẩn Unicode.
 */
function convertToneNumbersToDiacritics(str) {
  if (!str || typeof str !== 'string') return '';

  const toneMap = {
    a: ['ā', 'á', 'ǎ', 'à'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    v: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    A: ['Ā', 'Á', 'Ǎ', 'À'],
    E: ['Ē', 'É', 'Ě', 'È'],
    I: ['Ī', 'Í', 'Ǐ', 'Ì'],
    O: ['Ō', 'Ó', 'Ǒ', 'Ò'],
    U: ['Ū', 'Ú', 'Ǔ', 'Ù'],
    Ü: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ'],
    V: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ']
  };

  let text = str.replace(/u:/gi, 'ü').replace(/v/gi, 'ü');

  return text.replace(/([a-zA-ZüÜ]+)([1-5])/g, (match, syllable, toneNumStr) => {
    const tone = parseInt(toneNumStr, 10);
    if (tone === 5) return syllable;

    let lower = syllable.toLowerCase();
    let targetIdx = -1;

    if (lower.indexOf('a') !== -1) targetIdx = lower.indexOf('a');
    else if (lower.indexOf('e') !== -1) targetIdx = lower.indexOf('e');
    else if (lower.indexOf('ou') !== -1) targetIdx = lower.indexOf('ou');
    else {
      for (let i = syllable.length - 1; i >= 0; i--) {
        if ('aeiouüAEIOUÜ'.indexOf(syllable[i]) !== -1) {
          targetIdx = i;
          break;
        }
      }
    }

    if (targetIdx !== -1) {
      const origChar = syllable[targetIdx];
      const replacements = toneMap[origChar];
      if (replacements && replacements[tone - 1]) {
        const replacement = replacements[tone - 1];
        return syllable.substring(0, targetIdx) + replacement + syllable.substring(targetIdx + 1);
      }
    }
    return syllable;
  });
}

/**
 * Chuẩn hóa chuỗi Pinyin:
 * - Chuyển tone dạng số (ni3 hao3 -> nǐ hǎo)
 * - Xử lý dấu thanh bị tách (ni ˇ ha ˇ o -> nǐ hǎo)
 * - Xóa khoảng trắng thừa, chuẩn hóa Unicode NFC
 */
function normalizePinyin(pinyinStr) {
  if (!pinyinStr || typeof pinyinStr !== 'string') return '';
  let str = pinyinStr.trim();

  try { str = str.normalize('NFC'); } catch (e) {}

  str = str
    .replace(/a\s*[\u02C7\u030Cˇ^]/g, 'ǎ').replace(/A\s*[\u02C7\u030Cˇ^]/g, 'Ǎ')
    .replace(/e\s*[\u02C7\u030Cˇ^]/g, 'ě').replace(/E\s*[\u02C7\u030Cˇ^]/g, 'Ě')
    .replace(/i\s*[\u02C7\u030Cˇ^]/g, 'ǐ').replace(/I\s*[\u02C7\u030Cˇ^]/g, 'Ǐ')
    .replace(/o\s*[\u02C7\u030Cˇ^]/g, 'ǒ').replace(/O\s*[\u02C7\u030Cˇ^]/g, 'Ǒ')
    .replace(/u\s*[\u02C7\u030Cˇ^]/g, 'ǔ').replace(/U\s*[\u02C7\u030Cˇ^]/g, 'Ǔ')
    .replace(/ü\s*[\u02C7\u030Cˇ^]/g, 'ǚ').replace(/Ü\s*[\u02C7\u030Cˇ^]/g, 'Ǚ')
    .replace(/v\s*[\u02C7\u030Cˇ^]/g, 'ǚ').replace(/V\s*[\u02C7\u030Cˇ^]/g, 'Ǚ')
    .replace(/a\s*[\u0304\u00AF]/g, 'ā').replace(/A\s*[\u0304\u00AF]/g, 'Ā')
    .replace(/e\s*[\u0304\u00AF]/g, 'ē').replace(/E\s*[\u0304\u00AF]/g, 'Ē')
    .replace(/i\s*[\u0304\u00AF]/g, 'ī').replace(/I\s*[\u0304\u00AF]/g, 'Ī')
    .replace(/o\s*[\u0304\u00AF]/g, 'ō').replace(/O\s*[\u0304\u00AF]/g, 'Ō')
    .replace(/u\s*[\u0304\u00AF]/g, 'ū').replace(/U\s*[\u0304\u00AF]/g, 'Ū')
    .replace(/a\s*['\u0301]/g, 'á').replace(/A\s*['\u0301]/g, 'Á')
    .replace(/e\s*['\u0301]/g, 'é').replace(/E\s*['\u0301]/g, 'É')
    .replace(/i\s*['\u0301]/g, 'í').replace(/I\s*['\u0301]/g, 'Í')
    .replace(/o\s*['\u0301]/g, 'ó').replace(/O\s*['\u0301]/g, 'Ó')
    .replace(/u\s*['\u0301]/g, 'ú').replace(/U\s*['\u0301]/g, 'Ú')
    .replace(/a\s*[`\u0300]/g, 'à').replace(/A\s*[`\u0300]/g, 'À')
    .replace(/e\s*[`\u0300]/g, 'è').replace(/E\s*[`\u0300]/g, 'È')
    .replace(/i\s*[`\u0300]/g, 'ì').replace(/I\s*[`\u0300]/g, 'Ì')
    .replace(/o\s*[`\u0300]/g, 'ò').replace(/O\s*[`\u0300]/g, 'Ò')
    .replace(/u\s*[`\u0300]/g, 'ù').replace(/U\s*[`\u0300]/g, 'Ù');

  str = convertToneNumbersToDiacritics(str);
  try { str = str.normalize('NFC'); } catch (e) {}
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Tra cứu Pinyin từ chữ Hán (Hanzi) tự động.
 */
function lookupPinyinForHanzi(hanzi) {
  if (!hanzi || typeof hanzi !== 'string') return '';
  const cleanHanzi = hanzi.trim();
  if (!cleanHanzi) return '';

  if (HANZI_PINYIN_DICT[cleanHanzi]) {
    return HANZI_PINYIN_DICT[cleanHanzi];
  }

  const chars = Array.from(cleanHanzi);
  const pinyinParts = [];
  let allFound = true;

  for (const c of chars) {
    if (HANZI_PINYIN_DICT[c]) {
      pinyinParts.push(HANZI_PINYIN_DICT[c]);
    } else if (/[\u4e00-\u9fa5]/.test(c)) {
      allFound = false;
    } else {
      pinyinParts.push(c);
    }
  }

  if (pinyinParts.length > 0 && (allFound || pinyinParts.length === chars.length)) {
    return pinyinParts.join(' ');
  }

  return '';
}

/**
 * Tra cứu âm Hán Việt từ chữ Hán (Hanzi) tự động.
 */
function lookupHanVietForHanzi(hanzi) {
  if (!hanzi || typeof hanzi !== 'string') return '';
  const cleanHanzi = hanzi.trim();
  if (!cleanHanzi) return '';

  if (HANZI_HANVIET_DICT[cleanHanzi]) {
    return HANZI_HANVIET_DICT[cleanHanzi];
  }

  const chars = Array.from(cleanHanzi);
  const parts = [];
  let allFound = true;

  for (const c of chars) {
    if (HANZI_HANVIET_DICT[c]) {
      parts.push(HANZI_HANVIET_DICT[c]);
    } else if (/[\u4e00-\u9fa5]/.test(c)) {
      allFound = false;
    } else {
      parts.push(c);
    }
  }

  if (parts.length > 0 && (allFound || parts.length === chars.length)) {
    return parts.join(' ');
  }

  return '';
}



  // --------------------------------------------------------------------------
  // MODULE: js\utils\speech.js
  // --------------------------------------------------------------------------
// Web Speech API (Phát âm TTS & Nhận dạng Giọng nói Tiếng Trung zh-CN)

// 1. Phân mục phát âm Text-to-Speech (TTS)
function speakChinese(text, rate = 0.85, onEndCallback = null) {
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn chưa hỗ trợ Web Speech Synthesis phát âm.');
    return;
  }

  // Hủy lời nói cũ nếu đang phát
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate; // Tốc độ phát âm (0.85 cho người học dễ nghe)
  utterance.pitch = 1.0;

  // Lấy danh sách giọng đọc tiếng Trung tốt nhất
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN') || v.name.includes('Chinese'));
  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
}

// 2. Phân mục Nhận dạng Giọng nói (Speech Recognition - Speaking Skill)
class ChineseSpeechRecognizer {
  constructor(onResultCallback, onErrorCallback, onStatusChange) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = null;
    this.onResult = onResultCallback;
    this.onError = onErrorCallback;
    this.onStatus = onStatusChange;
    this.isListening = false;

    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStatus) this.onStatus('listening');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStatus) this.onStatus('stopped');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        if (this.onResult) {
          this.onResult({ transcript, confidence });
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (this.onError) {
          this.onError(event.error);
        }
      };
    }
  }

  start() {
    if (!this.isSupported) {
      if (this.onError) this.onError('Trình duyệt chưa hỗ trợ Nhận diện Giọng nói.');
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already started:', e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}

// 3. Hàm so sánh độ tương đồng giọng đọc với từ tiêu chuẩn (Chấm điểm phát âm)
function evaluatePronunciation(spokenText, targetHanzi, targetPinyin) {
  if (!spokenText) return { score: 0, feedback: 'Chưa nghe thấy giọng đọc. Hãy thử lại!' };

  const cleanSpoken = spokenText.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim();
  const cleanTarget = targetHanzi.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '').trim();

  if (cleanSpoken === cleanTarget) {
    return {
      score: 100,
      feedback: '🎉 Xuất sắc! Phát âm cực kỳ chuẩn xác!',
      isPass: true
    };
  }

  if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
    return {
      score: 85,
      feedback: `👍 Rất tốt! Bạn đọc: "${spokenText}". Gần như chính xác!`,
      isPass: true
    };
  }

  return {
    score: 50,
    feedback: `💡 Bạn đọc là "${spokenText}". Hãy nghe lại mẫu và thử phát âm rõ ràng hơn nhé!`,
    isPass: false
  };
}

const MIC_DEVICE_ID_STORAGE_KEY = 'hanzo_selected_mic_device_id';
let globalMicStream = null;

// Lấy Device ID của Microphone đã được cài đặt chọn
function getSelectedMicrophoneDeviceId() {
  try {
    return localStorage.getItem(MIC_DEVICE_ID_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

// Lưu cài đặt Device ID của Microphone được chọn
function setSelectedMicrophoneDeviceId(deviceId) {
  try {
    if (deviceId) {
      localStorage.setItem(MIC_DEVICE_ID_STORAGE_KEY, deviceId);
    } else {
      localStorage.removeItem(MIC_DEVICE_ID_STORAGE_KEY);
    }
  } catch (e) {}
}

// Liệt kê danh sách thiết bị Microphone đang kết nối
async function getAvailableMicrophones() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    return audioInputs.map((d, index) => ({
      deviceId: d.deviceId,
      label: d.label || `Microphone ${index + 1} (${d.deviceId ? d.deviceId.slice(0, 8) + '...' : 'Thiết bị mặc định'})`
    }));
  } catch (err) {
    console.warn('Lỗi khi truy vấn danh sách Microphone:', err);
    return [];
  }
}

// 4. Hàm yêu cầu cấp quyền Micro chủ động & Duy trì Stream để trình duyệt cấp quyền mặc định liên tục
// Giúp người dùng khi truy cập trang Luyện Nói KHÔNG CẦN CẤP QUYỀN LẠI MỖI LẦN PHÁT ÂM
async function requestMicrophonePermission(forceDeviceId = null) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { success: false, reason: 'Trình duyệt không hỗ trợ MediaDevices' };
  }

  const targetDeviceId = forceDeviceId !== null ? forceDeviceId : getSelectedMicrophoneDeviceId();

  // Nếu stream đang active và khớp với thiết bị yêu cầu, tái sử dụng trực tiếp
  if (globalMicStream && globalMicStream.active) {
    const activeTrack = globalMicStream.getAudioTracks()[0];
    if (activeTrack && activeTrack.readyState === 'live') {
      const settings = activeTrack.getSettings ? activeTrack.getSettings() : {};
      if (!targetDeviceId || settings.deviceId === targetDeviceId) {
        return { success: true, stream: globalMicStream };
      }
    }
    // Dừng track cũ để mở stream thiết bị mới
    globalMicStream.getTracks().forEach(track => track.stop());
    globalMicStream = null;
  }

  const audioConstraints = targetDeviceId
    ? { deviceId: { exact: targetDeviceId } }
    : true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
    globalMicStream = stream;
    window._globalActiveMicStream = stream;

    // Lưu thiết bị mặc định nếu chưa lưu
    const track = stream.getAudioTracks()[0];
    if (track && track.getSettings) {
      const settings = track.getSettings();
      if (settings.deviceId && !getSelectedMicrophoneDeviceId()) {
        setSelectedMicrophoneDeviceId(settings.deviceId);
      }
    }

    return { success: true, stream };
  } catch (err) {
    console.warn('Không thể mở micro với constraint thiết bị cụ thể, thử lại với micro mặc định:', err);
    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      globalMicStream = fallbackStream;
      window._globalActiveMicStream = fallbackStream;
      return { success: true, stream: fallbackStream };
    } catch (fallbackErr) {
      console.error('Yêu cầu quyền truy cập micro bị từ chối:', fallbackErr);
      return { success: false, error: fallbackErr };
    }
  }
}

// 5. Hàm kiểm tra âm lượng Micro trực tiếp (Visualizer Test)
function testMicrophoneVolume(onVolumeCallback, durationMs = 5000) {
  return requestMicrophonePermission().then(res => {
    if (!res.success || !res.stream) return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(res.stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let isTesting = true;

      const checkVolume = () => {
        if (!isTesting) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((average / 128) * 100));
        if (onVolumeCallback) onVolumeCallback(volumePercent);
        requestAnimationFrame(checkVolume);
      };

      checkVolume();

      const stopTest = () => {
        isTesting = false;
        try { audioCtx.close(); } catch (e) {}
      };

      if (durationMs > 0) {
        setTimeout(stopTest, durationMs);
      }

      return stopTest;
    } catch (err) {
      console.warn('Lỗi khi kiểm tra âm lượng micro:', err);
      return null;
    }
  });
}






  // --------------------------------------------------------------------------
  // MODULE: js\utils\srs.js
  // --------------------------------------------------------------------------
// Thuật toán Spaced Repetition System (SuperMemo SM-2) & Lưu trữ LocalStorage (Hanzo)


function getKey(baseKey) {
  return getScopedStorageKey(baseKey);
}

/**
 * Thuật toán SM-2 tính toán khoảng thời gian ôn tập tiếp theo
 * @param {number} quality - Điểm chất lượng trả lời (0: Quên hoàn toàn, 3: Nhớ hơi khó, 4: Nhớ tốt, 5: Rất dễ)
 * @param {number} repetitions - Số lần đã ôn đúng liên tiếp
 * @param {number} previousInterval - Khoảng thời gian ôn trước đó (ngày)
 * @param {number} previousEaseFactor - Hệ số dễ nhớ trước đó (Mặc định 2.5)
 */
function calculateSM2(quality, repetitions = 0, previousInterval = 1, previousEaseFactor = 2.5) {
  let nextRepetitions = repetitions;
  let nextInterval = previousInterval;
  let nextEaseFactor = previousEaseFactor;

  // Tính Ease Factor mới
  nextEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  if (quality >= 3) {
    // Trả lời đúng
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(previousInterval * nextEaseFactor);
    }
    nextRepetitions += 1;
  } else {
    // Trả lời sai/Quên -> reset chuỗi
    nextRepetitions = 0;
    nextInterval = 1;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + nextInterval);

  return {
    repetitions: nextRepetitions,
    interval: nextInterval,
    easeFactor: parseFloat(nextEaseFactor.toFixed(2)),
    dueDate: nextDueDate.toISOString()
  };
}


function getCustomDictionaryEdits() {
  try {
    const key = getKey('hanzo_custom_dict_edits');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveCustomDictionaryEdits(edits) {
  try {
    const key = getKey('hanzo_custom_dict_edits');
    localStorage.setItem(key, JSON.stringify(edits));
  } catch (e) {
    console.error('Lỗi khi lưu chỉnh sửa từ điển:', e);
  }
}

function getCustomDictionaryWords() {
  try {
    const key = getKey('hanzo_custom_dict_words');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveCustomDictionaryWords(customWords) {
  try {
    const key = getKey('hanzo_custom_dict_words');
    localStorage.setItem(key, JSON.stringify(customWords));
  } catch (e) {
    console.error('Lỗi khi lưu từ mới vào từ điển:', e);
  }
}

function syncTopicWordsToDictionary(targetTopics = null) {
  try {
    const allTopics = targetTopics || getAllTopicsList();
    const edits = getCustomDictionaryEdits();
    const customWordsMap = getCustomDictionaryWords();

    let addedCount = 0;
    let updatedCount = 0;
    let totalSynced = 0;

    const baseHanziMap = new Map();
    dictionaryData.forEach(w => baseHanziMap.set(w.hanzi, w));

    allTopics.forEach(topic => {
      if (!topic || !Array.isArray(topic.words)) return;

      let defaultHsk = 1;
      const topicIdLower = (topic.id || '').toLowerCase();
      const topicNameLower = (topic.name || '').toLowerCase();

      if (topicIdLower.includes('hsk2') || topicNameLower.includes('hsk 2') || topicNameLower.includes('hsk2')) defaultHsk = 2;
      else if (topicIdLower.includes('hsk3') || topicNameLower.includes('hsk 3') || topicNameLower.includes('hsk3')) defaultHsk = 3;
      else if (topicIdLower.includes('hsk4') || topicNameLower.includes('hsk 4') || topicNameLower.includes('hsk4')) defaultHsk = 4;
      else if (topicIdLower.includes('hsk5') || topicNameLower.includes('hsk 5') || topicNameLower.includes('hsk5')) defaultHsk = 5;
      else if (topicIdLower.includes('hsk6') || topicNameLower.includes('hsk 6') || topicNameLower.includes('hsk6')) defaultHsk = 6;

      topic.words.forEach(w => {
        if (!w || !w.hanzi || !w.hanzi.trim()) return;
        const hanzi = w.hanzi.trim();
        totalSynced++;

        let pinyin = normalizePinyin(w.pinyin || '');
        if ((!pinyin || pinyin === hanzi) && hanzi) {
          pinyin = lookupPinyinForHanzi(hanzi);
        }
        let hanviet = w.hanviet || lookupHanVietForHanzi(hanzi) || '';
        const meaning = w.meaning || hanzi;
        const pinyinNoTone = (pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        const hskLevel = w.hskLevel || defaultHsk;

        if (baseHanziMap.has(hanzi)) {
          const baseWord = baseHanziMap.get(hanzi);
          const currentEdits = edits[baseWord.id] || {};
          const newEdits = { ...currentEdits };
          let changed = false;

          if (pinyin && pinyin !== baseWord.pinyin && !currentEdits.pinyin) { newEdits.pinyin = pinyin; changed = true; }
          if (hanviet && hanviet !== baseWord.hanviet && !currentEdits.hanviet) { newEdits.hanviet = hanviet; changed = true; }
          if (meaning && meaning !== baseWord.meaning && !currentEdits.meaning) { newEdits.meaning = meaning; changed = true; }

          if (changed) {
            edits[baseWord.id] = newEdits;
            updatedCount++;
          }
        } else {
          const dictId = `dict_custom_${encodeURIComponent(hanzi)}`;
          if (!customWordsMap[dictId]) {
            customWordsMap[dictId] = {
              id: dictId,
              hanzi: hanzi,
              pinyin: pinyin || hanzi,
              pinyinNoTone: pinyinNoTone,
              hanviet: hanviet,
              meaning: meaning,
              hskLevel: hskLevel,
              radical: 'Bộ thủ từ Chủ đề',
              strokeCount: hanzi.length * 5,
              type: topic.category || 'Từ vựng Chủ đề',
              tags: [topic.name, topic.category || 'Chủ đề', `HSK${hskLevel}`],
              usageContext: `Từ vựng được tự động cập nhật từ bộ chủ đề "${topic.name}".`,
              sourceTopicId: topic.id,
              sourceTopicName: topic.name,
              isSyncedFromTopic: true
            };
            addedCount++;
          } else {
            const existing = customWordsMap[dictId];
            let changed = false;
            if (pinyin && pinyin !== existing.pinyin) { existing.pinyin = pinyin; changed = true; }
            if (hanviet && hanviet !== existing.hanviet) { existing.hanviet = hanviet; changed = true; }
            if (meaning && meaning !== existing.meaning) { existing.meaning = meaning; changed = true; }
            if (changed) {
              existing.pinyinNoTone = pinyinNoTone;
              customWordsMap[dictId] = existing;
              updatedCount++;
            }
          }
        }
      });
    });

    saveCustomDictionaryEdits(edits);
    saveCustomDictionaryWords(customWordsMap);

    return { addedCount, updatedCount, totalSynced };
  } catch (e) {
    console.error('Lỗi khi tự động cập nhật từ vựng vào từ điển HSK:', e);
    return { addedCount: 0, updatedCount: 0, totalSynced: 0 };
  }
}

function getEffectiveDictionaryData() {
  const edits = getCustomDictionaryEdits();
  const customWordsMap = getCustomDictionaryWords();

  const baseList = dictionaryData.map(word => {
    if (edits[word.id]) {
      return { ...word, ...edits[word.id] };
    }
    return word;
  });

  const existingHanziSet = new Set(baseList.map(w => w.hanzi));
  const customList = [];

  Object.values(customWordsMap).forEach(cWord => {
    if (cWord && cWord.hanzi) {
      let wordObj = cWord;
      if (edits[cWord.id]) {
        wordObj = { ...cWord, ...edits[cWord.id] };
      }
      if (!existingHanziSet.has(wordObj.hanzi)) {
        existingHanziSet.add(wordObj.hanzi);
        customList.push(wordObj);
      }
    }
  });

  const allTopics = getAllTopicsList();
  allTopics.forEach(topic => {
    if (!topic.words || !Array.isArray(topic.words)) return;
    let topicHsk = 1;
    if (topic.id.includes('hsk2') || topic.name.includes('HSK 2')) topicHsk = 2;
    else if (topic.id.includes('hsk3') || topic.name.includes('HSK 3')) topicHsk = 3;
    else if (topic.id.includes('hsk4') || topic.name.includes('HSK 4')) topicHsk = 4;
    else if (topic.id.includes('hsk5') || topic.name.includes('HSK 5')) topicHsk = 5;

    topic.words.forEach(w => {
      if (w && w.hanzi && !existingHanziSet.has(w.hanzi)) {
        existingHanziSet.add(w.hanzi);
        const pinyin = w.pinyin || lookupPinyinForHanzi(w.hanzi) || w.hanzi;
        const hanviet = w.hanviet || lookupHanVietForHanzi(w.hanzi) || '';
        const meaning = w.meaning || w.hanzi;
        const dictId = `dict_custom_${encodeURIComponent(w.hanzi)}`;

        customList.push({
          id: dictId,
          hanzi: w.hanzi,
          pinyin: pinyin,
          pinyinNoTone: (pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
          hanviet: hanviet,
          meaning: meaning,
          hskLevel: w.hskLevel || topicHsk,
          radical: 'Bộ thủ từ Chủ đề',
          strokeCount: w.hanzi.length * 5,
          type: topic.category || 'Từ vựng Chủ đề',
          tags: [topic.name, topic.category || 'Chủ đề', `HSK${w.hskLevel || topicHsk}`],
          usageContext: `Từ vựng được tự động cập nhật từ bộ chủ đề "${topic.name}".`,
          sourceTopicId: topic.id,
          sourceTopicName: topic.name,
          isSyncedFromTopic: true
        });
      }
    });
  });

  return [...baseList, ...customList];
}


// Lưu trữ & Quản lý LocalStorage (Scoped cho từng tài khoản)
function getSavedCustomTopics() {
  try {
    const key = getKey('hanzo_custom_topics');
    const data = localStorage.getItem(key);
    let topics = [];
    if (data) {
      topics = JSON.parse(data);
    } else {
      const activeUser = getActiveUser();
      if (activeUser.id === 'usr_minhanh') {
        const fallback = localStorage.getItem('hanzo_custom_topics') || localStorage.getItem('dcthanyu_custom_topics');
        if (fallback) topics = JSON.parse(fallback);
      }
    }
    topics.forEach(t => {
      if (t && Array.isArray(t.words)) {
        t.words.forEach(w => {
          if (w) {
            let clean = normalizePinyin(w.pinyin || '');
            if ((!clean || clean === w.hanzi) && w.hanzi) {
              clean = lookupPinyinForHanzi(w.hanzi);
            }
            if (clean) w.pinyin = clean;
            if (!w.hanviet && w.hanzi) {
              w.hanviet = lookupHanVietForHanzi(w.hanzi);
            }
          }
        });
      }
    });
    return topics;
  } catch (e) {
    console.error('Lỗi khi đọc Custom Topics từ LocalStorage:', e);
    return [];
  }
}

function getDeletedPresetIds() {
  try {
    const data = localStorage.getItem(getKey('hanzo_deleted_preset_ids'));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function markPresetDeleted(presetId) {
  const deleted = new Set(getDeletedPresetIds());
  deleted.add(presetId);
  localStorage.setItem(getKey('hanzo_deleted_preset_ids'), JSON.stringify(Array.from(deleted)));
  deleteCustomTopic(presetId);
}

function resetPresetTopic(presetId) {
  const deleted = new Set(getDeletedPresetIds());
  deleted.delete(presetId);
  localStorage.setItem(getKey('hanzo_deleted_preset_ids'), JSON.stringify(Array.from(deleted)));
  deleteCustomTopic(presetId);
}

function getAllTopicsList() {
  const savedTopics = getSavedCustomTopics();
  const savedMap = new Map(savedTopics.map(t => [t.id, t]));
  const deletedPresetIds = new Set(getDeletedPresetIds());

  const result = [];

  initialTopicsData.forEach(preset => {
    if (deletedPresetIds.has(preset.id)) {
      return;
    }
    if (savedMap.has(preset.id)) {
      const edited = savedMap.get(preset.id);
      result.push({ ...preset, ...edited, isEdited: true });
      savedMap.delete(preset.id);
    } else {
      result.push({ ...preset });
    }
  });

  savedMap.forEach(customTopic => {
    result.push(customTopic);
  });

  return result;
}

function saveCustomTopic(topic) {
  const topics = getSavedCustomTopics();
  const existingIdx = topics.findIndex(t => t.id === topic.id);
  if (existingIdx >= 0) {
    topics[existingIdx] = topic;
  } else {
    topics.push(topic);
  }
  localStorage.setItem(getKey('hanzo_custom_topics'), JSON.stringify(topics));
  return topics;
}

function deleteCustomTopic(topicId) {
  const topics = getSavedCustomTopics().filter(t => t.id !== topicId);
  localStorage.setItem(getKey('hanzo_custom_topics'), JSON.stringify(topics));
  return topics;
}

function getSRSProgress() {
  try {
    const key = getKey('hanzo_srs_progress');
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    const activeUser = getActiveUser();
    if (activeUser.id === 'usr_minhanh') {
      const fallback = localStorage.getItem('hanzo_srs_progress') || localStorage.getItem('dcthanyu_srs_progress');
      return fallback ? JSON.parse(fallback) : {};
    }
    return {};
  } catch (e) {
    return {};
  }
}

function getRealTimeWeekDays() {
  const now = new Date();
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

function getDefaultScheduleItems(allTopics = []) {
  if (!allTopics || allTopics.length === 0) {
    allTopics = getAllTopicsList();
  }

  const colors = ['#22C55E', '#F97316', '#3B82F6', '#EC4899', '#22C55E'];
  const statuses = ['in_progress', 'not_started', 'completed', 'not_started', 'completed'];
  const realWeekDays = getRealTimeWeekDays();

  return allTopics.slice(0, 5).map((t, idx) => {
    const dayInfo = realWeekDays[idx % realWeekDays.length];
    const status = statuses[idx % 5];
    const firstWord = (t.words && t.words.length > 0) ? t.words[0] : { hanzi: '学习', pinyin: 'xuéxí' };

    return {
      id: `sch_${t.id}`,
      accentColor: colors[idx % 5],
      day: dayInfo.day,
      date: dayInfo.date,
      time: dayInfo.defaultTime,
      topicId: t.id,
      topicName: t.name,
      hanzi: firstWord.hanzi,
      pinyin: firstWord.pinyin,
      vocabCount: (t.words || []).length,
      skills: ['quiz', 'speak', 'read', 'write'],
      targetReps: status === 'completed' ? 3 : (status === 'in_progress' ? 3 : 5),
      currentReps: status === 'completed' ? 3 : (status === 'in_progress' ? 2 : 0),
      status: status
    };
  });
}

function getStoredScheduleItems(allTopics = []) {
  try {
    const activeUser = typeof getActiveUser === 'function' ? getActiveUser() : { id: 'usr_minhanh' };
    const schKey = getKey('hanzo_custom_schedule_list');
    const data = localStorage.getItem(schKey);
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
      if (dateToCheck && dateToCheck.includes('/')) {
        const parts = dateToCheck.split('/').map(s => s.trim());
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
          item.day = dayNames[d.getDay()];
        }
      }
    });

    return stored;
  } catch (e) {
    return [];
  }
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

function recordTopicPracticeProgress(target) {
  try {
    if (!target) return;
    const targetIdStr = typeof target === 'object' ? String(target.id || target.name || '') : String(target);
    const targetNameStr = typeof target === 'object' ? String(target.name || target.id || '') : String(target);

    const targetIdLower = targetIdStr.trim().toLowerCase();
    const targetNameLower = targetNameStr.trim().toLowerCase();

    const schKey = getKey('hanzo_custom_schedule_list');
    const raw = localStorage.getItem(schKey);
    let scheduleItems = [];
    if (raw) {
      try { scheduleItems = JSON.parse(raw); } catch (e) { scheduleItems = []; }
    }
    
    if (!scheduleItems || scheduleItems.length === 0) {
      scheduleItems = getStoredScheduleItems();
    }

    if (!scheduleItems || scheduleItems.length === 0) return;

    let updated = false;

    const now = new Date();
    const dStr = now.getDate().toString().padStart(2, '0');
    const mStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const yStr = now.getFullYear();
    const todayFormatted = `${dStr}/${mStr}/${yStr}`;

    scheduleItems.forEach(item => {
      const itemTopicId = String(item.topicId || '').trim().toLowerCase();
      const itemTopicName = String(item.topicName || '').trim().toLowerCase();

      const isMatch = (
        itemTopicId === targetIdLower ||
        itemTopicName === targetNameLower ||
        (targetIdLower && itemTopicId && itemTopicId.includes(targetIdLower)) ||
        (targetNameLower && itemTopicName && itemTopicName.includes(targetNameLower)) ||
        (targetIdLower && itemTopicName && itemTopicName.includes(targetIdLower)) ||
        (targetNameLower && itemTopicId && itemTopicId.includes(targetNameLower))
      );

      if (isMatch) {
        const wasOverdue = isScheduleOverdue(item) || item.status === 'overdue' || item.wasOverdue;

        item.currentReps = (item.currentReps || 0) + 1;
        if (item.currentReps >= item.targetReps) {
          item.currentReps = item.targetReps;
          item.status = 'completed';
          item.completedDate = todayFormatted;
          if (wasOverdue) {
            item.wasOverdue = true;
          }
        } else {
          if (wasOverdue) {
            item.status = 'overdue';
            item.wasOverdue = true;
          } else {
            item.status = 'in_progress';
          }
        }
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(schKey, JSON.stringify(scheduleItems));
    }

    recordPracticeSession(targetNameStr, 'speak', '1/1 lần');
  } catch (e) {
    console.error('Error updating topic practice progress:', e);
  }
}

function updateWordSRS(wordKey, quality) {
  const progressMap = getSRSProgress();
  const current = progressMap[wordKey] || {
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    history: []
  };

  const updated = calculateSM2(quality, current.repetitions, current.interval, current.easeFactor);
  updated.lastReviewed = new Date().toISOString();
  updated.history = [...(current.history || []), { date: updated.lastReviewed, quality }];

  progressMap[wordKey] = updated;
  localStorage.setItem(getKey('hanzo_srs_progress'), JSON.stringify(progressMap));

  // Cập nhật thống kê Streak & Nhật ký học tập hàng ngày
  updateUserStreak();
  recordDailyActivity(wordKey);

  // Sync with schedule list progress
  try {
    const allTopics = getAllTopicsList();
    const matchedTopic = allTopics.find(t => t.words && t.words.some(w => w.hanzi === wordKey || `${t.id}_${w.hanzi}` === wordKey));
    if (matchedTopic) {
      recordTopicPracticeProgress(matchedTopic.id);
    }
  } catch (e) {}

  return updated;
}

function getScheduleGoals() {
  try {
    const activeUser = getActiveUser();
    const data = localStorage.getItem(getKey('hanzo_schedule_goals'));
    const defaultGoals = {
      dailyTargetWords: activeUser.dailyTargetWords || 10,
      weeklyTargetDays: 5,
      targetSkills: ['listening', 'speaking', 'reading', 'writing'],
      reminderTime: '20:00',
      enabledReminder: true
    };
    return data ? { ...defaultGoals, ...JSON.parse(data) } : defaultGoals;
  } catch (e) {
    const activeUser = getActiveUser();
    return {
      dailyTargetWords: activeUser.dailyTargetWords || 10,
      weeklyTargetDays: 5,
      targetSkills: ['listening', 'speaking', 'reading', 'writing'],
      reminderTime: '20:00',
      enabledReminder: true
    };
  }
}

function saveScheduleGoals(goals) {
  localStorage.setItem(getKey('hanzo_schedule_goals'), JSON.stringify(goals));
}

function getDailyLogs() {
  try {
    const data = localStorage.getItem(getKey('hanzo_daily_study_logs'));
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function recordDailyActivity(wordKey, skill = null) {
  const goals = getScheduleGoals();
  const logs = getDailyLogs();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayLog = logs[todayStr] || {
    wordsReviewedSet: [],
    wordsCount: 0,
    skillsPracticed: [],
    isTargetMet: false
  };

  if (!todayLog.wordsReviewedSet) todayLog.wordsReviewedSet = [];
  if (!todayLog.wordsReviewedSet.includes(wordKey)) {
    todayLog.wordsReviewedSet.push(wordKey);
    todayLog.wordsCount = todayLog.wordsReviewedSet.length;
  }

  if (!todayLog.skillsPracticed) todayLog.skillsPracticed = [];
  if (skill && !todayLog.skillsPracticed.includes(skill)) {
    todayLog.skillsPracticed.push(skill);
  }

  todayLog.isTargetMet = todayLog.wordsCount >= goals.dailyTargetWords;
  todayLog.lastUpdated = new Date().toISOString();

  logs[todayStr] = todayLog;
  localStorage.setItem(getKey('hanzo_daily_study_logs'), JSON.stringify(logs));
}

function calculateStreakFromHistory(datesArray) {
  if (!Array.isArray(datesArray) || datesArray.length === 0) return 1;
  const set = new Set(datesArray);
  const now = new Date();
  let count = 0;
  
  let checkDate = new Date(now);
  let dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  
  if (!set.has(dateStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  }

  while (set.has(dateStr)) {
    count++;
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  }

  return Math.max(1, count);
}

function recordAccountLoginStreak() {
  try {
    const key = getKey('hanzo_user_stats');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let stats = null;
    const raw = localStorage.getItem(key);
    if (raw) {
      try { stats = JSON.parse(raw); } catch (e) {}
    }

    if (!stats) {
      stats = { streak: 1, lastLoginDate: todayStr, loginDatesHistory: [todayStr] };
    }

    if (!Array.isArray(stats.loginDatesHistory)) {
      stats.loginDatesHistory = [];
    }

    if (!stats.loginDatesHistory.includes(todayStr)) {
      stats.loginDatesHistory.push(todayStr);
    }

    stats.lastLoginDate = todayStr;
    stats.streak = calculateStreakFromHistory(stats.loginDatesHistory);

    const srsMap = getSRSProgress();
    stats.totalWordsMastered = Object.values(srsMap).filter(item => item && item.repetitions >= 3).length;

    localStorage.setItem(key, JSON.stringify(stats));
    return stats;
  } catch (e) {
    return { streak: 1, lastLoginDate: '', loginDatesHistory: [] };
  }
}

function getUserStats() {
  return recordAccountLoginStreak();
}

function updateUserStreak() {
  return recordAccountLoginStreak();
}

function getCompletedTopicsCount() {
  try {
    const allTopics = getAllTopicsList();
    const srsProgress = getSRSProgress();
    const scheduleItems = getStoredScheduleItems(allTopics);

    const completedTopicIds = new Set();

    if (Array.isArray(scheduleItems)) {
      scheduleItems.forEach(item => {
        if (item && item.status === 'completed') {
          if (item.topicId) completedTopicIds.add(String(item.topicId));
          if (item.topicName) {
            const matched = allTopics.find(t => t.name === item.topicName || t.id === item.topicId);
            if (matched) completedTopicIds.add(String(matched.id));
          }
        }
      });
    }

    if (Array.isArray(allTopics)) {
      allTopics.forEach(t => {
        if (t && t.words && t.words.length > 0) {
          const allDone = t.words.every(w => {
            const keyWithTopic = `${t.id}_${w.hanzi}`;
            const keyHanzi = w.hanzi;
            const recTopic = srsProgress[keyWithTopic];
            const recHanzi = srsProgress[keyHanzi];
            return (recTopic && recTopic.repetitions > 0) || (recHanzi && recHanzi.repetitions > 0);
          });
          if (allDone) {
            completedTopicIds.add(String(t.id));
          }
        }
      });
    }

    return completedTopicIds.size;
  } catch (e) {
    return 0;
  }
}

function getRealTimeStats() {
  const srsProgress = getSRSProgress();
  const userStats = getUserStats();
  const goals = getScheduleGoals();
  const logs = getDailyLogs();

  const learnedWordsCount = Object.keys(srsProgress).length;
  const completedTopicsCount = getCompletedTopicsCount();
  const streak = (userStats && typeof userStats.streak === 'number' && userStats.streak > 0) ? userStats.streak : 1;

  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  let weeklyMinutes = 0;
  let activeDaysThisWeek = 0;

  for (let i = 0; i < dayOfWeek; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs[dateStr];
    if (log && log.wordsCount > 0) {
      activeDaysThisWeek++;
      weeklyMinutes += log.wordsCount * 2;
    }
  }

  if (weeklyMinutes === 0 && learnedWordsCount > 0) {
    weeklyMinutes = learnedWordsCount * 2;
  }
  if (activeDaysThisWeek === 0 && learnedWordsCount > 0) {
    activeDaysThisWeek = 1;
  }

  const hours = Math.floor(weeklyMinutes / 60);
  const mins = weeklyMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}g ${mins}p` : `${mins}p`;
  const timeFormattedLong = hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`;

  const targetDays = goals.weeklyTargetDays || 5;
  const progressPercent = Math.min(100, Math.round((activeDaysThisWeek / targetDays) * 100));

  return {
    learnedWords: learnedWordsCount,
    completedTopics: completedTopicsCount,
    streak: streak,
    weeklyMinutes: weeklyMinutes,
    timeFormatted: timeFormatted,
    timeFormattedLong: timeFormattedLong,
    progressPercent: progressPercent,
    activeDaysThisWeek: activeDaysThisWeek,
    targetDays: targetDays
  };
}

function recordPracticeSession(topicName, skillType = 'speak', repsStr = '1/1 lần') {
  try {
    if (!topicName) return [];
    const key = getKey('hanzo_recent_practice_history');
    const raw = localStorage.getItem(key);
    let list = [];
    if (raw) {
      try { list = JSON.parse(raw); } catch (e) {}
    }
    const now = new Date();
    const timeStr = `Hôm nay ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    let title = String(topicName).trim();
    if (!title.startsWith('Luyện tập')) {
      title = `Luyện tập - ${title}`;
    }

    const icon = skillType === 'listen' ? '🎧' : skillType === 'read' ? '📖' : '🎙️';

    const newSession = {
      id: `session_${Date.now()}`,
      title: title,
      time: timeStr,
      status: '✓ Hoàn thành',
      reps: repsStr,
      icon: icon,
      timestamp: Date.now()
    };

    list = [newSession, ...list.filter(item => item.title !== title)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Error recording practice session:', e);
    return [];
  }
}

function getRecentPracticeHistory() {
  try {
    const key = getKey('hanzo_recent_practice_history');
    const raw = localStorage.getItem(key);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
    
    const scheduleItems = getStoredScheduleItems();
    const completedSchedule = (scheduleItems || []).filter(s => s && (s.status === 'completed' || s.isCompleted || (s.currentReps && s.currentReps > 0)));
    if (completedSchedule.length > 0) {
      return completedSchedule.slice(-5).reverse().map(item => ({
        title: item.title && item.title.startsWith('Luyện tập') ? item.title : `Luyện tập - ${item.topicName || item.title || 'Bộ từ vựng'}`,
        time: item.completedDate ? `Hôm nay ${item.completedDate.split('T')[1]?.slice(0, 5) || '20:00'}` : 'Gần đây',
        status: '✓ Hoàn thành',
        reps: `${item.currentReps || item.repetitionCount || 1}/${item.targetReps || item.targetRepetitions || item.repetitionCount || 1} lần`,
        icon: item.type === 'audio' ? '🎧' : item.type === 'doc' ? '📖' : '🎙️'
      }));
    }

    return [
      { title: 'Luyện tập - HSK1.2', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 3 - Trung Cấp Đời Sống', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 2 - Giao Tiếp Thông Dụng', time: 'Hôm nay 20:00', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' }
    ];
  } catch (e) {
    return [
      { title: 'Luyện tập - HSK1.2', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 3 - Trung Cấp Đời Sống', time: 'Gần đây', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' },
      { title: 'Luyện tập - HSK 2 - Giao Tiếp Thông Dụng', time: 'Hôm nay 20:00', status: '✓ Hoàn thành', reps: '1/1 lần', icon: '🎙️' }
    ];
  }
}


  // --------------------------------------------------------------------------
  // MODULE: js\utils\hanziCanvas.js
  // --------------------------------------------------------------------------
// Hanzi Writer & Canvas Tracing Pad (Luyện viết nét Hán tự - Module Viết)

class HanziPracticePad {
  constructor(canvasContainerId, writerContainerId) {
    this.canvasContainerId = canvasContainerId;
    this.writerContainerId = writerContainerId;
    this.canvasContainer = typeof canvasContainerId === 'string' ? document.getElementById(canvasContainerId) : canvasContainerId;
    this.writerContainer = typeof writerContainerId === 'string' ? document.getElementById(writerContainerId) : writerContainerId;
    this.writerInstance = null;
    this.writerInstances = [];
    this.isDrawing = false;
    this.canvas = null;
    this.ctx = null;
    this.drawnStrokes = 0;
  }

  // Khởi tạo Hanzi Writer xem thứ tự nét vẽ (Stroke Order Animation) cho 1 hoặc nhiều chữ Hán
  renderWriter(characterString, width = 180, height = 180, retryCount = 0) {
    if (!this.writerContainer && this.writerContainerId) {
      this.writerContainer = document.getElementById(this.writerContainerId);
    }
    if (!this.writerContainer) return;

    // Nếu script CDN HanziWriter chưa tải xong, đợi và thử lại tối đa 3 lần
    if (!window.HanziWriter && retryCount < 3) {
      setTimeout(() => {
        this.renderWriter(characterString, width, height, retryCount + 1);
      }, 400);
      return;
    }

    this.writerContainer.innerHTML = '';
    this.writerInstances = [];

    if (!characterString) return;

    // Tách chuỗi thành các chữ Hán đơn lẻ (loại bỏ khoảng trắng thừa)
    const chars = Array.from(String(characterString).trim()).filter(c => c.trim().length > 0);
    if (chars.length === 0) return;

    // Tạo flex container chứa các ô chữ Hán
    const flexWrapper = document.createElement('div');
    flexWrapper.className = 'hanzi-writer-multi-wrapper flex flex-wrap items-center justify-center gap-4 py-2 w-full';
    this.writerContainer.appendChild(flexWrapper);

    chars.forEach((char) => {
      // Ô chứa cho từng ký tự
      const charCard = document.createElement('div');
      charCard.className = 'char-writer-card bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative transition-transform hover:scale-102';

      const targetBox = document.createElement('div');
      targetBox.className = 'writer-char-target flex items-center justify-center';
      targetBox.style.width = `${width}px`;
      targetBox.style.height = `${height}px`;

      const charLabel = document.createElement('div');
      charLabel.className = 'char-label text-xs font-bold text-slate-500 mt-2 tracking-widest';
      charLabel.textContent = char;

      charCard.appendChild(targetBox);
      charCard.appendChild(charLabel);
      flexWrapper.appendChild(charCard);

      if (window.HanziWriter) {
        try {
          const writer = window.HanziWriter.create(targetBox, char, {
            width: width,
            height: height,
            padding: 12,
            strokeColor: '#C41E24', // Màu đỏ Hán ngữ chuẩn sắc nét
            radicalColor: '#C41E24', // Nét vẽ chữ Hán hiển thị toàn bộ màu đỏ
            outlineColor: '#CBD5E1', // Viền nét xám nhạt Mễ tự cách
            showOutline: true,
            showCharacter: true, // HIỂN THỊ CHỮ NGAY KHI TẢI (TRÁNH BỊ TRẮNG KHUNG)
            strokeAnimationSpeed: 1.2,
            delayBetweenStrokes: 200,
            onLoadCharDataSuccess: () => {
              // Tự động phát hoạt ảnh nét vẽ ngay khi dữ liệu JSON nét chữ tải xong
              try { writer.animateCharacter(); } catch (err) {}
            },
            onLoadCharDataError: (err) => {
              console.warn(`Không tải được nét vẽ cho chữ "${char}":`, err);
              this.renderFallbackBox(targetBox, char, width, height);
            }
          });
          this.writerInstances.push({ writer, char, targetBox });
        } catch (e) {
          console.warn('HanziWriter create exception:', e);
          this.renderFallbackBox(targetBox, char, width, height);
        }
      } else {
        // Fallback nếu không có thư viện HanziWriter CDN
        this.renderFallbackBox(targetBox, char, width, height);
      }
    });
  }

  animateStrokes() {
    if (!this.writerInstances || this.writerInstances.length === 0) return;

    // Chạy hoạt ảnh vẽ nét tuần tự cho từng chữ Hán
    let chain = Promise.resolve();
    this.writerInstances.forEach(item => {
      if (item.writer && typeof item.writer.animateCharacter === 'function') {
        chain = chain.then(() => {
          return new Promise(resolve => {
            item.writer.animateCharacter({
              onComplete: resolve
            });
          });
        });
      }
    });
  }

  showHint() {
    if (this.writerInstances && this.writerInstances.length > 0) {
      this.writerInstances.forEach(item => {
        if (item.writer && typeof item.writer.quiz === 'function') {
          item.writer.quiz();
        }
      });
    }
  }

  // Tạo Canvas tập vẽ bằng nét cọ màu đỏ/vàng trên lưới chữ Mễ (米字格)
  initCanvas(width = 260, height = 260) {
    if (!this.canvasContainer) return;
    this.canvasContainer.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'hanzi-canvas-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;

    // Canvas hiển thị khung chữ Mễ (米字格)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    bgCanvas.style.position = 'absolute';
    bgCanvas.style.top = '0';
    bgCanvas.style.left = '0';
    bgCanvas.style.pointerEvents = 'none';
    this.drawMiZiGeGrid(bgCanvas.getContext('2d'), width, height);

    // Canvas chính cho người dùng vẽ
    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = width;
    drawCanvas.height = height;
    drawCanvas.style.position = 'absolute';
    drawCanvas.style.top = '0';
    drawCanvas.style.left = '0';
    drawCanvas.style.cursor = 'crosshair';
    drawCanvas.style.borderRadius = '12px';

    wrapper.appendChild(bgCanvas);
    wrapper.appendChild(drawCanvas);
    this.canvasContainer.appendChild(wrapper);

    this.canvas = drawCanvas;
    this.ctx = drawCanvas.getContext('2d');
    this.setupEvents();
  }

  drawMiZiGeGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.25)'; // Màu khung đỏ Mễ tự cách
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Đường chéo chính & phụ
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Khung viền ngoài
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(230, 57, 70, 0.5)';
    ctx.strokeRect(0, 0, w, h);
  }

  setupEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.strokeStyle = '#F59E0B'; // Nét cọ màu hổ phách / vàng kim
      this.ctx.lineWidth = 8;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const stopDraw = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.drawnStrokes += 1;
      }
    };

    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mouseup', stopDraw);
    this.canvas.addEventListener('mouseleave', stopDraw);

    this.canvas.addEventListener('touchstart', startDraw);
    this.canvas.addEventListener('touchmove', draw);
    this.canvas.addEventListener('touchend', stopDraw);
  }

  clearCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawnStrokes = 0;
    }
  }

  // Khung vẽ MiZiGe (米字格) fallback hiển thị chữ khi không tải được nét động
  renderFallbackBox(containerEl, char, width, height) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    containerEl.style.position = 'relative';

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    bgCanvas.style.position = 'absolute';
    bgCanvas.style.top = '0';
    bgCanvas.style.left = '0';
    this.drawMiZiGeGrid(bgCanvas.getContext('2d'), width, height);

    const textEl = document.createElement('div');
    textEl.style.position = 'absolute';
    textEl.style.top = '0';
    textEl.style.left = '0';
    textEl.style.width = `${width}px`;
    textEl.style.height = `${height}px`;
    textEl.style.display = 'flex';
    textEl.style.alignItems = 'center';
    textEl.style.justifyContent = 'center';
    textEl.style.fontSize = `${width * 0.55}px`;
    textEl.style.fontFamily = '"Noto Sans SC", "KaiTi", "SimSun", sans-serif';
    textEl.style.fontWeight = 'bold';
    textEl.style.color = '#C41E24';
    textEl.textContent = char;

    containerEl.appendChild(bgCanvas);
    containerEl.appendChild(textEl);
  }

  renderFallbackCharacter(char, width, height) {
    if (!this.writerContainer) return;
    this.renderFallbackBox(this.writerContainer, char, width, height);
  }
}



  // --------------------------------------------------------------------------
  // MODULE: js\views\authModal.js
  // --------------------------------------------------------------------------
// authModal.js - Handling Auth Modals (Login, Register with Email OTP, Forgot Password with OTP)

const SPECIAL_CHARS_TOOLBAR_HTML = `
  <div class="special-char-toolbar flex items-center gap-1 flex-wrap pt-1.5 text-2xs text-slate-500">
    <span class="font-bold text-slate-400 text-3xs">⚡ Chèn ký tự đặc biệt nhanh:</span>
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
      <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="+">+</button>
      <button type="button" class="btn-insert-spec-char px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-mono font-bold text-xs border border-slate-200 transition cursor-pointer" data-char="=">=</button>
    </div>
  </div>
`;

function setupSpecialCharsAndVisibility(container) {
  // 1. Password toggle visibility
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

  // 2. Special character quick insertion
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

function renderAuthModal(container = document.body, onAuthSuccess = null) {
  let modalEl = document.getElementById('hanzo-auth-modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'hanzo-auth-modal';
    modalEl.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto';
    if (!container) container = document.body;
    container.appendChild(modalEl);
  }

  const showLoginView = () => {
    modalEl.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-auto animate-fade-in relative">
        <!-- Header -->
        <div class="px-6 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔐</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Đăng Nhập Hệ Thống</h3>
            </div>
          </div>
          <button id="btn-close-auth-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">&times;</button>
        </div>

        <!-- Body -->
        <form id="form-login-user" class="p-6 space-y-4">
          <div id="login-error-msg" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"></div>

          <div>
            <label class="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">ID Tài khoản hoặc Email *</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
              <input type="text" id="login-id-input" class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500 transition" placeholder="v.d. admin hoặc user@example.com" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="username" required />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-extrabold uppercase text-slate-500">Mật khẩu *</label>
              <button type="button" id="btn-trigger-forgot-pwd" class="text-2xs font-extrabold text-red-600 hover:underline cursor-pointer">Quên mật khẩu?</button>
            </div>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔑</span>
              <input type="password" id="login-pwd-input" class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-red-500 transition" placeholder="••••••••" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="current-password" required />
              <button type="button" class="btn-toggle-pwd-visibility absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1" title="Hiện/Ẩn Mật Khẩu">👁️</button>
            </div>
          </div>

          ${SPECIAL_CHARS_TOOLBAR_HTML}

          <button type="submit" class="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-md shadow-red-500/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 mt-2">
            <span>🚀</span> <span>Đăng Nhập Vẫn Tiếp Tục</span>
          </button>

          <div class="text-center pt-3 border-t border-slate-100">
            <span class="text-xs text-slate-500 font-semibold">Chưa có tài khoản?</span>
            <button type="button" id="btn-trigger-register-view" class="text-xs font-black text-red-600 hover:underline ml-1 cursor-pointer">Đăng Ký Tài Khoản Mới</button>
          </div>
        </form>
      </div>
    `;

    const modalClose = modalEl.querySelector('#btn-close-auth-modal');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    setupSpecialCharsAndVisibility(modalEl);

    const formLogin = modalEl.querySelector('#form-login-user');
    const errorMsg = modalEl.querySelector('#login-error-msg');

    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const idInput = modalEl.querySelector('#login-id-input').value;
      const pwdInput = modalEl.querySelector('#login-pwd-input').value;

      const res = authenticateUser(idInput, pwdInput);
      if (res.success) {
        closeModal();
        if (onAuthSuccess) onAuthSuccess(res.user);
        alert(`🎉 Đăng nhập thành công! Chào mừng ${res.user.name} quay trở lại!`);
      } else {
        errorMsg.textContent = res.error;
        errorMsg.classList.remove('hidden');
      }
    });

    modalEl.querySelector('#btn-trigger-forgot-pwd')?.addEventListener('click', showForgotPasswordView);
    modalEl.querySelector('#btn-trigger-register-view')?.addEventListener('click', showRegisterView);
  };

  const showRegisterView = () => {
    modalEl.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-auto animate-fade-in relative">
        <div class="px-6 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-3">
            <span class="text-2xl">✨</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Đăng Ký Tài Khoản Mới</h3>
              <p class="text-2xs text-red-100">Cho phép ký tự đặc biệt trong ID, Email & Mật khẩu</p>
            </div>
          </div>
          <button id="btn-close-auth-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">&times;</button>
        </div>

        <form id="form-register-user" class="p-6 space-y-3.5">
          <div id="reg-error-msg" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"></div>

          <div>
            <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">ID Tài Khoản * (Hỗ trợ ký tự @, #, $, %, !)</label>
            <input type="text" id="reg-id" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="v.d. hanzo_user@01" required />
          </div>

          <div>
            <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Họ & Tên Hiển Thị *</label>
            <input type="text" id="reg-name" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="v.d. Nguyễn Văn A" required />
          </div>

          <div>
            <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Địa Chỉ Email * (Nhận Mã Xác Thực)</label>
            <input type="email" id="reg-email" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="user+sub@example.com" required />
          </div>

          <div>
            <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Mật Khẩu * (Tối thiểu 6 ký tự)</label>
            <div class="relative">
              <input type="password" id="reg-pwd" class="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500" placeholder="••••••••" minlength="6" required />
              <button type="button" class="btn-toggle-pwd-visibility absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1" title="Hiện/Ẩn Mật Khẩu">👁️</button>
            </div>
          </div>

          ${SPECIAL_CHARS_TOOLBAR_HTML}

          <button type="submit" class="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-200 transition cursor-pointer flex items-center justify-center gap-2 mt-2">
            <span>✉️</span> <span>Gửi Mã Xác Thực Email</span>
          </button>

          <div class="text-center pt-2 border-t border-slate-100">
            <span class="text-xs text-slate-500 font-semibold">Đã có tài khoản?</span>
            <button type="button" id="btn-trigger-login-view" class="text-xs font-black text-red-600 hover:underline ml-1 cursor-pointer">Đăng Nhập Ngay</button>
          </div>
        </form>
      </div>
    `;

    modalEl.querySelector('#btn-close-auth-modal')?.addEventListener('click', closeModal);
    modalEl.querySelector('#btn-trigger-login-view')?.addEventListener('click', showLoginView);
    setupSpecialCharsAndVisibility(modalEl);

    const formReg = modalEl.querySelector('#form-register-user');
    const errReg = modalEl.querySelector('#reg-error-msg');

    formReg.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = modalEl.querySelector('#reg-id').value;
      const name = modalEl.querySelector('#reg-name').value;
      const email = modalEl.querySelector('#reg-email').value;
      const pwd = modalEl.querySelector('#reg-pwd').value;

      const res = requestRegisterEmailVerification(id, email, pwd, name);
      if (res.success) {
        showRegisterOTPView(res.pendingData, res.otp);
      } else {
        errReg.textContent = res.error;
        errReg.classList.remove('hidden');
      }
    });
  };

  const showRegisterOTPView = (pendingData, otp) => {
    modalEl.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-auto animate-fade-in relative">
        <div class="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📩</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Xác Nhận Email Đăng Ký</h3>
              <p class="text-2xs text-emerald-100">Nhập mã 6 chữ số vừa gửi tới email</p>
            </div>
          </div>
          <button id="btn-close-auth-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">&times;</button>
        </div>

        <form id="form-otp-register" class="p-6 space-y-4">
          <div id="otp-error-msg" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"></div>

          <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
            📧 Mã OTP xác thực đã được gửi tới email <strong>${pendingData.email}</strong>.<br/>
            <span class="text-2xs text-emerald-700 font-mono mt-1 block">💡 Mã OTP demo thử nghiệm: <strong class="text-sm font-bold text-emerald-900">${otp}</strong></span>
          </div>

          <div>
            <label class="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Mã Xác Thực OTP (6 chữ số) *</label>
            <input type="text" id="input-register-otp" class="w-full text-center tracking-widest text-xl font-black text-slate-800 px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono" placeholder="123456" maxlength="6" required />
          </div>

          <button type="submit" class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 transition cursor-pointer flex items-center justify-center gap-2">
            <span>✅</span> <span>Xác Nhận & Đăng Ký Tài Khoản</span>
          </button>
        </form>
      </div>
    `;

    modalEl.querySelector('#btn-close-auth-modal')?.addEventListener('click', closeModal);
    const formOtp = modalEl.querySelector('#form-otp-register');
    const errOtp = modalEl.querySelector('#otp-error-msg');

    formOtp.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = modalEl.querySelector('#input-register-otp').value;
      const res = confirmRegisterOTP(code);
      if (res.success) {
        closeModal();
        if (onAuthSuccess) onAuthSuccess(res.user);
        alert(`🎉 Đăng ký thành công! Tài khoản "${res.user.id}" đã được kích hoạt.`);
      } else {
        errOtp.textContent = res.error;
        errOtp.classList.remove('hidden');
      }
    });
  };

  const showForgotPasswordView = () => {
    modalEl.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-auto animate-fade-in relative">
        <div class="px-6 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔄</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Đặt Lai Mật Khẩu Qua Email</h3>
              <p class="text-2xs text-amber-100">Nhập email đã đăng ký để nhận mã reset</p>
            </div>
          </div>
          <button id="btn-close-auth-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">&times;</button>
        </div>

        <form id="form-forgot-pwd" class="p-6 space-y-4">
          <div id="forgot-error-msg" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"></div>

          <div>
            <label class="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">Email Đã Đăng Ký Tài Khoản *</label>
            <input type="email" id="forgot-email-input" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500" placeholder="user@example.com" required />
          </div>

          ${SPECIAL_CHARS_TOOLBAR_HTML}

          <button type="submit" class="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-200 transition cursor-pointer flex items-center justify-center gap-2">
            <span>📩</span> <span>Gửi Mã Đặt Lại Mật Khẩu</span>
          </button>

          <div class="text-center pt-2 border-t border-slate-100">
            <button type="button" id="btn-back-to-login" class="text-xs font-bold text-slate-600 hover:underline cursor-pointer">Quay lại Đăng nhập</button>
          </div>
        </form>
      </div>
    `;

    modalEl.querySelector('#btn-close-auth-modal')?.addEventListener('click', closeModal);
    modalEl.querySelector('#btn-back-to-login')?.addEventListener('click', showLoginView);
    setupSpecialCharsAndVisibility(modalEl);

    const formForgot = modalEl.querySelector('#form-forgot-pwd');
    const errForgot = modalEl.querySelector('#forgot-error-msg');

    formForgot.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = modalEl.querySelector('#forgot-email-input').value;
      const res = requestPasswordResetOTP(email);
      if (res.success) {
        showResetOTPView(res.user, res.otp);
      } else {
        errForgot.textContent = res.error;
        errForgot.classList.remove('hidden');
      }
    });
  };

  const showResetOTPView = (user, otp) => {
    modalEl.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 my-auto animate-fade-in relative">
        <div class="px-6 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔑</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Nhập Mã Reset & Mật Khẩu Mới</h3>
              <p class="text-2xs text-amber-100">Tài khoản: ${user.id} (${user.email})</p>
            </div>
          </div>
          <button id="btn-close-auth-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">&times;</button>
        </div>

        <form id="form-reset-pwd-final" class="p-6 space-y-4">
          <div id="reset-error-msg" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed"></div>

          <div class="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
            💡 Mã xác nhận OTP đã gửi tới email <strong>${user.email}</strong>.<br/>
            Mã OTP thử nghiệm: <strong class="text-sm font-bold text-amber-900 font-mono">${otp}</strong>
          </div>

          <div>
            <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Mã OTP (6 chữ số) *</label>
            <input type="text" id="reset-otp-code" class="w-full text-center font-mono font-bold text-lg px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500" placeholder="123456" maxlength="6" required />
          </div>

          <div>
            <label class="block text-2xs font-extrabold uppercase text-slate-500 mb-1">Mật Khẩu Mới *</label>
            <div class="relative">
              <input type="password" id="reset-new-pwd" class="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500" placeholder="Mật khẩu mới..." minlength="6" required />
              <button type="button" class="btn-toggle-pwd-visibility absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1" title="Hiện/Ẩn Mật Khẩu">👁️</button>
            </div>
          </div>

          ${SPECIAL_CHARS_TOOLBAR_HTML}

          <button type="submit" class="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-200 transition cursor-pointer flex items-center justify-center gap-2">
            <span>💾</span> <span>Cập Nhật Mật Khẩu Mới</span>
          </button>
        </form>
      </div>
    `;

    modalEl.querySelector('#btn-close-auth-modal')?.addEventListener('click', closeModal);
    setupSpecialCharsAndVisibility(modalEl);

    const formReset = modalEl.querySelector('#form-reset-pwd-final');
    const errReset = modalEl.querySelector('#reset-error-msg');

    formReset.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = modalEl.querySelector('#reset-otp-code').value;
      const newPwd = modalEl.querySelector('#reset-new-pwd').value;

      const res = resetPasswordWithOTP(code, newPwd);
      if (res.success) {
        closeModal();
        alert(`🎉 Cập nhật mật khẩu thành công cho tài khoản "${res.user.id}"! Bạn có thể đăng nhập lại.`);
        showLoginView();
      } else {
        errReset.textContent = res.error;
        errReset.classList.remove('hidden');
      }
    });
  };

  const closeModal = () => {
    modalEl.classList.add('hidden');
    modalEl.classList.remove('flex');
  };

  const openModal = (viewMode = 'login') => {
    if (viewMode === 'register') showRegisterView();
    else if (viewMode === 'forgot') showForgotPasswordView();
    else showLoginView();

    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
  };

  return { openModal, closeModal };
}


  // --------------------------------------------------------------------------
  // MODULE: js\views\homeDashboardView.js
  // --------------------------------------------------------------------------

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

function renderHomeDashboardView(container, onStartPracticeCallback, onSwitchTabCallback) {
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


  // --------------------------------------------------------------------------
  // MODULE: js\views\topicsView.js
  // --------------------------------------------------------------------------
// Module 1: Quản lý & Tạo Bộ Chủ Đề Từ Vựng Tùy Chỉnh & HSK (topicsView.js)

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

function renderTopicsView(container, onStartPracticeCallback) {
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




  // --------------------------------------------------------------------------
  // MODULE: js\views\practiceView.js
  // --------------------------------------------------------------------------

function renderPracticeView(container, activeTopic) {
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


  // --------------------------------------------------------------------------
  // MODULE: js\views\dictionaryView.js
  // --------------------------------------------------------------------------
// Module 3: Tra Cứu Từ Điển Trung - Việt / Việt - Trung & Trường Hợp Sử Dụng Giao Tiếp (dictionaryView.js)


function syncWordEditToTopics(oldHanzi, newWordData) {
  try {
    const allTopics = getAllTopicsList();
    let updatedTopicCount = 0;

    allTopics.forEach(topic => {
      if (!topic.words || !Array.isArray(topic.words)) return;
      let topicModified = false;

      topic.words.forEach(w => {
        if (w.hanzi === oldHanzi || (newWordData.hanzi && w.hanzi === newWordData.hanzi)) {
          if (newWordData.hanzi) w.hanzi = newWordData.hanzi;
          if (newWordData.pinyin) w.pinyin = newWordData.pinyin;
          if (newWordData.hanviet !== undefined) w.hanviet = newWordData.hanviet;
          if (newWordData.meaning) w.meaning = newWordData.meaning;
          topicModified = true;
        }
      });

      if (topicModified) {
        updatedTopicCount++;
        saveCustomTopic(topic);
      }
    });

    return updatedTopicCount;
  } catch (e) {
    console.error('Lỗi khi đồng bộ từ vựng sang các bộ chủ đề:', e);
    return 0;
  }
}

function updateDictionaryWord(wordId, oldHanzi, updatedFields) {
  const edits = getCustomDictionaryEdits();
  edits[wordId] = {
    ...(edits[wordId] || {}),
    ...updatedFields
  };
  saveCustomDictionaryEdits(edits);

  const wordIdx = dictionaryData.findIndex(w => w.id === wordId);
  if (wordIdx !== -1) {
    Object.assign(dictionaryData[wordIdx], updatedFields);
  }

  const syncedCount = syncWordEditToTopics(oldHanzi, updatedFields);
  return syncedCount;
}

function renderDictionaryView(container) {
  let searchQuery = '';
  let selectedHsk = 'all';

  const filterWords = () => {
    const q = searchQuery.toLowerCase().trim();
    const currentList = getEffectiveDictionaryData();
    const favList = getFavoriteDictWords();

    return currentList.filter(word => {
      const hanviet = (word.hanviet || lookupHanVietForHanzi(word.hanzi) || '').toLowerCase();
      let matchHsk = false;

      if (selectedHsk === 'fav') {
        matchHsk = favList.includes(word.id);
      } else if (selectedHsk === 'topic') {
        matchHsk = word.isSyncedFromTopic || !!word.sourceTopicId;
      } else {
        matchHsk = selectedHsk === 'all' || String(word.hskLevel) === selectedHsk;
      }

      const matchQuery = !q || 
        word.hanzi.includes(q) ||
        word.pinyin.toLowerCase().includes(q) ||
        (word.pinyinNoTone && word.pinyinNoTone.toLowerCase().includes(q)) ||
        word.meaning.toLowerCase().includes(q) ||
        hanviet.includes(q) ||
        (word.tags && word.tags.some(t => t.toLowerCase().includes(q)));
      return matchHsk && matchQuery;
    });
  };

  const renderContent = () => {
    const filtered = filterWords();
    const favList = getFavoriteDictWords();
    const currentData = getEffectiveDictionaryData();
    const topicSyncedCount = currentData.filter(w => w.isSyncedFromTopic || w.sourceTopicId).length;

    container.innerHTML = `
      <div class="view-header mb-6 flex flex-col md:flex-row justify-between align-start md:align-center gap-3">
        <div>
          <h1 class="text-gradient">🔍 Từ Điển Tra Cứu HSK</h1>
          <p class="subtitle">Tra cứu Hán tự, Pinyin, Hán Việt, nghĩa tiếng Việt, tự động đồng bộ 2 chiều giữa Từ điển HSK và Các bộ chủ đề từ vựng.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-sync-topics-to-dict" class="btn btn-secondary font-bold text-xs bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 py-2 px-3.5 rounded-xl cursor-pointer transition shadow-xs">
            <span>🔄 Cập Nhật Từ Bộ Chủ Đề</span>
          </button>
        </div>
      </div>

      <!-- Search Controls Bar -->
      <div class="search-bar-wrapper glass-panel p-4 mb-6 flex flex-col md:flex-row gap-3 align-center">
        <div class="relative flex-1" style="width: 100%;">
          <input type="text" id="dict-search-input" class="form-control form-control-lg pl-10" placeholder="Gõ Hán tự (你好), Pinyin (ni hao / nǐ hǎo), Hán Việt (nhĩ hảo) hoặc từ tiếng Việt (Xin chào)..." value="${escapeHtml(searchQuery)}" />
          <span class="absolute left-3 top-3 text-slate-400 text-lg">🔍</span>
        </div>
        <div class="flex gap-2">
          <select id="hsk-filter-select" class="form-control" style="width: 180px;">
            <option value="all" ${selectedHsk === 'all' ? 'selected' : ''}>Tất cả HSK (${currentData.length})</option>
            <option value="fav" ${selectedHsk === 'fav' ? 'selected' : ''}>⭐ Yêu Thích (${favList.length})</option>
            <option value="topic" ${selectedHsk === 'topic' ? 'selected' : ''}>📂 Bộ Chủ Đề (${topicSyncedCount})</option>
            <option value="1" ${selectedHsk === '1' ? 'selected' : ''}>HSK 1</option>
            <option value="2" ${selectedHsk === '2' ? 'selected' : ''}>HSK 2</option>
            <option value="3" ${selectedHsk === '3' ? 'selected' : ''}>HSK 3</option>
            <option value="4" ${selectedHsk === '4' ? 'selected' : ''}>HSK 4</option>
          </select>
        </div>
      </div>

      <!-- Dictionary Grid Results -->
      <div class="dict-results-count flex justify-between items-center text-xs text-muted mb-3">
        <span>Tìm thấy ${filtered.length} kết quả từ vựng HSK.</span>
        <span class="text-2xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-200">
          💡 Bấm nút ✏️ trên từ để sửa & đồng bộ bộ từ vựng
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="dict-grid">
        ${filtered.map(w => renderDictWordCard(w)).join('')}
      </div>

      <!-- Detail Modal -->
      <div id="dict-detail-modal" class="modal-overlay hidden">
        <div class="modal-card max-w-2xl" id="dict-modal-content">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- Edit Modal -->
      <div id="dict-edit-modal" class="modal-overlay hidden">
        <div class="modal-card max-w-lg bg-white border border-slate-200/90 text-slate-800 p-6 rounded-3xl shadow-2xl relative">
          <div class="modal-header flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <div class="flex items-center gap-2 font-bold text-xl text-slate-900">
              <span>✏️</span> <span>Chỉnh Sửa Từ Vựng HSK</span>
            </div>
            <button class="btn-close text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer" id="dict-edit-modal-close">&times;</button>
          </div>

          <form id="dict-edit-form" class="space-y-4">
            <input type="hidden" id="edit-word-id" />
            <input type="hidden" id="edit-word-old-hanzi" />

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">Chữ Hán (Tiếng Trung) *</label>
                <input type="text" id="edit-word-hanzi" class="form-control font-extrabold text-red-600 text-lg border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" required placeholder="v.d. 你好" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Cấp độ HSK</label>
                <select id="edit-word-hsk" class="form-control font-bold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 w-full focus:border-red-500 focus:outline-none">
                  <option value="1">HSK 1</option>
                  <option value="2">HSK 2</option>
                  <option value="3">HSK 3</option>
                  <option value="4">HSK 4</option>
                  <option value="5">HSK 5</option>
                  <option value="6">HSK 6</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Phiên âm (Pinyin)</label>
                <input type="text" id="edit-word-pinyin" class="form-control font-pinyin font-medium text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" placeholder="v.d. nǐ hǎo" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Hán Việt</label>
                <input type="text" id="edit-word-hanviet" class="form-control font-bold text-slate-800 tracking-wide border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" placeholder="v.d. NHĨ HẢO" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ý nghĩa Tiếng Việt *</label>
              <input type="text" id="edit-word-meaning" class="form-control font-bold text-emerald-600 border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-emerald-500 focus:outline-none" required placeholder="v.d. Xin chào" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Giải thích & Trường hợp sử dụng</label>
              <textarea id="edit-word-usage" class="form-control text-slate-700 text-sm border border-slate-200 rounded-xl px-3.5 py-2 w-full focus:border-red-500 focus:outline-none" rows="3" placeholder="Từ vựng HSK 1 phổ biến trong giao tiếp."></textarea>
            </div>

            <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-red-900 font-semibold flex items-start gap-2.5 leading-relaxed">
              <span class="bg-blue-500 text-white rounded p-1 text-xs shrink-0 mt-0.5 flex items-center justify-center w-5 h-5">🔄</span>
              <span>Dữ liệu vừa chỉnh sửa (Chữ Hán, Pinyin, Hán Việt, Nghĩa tiếng Việt) sẽ được <strong>tự động đồng bộ cập nhật ngược lại</strong> tất cả các bộ chủ đề từ vựng chứa từ này.</span>
            </div>

            <div class="modal-footer flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" class="px-5 py-2 rounded-full border border-red-500 text-red-600 font-bold hover:bg-red-50 transition cursor-pointer text-sm" id="dict-edit-cancel-btn">Hủy</button>
              <button type="submit" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer text-sm">
                <span>💾</span> <span>Lưu & Đồng Bộ Bộ Chủ Đề</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupDictEvents();
  };

  function setupDictEvents() {
    const searchInput = container.querySelector('#dict-search-input');
    const hskSelect = container.querySelector('#hsk-filter-select');

    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderContent();
      const newInp = container.querySelector('#dict-search-input');
      if (newInp) {
        newInp.focus();
        newInp.setSelectionRange(newInp.value.length, newInp.value.length);
      }
    });

    hskSelect?.addEventListener('change', (e) => {
      selectedHsk = e.target.value;
      renderContent();
    });

    // Speak audio
    container.querySelectorAll('.btn-speak-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = e.currentTarget.dataset.text;
        speakChinese(text);
      });
    });

    // Manual Sync Topics to Dictionary
    container.querySelector('#btn-sync-topics-to-dict')?.addEventListener('click', () => {
      const res = syncTopicWordsToDictionary();
      renderContent();
      alert(`🎉 Đã tự động đồng bộ & cập nhật từ vựng từ tất cả Bộ chủ đề vào Từ điển HSK!\n\n✨ Thêm mới vào từ điển: ${res.addedCount} từ vựng\n✨ Cập nhật thông tin: ${res.updatedCount} từ vựng\n✨ Tổng số từ vựng chủ đề đã đồng bộ: ${res.totalSynced} từ.`);
    });

    // Toggle Favorite
    container.querySelectorAll('.btn-fav-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        toggleFavoriteDictWord(id);
        renderContent();
      });
    });

    // Edit Word Button
    container.querySelectorAll('.btn-edit-word').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const currentData = getEffectiveDictionaryData();
        const word = currentData.find(w => w.id === id);
        if (word) openEditWordModal(word);
      });
    });

    // View detail modal
    container.querySelectorAll('.dict-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-speak-word') || e.target.closest('.btn-fav-word') || e.target.closest('.btn-edit-word')) return;
        const wordId = card.dataset.id;
        const currentData = getEffectiveDictionaryData();
        const word = currentData.find(w => w.id === wordId);
        if (word) openWordDetailModal(word);
      });
    });

    // Setup Edit Modal Form
    const editModal = container.querySelector('#dict-edit-modal');
    const editCloseBtn = container.querySelector('#dict-edit-modal-close');
    const editCancelBtn = container.querySelector('#dict-edit-cancel-btn');
    const editForm = container.querySelector('#dict-edit-form');
    const hanziInp = container.querySelector('#edit-word-hanzi');
    const pinyinInp = container.querySelector('#edit-word-pinyin');
    const hanvietInp = container.querySelector('#edit-word-hanviet');

    const closeEditModal = () => editModal?.classList.add('hidden');
    editCloseBtn?.addEventListener('click', closeEditModal);
    editCancelBtn?.addEventListener('click', closeEditModal);

    hanziInp?.addEventListener('input', () => {
      const val = hanziInp.value.trim();
      if (val) {
        if (!pinyinInp.value.trim() || pinyinInp.dataset.autoFilled === 'true') {
          const autoPy = lookupPinyinForHanzi(val);
          if (autoPy) {
            pinyinInp.value = autoPy;
            pinyinInp.dataset.autoFilled = 'true';
          }
        }
        if (!hanvietInp.value.trim() || hanvietInp.dataset.autoFilled === 'true') {
          const autoHv = lookupHanVietForHanzi(val);
          if (autoHv) {
            hanvietInp.value = autoHv;
            hanvietInp.dataset.autoFilled = 'true';
          }
        }
      }
    });

    editForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const wordId = container.querySelector('#edit-word-id').value;
      const oldHanzi = container.querySelector('#edit-word-old-hanzi').value;
      const hanzi = container.querySelector('#edit-word-hanzi').value.trim();
      let pinyin = container.querySelector('#edit-word-pinyin').value.trim();
      let hanviet = container.querySelector('#edit-word-hanviet').value.trim();
      const meaning = container.querySelector('#edit-word-meaning').value.trim();
      const hskLevel = parseInt(container.querySelector('#edit-word-hsk').value, 10) || 1;
      const usageContext = container.querySelector('#edit-word-usage').value.trim();

      if (!hanzi || !meaning) {
        alert('Vui lòng nhập đầy đủ Chữ Hán và Nghĩa tiếng Việt!');
        return;
      }

      if (!pinyin) pinyin = lookupPinyinForHanzi(hanzi) || hanzi;
      if (!hanviet) hanviet = lookupHanVietForHanzi(hanzi) || '';

      const updatedFields = { hanzi, pinyin, hanviet, meaning, hskLevel, usageContext };
      const syncedCount = updateDictionaryWord(wordId, oldHanzi, updatedFields);

      closeEditModal();
      renderContent();

      alert(`🎉 Đã cập nhật thành công từ vựng "${hanzi}"!\n\n✨ Đã đồng bộ thông tin mới (Chữ Hán, Pinyin, Hán Việt, Nghĩa) ngược lại ${syncedCount} bộ chủ đề từ vựng.`);
    });
  }

  function openEditWordModal(word) {
    const editModal = container.querySelector('#dict-edit-modal');
    const hanviet = word.hanviet || lookupHanVietForHanzi(word.hanzi);

    container.querySelector('#edit-word-id').value = word.id;
    container.querySelector('#edit-word-old-hanzi').value = word.hanzi;
    container.querySelector('#edit-word-hanzi').value = word.hanzi;
    container.querySelector('#edit-word-pinyin').value = word.pinyin || '';
    container.querySelector('#edit-word-hanviet').value = hanviet || '';
    container.querySelector('#edit-word-meaning').value = word.meaning || '';
    container.querySelector('#edit-word-hsk').value = String(word.hskLevel || 1);
    container.querySelector('#edit-word-usage').value = word.usageContext || '';

    editModal.classList.remove('hidden');
  }

  function openWordDetailModal(word) {
    const modal = container.querySelector('#dict-detail-modal');
    const content = container.querySelector('#dict-modal-content');
    const customTopics = getSavedCustomTopics();
    const hanviet = word.hanviet || lookupHanVietForHanzi(word.hanzi);

    content.innerHTML = `
      <div class="modal-header flex justify-between align-center border-b border-slate-700 pb-3">
        <div class="flex align-center gap-3">
          <span class="text-4xl font-extrabold text-amber-400">${escapeHtml(word.hanzi)}</span>
          <div>
            <div class="flex align-center gap-2 mb-1">
              <span class="text-lg font-bold text-slate-200">${escapeHtml(word.pinyin)}</span>
              ${hanviet ? `<span class="badge badge-purple text-xs font-semibold">[${escapeHtml(hanviet)}]</span>` : ''}
              <span class="badge badge-red">HSK ${word.hskLevel}</span>
            </div>
            <p class="text-sm text-emerald-400 font-semibold">${escapeHtml(word.meaning)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-secondary text-xs font-bold" id="btn-modal-trigger-edit" data-id="${word.id}">
            ✏️ Chỉnh sửa từ này
          </button>
          <button class="btn-close" id="dict-modal-close">&times;</button>
        </div>
      </div>

      <div class="modal-body py-4 max-h-96 overflow-y-auto pr-1">
        <div class="grid grid-cols-2 gap-2 p-3 bg-slate-900/60 rounded-xl mb-4 text-xs">
          <div><span class="text-muted">Hán Việt:</span> <span class="text-purple-300 font-semibold">${escapeHtml(hanviet || 'N/A')}</span></div>
          <div><span class="text-muted">Bộ thủ:</span> <span class="text-slate-200">${escapeHtml(word.radical || 'N/A')}</span></div>
          <div><span class="text-muted">Số nét:</span> <span class="text-slate-200">${word.strokeCount || 5} nét</span></div>
          <div><span class="text-muted">Từ loại:</span> <span class="text-slate-200">${escapeHtml(word.type || 'Từ vựng HSK')}</span></div>
          <div><span class="text-muted">Phát âm:</span> <button class="btn-link text-amber-400" onclick="window.speakZh('${escapeHtml(word.hanzi)}')">🔊 Nghe TTS</button></div>
        </div>

        <div class="mb-4">
          <h4 class="font-bold text-amber-400 text-sm mb-1">💡 Giải thích & Trường hợp sử dụng hàng ngày:</h4>
          <p class="text-sm text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            ${escapeHtml(word.usageContext || 'Được sử dụng phổ biến trong giao tiếp hàng ngày và môi trường học tập công sở.')}
          </p>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    content.querySelector('#dict-modal-close')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#btn-modal-trigger-edit')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      openEditWordModal(word);
    });
  }

  renderContent();
}

function renderDictWordCard(word) {
  const hanviet = word.hanviet || lookupHanVietForHanzi(word.hanzi);
  const isFav = getFavoriteDictWords().includes(word.id);
  const hanvietFormatted = hanviet ? hanviet.toUpperCase() : '';
  const usageText = word.usageContext || `Từ vựng HSK ${word.hskLevel || 1} phổ biến trong giao tiếp.`;

  return `
    <div class="dict-card hsk-word-card bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-red-300/80 transition-all cursor-pointer relative" data-id="${word.id}">
      <div>
        <!-- Top Row: Hanzi + Hán Việt & 3 Top-Right Action Icon Buttons -->
        <div class="flex justify-between items-start mb-1">
          <div class="flex items-baseline gap-2 flex-wrap pr-2">
            <h3 class="text-3xl font-extrabold text-red-600 hanzi-font leading-tight">${escapeHtml(word.hanzi)}</h3>
            ${hanvietFormatted ? `<span class="text-sm font-bold text-slate-800 tracking-wide">[${escapeHtml(hanvietFormatted)}]</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button class="btn-fav-word w-8 h-8 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-rose-50 hover:border-rose-300 text-rose-500 transition flex items-center justify-center cursor-pointer shadow-2xs" data-id="${word.id}" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích từ này'}">
              <span class="text-sm leading-none" style="color: #e11d48;">${isFav ? '★' : '☆'}</span>
            </button>
            <button class="btn-speak-word w-8 h-8 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50 hover:border-blue-300 text-blue-500 transition flex items-center justify-center cursor-pointer shadow-2xs" data-text="${escapeHtml(word.hanzi)}" title="Phát âm">
              <svg class="w-4 h-4 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            <button class="btn-edit-word w-8 h-8 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-amber-50 hover:border-amber-300 text-amber-600 transition flex items-center justify-center cursor-pointer shadow-2xs" data-id="${word.id}" title="Chỉnh sửa từ vựng này">
              <svg class="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Pinyin row -->
        <div class="mb-2">
          <span class="pinyin-text font-pinyin text-sm font-medium text-slate-800">${escapeHtml(word.pinyin)}</span>
        </div>

        <!-- Vietnamese Meaning -->
        <h4 class="text-base font-bold text-emerald-600 mb-1 leading-snug">${escapeHtml(word.meaning)}</h4>

        <!-- Usage context snippet -->
        <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">${escapeHtml(usageText)}</p>
      </div>

      <!-- Footer: HSK badge left, Edit & Detail right -->
      <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <span class="badge-hsk-level inline-block bg-amber-50 border border-amber-300 text-amber-700 font-bold px-3 py-1 rounded-lg text-xs">
          HSK ${word.hskLevel || 1}
        </span>
        <div class="flex items-center gap-3">
          <button class="btn-edit-word text-slate-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition cursor-pointer" data-id="${word.id}">
            <span>✏️</span> <span>Chỉnh sửa</span>
          </button>
          <span class="text-red-600 font-bold flex items-center gap-0.5 hover:underline cursor-pointer">
            Chi tiết ➔
          </span>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


  // --------------------------------------------------------------------------
  // MODULE: js\views\chatgptView.js
  // --------------------------------------------------------------------------
// Module 9: Trợ lý Hán Ngữ ChatGPT AI Assistant (chatgptView.js)

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

function renderChatGPTView(container) {
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


  // --------------------------------------------------------------------------
  // MODULE: js\views\musicView.js
  // --------------------------------------------------------------------------
// Module 5: Học Bài Hát Tiếng Trung qua Video YouTube & Lời Bài Hát (musicView.js)

function getSongsKey() {
  return typeof getScopedStorageKey === 'function' ? getScopedStorageKey('hanzo_custom_songs') : 'hanzo_custom_songs';
}

function getDeletedSongsKey() {
  return typeof getScopedStorageKey === 'function' ? getScopedStorageKey('hanzo_deleted_preset_songs') : 'hanzo_deleted_preset_songs';
}

function getSavedSongs() {
  try {
    const data = localStorage.getItem(getSongsKey());
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function getDeletedPresetIds() {
  try {
    const data = localStorage.getItem(getDeletedSongsKey());
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function getAllSongsList() {
  const savedSongs = getSavedSongs();
  const deletedIds = getDeletedPresetIds();
  
  const activePresets = initialMusicData.filter(p => !deletedIds.includes(p.id));
  
  const mergedList = activePresets.map(preset => {
    const editedVersion = savedSongs.find(s => s.id === preset.id);
    return editedVersion ? { ...editedVersion, isEditedPreset: true } : preset;
  });

  savedSongs.forEach(saved => {
    if (!saved.id.startsWith('song_')) {
      mergedList.push(saved);
    }
  });

  return mergedList;
}

function saveSongToStorage(song) {
  const songs = getSavedSongs();
  const idx = songs.findIndex(s => s.id === song.id);
  if (idx >= 0) songs[idx] = song;
  else songs.push(song);
  localStorage.setItem(getSongsKey(), JSON.stringify(songs));
}

function deleteSongFromStorage(songId) {
  if (songId.startsWith('song_')) {
    const deletedIds = getDeletedPresetIds();
    if (!deletedIds.includes(songId)) {
      deletedIds.push(songId);
      localStorage.setItem(getDeletedSongsKey(), JSON.stringify(deletedIds));
    }
    const songs = getSavedSongs().filter(s => s.id !== songId);
    localStorage.setItem(getSongsKey(), JSON.stringify(songs));
  } else {
    const songs = getSavedSongs().filter(s => s.id !== songId);
    localStorage.setItem(getSongsKey(), JSON.stringify(songs));
  }
}

function parseYouTubeVideoId(url) {
  if (!url) return '';
  url = url.trim();
  if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : '';
}

function formatLyricsForEditing(lyrics) {
  if (!lyrics || !Array.isArray(lyrics) || lyrics.length === 0) return '';
  return lyrics.map((l, idx) => {
    let block = `${idx + 1}. ${l.hanzi || ''}`;
    if (l.pinyin) block += `\n${l.pinyin}`;
    if (l.meaning) block += `\n${l.meaning}`;
    return block;
  }).join('\n\n');
}

function parseLyricsInput(lyricsRaw) {
  if (!lyricsRaw || !lyricsRaw.trim()) return [];

  const lines = lyricsRaw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const results = [];

  let currentHanzi = '';
  let currentPinyin = '';
  let currentMeaning = '';

  const pushCurrent = () => {
    if (currentHanzi) {
      let py = normalizePinyin(currentPinyin);
      if (!py && currentHanzi && typeof lookupPinyinForHanzi === 'function') {
        py = lookupPinyinForHanzi(currentHanzi);
      }
      results.push({
        hanzi: currentHanzi,
        pinyin: py || currentHanzi,
        meaning: currentMeaning
      });
      currentHanzi = '';
      currentPinyin = '';
      currentMeaning = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if line has pipe separators: "1. 后来 | Hòu lái | Sau này" or "后来 | Hòu lái | Sau này"
    if (line.includes('|')) {
      pushCurrent();
      line = line.replace(/^\d+[\.\)\/]\s*/, '');
      const parts = line.split('|').map(p => p.trim());
      const hanzi = parts[0] || '';
      const pinyin = normalizePinyin(parts[1] || '');
      const meaning = parts[2] || '';
      if (hanzi) {
        results.push({
          hanzi,
          pinyin: pinyin || (typeof lookupPinyinForHanzi === 'function' ? lookupPinyinForHanzi(hanzi) : hanzi),
          meaning
        });
      }
      continue;
    }

    // Check if line starts with a number prefix like "1. 后来" or "1) 后来" or "1. 后来"
    const numMatch = line.match(/^(\d+)[\.\)\/]\s*(.*)/);
    if (numMatch) {
      pushCurrent();
      currentHanzi = numMatch[2].trim();
      continue;
    }

    // If we have a currentHanzi but no currentPinyin:
    if (currentHanzi && !currentPinyin) {
      const hasChineseChar = /[\u4e00-\u9fa5]/.test(line);
      if (hasChineseChar && !/^\d+/.test(line)) {
        pushCurrent();
        currentHanzi = line;
      } else {
        currentPinyin = line;
      }
      continue;
    }

    // If we have currentHanzi and currentPinyin, but no currentMeaning:
    if (currentHanzi && currentPinyin && !currentMeaning) {
      const hasChineseChar = /[\u4e00-\u9fa5]/.test(line);
      if (hasChineseChar) {
        pushCurrent();
        currentHanzi = line;
      } else {
        currentMeaning = line;
        pushCurrent();
      }
      continue;
    }

    // Default fallback: new Hanzi line
    pushCurrent();
    currentHanzi = line.replace(/^\d+[\.\)\/]\s*/, '');
  }

  pushCurrent();
  return results;
}

function renderMusicView(container, activeSongId = null) {
  let allSongs = getAllSongsList();
  let currentSong = allSongs.find(s => s.id === activeSongId) || allSongs[0] || null;

  let showPinyin = true;
  let showMeaning = true;
  let fontSizeScale = localStorage.getItem('hanzo_music_font_size') || 'base'; // 'sm', 'base', 'lg'
  let searchQuery = '';
  let isDrawerOpen = false;
  let editingSong = null;

  const renderView = () => {
    allSongs = getAllSongsList();
    if (!currentSong && allSongs.length > 0) {
      currentSong = allSongs[0];
    }

    const filteredSongs = allSongs.filter(s => 
      (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.pinyin || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.titleVi || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const videoId = parseYouTubeVideoId(currentSong?.youtubeUrl);
    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : (currentSong?.youtubeUrl || '');

    const htmlContent = `
      <div class="space-y-6 pb-12 animate-fade-in relative">
        
        <!-- HEADER TITLE BAR & ACTION BUTTON -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-rose-200">
              🎵
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Học bài hát tiếng Trung
              </h1>
              <p class="text-xs text-slate-500 font-medium">
                Vừa nghe nhạc, vừa học tiếng Trung một cách thú vị!
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <button id="btn-toggle-add-song" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-crimson hover:bg-red-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer">
              <span class="text-sm font-black">+</span>
              <span>Thêm bài hát mới</span>
            </button>
          </div>
        </div>

        <!-- MAIN GRID CONTAINER -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT AREA: PLAYER, INFO, SONG LIST (Cols 7 or 12) -->
          <div class="${isDrawerOpen ? 'lg:col-span-7' : 'lg:col-span-7'} space-y-6 transition-all duration-300">
            
            <!-- CARD 1: TOP SONG SELECTOR -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 shrink-0">
                  <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">🎵</div>
                  <span class="font-extrabold text-slate-800 text-sm whitespace-nowrap">Chọn bài hát</span>
                </div>

                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div class="relative flex-1 min-w-0">
                    <select id="select-active-song" class="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2 pr-8 appearance-none outline-none focus:border-crimson cursor-pointer truncate">
                      ${allSongs.map(song => `
                        <option value="${song.id}" ${currentSong && currentSong.id === song.id ? 'selected' : ''}>
                          ${escapeHtml(song.title)} (${escapeHtml(song.pinyin || '')}) - ${escapeHtml(song.titleVi || '')}
                        </option>
                      `).join('')}
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-slate-400 pointer-events-none">▼</div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    <button id="btn-prev-song" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs transition cursor-pointer" title="Bài trước">&lt;</button>
                    <button id="btn-next-song" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs transition cursor-pointer" title="Bài tiếp">&gt;</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 2: SONG INFO -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">📇</div>
                <h3 class="font-extrabold text-slate-800 text-sm">Thông tin bài hát</h3>
              </div>

              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 border border-rose-200/60 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
                  ${currentSong?.coverIcon || '🎵'}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1 min-w-0">
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Tên bài hát (Trung):</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.title || '')} ${currentSong?.pinyin ? `<span class="font-pinyin">(${escapeHtml(currentSong.pinyin)})</span>` : ''}</span>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Thể loại:</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.category || 'Pop, Ballad')}</span>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Tên bài hát (Việt):</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.titleVi || '')}</span>
                  </div>
                  <div class="truncate">
                    <span class="text-slate-400 font-medium">Thời lượng:</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.duration || '5:19')}</span>
                  </div>
                  <div class="sm:col-span-2 truncate">
                    <span class="text-slate-400 font-medium">Ca sĩ:</span>
                    <span class="font-bold text-slate-900 ml-1.5">${escapeHtml(currentSong?.artist || 'Không rõ')}</span>
                  </div>
                  <div class="sm:col-span-2 truncate">
                    <span class="text-slate-400 font-medium">Link YouTube:</span>
                    <a href="${watchUrl}" target="_blank" class="font-bold text-crimson hover:underline ml-1.5 truncate inline-block max-w-[260px] align-bottom">${watchUrl}</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 3: SONG LIST TABLE -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">🎵</div>
                  <h3 class="font-extrabold text-slate-800 text-sm">Danh sách bài hát</h3>
                </div>

                <div class="relative w-full sm:w-60">
                  <input type="text" id="song-search-input" class="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 pl-8 outline-none focus:border-crimson" placeholder="Tìm bài hát..." value="${escapeHtml(searchQuery)}" />
                  <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">🔍</span>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="border-b border-slate-100 text-slate-400 font-bold text-2xs uppercase tracking-wider">
                      <th class="py-2.5 px-2 text-center w-8">#</th>
                      <th class="py-2.5 px-2">Tên bài hát (Trung)</th>
                      <th class="py-2.5 px-2">Pinyin</th>
                      <th class="py-2.5 px-2">Tên bài hát (Việt)</th>
                      <th class="py-2.5 px-2">Ca sĩ</th>
                      <th class="py-2.5 px-2 text-center">Thời lượng</th>
                      <th class="py-2.5 px-2 text-center w-16">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                    ${filteredSongs.length > 0 ? filteredSongs.map((song, idx) => {
                      const isActive = currentSong && currentSong.id === song.id;
                      return `
                        <tr class="song-table-row hover:bg-rose-50/50 transition cursor-pointer ${isActive ? 'bg-rose-50/80 font-bold text-crimson' : ''}" data-song-id="${song.id}">
                          <td class="py-3 px-2 text-center text-slate-400 font-bold">${idx + 1}</td>
                          <td class="py-3 px-2 font-black ${isActive ? 'text-crimson' : 'text-slate-900'}">${escapeHtml(song.title)}</td>
                          <td class="py-3 px-2 text-emerald-600 font-bold font-pinyin">${escapeHtml(song.pinyin || '')}</td>
                          <td class="py-3 px-2 text-slate-700 font-semibold">${escapeHtml(song.titleVi || '')}</td>
                          <td class="py-3 px-2 text-slate-500">${escapeHtml(song.artist || '')}</td>
                          <td class="py-3 px-2 text-center text-slate-400 font-semibold">${escapeHtml(song.duration || '4:00')}</td>
                          <td class="py-3 px-2 text-center">
                            <div class="flex items-center justify-center gap-1.5">
                              <button class="btn-edit-song text-rose-600 hover:text-red-700 p-1 rounded transition cursor-pointer" data-id="${song.id}" title="Chỉnh sửa">✏️</button>
                              <button class="btn-delete-song text-rose-600 hover:text-red-700 p-1 rounded transition cursor-pointer" data-id="${song.id}" title="Xóa">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('') : `
                      <tr>
                        <td colspan="7" class="py-6 text-center text-slate-400 font-medium">Không tìm thấy bài hát nào phù hợp</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- RIGHT AREA: SYNCHRONIZED LYRICS (Cols 5) -->
          <div class="${isDrawerOpen ? 'lg:col-span-5' : 'lg:col-span-5'} bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-rose-100 text-crimson flex items-center justify-center text-xs font-bold">📄</div>
                <h3 class="font-extrabold text-slate-800 text-sm">Lời bài hát</h3>
              </div>

              <!-- CONTROLS ROW -->
              <div class="flex flex-wrap items-center gap-3 text-xs">
                <button id="btn-toggle-pinyin" class="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none">
                  <div class="w-3 h-3 rounded-full border border-rose-300 ${showPinyin ? 'bg-crimson' : 'bg-slate-200'}"></div>
                  <span>Hiển thị Pinyin</span>
                </button>

                <button id="btn-toggle-meaning" class="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none">
                  <div class="w-3 h-3 rounded-full border border-rose-300 ${showMeaning ? 'bg-crimson' : 'bg-slate-200'}"></div>
                  <span>Hiển thị nghĩa tiếng Việt</span>
                </button>

                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-bold text-2xs text-slate-600">
                  <span class="px-1 text-slate-400">Cỡ chữ</span>
                  <button class="btn-font-size px-2 py-0.5 rounded-lg transition cursor-pointer ${fontSizeScale === 'sm' ? 'bg-crimson text-white font-black shadow-2xs' : 'hover:bg-slate-200'}" data-size="sm">A-</button>
                  <button class="btn-font-size px-2 py-0.5 rounded-lg transition cursor-pointer ${fontSizeScale === 'base' ? 'bg-crimson text-white font-black shadow-2xs' : 'hover:bg-slate-200'}" data-size="base">A</button>
                  <button class="btn-font-size px-2 py-0.5 rounded-lg transition cursor-pointer ${fontSizeScale === 'lg' ? 'bg-crimson text-white font-black shadow-2xs' : 'hover:bg-slate-200'}" data-size="lg">A+</button>
                </div>
              </div>
            </div>

            <!-- SCROLLABLE LYRICS CONTAINER WITH LINE NUMBERS -->
            <div id="lyrics-lines-container" class="space-y-4 max-h-[640px] overflow-y-auto pr-2 flex-1">
              ${(currentSong?.lyrics || []).map((line, idx) => {
                const fs = {
                  sm: { hanzi: 'font-size: 15px;', sub: 'font-size: 11.5px;' },
                  base: { hanzi: 'font-size: 20px;', sub: 'font-size: 13.5px;' },
                  lg: { hanzi: 'font-size: 26px;', sub: 'font-size: 16.5px;' }
                }[fontSizeScale] || { hanzi: 'font-size: 20px;', sub: 'font-size: 13.5px;' };

                return `
                  <div class="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-rose-50/40 transition group cursor-pointer lyric-line-item" data-hanzi="${escapeHtml(line.hanzi)}" title="Bấm để nghe đọc giọng đọc câu này">
                    <div class="w-6 h-6 rounded-full bg-rose-50 text-crimson font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                      ${idx + 1}
                    </div>

                    <div class="space-y-1 min-w-0 flex-1">
                      <div class="font-extrabold text-red-600 leading-snug" style="${fs.hanzi}">
                        ${escapeHtml(line.hanzi)}
                      </div>
                      ${showPinyin ? `
                        <div class="font-pinyin font-bold text-emerald-600 leading-snug tracking-wide" style="${fs.sub}">
                          ${escapeHtml(line.pinyin || lookupPinyinForHanzi(line.hanzi))}
                        </div>
                      ` : ''}
                      ${showMeaning && line.meaning ? `
                        <div class="font-medium text-slate-800 leading-snug" style="${fs.sub}">
                          ${escapeHtml(line.meaning)}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- CENTERED MODAL / POPUP FOR "Thêm bài hát mới" / "Chỉnh sửa bài hát" -->
        <div id="panel-add-song-modal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-all ${isDrawerOpen ? '' : 'hidden'}">
          <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden transform transition-all my-auto animate-scale-up">
            
            <!-- Modal Header (Tông màu đỏ Hán Ngữ) -->
            <div class="px-6 py-4 bg-gradient-to-r from-red-700 via-rose-600 to-red-600 text-white flex items-center justify-between border-b border-rose-800 shadow-md">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg font-black shadow-inner border border-white/30">
                  🎵
                </div>
                <div>
                  <h3 id="drawer-form-title" class="font-black text-sm sm:text-base tracking-wide text-white drop-shadow-xs">
                    ${editingSong ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}
                  </h3>
                  <p class="text-2xs text-rose-100 font-medium">Cập nhật thông tin bài hát và tự động đánh số câu lời bài hát</p>
                </div>
              </div>
              <button id="btn-close-song-drawer" class="text-white/80 hover:text-white w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center font-bold text-sm transition cursor-pointer" title="Đóng">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 max-h-[82vh] overflow-y-auto">
              <form id="song-form" class="space-y-4 text-xs font-bold text-slate-700">
                <input type="hidden" id="form-song-id" value="${editingSong?.id || ''}" />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Tên bài hát (Tiếng Trung) <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-title" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: 后来" value="${escapeHtml(editingSong?.title || '')}" required />
                  </div>

                  <div>
                    <label class="block mb-1">Pinyin <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-pinyin" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: Hòu lái" value="${escapeHtml(editingSong?.pinyin || '')}" required />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Tên bài hát (Tiếng Việt) <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-title-vi" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: Sau này" value="${escapeHtml(editingSong?.titleVi || '')}" required />
                  </div>

                  <div>
                    <label class="block mb-1">Ca sĩ</label>
                    <input type="text" id="form-song-artist" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: 刘若英 (Lưu Nhược Anh)" value="${escapeHtml(editingSong?.artist || '')}" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Thể loại</label>
                    <input type="text" id="form-song-category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="Ví dụ: Pop, Ballad" value="${escapeHtml(editingSong?.category || 'Pop, Ballad')}" />
                  </div>

                  <div>
                    <label class="block mb-1">Link video YouTube <span class="text-crimson">*</span></label>
                    <input type="text" id="form-song-youtube" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-crimson" placeholder="https://www.youtube.com/watch?v=..." value="${escapeHtml(editingSong?.youtubeUrl || '')}" required />
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block font-extrabold text-slate-800">Lời bài hát <span class="text-crimson">*</span></label>
                    <button type="button" id="btn-auto-format-lyrics" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-crimson text-2xs font-extrabold transition cursor-pointer border border-rose-200">
                      <span>🪄 Tự động đánh số & định dạng câu</span>
                    </button>
                  </div>
                  <textarea id="form-song-lyrics-raw" rows="9" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs text-slate-800 outline-none focus:border-crimson leading-relaxed" placeholder="Nhập lời bài hát theo định dạng:&#10;1. 后来 我总算学会了如何去爱&#10;Hòu lái wǒ zǒng suàn xué huì le rú hé qù ài&#10;Sau này, cuối cùng em cũng đã học được cách để yêu&#10;&#10;2. 可惜 你早已远去 消失在人海&#10;Kě xī nǐ zǎo yǐ yuǎn qù xiāo shī zài rén hǎi&#10;Chỉ tiếc rằng anh đã sớm rời xa...">${editingSong ? formatLyricsForEditing(editingSong.lyrics) : ''}</textarea>
                  <div class="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 font-medium text-slate-600">
                    <div class="font-extrabold text-slate-800">📌 Định dạng câu bài hát (Tự động đánh số theo thứ tự 3 dòng):</div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-2xs">
                      <div class="p-2 rounded-xl bg-white border border-slate-200">
                        <span class="text-red-600 font-extrabold">1. Dòng 1:</span> Câu tiếng Trung
                      </div>
                      <div class="p-2 rounded-xl bg-white border border-slate-200">
                        <span class="text-emerald-600 font-extrabold">Dòng 2:</span> Pinyin
                      </div>
                      <div class="p-2 rounded-xl bg-white border border-slate-200">
                        <span class="text-slate-800 font-extrabold">Dòng 3:</span> Nghĩa tiếng Việt
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" id="btn-cancel-song-form" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition text-xs cursor-pointer">Hủy</button>
                  <button type="submit" class="px-6 py-2.5 rounded-xl bg-crimson hover:bg-red-700 text-white font-extrabold shadow-md hover:shadow-lg transition text-xs cursor-pointer">Lưu bài hát</button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    `;

    container.innerHTML = htmlContent;
    bindEvents();
  };

  function bindEvents() {
    // Open Popup Mini Player button
    container.querySelectorAll('.btn-open-popup-player').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = e.currentTarget.dataset.url || watchUrl;
        if (url) openYouTubePopup(url);
      });
    });

    // Dropdown song select
    const selectSong = container.querySelector('#select-active-song');
    selectSong?.addEventListener('change', (e) => {
      const songId = e.target.value;
      const found = allSongs.find(s => s.id === songId);
      if (found) {
        currentSong = found;
        renderView();
      }
    });

    // Prev / Next song buttons
    container.querySelector('#btn-prev-song')?.addEventListener('click', () => {
      const currentIdx = allSongs.findIndex(s => s.id === currentSong?.id);
      if (currentIdx > 0) {
        currentSong = allSongs[currentIdx - 1];
        renderView();
      }
    });

    container.querySelector('#btn-next-song')?.addEventListener('click', () => {
      const currentIdx = allSongs.findIndex(s => s.id === currentSong?.id);
      if (currentIdx >= 0 && currentIdx < allSongs.length - 1) {
        currentSong = allSongs[currentIdx + 1];
        renderView();
      }
    });

    // Song Table Row click
    container.querySelectorAll('.song-table-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit-song') || e.target.closest('.btn-delete-song')) return;
        const songId = row.dataset.songId;
        const found = allSongs.find(s => s.id === songId);
        if (found) {
          currentSong = found;
          renderView();
        }
      });
    });

    // Search input
    const searchInput = container.querySelector('#song-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderView();
    });

    // Toggle Pinyin
    container.querySelector('#btn-toggle-pinyin')?.addEventListener('click', () => {
      showPinyin = !showPinyin;
      renderView();
    });

    // Toggle Meaning
    container.querySelector('#btn-toggle-meaning')?.addEventListener('click', () => {
      showMeaning = !showMeaning;
      renderView();
    });

    // Font size buttons
    container.querySelectorAll('.btn-font-size').forEach(btn => {
      btn.addEventListener('click', (e) => {
        fontSizeScale = e.currentTarget.dataset.size || 'base';
        try { localStorage.setItem('hanzo_music_font_size', fontSizeScale); } catch (err) {}
        renderView();
      });
    });

    // Open Drawer button
    container.querySelector('#btn-toggle-add-song')?.addEventListener('click', () => {
      editingSong = null;
      isDrawerOpen = true;
      renderView();
    });

    // Close Drawer button
    container.querySelector('#btn-close-song-drawer')?.addEventListener('click', () => {
      isDrawerOpen = false;
      editingSong = null;
      renderView();
    });

    container.querySelector('#btn-cancel-song-form')?.addEventListener('click', () => {
      isDrawerOpen = false;
      editingSong = null;
      renderView();
    });

    // Close Modal on backdrop click
    container.querySelector('#panel-add-song-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'panel-add-song-modal') {
        isDrawerOpen = false;
        editingSong = null;
        renderView();
      }
    });

    // Edit song
    container.querySelectorAll('.btn-edit-song').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.currentTarget.dataset.id;
        const found = allSongs.find(s => s.id === songId);
        if (found) {
          editingSong = found;
          isDrawerOpen = true;
          renderView();
        }
      });
    });

    // Delete song
    container.querySelectorAll('.btn-delete-song').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.currentTarget.dataset.id;
        const found = allSongs.find(s => s.id === songId);
        if (found && confirm(`Bạn có chắc chắn muốn xóa bài hát "${found.title}" không?`)) {
          deleteSongFromStorage(songId);
          allSongs = getAllSongsList();
          currentSong = allSongs.find(s => s.id !== songId) || allSongs[0] || null;
          renderView();
        }
      });
    });

    // Speech TTS on Lyric line click
    container.querySelectorAll('.lyric-line-item').forEach(item => {
      item.addEventListener('click', () => {
        const hanzi = item.dataset.hanzi;
        if (hanzi) speakChinese(hanzi, 0.85);
      });
    });

    // Auto format lyrics button
    container.querySelector('#btn-auto-format-lyrics')?.addEventListener('click', () => {
      const textarea = container.querySelector('#form-song-lyrics-raw');
      if (textarea && textarea.value) {
        const parsed = parseLyricsInput(textarea.value);
        if (parsed.length > 0) {
          textarea.value = formatLyricsForEditing(parsed);
        }
      }
    });

    // Save Song Form Submit
    const form = container.querySelector('#song-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const songId = container.querySelector('#form-song-id').value;
      const id = songId || `music_${Date.now()}`;
      const title = container.querySelector('#form-song-title').value.trim();
      const pinyin = container.querySelector('#form-song-pinyin').value.trim();
      const titleVi = container.querySelector('#form-song-title-vi').value.trim();
      const artist = container.querySelector('#form-song-artist').value.trim();
      const category = container.querySelector('#form-song-category').value.trim() || 'Pop, Ballad';
      const youtubeUrl = container.querySelector('#form-song-youtube').value.trim();
      const lyricsRaw = container.querySelector('#form-song-lyrics-raw').value;

      const parsedLyrics = parseLyricsInput(lyricsRaw);

      if (parsedLyrics.length === 0) {
        alert('Vui lòng nhập lời bài hát tiếng Trung!');
        return;
      }

      const songObj = {
        id,
        title,
        pinyin,
        titleVi,
        artist,
        category,
        duration: editingSong?.duration || '4:15',
        youtubeUrl,
        coverIcon: editingSong?.coverIcon || '🎵',
        lyrics: parsedLyrics
      };

      saveSongToStorage(songObj);
      isDrawerOpen = false;
      editingSong = null;
      currentSong = songObj;
      renderView();
    });
  } // end bindEvents

  renderView();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


  // --------------------------------------------------------------------------
  // MODULE: js\views\scheduleView.js
  // --------------------------------------------------------------------------
// Module 6: Lịch Học Tập & Giám Sát Tiến Độ Học (scheduleView.js)

function getScheduleKey() {
  return typeof getScopedStorageKey === 'function' ? getScopedStorageKey('hanzo_custom_schedule_list') : 'hanzo_custom_schedule_list';
}

function getDayOfWeekFromDate(dateStr) {
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

function getRealTimeWeekDays(referenceDate = new Date()) {
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

function getStoredScheduleItems(allTopics = []) {
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

function renderScheduleView(container, onStartPracticeCallback) {
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


  // --------------------------------------------------------------------------
  // MODULE: js\views\gameView.js
  // --------------------------------------------------------------------------
/* ==========================================================================
   Hanzo - Vocabulary Game View (Game từ vựng)
   Matching the reference layout & aesthetics
   ========================================================================== */


function getWordCardIllustration(word) {
  if (!word) return '';
  const hanzi = String(word.hanzi || '').trim();
  const meaning = String(word.meaning || '').trim().toLowerCase();
  
  const exactMap = {
    // Apologies & Polite Greetings
    '对不起': { from: 'from-purple-600', to: 'to-indigo-800', icon: '🙇‍♂️', glow: 'bg-purple-400/20' },
    '抱歉': { from: 'from-purple-600', to: 'to-indigo-800', icon: '🙏', glow: 'bg-purple-400/20' },
    '没关系': { from: 'from-emerald-500', to: 'to-teal-700', icon: '👌', glow: 'bg-emerald-400/20' },
    '不客气': { from: 'from-teal-500', to: 'to-emerald-700', icon: '😊', glow: 'bg-teal-400/20' },
    '你': { from: 'from-violet-600', to: 'to-indigo-800', icon: '🙋‍♂️', glow: 'bg-violet-400/20' },
    '您': { from: 'from-violet-600', to: 'to-indigo-800', icon: '🧑‍💼', glow: 'bg-violet-400/20' },
    '你好': { from: 'from-rose-500', to: 'to-pink-600', icon: '👋', glow: 'bg-rose-400/20' },
    '谢谢': { from: 'from-amber-500', to: 'to-orange-600', icon: '🙏', glow: 'bg-amber-400/20' },
    '再见': { from: 'from-sky-500', to: 'to-blue-600', icon: '👋', glow: 'bg-sky-400/20' },
    '请': { from: 'from-teal-600', to: 'to-cyan-800', icon: '🤲', glow: 'bg-teal-400/20' },

    // Numbers
    '一': { from: 'from-blue-500', to: 'to-indigo-700', icon: '1️⃣', glow: 'bg-blue-400/20' },
    '二': { from: 'from-blue-500', to: 'to-indigo-700', icon: '2️⃣', glow: 'bg-blue-400/20' },
    '两': { from: 'from-blue-500', to: 'to-indigo-700', icon: '2️⃣', glow: 'bg-blue-400/20' },
    '三': { from: 'from-blue-500', to: 'to-indigo-700', icon: '3️⃣', glow: 'bg-blue-400/20' },
    '四': { from: 'from-blue-500', to: 'to-indigo-700', icon: '4️⃣', glow: 'bg-blue-400/20' },
    '五': { from: 'from-blue-500', to: 'to-indigo-700', icon: '5️⃣', glow: 'bg-blue-400/20' },
    '六': { from: 'from-blue-500', to: 'to-indigo-700', icon: '6️⃣', glow: 'bg-blue-400/20' },
    '七': { from: 'from-blue-500', to: 'to-indigo-700', icon: '7️⃣', glow: 'bg-blue-400/20' },
    '八': { from: 'from-blue-500', to: 'to-indigo-700', icon: '8️⃣', glow: 'bg-blue-400/20' },
    '九': { from: 'from-blue-500', to: 'to-indigo-700', icon: '9️⃣', glow: 'bg-blue-400/20' },
    '十': { from: 'from-blue-500', to: 'to-indigo-700', icon: '🔟', glow: 'bg-blue-400/20' },
    '百': { from: 'from-amber-500', to: 'to-orange-700', icon: '💯', glow: 'bg-amber-400/20' },
    '千': { from: 'from-amber-500', to: 'to-orange-700', icon: '🔢', glow: 'bg-amber-400/20' },

    // Tech & Accessories
    '耳机': { from: 'from-cyan-600', to: 'to-blue-800', icon: '🎧', glow: 'bg-cyan-400/20' },
    '电脑': { from: 'from-blue-600', to: 'to-indigo-800', icon: '💻', glow: 'bg-blue-400/20' },
    '手机': { from: 'from-sky-500', to: 'to-blue-700', icon: '📱', glow: 'bg-sky-400/20' },
    '电视': { from: 'from-slate-600', to: 'to-slate-800', icon: '📺', glow: 'bg-slate-400/20' },
    '手表': { from: 'from-amber-600', to: 'to-orange-800', icon: '⌚', glow: 'bg-amber-400/20' },

    // Places & Countries
    '中国': { from: 'from-red-600', to: 'to-rose-800', icon: '🇨🇳', glow: 'bg-red-400/20' },
    '北京': { from: 'from-rose-600', to: 'to-red-800', icon: '🏯', glow: 'bg-rose-400/20' },
    '汉语': { from: 'from-red-500', to: 'to-rose-700', icon: '🗣️', glow: 'bg-red-400/20' },
    '中文': { from: 'from-red-500', to: 'to-rose-700', icon: '💬', glow: 'bg-red-400/20' },

    // People & Education
    '朋友': { from: 'from-purple-500', to: 'to-indigo-700', icon: '🧑‍🤝‍🧑', glow: 'bg-purple-400/20' },
    '老师': { from: 'from-blue-600', to: 'to-indigo-800', icon: '🧑‍🏫', glow: 'bg-blue-400/20' },
    '学生': { from: 'from-teal-500', to: 'to-emerald-700', icon: '🧑‍🎓', glow: 'bg-teal-400/20' },
    '高兴': { from: 'from-amber-400', to: 'to-orange-500', icon: '😊', glow: 'bg-amber-300/20' },
    '学习': { from: 'from-blue-500', to: 'to-indigo-700', icon: '📚', glow: 'bg-blue-400/20' },
    '准备': { from: 'from-slate-600', to: 'to-slate-800', icon: '📋', glow: 'bg-slate-400/20' },
    '已经': { from: 'from-emerald-500', to: 'to-teal-700', icon: '✅', glow: 'bg-emerald-400/20' },
    '咖啡': { from: 'from-amber-800', to: 'to-stone-900', icon: '☕', glow: 'bg-amber-400/20' },
    '运动': { from: 'from-emerald-500', to: 'to-green-700', icon: '🏃', glow: 'bg-emerald-400/20' },
    '时间': { from: 'from-slate-700', to: 'to-slate-900', icon: '⏰', glow: 'bg-slate-400/20' },
    '希望': { from: 'from-sky-400', to: 'to-blue-600', icon: '🌟', glow: 'bg-sky-300/20' },
    '意思': { from: 'from-amber-400', to: 'to-orange-500', icon: '💡', glow: 'bg-amber-300/20' },
    '问题': { from: 'from-indigo-500', to: 'to-purple-700', icon: '❓', glow: 'bg-indigo-400/20' },
    '会议': { from: 'from-slate-700', to: 'to-gray-900', icon: '👔', glow: 'bg-slate-400/20' },
    '选择': { from: 'from-purple-600', to: 'to-indigo-800', icon: '🔀', glow: 'bg-purple-400/20' },
    '方便': { from: 'from-teal-500', to: 'to-cyan-700', icon: '⚡', glow: 'bg-teal-400/20' },
    '环境': { from: 'from-emerald-500', to: 'to-green-700', icon: '🌿', glow: 'bg-emerald-400/20' },
    '机会': { from: 'from-blue-600', to: 'to-sky-700', icon: '🚪', glow: 'bg-blue-400/20' },
    '根据': { from: 'from-indigo-600', to: 'to-blue-800', icon: '📊', glow: 'bg-indigo-400/20' },
    '清楚': { from: 'from-cyan-500', to: 'to-blue-600', icon: '🔍', glow: 'bg-cyan-400/20' },
    '护照': { from: 'from-blue-700', to: 'to-indigo-900', icon: '🛂', glow: 'bg-blue-400/20' },
    '机场': { from: 'from-sky-600', to: 'to-blue-800', icon: '✈️', glow: 'bg-sky-400/20' },
    '酒店': { from: 'from-indigo-600', to: 'to-purple-800', icon: '🏨', glow: 'bg-indigo-400/20' },
    '出租车': { from: 'from-yellow-400', to: 'to-amber-600', icon: '🚕', glow: 'bg-yellow-300/20' },
    '多少钱': { from: 'from-emerald-500', to: 'to-green-700', icon: '💵', glow: 'bg-emerald-400/20' },
    '钱': { from: 'from-emerald-500', to: 'to-green-700', icon: '💵', glow: 'bg-emerald-400/20' },
    '行李': { from: 'from-amber-600', to: 'to-orange-800', icon: '🧳', glow: 'bg-amber-400/20' },
    '订房': { from: 'from-rose-600', to: 'to-red-800', icon: '🔑', glow: 'bg-rose-400/20' },
    '服务员': { from: 'from-pink-500', to: 'to-rose-600', icon: '🧑‍🍳', glow: 'bg-pink-400/20' },
    '买单': { from: 'from-emerald-600', to: 'to-teal-800', icon: '💳', glow: 'bg-emerald-400/20' },
    '菜单': { from: 'from-indigo-500', to: 'to-purple-700', icon: '📜', glow: 'bg-indigo-400/20' },
    '饺子': { from: 'from-amber-500', to: 'to-orange-600', icon: '🥟', glow: 'bg-amber-400/20' },
    '米饭': { from: 'from-amber-500', to: 'to-orange-600', icon: '🍚', glow: 'bg-amber-400/20' },
    '好吃的': { from: 'from-rose-500', to: 'to-red-600', icon: '😋', glow: 'bg-rose-400/20' },
    '辣的': { from: 'from-red-600', to: 'to-rose-800', icon: '🌶️', glow: 'bg-red-400/20' },
    '水': { from: 'from-cyan-500', to: 'to-blue-600', icon: '💧', glow: 'bg-cyan-400/20' },
    '面包': { from: 'from-amber-600', to: 'to-yellow-700', icon: '🍞', glow: 'bg-amber-400/20' },
    '苹果': { from: 'from-red-500', to: 'to-rose-600', icon: '🍎', glow: 'bg-red-400/20' },
    '茶': { from: 'from-emerald-500', to: 'to-teal-700', icon: '🍵', glow: 'bg-emerald-400/20' },
    '鸡肉': { from: 'from-rose-500', to: 'to-red-600', icon: '🍗', glow: 'bg-rose-400/20' },
    '猪肉': { from: 'from-rose-600', to: 'to-red-700', icon: '🥩', glow: 'bg-rose-400/20' },
    '牛肉': { from: 'from-amber-700', to: 'to-red-800', icon: '🥩', glow: 'bg-amber-400/20' },
    '鱼': { from: 'from-sky-500', to: 'to-blue-600', icon: '🐟', glow: 'bg-sky-400/20' },
    '猫': { from: 'from-orange-500', to: 'to-amber-600', icon: '🐱', glow: 'bg-orange-400/20' },
    '狗': { from: 'from-lime-600', to: 'to-green-700', icon: '🐶', glow: 'bg-lime-400/20' },
    '看书': { from: 'from-sky-500', to: 'to-blue-700', icon: '📖', glow: 'bg-sky-400/20' },
    '医院': { from: 'from-cyan-600', to: 'to-blue-700', icon: '🏥', glow: 'bg-cyan-400/20' },
    '学校': { from: 'from-violet-500', to: 'to-purple-700', icon: '🏫', glow: 'bg-violet-400/20' },
    '商店': { from: 'from-amber-500', to: 'to-orange-700', icon: '🏪', glow: 'bg-amber-400/20' },
    '衣服': { from: 'from-purple-500', to: 'to-indigo-700', icon: '👕', glow: 'bg-purple-400/20' },
    '工作': { from: 'from-slate-600', to: 'to-slate-800', icon: '💼', glow: 'bg-slate-400/20' }
  };

  if (exactMap[hanzi]) {
    const t = exactMap[hanzi];
    return renderVisualCard(t.from, t.to, t.icon, t.glow);
  }

  // Semantic Keyword Matching
  // 1. Apologies, Forgiveness, Thanks & Politeness
  if (meaning.includes('xin lỗi') || meaning.includes('tạ lỗi') || meaning.includes('bất quá') || meaning.includes('thông cảm') || meaning.includes('xin thứ')) {
    return renderVisualCard('from-purple-600', 'to-indigo-800', '🙇‍♂️', 'bg-purple-400/20');
  }
  if (meaning.includes('không sao') || meaning.includes('đừng khách') || meaning.includes('không có gì') || meaning.includes('được rồi')) {
    return renderVisualCard('from-emerald-500', 'to-teal-700', '👌', 'bg-emerald-400/20');
  }
  if (meaning.includes('cảm ơn') || meaning.includes('tạ ơn') || meaning.includes('cảm tạ')) {
    return renderVisualCard('from-amber-500', 'to-orange-600', '🙏', 'bg-amber-400/20');
  }
  if (meaning.includes('xin chào') || meaning.includes('chào')) {
    return renderVisualCard('from-rose-500', 'to-pink-600', '👋', 'bg-rose-400/20');
  }

  // 2. Audio & Tech Accessories
  if (meaning.includes('tai nghe') || meaning.includes('âm thanh')) {
    return renderVisualCard('from-cyan-600', 'to-blue-800', '🎧', 'bg-cyan-400/20');
  }
  if (meaning.includes('máy tính') || meaning.includes('điện thoại') || meaning.includes('tivi') || meaning.includes('máy ảnh')) {
    return renderVisualCard('from-blue-600', 'to-indigo-800', '💻', 'bg-blue-400/20');
  }

  // 3. Numbers & Quantities
  if (meaning.includes('số 1') || meaning.includes('một') || meaning.includes('nhất')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '1️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 2') || meaning.includes('hai') || meaning.includes('nhị') || meaning.includes('lưỡng')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '2️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 3') || meaning.includes('ba') || meaning.includes('tam')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '3️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 4') || meaning.includes('bốn') || meaning.includes('tứ')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '4️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 5') || (meaning.includes('năm') && !meaning.includes('năm ngoái') && !meaning.includes('năm nay'))) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '5️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 6') || meaning.includes('sáu') || meaning.includes('lục')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '6️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 7') || meaning.includes('bảy') || meaning.includes('thất')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '7️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 8') || meaning.includes('tám') || meaning.includes('bát')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '8️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 9') || meaning.includes('chín') || meaning.includes('cửu')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '9️⃣', 'bg-blue-400/20');
  }
  if (meaning.includes('số 10') || meaning.includes('mười') || meaning.includes('thập')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '🔟', 'bg-blue-400/20');
  }
  if (meaning.includes('trăm') || meaning.includes('nghìn') || meaning.includes('vạn')) {
    return renderVisualCard('from-amber-500', 'to-orange-700', '💯', 'bg-amber-400/20');
  }

  // 4. Family & People
  if (meaning.includes('bố') || meaning.includes('mẹ') || meaning.includes('cha') || meaning.includes('ông') || meaning.includes('bà') || meaning.includes('con')) {
    return renderVisualCard('from-indigo-500', 'to-purple-700', '👨‍👩‍👧', 'bg-indigo-400/20');
  }
  if (meaning.includes('bạn') || meaning.includes('anh') || meaning.includes('chị') || meaning.includes('người') || meaning.includes('tôi') || meaning.includes('nễ') || meaning.includes('bằng hữu')) {
    return renderVisualCard('from-violet-600', 'to-indigo-800', '🙋‍♂️', 'bg-violet-400/20');
  }

  // 5. Learning & Books
  if (meaning.includes('học') || meaning.includes('sách') || meaning.includes('viết') || meaning.includes('đọc') || meaning.includes('bài') || meaning.includes('ngôn ngữ') || meaning.includes('hán') || meaning.includes('chữ')) {
    return renderVisualCard('from-blue-500', 'to-indigo-700', '📚', 'bg-blue-400/20');
  }

  // 6. Food & Drinks
  if (meaning.includes('ăn') || meaning.includes('uống') || meaning.includes('cơm') || meaning.includes('thịt') || meaning.includes('bánh') || meaning.includes('trái') || meaning.includes('quả') || meaning.includes('món') || meaning.includes('ngon') || meaning.includes('vị')) {
    return renderVisualCard('from-amber-500', 'to-orange-600', '🍽️', 'bg-amber-400/20');
  }

  // 7. Travel & Transport
  if (meaning.includes('xe') || meaning.includes('máy bay') || meaning.includes('sân bay') || meaning.includes('du lịch') || meaning.includes('hộ chiếu') || meaning.includes('khách sạn') || meaning.includes('hành lý') || meaning.includes('đi') || meaning.includes('đến')) {
    return renderVisualCard('from-sky-500', 'to-blue-700', '✈️', 'bg-sky-400/20');
  }

  // 8. Money & Shopping
  if (meaning.includes('tiền') || meaning.includes('giá') || meaning.includes('thanh toán') || meaning.includes('mua') || meaning.includes('bán') || meaning.includes('mãi đơn') || meaning.includes('tính tiền')) {
    return renderVisualCard('from-emerald-500', 'to-green-700', '💵', 'bg-emerald-400/20');
  }

  // 9. Time & Calendar
  if (meaning.includes('thời gian') || meaning.includes('giờ') || meaning.includes('phút') || meaning.includes('ngày') || meaning.includes('tháng') || meaning.includes('năm') || meaning.includes('tuần') || meaning.includes('sáng') || meaning.includes('tối')) {
    return renderVisualCard('from-slate-600', 'to-slate-800', '⏰', 'bg-slate-400/20');
  }

  // 10. Buildings & Places
  if (meaning.includes('nhà') || meaning.includes('bệnh viện') || meaning.includes('trường') || meaning.includes('cửa hàng') || meaning.includes('công ty')) {
    return renderVisualCard('from-indigo-600', 'to-purple-800', '🏠', 'bg-indigo-400/20');
  }

  // 11. Feelings & Emotions
  if (meaning.includes('vui') || meaning.includes('thích') || meaning.includes('yêu') || meaning.includes('chúc')) {
    return renderVisualCard('from-rose-500', 'to-pink-600', '😊', 'bg-rose-400/20');
  }

  // 12. Sports & Fitness
  if (meaning.includes('thể thao') || meaning.includes('chạy') || meaning.includes('vận động')) {
    return renderVisualCard('from-emerald-500', 'to-teal-700', '🏃', 'bg-emerald-400/20');
  }

  // 13. Questions & Doubts
  if (meaning.includes('câu hỏi') || meaning.includes('vấn đề') || meaning.includes('hỏi') || meaning.includes('gì') || meaning.includes('đâu') || meaning.includes('ai') || meaning.includes('sao')) {
    return renderVisualCard('from-purple-500', 'to-indigo-700', '❓', 'bg-purple-400/20');
  }

  // Deterministic Dynamic Fallback for any unknown word:
  // Uses string character sum to assign a unique gradient + symbol so no word looks generic
  let charCodeSum = 0;
  for (let i = 0; i < hanzi.length; i++) {
    charCodeSum += hanzi.charCodeAt(i);
  }
  const dynamicPalettes = [
    { from: 'from-rose-500', to: 'to-red-700', icon: '🌟', glow: 'bg-rose-400/20' },
    { from: 'from-purple-600', to: 'to-indigo-800', icon: '💡', glow: 'bg-purple-400/20' },
    { from: 'from-emerald-600', to: 'to-teal-800', icon: '🍀', glow: 'bg-emerald-400/20' },
    { from: 'from-amber-500', to: 'to-orange-700', icon: '🔖', glow: 'bg-amber-400/20' },
    { from: 'from-cyan-500', to: 'to-blue-700', icon: '💠', glow: 'bg-cyan-400/20' },
    { from: 'from-fuchsia-600', to: 'to-pink-700', icon: '✨', glow: 'bg-fuchsia-400/20' },
    { from: 'from-blue-600', to: 'to-sky-800', icon: '🎯', glow: 'bg-blue-400/20' }
  ];
  const p = dynamicPalettes[charCodeSum % dynamicPalettes.length];
  return renderVisualCard(p.from, p.to, p.icon, p.glow);
}

function renderVisualCard(fromClass, toClass, iconSymbol, glowClass) {
  return `
    <div class="w-full h-full bg-gradient-to-br ${fromClass} ${toClass} flex items-center justify-center p-4 text-center select-none relative overflow-hidden group shadow-inner">
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full ${glowClass} blur-lg group-hover:scale-125 transition-transform duration-500"></div>
      <div class="absolute -left-8 -bottom-8 w-32 h-32 rounded-full ${glowClass} blur-lg group-hover:scale-125 transition-transform duration-500"></div>
      <span class="text-7xl md:text-8xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xl leading-none z-10">${iconSymbol}</span>
    </div>
  `;
}

const DEFAULT_GAME_IMAGE = 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80';

function renderGameView(container, backHandler = null) {
  if (!container) return;

  let allTopics = getAllTopicsList();

  // Create default fallback topic "Nhà hàng & Đồ ăn" matching reference photo if not present
  const restaurantWords = [
    { hanzi: '米饭', pinyin: 'mǐfàn', hanviet: 'Mễ Phạn', meaning: 'cơm' },
    { hanzi: '鸡肉', pinyin: 'jīròu', hanviet: 'Kê Nhục', meaning: 'thịt gà' },
    { hanzi: '水', pinyin: 'shuǐ', hanviet: 'Thủy', meaning: 'nước' },
    { hanzi: '面包', pinyin: 'miànbāo', hanviet: 'Miến Bao', meaning: 'bánh mì' },
    { hanzi: '苹果', pinyin: 'píngguǒ', hanviet: 'Tần Quả', meaning: 'quả táo' },
    { hanzi: '茶', pinyin: 'chá', hanviet: 'Trà', meaning: 'trà' },
    { hanzi: '咖啡', pinyin: 'kāfēi', hanviet: 'Cà Phê', meaning: 'cà phê' },
    { hanzi: '饺子', pinyin: 'jiǎozi', hanviet: 'Giảo Tử', meaning: 'bánh há cảo / sủi cảo' },
    { hanzi: '菜单', pinyin: 'càidān', hanviet: 'Thái Đơn', meaning: 'thực đơn / menu' },
    { hanzi: '买单', pinyin: 'mǎidān', hanviet: 'Mãi Đơn', meaning: 'tính tiền / thanh toán' },
    { hanzi: '服务员', pinyin: 'fúwùyuán', hanviet: 'Phục Vụ Viên', meaning: 'nhân viên phục vụ' }
  ];

  let selectedTopicId = 'restaurant';
  let gameWordsPool = getWordsForTopic(selectedTopicId, allTopics, restaurantWords);

  // Game state
  let maxQuestions = 20;
  let questions = generateQuestions(gameWordsPool, maxQuestions);
  let currentIndex = 0;
  let score = 30; // Matches reference image starting state
  let lives = 3;  // 3 hearts max
  let timerMax = 15;
  let timerCurrent = timerMax;
  let timerInterval = null;
  let isAnswered = false;
  let selectedOptionIndex = -1;
  let hintUsed = false;
  let hintText = '';
  let userAnswersHistory = new Array(maxQuestions).fill(null);

  // Stats
  const realStats = getRealTimeStats();
  const streakDays = realStats.streak || 7;

  function getWordsForTopic(topicId, topics, fallbackWords) {
    if (topicId === 'restaurant') {
      return fallbackWords;
    }
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.words && topic.words.length >= 4) {
      return topic.words;
    }
    // Aggregate all words across topics
    let aggregated = [];
    topics.forEach(t => {
      if (t.words) aggregated = aggregated.concat(t.words);
    });
    if (aggregated.length < 4) aggregated = aggregated.concat(fallbackWords);
    return aggregated;
  }

  function generateQuestions(pool, count) {
    const qList = [];
    const poolSize = pool.length;
    for (let i = 0; i < count; i++) {
      const targetWord = pool[i % poolSize];
      const distractors = [];
      
      // Select 3 random distractors
      const otherWords = pool.filter(w => w.hanzi !== targetWord.hanzi && w.meaning !== targetWord.meaning);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      
      const optionTexts = [targetWord.meaning];
      shuffledOthers.forEach(w => {
        if (optionTexts.length < 4 && !optionTexts.includes(w.meaning)) {
          optionTexts.push(w.meaning);
        }
      });

      // Fill in generic distractors if needed
      const genericDistractors = ['thịt gà', 'cơm', 'nước', 'bánh mì', 'trà sữa', 'cà phê', 'hoa quả', 'canh', 'bánh ngọt'];
      genericDistractors.forEach(gd => {
        if (optionTexts.length < 4 && !optionTexts.includes(gd)) {
          optionTexts.push(gd);
        }
      });

      // Shuffle options A, B, C, D
      const shuffledOptions = [...optionTexts].sort(() => 0.5 - Math.random());
      const correctIdx = shuffledOptions.indexOf(targetWord.meaning);

      qList.push({
        id: i + 1,
        word: targetWord,
        options: shuffledOptions,
        correctIndex: correctIdx,
        imageUrl: ''
      });
    }
    return qList;
  }

  function startTimer() {
    stopTimer();
    timerCurrent = timerMax;
    updateTimerUI();
    timerInterval = setInterval(() => {
      timerCurrent--;
      updateTimerUI();
      if (timerCurrent <= 0) {
        stopTimer();
        handleTimeOut();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerUI() {
    const timerTextEl = document.getElementById('game-timer-text');
    const timerBarEl = document.getElementById('game-timer-bar');
    if (timerTextEl) timerTextEl.innerText = `${timerCurrent}s`;
    if (timerBarEl) {
      const pct = Math.max(0, Math.min(100, (timerCurrent / timerMax) * 100));
      timerBarEl.style.width = `${pct}%`;
    }
  }

  function handleTimeOut() {
    if (isAnswered) return;
    isAnswered = true;
    selectedOptionIndex = -1;
    lives = Math.max(0, lives - 1);
    userAnswersHistory[currentIndex] = { answered: true, isCorrect: false, selectedIdx: -1 };
    renderGameCard();
    renderRightWidgets();
    checkGameOver();
  }

  function checkGameOver() {
    if (lives <= 0) {
      stopTimer();
      showGameOverModal();
    }
  }

  function selectOption(idx) {
    if (isAnswered) return;
    stopTimer();
    isAnswered = true;
    selectedOptionIndex = idx;
    
    const currentQ = questions[currentIndex];
    const isCorrect = (idx === currentQ.correctIndex);

    if (isCorrect) {
      score += 10;
      updateWordSRS(currentQ.word.hanzi, 5);
      if (window.speakZh) window.speakZh(currentQ.word.hanzi);
    } else {
      lives = Math.max(0, lives - 1);
      updateWordSRS(currentQ.word.hanzi, 1);
    }

    userAnswersHistory[currentIndex] = { answered: true, isCorrect, selectedIdx: idx };

    renderGameCard();
    renderRightWidgets();
    checkGameOver();
  }

  function showHint() {
    if (hintUsed || isAnswered) return;
    if (score < 2) {
      alert('Bạn cần ít nhất 2 điểm để dùng gợi ý!');
      return;
    }
    score -= 2;
    hintUsed = true;
    const currentQ = questions[currentIndex];
    hintText = `Gợi ý: Chữ cái đầu của đáp án là "${currentQ.word.meaning.charAt(0).toUpperCase()}"`;
    renderGameCard();
    renderRightWidgets();
  }

  function nextQuestion() {
    if (currentIndex < maxQuestions - 1) {
      currentIndex++;
      loadCurrentQuestion();
    } else {
      stopTimer();
      showVictoryModal();
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      loadCurrentQuestion();
    }
  }

  function shuffleCurrentQuestion() {
    const pool = gameWordsPool;
    const randWord = pool[Math.floor(Math.random() * pool.length)];
    const distractors = pool.filter(w => w.hanzi !== randWord.hanzi).sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.meaning);
    const optionTexts = [randWord.meaning, ...distractors];
    while (optionTexts.length < 4) optionTexts.push('khác');
    const shuffled = optionTexts.sort(() => 0.5 - Math.random());
    
    questions[currentIndex] = {
      id: currentIndex + 1,
      word: randWord,
      options: shuffled,
      correctIndex: shuffled.indexOf(randWord.meaning),
      imageUrl: ''
    };
    loadCurrentQuestion();
  }

  function loadCurrentQuestion() {
    const existing = userAnswersHistory[currentIndex];
    if (existing) {
      isAnswered = existing.answered;
      selectedOptionIndex = existing.selectedIdx;
      stopTimer();
    } else {
      isAnswered = false;
      selectedOptionIndex = -1;
      hintUsed = false;
      hintText = '';
      startTimer();
    }
    renderGameCard();
    renderRightWidgets();
  }

  function renderGameCard() {
    const cardContainer = document.getElementById('vocab-game-card-root');
    if (!cardContainer) return;

    const q = questions[currentIndex];
    const pctProgress = Math.round(((currentIndex + 1) / maxQuestions) * 100);

    const letters = ['A', 'B', 'C', 'D'];

    let optionsHtml = q.options.map((optText, idx) => {
      let btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white text-slate-800 border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 shadow-xs';
      let badgeClass = 'game-option-letter w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-sm transition';
      let iconRight = '';

      if (isAnswered) {
        if (idx === q.correctIndex) {
          btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm';
          badgeClass = 'game-option-letter w-9 h-9 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-xs';
          iconRight = `<span class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">✓</span>`;
        } else if (idx === selectedOptionIndex) {
          btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-sm';
          badgeClass = 'game-option-letter w-9 h-9 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-sm shadow-xs';
          iconRight = `<span class="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">✕</span>`;
        } else {
          btnClass = 'game-option-card flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-slate-50/70 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed';
        }
      }

      return `
        <button class="${btnClass}" data-index="${idx}" ${isAnswered ? 'disabled' : ''}>
          <div class="flex items-center gap-3.5">
            <span class="${badgeClass}">${letters[idx]}</span>
            <span class="font-extrabold text-base tracking-tight">${escapeHtml(optText)}</span>
          </div>
          ${iconRight}
        </button>
      `;
    }).join('');

    let resultBannerHtml = '';
    if (isAnswered) {
      if (selectedOptionIndex === q.correctIndex) {
        resultBannerHtml = `
          <div class="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between animate-fade-in shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                ✓
              </div>
              <div>
                <h4 class="font-black text-base text-emerald-900 leading-tight">Chính xác!</h4>
                <p class="text-xs text-emerald-800 mt-0.5"><span class="font-bold hanzi-font">${q.word.hanzi}</span> (${q.word.pinyin}) nghĩa là <strong class="text-emerald-950 underline decoration-emerald-400 decoration-2">${q.word.meaning}</strong>.</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-extrabold text-xs shadow-2xs whitespace-nowrap">+10 điểm</span>
          </div>
        `;
      } else {
        resultBannerHtml = `
          <div class="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between animate-fade-in shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                ✕
              </div>
              <div>
                <h4 class="font-black text-base text-rose-900 leading-tight">Chưa chính xác!</h4>
                <p class="text-xs text-rose-800 mt-0.5"><span class="font-bold hanzi-font">${q.word.hanzi}</span> (${q.word.pinyin}) đúng nghĩa là <strong class="text-rose-950 underline decoration-rose-400 decoration-2">${q.word.meaning}</strong>.</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-rose-200/80 text-rose-900 font-extrabold text-xs shadow-2xs whitespace-nowrap">-1 mạng</span>
          </div>
        `;
      }
    }

    cardContainer.innerHTML = `
      <!-- Question Progress Header -->
      <div class="flex items-center justify-between mb-4 gap-4">
        <div class="flex items-center gap-3 flex-1">
          <span class="font-black text-sm text-rose-600 whitespace-nowrap">Câu ${currentIndex + 1} / ${maxQuestions}</span>
          <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 shadow-inner">
            <div class="bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 h-3 rounded-full transition-all duration-300" style="width: ${pctProgress}%"></div>
          </div>
          <span class="font-extrabold text-xs text-slate-400 min-w-[32px]">${pctProgress}%</span>
        </div>
        <button id="btn-game-settings" class="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition" title="Cài đặt trò chơi">
          ⚙️
        </button>
      </div>

      <!-- Hint Banner -->
      <div class="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-center gap-2 text-xs text-amber-900 font-extrabold shadow-2xs">
        <span>💡</span>
        <span>${hintText || 'Chọn đáp án đúng cho nghĩa của từ dưới đây!'}</span>
      </div>

      <!-- Main Game Card Content Split -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <!-- Left: Word Display & Audio & Photo -->
        <div class="md:col-span-6 flex flex-col items-center justify-center text-center space-y-3">
          <button class="btn-play-word-audio w-14 h-14 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center text-2xl transition shadow-sm border border-rose-200 active:scale-95 cursor-pointer" title="Nghe phát âm">
            🔊
          </button>

          <div>
            <h2 class="hanzi-font text-5xl md:text-6xl font-black text-red-600 tracking-tight drop-shadow-xs">${escapeHtml(q.word.hanzi)}</h2>
            <div class="flex items-center justify-center gap-1.5 mt-1">
              <span class="pinyin-font text-lg font-bold text-slate-600">${escapeHtml(q.word.pinyin)}</span>
              <button class="btn-play-word-audio text-rose-500 hover:text-rose-700 text-base" title="Phát âm">🔊</button>
            </div>
          </div>

          <div class="w-full max-w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md border-2 border-slate-200/80">
            ${getWordCardIllustration(q.word)}
          </div>
        </div>

        <!-- Right: Multiple Choice Options A, B, C, D -->
        <div class="md:col-span-6 space-y-3">
          ${optionsHtml}
        </div>
      </div>

      <!-- Answer Result Banner -->
      ${resultBannerHtml}

      <!-- Bottom Navigation Action Bar -->
      <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
        <button id="btn-game-prev" class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 shadow-2xs ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
          🔄 Câu trước
        </button>

        <button id="btn-game-next" class="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95">
          <span>${currentIndex === maxQuestions - 1 ? 'Hoàn thành lượt chơi 🎉' : 'Câu tiếp theo ➔'}</span>
        </button>

        <button id="btn-game-shuffle" class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 shadow-2xs" title="Đổi câu hỏi khác">
          🔀 Đổi câu hỏi
        </button>
      </div>
    `;

    // Attach card event handlers
    cardContainer.querySelectorAll('.btn-play-word-audio').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.speakZh) window.speakZh(q.word.hanzi);
      });
    });

    cardContainer.querySelectorAll('.game-option-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        selectOption(idx);
      });
    });

    const prevBtn = document.getElementById('btn-game-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevQuestion);

    const nextBtn = document.getElementById('btn-game-next');
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);

    const shuffleBtn = document.getElementById('btn-game-shuffle');
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCurrentQuestion);
  }

  function renderRightWidgets() {
    const widgetsContainer = document.getElementById('vocab-game-widgets-root');
    if (!widgetsContainer) return;

    // Hearts visualization
    let heartsHtml = '';
    for (let i = 0; i < 3; i++) {
      if (i < lives) {
        heartsHtml += `<span class="text-rose-500 text-xl animate-pulse">❤️</span>`;
      } else {
        heartsHtml += `<span class="text-slate-300 text-xl">🖤</span>`;
      }
    }

    // Days of week streak visualization
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const daysHtml = days.map((d, idx) => {
      const isDone = idx < 6; // Active streak simulation
      return `
        <div class="flex flex-col items-center gap-1">
          <div class="w-6 h-6 rounded-full ${isDone ? 'bg-rose-500 text-white font-extrabold' : 'bg-slate-100 text-slate-400 font-medium'} flex items-center justify-center text-2xs shadow-2xs">
            ${isDone ? '✓' : ''}
          </div>
          <span class="text-3xs text-slate-400 font-bold">${d}</span>
        </div>
      `;
    }).join('');

    widgetsContainer.innerHTML = `
      <!-- Card 1: Score Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-inner border border-amber-200">
            🏆
          </div>
          <div>
            <span class="text-xs font-bold text-slate-500 block">Điểm hiện tại</span>
            <span class="text-3xl font-black text-rose-600 tracking-tight" id="game-score-text">${score}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Lives Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <span>❤️</span> Mạng sống
          </span>
          <div class="flex items-center gap-1.5">
            ${heartsHtml}
          </div>
        </div>
      </div>

      <!-- Card 3: Answer Timer Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <span>⏱️</span> Thời gian trả lời
          </span>
          <span class="text-xl font-black text-slate-800" id="game-timer-text">${timerCurrent}s</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div id="game-timer-bar" class="bg-gradient-to-r from-red-500 to-rose-600 h-2.5 rounded-full transition-all duration-300" style="width: 100%"></div>
        </div>
      </div>

      <!-- Card 4: Hint Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
            <span>💡</span> Gợi ý
          </span>
          <span class="text-slate-300 text-xs font-bold hover:text-slate-500 cursor-pointer">✕</span>
        </div>
        <p class="text-2xs text-slate-500 leading-snug">Xem gợi ý về hình ảnh hoặc chữ cái đầu tiên của từ.</p>
        <button id="btn-use-hint" class="w-full py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-extrabold text-xs transition shadow-2xs active:scale-98 ${hintUsed ? 'opacity-50 cursor-not-allowed' : ''}">
          ${hintUsed ? 'Đã dùng gợi ý' : 'Dùng gợi ý (-2 điểm)'}
        </button>
      </div>

      <!-- Card 5: Win Streak Widget -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔥</span>
            <div>
              <span class="text-2xs font-bold text-slate-400 block uppercase tracking-wider">Chuỗi thắng</span>
              <span class="text-sm font-black text-slate-900">${streakDays} ngày</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pt-1">
          ${daysHtml}
        </div>
      </div>
    `;

    const hintBtn = document.getElementById('btn-use-hint');
    if (hintBtn) hintBtn.addEventListener('click', showHint);
  }

  function showGameOverModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-rose-200">
        <div class="w-20 h-20 rounded-full bg-rose-100 text-rose-600 text-4xl font-black flex items-center justify-center mx-auto shadow-inner border border-rose-200">
          💔
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900">Hết Mạng Sống!</h3>
          <p class="text-xs text-slate-500 mt-1">Đừng nản lòng! Bạn đã đạt được <strong class="text-rose-600 font-extrabold text-sm">${score} điểm</strong> trong lượt chơi này.</p>
        </div>
        <div class="pt-2 flex gap-3">
          <button id="btn-restart-game" class="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md transition">
            🔄 Thử lại ngay
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-restart-game')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      score = 30;
      lives = 3;
      currentIndex = 0;
      userAnswersHistory = new Array(maxQuestions).fill(null);
      questions = generateQuestions(gameWordsPool, maxQuestions);
      loadCurrentQuestion();
    });
  }

  function showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-amber-200">
        <div class="w-20 h-20 rounded-full bg-amber-100 text-amber-500 text-4xl font-black flex items-center justify-center mx-auto shadow-inner border border-amber-200">
          🏆
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900">Xuất Sắc! Hoàn Thành Lượt Chơi!</h3>
          <p class="text-xs text-slate-500 mt-1">Tổng điểm tích lũy: <strong class="text-amber-600 font-extrabold text-base">${score} điểm</strong> ⭐⭐⭐</p>
        </div>
        <div class="pt-2 flex gap-3">
          <button id="btn-new-round" class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm shadow-md transition">
            🎉 Lượt chơi mới
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-new-round')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      score = 30;
      lives = 3;
      currentIndex = 0;
      userAnswersHistory = new Array(maxQuestions).fill(null);
      questions = generateQuestions(gameWordsPool, maxQuestions);
      loadCurrentQuestion();
    });
  }

  // Render Full View Frame
  container.innerHTML = `
    <div class="space-y-6 max-w-7xl mx-auto">
      <!-- Sub-Header Bar (Back button, Topic selector, Stats summary) -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex items-center gap-3">
          <button id="btn-game-back" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 font-extrabold text-xs text-slate-700 transition flex items-center gap-1.5">
            ❮ Quay lại
          </button>
          
          <div class="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
            <span class="text-2xs font-extrabold text-slate-500 uppercase tracking-wider">Chủ đề hiện tại:</span>
            <select id="select-game-topic" class="bg-transparent font-black text-xs text-slate-800 focus:outline-none cursor-pointer">
              <option value="restaurant">🍱 Nhà hàng & Đồ ăn</option>
              ${allTopics.map(t => `<option value="${t.id}">📚 ${escapeHtml(t.name)}</option>`).join('')}
              <option value="all">⚡ Tất cả từ vựng (Tổng hợp)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-xs flex items-center gap-1.5">
            <span>🔥</span> ${streakDays} ngày
          </div>
          <button class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition" title="Thông báo">
            🔔
          </button>
        </div>
      </div>

      <!-- Main Game Arena Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left 8/12: Central Question & Options Card -->
        <div class="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm" id="vocab-game-card-root">
          <!-- Rendered dynamically by renderGameCard() -->
        </div>

        <!-- Right 4/12: Game Status Widgets & Power-ups -->
        <div class="lg:col-span-4 space-y-4" id="vocab-game-widgets-root">
          <!-- Rendered dynamically by renderRightWidgets() -->
        </div>
      </div>
    </div>
  `;

  // Attach Top Bar Handlers
  const backBtn = container.querySelector('#btn-game-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      stopTimer();
      if (typeof backHandler === 'function') {
        backHandler();
      } else if (window.appInstance) {
        window.appInstance.switchTab('dashboard');
      }
    });
  }

  const topicSelect = container.querySelector('#select-game-topic');
  if (topicSelect) {
    topicSelect.addEventListener('change', (e) => {
      selectedTopicId = e.target.value;
      gameWordsPool = getWordsForTopic(selectedTopicId, allTopics, restaurantWords);
      questions = generateQuestions(gameWordsPool, maxQuestions);
      currentIndex = 0;
      userAnswersHistory = new Array(maxQuestions).fill(null);
      loadCurrentQuestion();
    });
  }

  // Initial render launch
  loadCurrentQuestion();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


  // --------------------------------------------------------------------------
  // MODULE: js\views\grammarView.js
  // --------------------------------------------------------------------------

const DEFAULT_GRAMMAR_DATA = [
  { id: 'g1', title: 'Câu với 是 (shì)', desc: 'Dùng để xác định, giới thiệu người hoặc sự vật.', formula: 'A + 是 + B', examples: ['我是学生。 | wǒ shì xuésheng. | (Tôi là học sinh)', '这是我的书。 | zhè shì wǒ de shū. | (Đây là sách của tôi)'] },
  { id: 'g2', title: 'Phủ định với 不 (bù)', desc: 'Dùng để phủ định hành động, trạng thái hoặc thói quen.', formula: '不 + Động từ/Tính từ', examples: ['我不吃辣。 | wǒ bù chī là. | (Tôi không ăn cay)', '他不高。 | tā bù gāo. | (Anh ấy không cao)'] },
  { id: 'g3', title: 'Phủ định với 没/没有 (méi/méiyǒu)', desc: 'Dùng để diễn đạt chưa làm hoặc không có.', formula: '没(有) + Động từ/Danh từ', examples: ['我没有钱。 | wǒ méiyǒu qián. | (Tôi không có tiền)', '他没去学校。 | tā méi qù xuéxiào. | (Anh ấy chưa đến trường)'] },
  { id: 'g4', title: 'Câu hỏi với 吗 (ma)', desc: 'Dùng để tạo câu hỏi Có/Không.', formula: 'Câu trần thuật + 吗？', examples: ['你是越南人吗？ | nǐ shì yuènán rén ma? | (Bạn là người Việt Nam phải không?)', '他来吗？ | tā lái ma? | (Anh ấy có đến không?)'] },
  { id: 'g5', title: 'Câu hỏi A不A', desc: 'Dùng để hỏi lựa chọn khẳng định/phủ định.', formula: 'Động từ/Tính từ + 不 + Động từ/Tính từ', examples: ['你去不去？ | nǐ qù bù qù? | (Bạn có đi không?)', '好不好？ | hǎo bù hǎo? | (Được không?)'] },
  { id: 'g6', title: 'Đại từ nghi vấn', desc: 'Dùng để hỏi người, vật, địa điểm, cách thức và nguyên nhân.', formula: '谁 / 什么 / 哪 / 哪儿 / 怎么 / 为什么', examples: ['他是谁？ | tā shì shéi? | (Anh ấy là ai?)', '你叫什么名字？ | nǐ jiào shénme míngzi? | (Bạn tên là gì?)', '你怎么去？ | nǐ zěnme qù? | (Bạn đi bằng cách nào?)'] },
  { id: 'g7', title: 'Sở hữu với 的 (de)', desc: 'Diễn đạt quan hệ sở hữu hoặc bổ nghĩa.', formula: 'A + 的 + B', examples: ['我的电脑 | wǒ de diànnǎo | (Máy tính của tôi)', '漂亮的衣服 | piàoliang de yīfu | (Quần áo đẹp)'] },
  { id: 'g8', title: '有/没有 (yǒu/méiyǒu)', desc: 'Diễn đạt có hoặc không có.', formula: 'Chủ ngữ + 有/没有 + Tân ngữ', examples: ['我有一个苹果。 | wǒ yǒu yí gè píngguǒ. | (Tôi có một quả táo)', '他没有时间。 | tā méiyǒu shíjiān. | (Anh ấy không có thời gian)'] },
  { id: 'g9', title: '在 (zài)', desc: 'Diễn đạt vị trí hoặc hành động đang diễn ra.', formula: 'Chủ ngữ + 在 + Địa điểm / 在 + Động từ', examples: ['我在家。 | wǒ zài jiā. | (Tôi đang ở nhà)', '他在看书。 | tā zài kàn shū. | (Anh ấy đang đọc sách)'] },
  { id: 'g10', title: 'Câu tồn hiện với 有', desc: 'Diễn đạt tại một nơi có người hoặc sự vật.', formula: 'Địa điểm + 有 + Danh từ', examples: ['桌子上有一个苹果。 | zhuōzi shàng yǒu yí gè píngguǒ. | (Trên bàn có một quả táo)'] },
  { id: 'g11', title: 'Số + lượng từ', desc: 'Diễn đạt số lượng người hoặc sự vật.', formula: 'Số + 个/本/杯/件… + Danh từ', examples: ['一个人 | yí gè rén | (Một người)', '两本书 | liǎng běn shū | (Hai quyển sách)', '三杯茶 | sān bēi chá | (Ba cốc trà)'] },
  { id: 'g12', title: 'Cấu trúc thời gian', desc: 'Diễn đạt thời điểm xảy ra hành động.', formula: 'Chủ ngữ + Thời gian + Động từ / Thời gian + Chủ ngữ + Động từ', examples: ['我明天去北京。 | wǒ míngtiān qù běijīng. | (Ngày mai tôi đi Bắc Kinh)', '明天我去北京。 | míngtiān wǒ qù běijīng. | (Ngày mai tôi đi Bắc Kinh)'] },
  { id: 'g13', title: '想 (xiǎng)', desc: 'Diễn đạt mong muốn hoặc ý định.', formula: '想 + Động từ', examples: ['我想喝水。 | wǒ xiǎng hē shuǐ. | (Tôi muốn uống nước)', '你想去哪儿？ | nǐ xiǎng qù nǎr? | (Bạn muốn đi đâu?)'] },
  { id: 'g14', title: '要 (yào)', desc: 'Diễn đạt muốn, cần hoặc dự định làm việc gì.', formula: '要 + Danh từ/Động từ', examples: ['我要一杯咖啡。 | wǒ yào yì bēi kāfēi. | (Tôi muốn một tách cà phê)', '我要去超市。 | wǒ yào qù chāoshì. | (Tôi cần đi siêu thị)'] },
  { id: 'g15', title: '会 (huì)', desc: 'Diễn đạt kỹ năng đã học hoặc khả năng sẽ xảy ra.', formula: '会 + Động từ', examples: ['我会说汉语。 | wǒ huì shuō hànyǔ. | (Tôi biết nói tiếng Trung)', '明天会下雨。 | míngtiān huì xià yǔ. | (Ngày mai trời sẽ mưa)'] },
  { id: 'g16', title: '能 (néng)', desc: 'Diễn đạt khả năng hoặc điều kiện cho phép thực hiện hành động.', formula: '能 + Động từ', examples: ['我能帮你吗？ | wǒ néng bāng nǐ ma? | (Tôi có thể giúp bạn không?)', '今天我不能来。 | jīntiān wǒ bù néng lái. | (Hôm nay tôi không thể đến)'] },
  { id: 'g17', title: '可以 (kěyǐ)', desc: 'Diễn đạt sự cho phép hoặc khả năng.', formula: '可以 + Động từ', examples: ['你可以进来。 | nǐ kěyǐ jìnlái. | (Bạn có thể vào)', '我可以借你的书吗？ | wǒ kěyǐ jiè nǐ de shū ma? | (Tôi có thể mượn sách của bạn không?)'] },
  { id: 'g18', title: '应该 (yīnggāi)', desc: 'Diễn đạt điều nên làm.', formula: '应该 + Động từ', examples: ['你应该多休息。 | nǐ yīnggāi duō xiūxi. | (Bạn nên nghỉ ngơi nhiều hơn)', '我们应该怎么做？ | wǒmen yīnggāi zěnme zuò? | (Chúng ta nên làm gì?)'] },
  { id: 'g19', title: '得 (děi)', desc: 'Diễn đạt phải hoặc cần phải làm việc gì.', formula: '得 + Động từ', examples: ['我得走了。 | wǒ děi zǒu le. | (Tôi phải đi rồi)', '你得好好学习。 | nǐ děi hǎohǎo xuéxí. | (Bạn phải học tập chăm chỉ)'] },
  { id: 'g20', title: '很/太/真', desc: 'Diễn đạt mức độ của tính chất hoặc trạng thái.', formula: '很/太/真 + Tính từ', examples: ['他很高。 | tā hěn gāo. | (Anh ấy rất cao)', '真漂亮！ | zhēn piàoliang! | (Thật đẹp!)'] },
  { id: 'g21', title: '太…了 (tài…le)', desc: 'Diễn đạt mức độ “quá/rất”.', formula: '太 + Tính từ + 了', examples: ['太好了！ | tài hǎo le! | (Quá tốt rồi!)', '太贵了！ | tài guì le! | (Quá đắt rồi!)'] },
  { id: 'g22', title: 'So sánh với 比 (bǐ)', desc: 'Dùng để so sánh A với B.', formula: 'A + 比 + B + Tính từ', examples: ['我比他高。 | wǒ bǐ tā gāo. | (Tôi cao hơn anh ấy)', '今天比昨天热。 | jīntiān bǐ zuótiān rè. | (Hôm nay nóng hơn hôm qua)'] },
  { id: 'g23', title: '没有…那么…', desc: 'Diễn đạt A không bằng B về một đặc điểm.', formula: 'A + 没有 + B + 那么 + Tính từ', examples: ['我没有他那么高。 | wǒ méiyǒu tā nàme gāo. | (Tôi không cao bằng anh ấy)'] },
  { id: 'g24', title: '一样 (yíyàng)', desc: 'Diễn đạt A và B giống nhau.', formula: 'A + 跟/和 + B + 一样', examples: ['我跟他一样大。 | wǒ gēn tā yíyàng dà. | (Tôi lớn bằng anh ấy)', '这件衣服和那件一样漂亮。 | zhè jiàn yīfu hé nà jiàn yíyàng piàoliang. | (Bộ quần áo này đẹp như bộ kia)'] },
  { id: 'g25', title: '最 (zuì)', desc: 'Diễn đạt mức độ cao nhất “nhất”.', formula: '最 + Tính từ', examples: ['他最高。 | tā zuì gāo. | (Anh ấy cao nhất)', '这是最好吃的菜。 | zhè shì zuì hǎochī de cài. | (Đây là món ăn ngon nhất)'] },
  { id: 'g26', title: 'Trợ từ 了', desc: 'Diễn đạt sự thay đổi trạng thái hoặc tình huống mới.', formula: 'Câu + 了', examples: ['下雨了。 | xià yǔ le. | (Trời mưa rồi)', '我不吃了。 | wǒ bù chī le. | (Tôi không ăn nữa)'] },
  { id: 'g27', title: 'Hoàn thành với 了', desc: 'Diễn đạt hành động đã hoàn thành.', formula: 'Động từ + 了 + Tân ngữ', examples: ['我买了一本书。 | wǒ mǎi le yì běn shū. | (Tôi đã mua một quyển sách)', '他去北京了。 | tā qù běijīng le. | (Anh ấy đã đi Bắc Kinh rồi)'] },
  { id: 'g28', title: 'Kinh nghiệm với 过 (guo)', desc: 'Diễn đạt đã từng trải qua hoặc làm việc gì.', formula: 'Động từ + 过', examples: ['我去过中国。 | wǒ qù guo zhōngguó. | (Tôi đã từng đi Trung Quốc)', '你看过这个电影吗？ | nǐ kàn guo zhège diànyǐng ma? | (Bạn đã từng xem bộ phim này chưa?)'] },
  { id: 'g29', title: '正在/在 (zhèngzài/zài)', desc: 'Diễn đạt hành động đang diễn ra.', formula: '正在/在 + Động từ', examples: ['我在吃饭。 | wǒ zài chī fàn. | (Tôi đang ăn cơm)', '他正在看电视。 | tā zhèngzài kàn diànshì. | (Anh ấy đang xem tivi)'] },
  { id: 'g30', title: '着 (zhe)', desc: 'Diễn đạt trạng thái hoặc hành động đang được duy trì.', formula: 'Động từ + 着', examples: ['门开着。 | mén kāi zhe. | (Cửa đang mở)', '他穿着一件红衣服。 | tā chuān zhe yí jiàn hóng yīfu. | (Anh ấy đang mặc một chiếc áo màu đỏ)'] },
  { id: 'g31', title: '快/要/快要…了', desc: 'Diễn đạt hành động sắp xảy ra.', formula: '快/要/快要 + Động từ + 了', examples: ['火车快要开了。 | huǒchē kuàiyào kāi le. | (Tàu hỏa sắp chạy rồi)', '快下雨了。 | kuài xià yǔ le. | (Sắp mưa rồi)'] },
  { id: 'g32', title: '先…再… (xiān…zài…)', desc: 'Diễn đạt “trước… sau đó…”.', formula: '先 + Hành động 1 + 再 + Hành động 2', examples: ['你先洗手再吃饭。 | nǐ xiān xǐ shǒu zài chī fàn. | (Bạn rửa tay trước rồi sau đó ăn cơm)'] },
  { id: 'g33', title: '一边…一边… (yìbiān…yìbiān…)', desc: 'Diễn đạt hai hành động xảy ra đồng thời.', formula: '一边 + V1 + 一边 + V2', examples: ['他一边吃饭一边看电视。 | tā yìbiān chī fàn yìbiān kàn diànshì. | (Anh ấy vừa ăn cơm vừa xem tivi)'] },
  { id: 'g34', title: '一…就… (yī…jiù…)', desc: 'Diễn đạt “vừa… thì/ngay…”.', formula: '一 + Hành động 1 + 就 + Hành động 2', examples: ['他一回家就做饭。 | tā yì huí jiā jiù zuò fàn. | (Anh ấy vừa về nhà là nấu ăn ngay)'] },
  { id: 'g35', title: '因为…所以… (yīnwèi…suǒyǐ…)', desc: 'Diễn đạt quan hệ nguyên nhân–kết quả.', formula: '因为 + Nguyên nhân + 所以 + Kết quả', examples: ['因为下雨，所以我们不去。 | yīnwèi xià yǔ, suǒyǐ wǒmen bú qù. | (Bởi vì trời mưa nên chúng tôi không đi)'] },
  { id: 'g36', title: '虽然…但是… (suīrán…dànshì…)', desc: 'Diễn đạt “tuy… nhưng…”.', formula: '虽然 + A + 但是 + B', examples: ['虽然很累，但是他很开心。 | suīrán hěn lèi, dànshì tā hěn kāixīn. | (Mặc dù rất mệt nhưng anh ấy rất vui)'] },
  { id: 'g37', title: '如果…就… (rúguǒ…jiù…)', desc: 'Diễn đạt “nếu… thì…”.', formula: '如果 + Điều kiện + 就 + Kết quả', examples: ['如果你去，我就去。 | rúguǒ nǐ qù, wǒ jiù qù. | (Nếu bạn đi, tôi sẽ đi)'] },
  { id: 'g38', title: '除了…以外… (chúle…yǐwài…)', desc: 'Diễn đạt “ngoài… ra”.', formula: '除了 + A + 以外 + …', examples: ['除了我以外，大家都去了。 | chúle wǒ yǐwài, dàjiā dōu qù le. | (Ngoài tôi ra, mọi người đều đã đi)'] },
  { id: 'g39', title: '又…又… (yòu…yòu…)', desc: 'Diễn đạt “vừa… vừa…”.', formula: '又 + Tính từ/Động từ + 又 + Tính từ/Động từ', examples: ['这个苹果又大又甜。 | zhège píngguǒ yòu dà yòu tián. | (Quả táo này vừa to vừa ngọt)', '他又聪明又帅。 | tā yòu cōngmíng yòu shuài. | (Anh ấy vừa thông minh vừa đẹp trai)'] },
  { id: 'g40', title: '越来越… (yuèláiyuè…)', desc: 'Diễn đạt “ngày càng…”.', formula: '越来越 + Tính từ/Trạng thái', examples: ['天气越来越热了。 | tiānqì yuèláiyuè rè le. | (Thời tiết ngày càng nóng)', '他的汉语越来越好。 | tā de hànyǔ yuèláiyuè hǎo. | (Tiếng Trung của anh ấy ngày càng tốt)'] },
  { id: 'g41', title: '越…越… (yuè…yuè…)', desc: 'Diễn đạt “càng… càng…”.', formula: '越 + A + 越 + B', examples: ['雨越下越大。 | yǔ yuè xià yuè dà. | (Mưa càng lúc càng lớn)', '东西越便宜越好。 | dōngxi yuè piányi yuè hǎo. | (Đồ càng rẻ càng tốt)'] },
  { id: 'g42', title: 'Câu 把 (bǎ)', desc: 'Nhấn mạnh cách xử lý hoặc tác động lên tân ngữ.', formula: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác', examples: ['请把门打开。 | qǐng bǎ mén dǎkāi. | (Vui lòng mở cửa)', '我把书看完了。 | wǒ bǎ shū kàn wán le. | (Tôi đã đọc xong sách rồi)'] },
  { id: 'g43', title: 'Câu 被 (bèi)', desc: 'Diễn đạt câu bị động.', formula: 'Chủ ngữ + 被 + Tác nhân + Động từ', examples: ['苹果被我吃了。 | píngguǒ bèi wǒ chī le. | (Quả táo đã bị tôi ăn rồi)', '我的钱包被偷了。 | wǒ de qiánbāo bèi tōu le. | (Ví của tôi bị trộm rồi)'] },
  { id: 'g44', title: 'Bổ ngữ kết quả', desc: 'Diễn đạt kết quả đạt được sau hành động.', formula: 'Động từ + 完/到/懂/好/见…', examples: ['我看完了。 | wǒ kàn wán le. | (Tôi đã xem xong rồi)', '我听懂了。 | wǒ tīng dǒng le. | (Tôi đã nghe hiểu rồi)'] },
  { id: 'g45', title: 'Bổ ngữ xu hướng', desc: 'Diễn đạt hướng chuyển động của hành động.', formula: 'Động từ + 来/去/上/下/进/出/回/过/起…', examples: ['他走进来了。 | tā zǒu jìnlái le. | (Anh ấy bước vào trong rồi)', '请拿过去。 | qǐng ná guòqù. | (Vui lòng mang qua đó)'] },
  { id: 'g46', title: 'Bổ ngữ khả năng', desc: 'Diễn đạt có hoặc không có khả năng đạt được kết quả.', formula: 'Động từ + 得/不 + Bổ ngữ', examples: ['我听得懂。 | wǒ tīng de dǒng. | (Tôi có thể nghe hiểu)', '我看不见。 | wǒ kàn bú jiàn. | (Tôi không thể nhìn thấy)'] },
  { id: 'g47', title: 'Bổ ngữ mức độ với 得 (de)', desc: 'Mô tả mức độ hoặc trạng thái của hành động.', formula: 'Động từ + 得 + Tính từ/Bổ ngữ', examples: ['他跑得很快。 | tā pǎo de hěn kuài. | (Anh ấy chạy rất nhanh)', '你做得很好。 | nǐ zuò de hěn hǎo. | (Bạn làm rất tốt)'] },
  { id: 'g48', title: '让/叫 (ràng/jiào)', desc: 'Diễn đạt để, bảo hoặc yêu cầu ai làm việc gì.', formula: '让/叫 + Người + Động từ', examples: ['妈妈让我去买东西。 | māma ràng wǒ qù mǎi dōngxi. | (Mẹ bảo tôi đi mua đồ)', '他叫我过来。 | tā jiào wǒ guòlái. | (Anh ấy gọi tôi qua đây)'] },
  { id: 'g49', title: '给 (gěi)', desc: 'Diễn đạt cho hoặc thực hiện hành động hướng tới ai đó.', formula: '给 + Người + Danh từ/Động từ hoặc Chủ ngữ + 给 + Người + Động từ', examples: ['我给你一本书。 | wǒ gěi nǐ yì běn shū. | (Tôi đưa cho bạn một quyển sách)', '请给我打电话。 | qǐng gěi wǒ dǎ diànhuà. | (Vui lòng gọi điện cho tôi)'] },
  { id: 'g50', title: '对…来说 (duì…láishuō)', desc: 'Diễn đạt “đối với… mà nói”.', formula: '对 + Người/Sự vật + 来说 + Nhận xét', examples: ['对我来说，汉语不难。 | duì wǒ lái shuō, hànyǔ bù nán. | (Đối với tôi mà nói, tiếng Trung không khó)'] }
];

function getStoredGrammarData() {
  try {
    const raw = localStorage.getItem('hanzo_grammar_list_v2');
    const list = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      localStorage.setItem('hanzo_grammar_list_v2', JSON.stringify(DEFAULT_GRAMMAR_DATA));
      return DEFAULT_GRAMMAR_DATA;
    }
    return list;
  } catch (e) {
    return DEFAULT_GRAMMAR_DATA;
  }
}

function saveStoredGrammarData(data) {
  try {
    localStorage.setItem('hanzo_grammar_list_v2', JSON.stringify(data));
  } catch (e) {}
}

function renderGrammarView(container) {
  const grammarData = getStoredGrammarData();
  let currentFilter = 'all'; // 'all' | 'mastered' | 'learning' | 'unlearned'
  let currentHskFilter = 'all'; // 'all' | 'HSK 1' | ...

  // Calculate mastery statistics
  const masteredCount = grammarData.filter(g => g.masteryLevel >= 4).length;
  const learningCount = grammarData.filter(g => g.masteryLevel > 0 && g.masteryLevel < 4).length;
  const unlearnedCount = grammarData.filter(g => !g.masteryLevel || g.masteryLevel === 0).length;

  const stats = {
    total: grammarData.length,
    learned: masteredCount + learningCount,
    mastered: masteredCount,
    score: grammarData.reduce((acc, g) => acc + (g.score || 0), 0)
  };

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="font-black text-2xl sm:text-3xl text-red-950 tracking-tight flex items-center gap-2">
          <span>📚</span> <span>Học Ngữ Pháp</span>
        </h1>
        <p class="text-xs text-slate-500 font-semibold mt-1">Hệ thống tổng hợp các cấu trúc ngữ pháp Tiếng Trung HSK kèm ví dụ minh họa</p>
      </div>
      <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <!-- Xuất Excel -->
        <button id="btn-export-grammar-excel" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Xuất toàn bộ danh sách cấu trúc ngữ pháp ra file Excel (.csv UTF-8)">
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#107C41"/>
            <path d="M13.8 12L17.5 17.5H14.9L12.4 13.7L9.9 17.5H7.3L11 12L7.5 6.5H10.1L12.4 10.1L14.7 6.5H17.3L13.8 12Z" fill="white"/>
          </svg>
          <span>Xuất Excel</span>
        </button>

        <!-- Nhập Excel -->
        <button id="btn-import-grammar-excel" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Tạo mới hàng loạt cấu trúc ngữ pháp từ tệp Excel (.csv)">
          <svg class="w-5 h-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          <span>Nhập Excel</span>
        </button>
        <input type="file" id="grammar-excel-file-input" accept=".csv,.txt" class="hidden" />

        <!-- Mẫu -->
        <button id="btn-download-grammar-template" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Tải file Excel mẫu hướng dẫn cấu trúc dữ liệu">
          <svg class="w-5 h-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <span>Mẫu</span>
        </button>

        <!-- Quy Tắc -->
        <button id="btn-open-mastery-guide" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Xem bảng quy tắc đánh giá mức độ thành thạo ngữ pháp">
          <svg class="w-5 h-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          <span>Quy Tắc</span>
        </button>

        <!-- Mini-Game -->
        <button id="btn-start-global-grammar-game" class="btn bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/35 hover:shadow-xl hover:shadow-red-500/45 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap" title="Luyện tập ngẫu nhiên ví dụ từ tất cả cấu trúc ngữ pháp">
          <svg class="w-5 h-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 1c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span>Mini-Game</span>
        </button>

        <!-- Tạo Cấu Trúc Mới -->
        <button id="btn-create-grammar" class="btn bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/35 hover:shadow-xl hover:shadow-red-500/45 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap" title="Tạo mới cấu trúc ngữ pháp">
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="white"/>
            <path d="M12 7.5v9M7.5 12h9" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span>Tạo Cấu Trúc Mới</span>
        </button>
      </div>
    </div>

        <!-- Grammar Analytics Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <!-- Card 1: Cấu trúc đã học -->
      <div class="glass-panel p-4 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/70 via-white to-rose-50/50 shadow-sm hover:shadow-md transition flex items-center justify-between relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div>
            <div class="text-2xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <span>CẤU TRÚC ĐÃ HỌC</span>
              <svg class="w-3.5 h-3.5 text-slate-400 cursor-pointer inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" title="Số lượng cấu trúc ngữ pháp bạn đã bắt đầu ôn luyện">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/>
              </svg>
            </div>
            <div class="mt-0.5 flex items-baseline gap-1">
              <span class="text-2xl font-black text-red-950 font-mono">${stats.learned}</span>
              <span class="text-slate-400 font-bold text-sm font-mono">/ ${stats.total}</span>
            </div>
          </div>
        </div>
        <div class="flex items-end gap-1 opacity-25 shrink-0">
          <div class="w-1.5 h-4 bg-red-500 rounded-full"></div>
          <div class="w-1.5 h-6 bg-red-500 rounded-full"></div>
          <div class="w-1.5 h-8 bg-red-500 rounded-full"></div>
          <div class="w-1.5 h-5 bg-red-500 rounded-full"></div>
        </div>
      </div>

      <!-- Card 2: Điểm số luyện tập -->
      <div class="glass-panel p-4 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-amber-50/60 via-white to-rose-50/40 shadow-sm hover:shadow-md transition flex items-center justify-between relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-400/35 shrink-0">
            <svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
          <div>
            <div class="text-2xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <span>ĐIỂM SỐ LUYỆN TẬP</span>
              <svg class="w-3.5 h-3.5 text-slate-400 cursor-pointer inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" title="Tổng điểm tích lũy từ các bài mini-game ngữ pháp">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/>
              </svg>
            </div>
            <div class="mt-0.5">
              <span class="text-2xl font-black text-red-950 font-mono">${stats.score}</span>
            </div>
          </div>
        </div>
        <div class="flex items-end gap-1 opacity-25 shrink-0">
          <div class="w-1.5 h-3 bg-amber-500 rounded-full"></div>
          <div class="w-1.5 h-5 bg-amber-500 rounded-full"></div>
          <div class="w-1.5 h-7 bg-amber-500 rounded-full"></div>
        </div>
      </div>

      <!-- Card 3: Tùy chỉnh thử thách -->
      <div id="btn-launch-challenge-card" class="glass-panel p-4 rounded-3xl border border-rose-300/80 bg-gradient-to-r from-red-50/90 via-rose-100/70 to-red-100/80 shadow-md hover:shadow-lg hover:scale-[1.01] transition flex items-center justify-between cursor-pointer group relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/30 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </div>
          <div>
            <div class="text-xs font-black uppercase text-red-950 tracking-tight leading-tight">
              TÙY CHỈNH THỬ THÁCH
            </div>
            <div class="text-2xs font-semibold text-slate-600 mt-0.5">
              Chọn Cấu Trúc & Ôn Luyện
            </div>
          </div>
        </div>
        <div class="w-9 h-9 rounded-full bg-white text-red-600 shadow-md flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Content Header, Banner & Filters -->
    <div class="bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-red-100/60 rounded-3xl p-5 border border-rose-200/70 shadow-sm relative overflow-hidden mb-6">
      <div class="flex flex-col lg:flex-row items-stretch gap-6 relative z-10">
        
        <!-- Left Side: Title, Subtitle, Watermark & Mastery Filters -->
        <div class="flex-1 flex flex-col justify-between space-y-4 relative">
          <!-- Title & Subtitle block -->
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-11 h-11 rounded-2xl bg-red-100/90 flex justify-center items-center text-red-600 shrink-0 shadow-2xs">
              <svg class="w-6 h-6 text-red-600 fill-current" viewBox="0 0 24 24">
                <path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
              </svg>
            </div>
            <div class="h-8 w-px bg-rose-300/60"></div>
            <div>
              <h2 class="font-black text-xl text-red-950 tracking-tight leading-tight">Các Cấu Trúc Trọng Tâm</h2>
              <p class="text-2xs font-semibold text-slate-500 mt-0.5">Học theo chủ đề và luyện tập hiệu quả hơn</p>
            </div>

            <!-- Watermark Pushpin inside left column -->
            <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none text-red-300 hidden sm:block">
              <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
              </svg>
            </div>
          </div>

          <!-- Mastery Filter Tabs -->
          <div class="flex items-center gap-2.5 overflow-x-auto pb-0.5 relative z-10" id="grammar-filter-tabs">
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-bold text-xs shadow-md shadow-red-500/30 flex items-center gap-2 cursor-pointer active-filter whitespace-nowrap" data-filter="all">
              <svg class="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
              <span>Tất Cả (${grammarData.length})</span>
            </button>
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap" data-filter="mastered">
              <span class="text-amber-500 text-sm">🏆</span>
              <span>Đã Thành Thạo (${masteredCount})</span>
            </button>
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap" data-filter="learning">
              <span class="text-emerald-500 text-sm">🌱</span>
              <span>Đang Học (${learningCount})</span>
            </button>
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap" data-filter="unlearned">
              <span class="text-purple-500 text-sm">🌙</span>
              <span>Chưa Ôn (${unlearnedCount})</span>
            </button>
          </div>
        </div>

        <!-- Middle Vertical Divider Line -->
        <div class="hidden lg:block w-px bg-rose-200/90 my-1 self-stretch"></div>

        <!-- Right Side: Search Input & HSK Quick Filter Tabs -->
        <div class="flex-1 flex flex-col justify-between space-y-4">
          <!-- Search Bar -->
          <div class="relative w-full">
            <div class="flex items-center bg-white rounded-full border border-rose-200/90 shadow-sm pl-4 pr-1.5 py-1.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <svg class="w-4 h-4 text-red-500 shrink-0 mr-2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" id="search-grammar-input" class="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" placeholder="Tìm kiếm ngữ pháp..." />
              <button type="button" id="btn-search-grammar-trigger" class="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick HSK Filter Buttons -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5" id="grammar-hsk-filter-tabs">
            <span class="text-2xs font-extrabold text-red-900/80 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <span>🏷️</span> <span>Cấp độ HSK:</span>
            </span>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-extrabold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-xs cursor-pointer active-hsk-filter whitespace-nowrap transition-all" data-hsk="all">Tất cả HSK</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 1">HSK 1</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 2">HSK 2</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 3">HSK 3</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 4">HSK 4</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 5">HSK 5</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 6">HSK 6</button>
          </div>
        </div>

      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10" id="grammar-cards-container">
      ${grammarData.map((g, idx) => renderCard(g, idx)).join('')}
    </div>

    <!-- Practice Config Modal -->
    <div id="grammar-config-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md shrink-0">
          <div class="flex items-center gap-2.5 font-bold text-lg">
            <span class="text-2xl">🎯</span>
            <div>
              <h3 class="font-black text-lg leading-tight text-white">Tùy Chỉnh Ôn Luyện Ngữ Pháp</h3>
              <p class="text-2xs text-red-100 font-normal">Chọn cấu trúc & chế độ kiểm tra phù hợp với bạn</p>
            </div>
          </div>
          <button id="btn-close-grammar-config" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6 overflow-y-auto grow">
          <!-- Mode Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">1. Chọn Chế Độ Luyện Tập *</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label id="lbl-mode-random" class="config-mode-card flex items-start gap-3 p-4 rounded-2xl border-2 border-red-500 bg-red-50/40 cursor-pointer hover:shadow-sm transition">
                <input type="radio" name="practice-order-mode" value="random" checked class="mt-1 text-red-600 focus:ring-red-500" />
                <div>
                  <div class="font-black text-slate-800 text-sm flex items-center gap-1.5">🔀 Kiểm Tra Ngẫu Nhiên</div>
                  <div class="text-2xs text-slate-500 font-medium mt-0.5">Trộn ngẫu nhiên các câu ví dụ từ những cấu trúc đã chọn.</div>
                </div>
              </label>
              <label id="lbl-mode-sequential" class="config-mode-card flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white cursor-pointer hover:border-red-300 transition">
                <input type="radio" name="practice-order-mode" value="sequential" class="mt-1 text-red-600 focus:ring-red-500" />
                <div>
                  <div class="font-black text-slate-800 text-sm flex items-center gap-1.5">➡️ Kiểm Tra Tuần Tự (Chủ Đề Liên Quan)</div>
                  <div class="text-2xs text-slate-500 font-medium mt-0.5">Kiểm tra lần lượt theo thứ tự chủ đề liên quan (Căn bản -> Phủ định -> Bổ ngữ...).</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Question Count Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">2. Số Lượng Câu Ví Dụ Luyện Tập</label>
            <div class="flex items-center gap-2.5 flex-wrap" id="config-count-options">
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer" data-count="5">5 Câu</button>
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border-2 border-red-500 bg-red-50 font-black text-xs text-red-800 shadow-2xs cursor-pointer active-count" data-count="10">10 Câu (Mặc định)</button>
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer" data-count="20">20 Câu</button>
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer" data-count="all">Tất Cả Câu</button>
            </div>
          </div>

          <!-- Grammar Structures Selector -->
          <div>
            <div class="flex justify-between items-center mb-2.5">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500">3. Tùy Chọn Cấu Trúc Ngữ Pháp (<span id="config-selected-count" class="text-red-600">0</span>/<span id="config-total-count">0</span>)</label>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-config-select-all" class="text-2xs font-bold text-red-600 hover:underline cursor-pointer">Chọn Tất Cả</button>
                <span class="text-slate-300">|</span>
                <button type="button" id="btn-config-deselect-all" class="text-2xs font-bold text-slate-400 hover:underline cursor-pointer">Bỏ Chọn Tất Cả</button>
              </div>
            </div>

            <div class="relative mb-3">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input type="text" id="config-search-grammar" class="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-red-400" placeholder="Lọc nhanh tên cấu trúc..." />
            </div>

            <div id="config-grammar-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <!-- Checkboxes dynamically rendered -->
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button type="button" id="btn-cancel-grammar-config" class="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition text-sm cursor-pointer">Hủy</button>
          <button type="button" id="btn-start-configured-game" class="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-200 transition text-sm cursor-pointer">
            <span>🎮</span> <span>Bắt Đầu Ôn Luyện</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Game Modal -->
    <div id="grammar-game-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-100 my-auto">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-sm">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🧩</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Luyện Tập Ngữ Pháp</h3>
              <div id="grammar-game-badge" class="text-2xs font-extrabold text-red-100 tracking-wide uppercase">Tất cả cấu trúc</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div id="grammar-game-streak" class="flex items-center gap-1 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full border border-white/30 shadow-2xs">
              <span>🔥</span> <span id="game-streak-count">0</span>
            </div>
            <button id="btn-close-grammar-game" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="text-2xs font-extrabold uppercase tracking-wider text-slate-400" id="game-progress-label">Câu 1</span>
            <button id="btn-game-tts" class="text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer" title="Nghe phát âm chuẩn tiếng Trung">
              <span>🔊</span> <span>Nghe đọc</span>
            </button>
          </div>

          <div class="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 relative">
            <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ý nghĩa câu (Tiếng Việt):</div>
            <div id="grammar-game-meaning" class="text-base sm:text-lg font-bold text-slate-800 italic leading-snug"></div>
          </div>

          <div class="mb-5">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp xếp câu Tiếng Trung:</span>
              <button id="btn-toggle-pinyin-hint" class="text-2xs font-bold text-blue-600 hover:underline cursor-pointer">👁️ Hiện Pinyin</button>
            </div>
            
            <div id="grammar-game-answer-area" class="flex flex-wrap gap-2 min-h-[64px] p-3.5 bg-red-50/40 rounded-2xl border-2 border-dashed border-red-200/90 items-center transition-all duration-300">
            </div>
          </div>

          <div class="mb-6">
            <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nhấp vào từ bên dưới để chọn:</div>
            <div id="grammar-game-options-area" class="flex flex-wrap gap-2 min-h-[50px] p-2 bg-slate-50 rounded-2xl border border-slate-200/70 items-center">
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
            <div id="grammar-game-feedback" class="font-bold text-sm sm:text-base transition-all duration-300"></div>
            <div class="flex items-center gap-2 shrink-0">
              <button id="btn-check-grammar-game" class="btn btn-primary bg-red-600 hover:bg-red-700 font-bold px-6 py-2.5 rounded-xl text-white shadow-md shadow-red-200 transition cursor-pointer text-sm">Kiểm tra</button>
              <button id="btn-next-grammar-game" class="btn bg-rose-600 hover:bg-rose-700 font-bold px-6 py-2.5 rounded-xl text-white shadow-md shadow-rose-200 transition cursor-pointer text-sm hidden">Câu Tiếp Theo ➔</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grammar Edit/Create Modal -->
    <div id="grammar-edit-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto">
        <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2 font-bold text-lg">
            <span id="grammar-modal-icon">✏️</span> <span id="grammar-modal-title-text">Chỉnh Sửa Cấu Trúc Ngữ Pháp</span>
          </div>
          <button id="btn-close-grammar-edit" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <input type="hidden" id="edit-grammar-id" />

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tên Cấu Trúc Ngữ Pháp *</label>
            <input type="text" id="edit-grammar-title" class="form-control font-bold text-red-700 text-base border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500" required placeholder="v.d. Câu với 是 (shì)" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Giải thích & Cách dùng *</label>
            <textarea id="edit-grammar-desc" class="form-control text-slate-700 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500" rows="2" placeholder="Dùng để xác định, giới thiệu..."></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Cấp độ HSK *</label>
              <select id="edit-grammar-hsk" class="form-control font-bold text-amber-800 border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500 cursor-pointer bg-amber-50/30">
                <option value="HSK 1">HSK 1</option>
                <option value="HSK 2">HSK 2</option>
                <option value="HSK 3">HSK 3</option>
                <option value="HSK 4">HSK 4</option>
                <option value="HSK 5">HSK 5</option>
                <option value="HSK 6">HSK 6</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Công thức Cấu trúc *</label>
              <input type="text" id="edit-grammar-formula" class="form-control font-bold text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500" placeholder="v.d. A + 是 + B" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span>📝</span> <span>Các Ví Dụ Ứng Dụng (Dạng Văn Bản Multiline)</span>
              </span>
              <span class="text-2xs text-slate-400 font-normal">Dòng 1: Chữ Hán (Đỏ) | Dòng 2: Pinyin (Xanh) | Dòng 3: Dịch</span>
            </label>
            
            <div id="grammar-multiline-examples-editor" class="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 min-h-[180px] space-y-3">
              <!-- Dynamic Multiline Example Blocks -->
            </div>

            <div class="flex justify-between items-center mt-3">
              <button type="button" id="btn-add-multiline-example-block" class="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1">
                <span>➕</span> <span>Thêm Ví Dụ Mới</span>
              </button>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button type="button" id="btn-delete-grammar-in-modal" class="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition cursor-pointer text-sm hidden flex items-center gap-1.5">
            <span>🗑️</span> <span>Xóa Cấu Trúc</span>
          </button>
          <div class="flex justify-end items-center gap-3 ml-auto">
            <button type="button" id="btn-cancel-grammar-edit" class="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer text-sm">Hủy</button>
            <button type="button" id="btn-save-grammar-edit" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md shadow-red-200 transition cursor-pointer text-sm">
              <span>💾</span> <span id="grammar-save-btn-text">Lưu Cấu Trúc Ngữ Pháp</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mastery Rules Guide Modal -->
    <div id="grammar-mastery-guide-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-auto flex flex-col">
        <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2.5 font-bold text-lg">
            <span class="text-2xl">📊</span>
            <div>
              <h3 class="font-black text-lg leading-tight">Quy Tắc Đánh Giá Mức Độ Thành Thạo</h3>
              <p class="text-2xs text-red-100 font-normal">Tiêu chuẩn phân cấp & chấm điểm ngữ pháp</p>
            </div>
          </div>
          <button id="btn-close-mastery-guide" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <div class="p-6 space-y-3.5">
          <div class="flex items-center gap-3 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200">
            <div class="text-2xl shrink-0">🏆</div>
            <div>
              <div class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">Chuyên Gia (85% - 100%) <span class="text-amber-500">⭐⭐⭐⭐⭐</span></div>
              <div class="text-2xs text-amber-800 font-medium mt-0.5">Đạt tỷ lệ đúng từ 85% trở lên và hoàn thành tối thiểu 3 lượt làm bài tập.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200">
            <div class="text-2xl shrink-0">✨</div>
            <div>
              <div class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">Thành Thạo (70% - 84%) <span class="text-emerald-500">⭐⭐⭐⭐☆</span></div>
              <div class="text-2xs text-emerald-800 font-medium mt-0.5">Đạt tỷ lệ đúng từ 70% đến 84% qua các đợt làm bài tập ví dụ.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200">
            <div class="text-2xl shrink-0">👍</div>
            <div>
              <div class="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">Đạt Yêu Cầu (50% - 69%) <span class="text-blue-500">⭐⭐⭐☆☆</span></div>
              <div class="text-2xs text-blue-800 font-medium mt-0.5">Đạt tỷ lệ đúng từ 50% trở lên. Cần luyện tập thêm để nâng cao phản xạ.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-rose-50/90 rounded-2xl border border-rose-200">
            <div class="text-2xl shrink-0">🌱</div>
            <div>
              <div class="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">Mới Bắt Đầu (< 50%) <span class="text-rose-500">⭐☆☆☆☆</span></div>
              <div class="text-2xs text-rose-800 font-medium mt-0.5">Đã thực hiện bài làm nhưng tỷ lệ chính xác dưới 50%. Cần xem lại ví dụ.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div class="text-2xl shrink-0">⚪</div>
            <div>
              <div class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">Chưa Ôn Luyện (0%) <span class="text-slate-400">☆☆☆☆☆</span></div>
              <div class="text-2xs text-slate-500 font-medium mt-0.5">Chưa từng tham gia làm bài tập Mini-Game cho cấu trúc ngữ pháp này.</div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button type="button" id="btn-dismiss-mastery-guide" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition cursor-pointer">Đã Hiểu</button>
        </div>
      </div>
    </div>

    <!-- Excel Template & Import Guide Modal -->
    <div id="grammar-excel-template-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2.5 font-bold text-lg">
            <span class="text-2xl">📝</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Tạo & Tải Mẫu File Excel Import Ngữ Pháp</h3>
              <p class="text-2xs text-indigo-100 font-normal">Định dạng chuẩn để thêm mới hàng loạt hàng chục cấu trúc ngữ pháp</p>
            </div>
          </div>
          <button id="btn-close-excel-template-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
          <div class="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200 leading-relaxed text-indigo-950 font-medium">
            💡 <strong>Hướng dẫn:</strong> Bấm nút <strong>"Tải Tệp Excel Mẫu"</strong> bên dưới để tải file về máy, mở bằng <strong>Microsoft Excel</strong> hoặc <strong>Google Sheets</strong>, điền dữ liệu theo các cột hướng dẫn, sau đó quay lại ứng dụng bấm <strong>"Nhập Excel"</strong> để tự động thêm mới hàng loạt!
          </div>

          <!-- Table schema columns explanation -->
          <div>
            <h4 class="font-extrabold text-slate-800 uppercase tracking-wider text-2xs mb-2">Cấu Trúc Các Cột Trong Tệp Excel Mẫu:</h4>
            <div class="space-y-2">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 1: Tên Cấu Trúc Ngữ Pháp</span>
                  <span class="text-2xs text-rose-500 font-bold ml-1.5">* (Bắt buộc)</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Tên tiêu đề cấu trúc ngữ pháp (Tiếng Trung + Pinyin hoặc Hán Việt)</div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">Ví dụ: Câu với 比如 (bǐrú)</div>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 2: Mô Tả / Ý Nghĩa</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Giải thích ý nghĩa và cách dùng của cấu trúc</div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">Ví dụ: Dùng để đưa ra ví dụ...</div>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 3: Công Thức Cấu Trúc</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Công thức ghép câu chi tiết</div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">Ví dụ: Mệnh đề + 比如 + Danh từ</div>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 4: Các Ví Dụ Ứng Dụng (Dạng Multiline)</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Nhập nhiều dòng trực tiếp trong ô Excel. Mỗi ví dụ gồm 3 dòng liên tiếp: <code>Dòng 1: Câu Hán</code> | <code>Dòng 2: Pinyin</code> | <code>Dòng 3: Dịch Việt</code></div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">1. 我是学生。<br/>wǒ shì xuésheng.<br/>Tôi là học sinh</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <button type="button" id="btn-close-template-modal-footer" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition text-xs cursor-pointer w-full sm:w-auto">Đóng</button>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button type="button" id="btn-trigger-import-modal" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-300 font-extrabold hover:bg-blue-100 transition text-xs cursor-pointer flex items-center gap-1">
              <span>📥</span> <span>Nhập File Excel Của Bạn</span>
            </button>
            <button type="button" id="btn-download-sample-excel-now" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition text-xs cursor-pointer">
              <span>📥</span> <span>Tải Tệp Excel Mẫu (.csv)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Export Excel Button
  const btnExportExcel = container.querySelector('#btn-export-grammar-excel');
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      exportGrammarToExcel();
    });
  }

  // Import Excel Button & File Input
  const btnImportExcel = container.querySelector('#btn-import-grammar-excel');
  const excelFileInput = container.querySelector('#grammar-excel-file-input');
  const btnDownloadTemplate = container.querySelector('#btn-download-grammar-template');

  // Excel Template Modal Elements
  const excelTemplateModal = container.querySelector('#grammar-excel-template-modal');
  const btnCloseTemplateModal = container.querySelector('#btn-close-excel-template-modal');
  const btnCloseTemplateModalFooter = container.querySelector('#btn-close-template-modal-footer');
  const btnDownloadSampleNow = container.querySelector('#btn-download-sample-excel-now');
  const btnTriggerImportModal = container.querySelector('#btn-trigger-import-modal');

  const openTemplateModal = () => {
    excelTemplateModal?.classList.remove('hidden');
    excelTemplateModal?.classList.add('flex');
  };
  const closeTemplateModal = () => {
    excelTemplateModal?.classList.add('hidden');
    excelTemplateModal?.classList.remove('flex');
  };

  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', openTemplateModal);
  }
  if (btnCloseTemplateModal) btnCloseTemplateModal.addEventListener('click', closeTemplateModal);
  if (btnCloseTemplateModalFooter) btnCloseTemplateModalFooter.addEventListener('click', closeTemplateModal);

  if (btnDownloadSampleNow) {
    btnDownloadSampleNow.addEventListener('click', () => {
      downloadSampleGrammarExcelTemplate();
    });
  }

  if (btnTriggerImportModal && excelFileInput) {
    btnTriggerImportModal.addEventListener('click', () => {
      closeTemplateModal();
      excelFileInput.value = '';
      excelFileInput.click();
    });
  }

  if (btnImportExcel && excelFileInput) {
    btnImportExcel.addEventListener('click', () => {
      excelFileInput.value = '';
      excelFileInput.click();
    });

    excelFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importGrammarFromExcel(file, () => {
          renderGrammarView(container);
        });
      }
    });
  }

  // Mastery Guide Modal Logic
  const masteryGuideModal = container.querySelector('#grammar-mastery-guide-modal');
  const btnOpenMasteryGuide = container.querySelector('#btn-open-mastery-guide');
  const btnCloseMasteryGuide = container.querySelector('#btn-close-mastery-guide');
  const btnDismissMasteryGuide = container.querySelector('#btn-dismiss-mastery-guide');

  const openMasteryGuideModal = () => {
    masteryGuideModal?.classList.remove('hidden');
    masteryGuideModal?.classList.add('flex');
  };
  const closeMasteryGuideModal = () => {
    masteryGuideModal?.classList.add('hidden');
    masteryGuideModal?.classList.remove('flex');
  };

  if (btnOpenMasteryGuide) btnOpenMasteryGuide.addEventListener('click', openMasteryGuideModal);
  if (btnCloseMasteryGuide) btnCloseMasteryGuide.addEventListener('click', closeMasteryGuideModal);
  if (btnDismissMasteryGuide) btnDismissMasteryGuide.addEventListener('click', closeMasteryGuideModal);

  // Edit/Create Logic
  const editModal = container.querySelector('#grammar-edit-modal');
  const modalIcon = container.querySelector('#grammar-modal-icon');
  const modalTitleText = container.querySelector('#grammar-modal-title-text');
  const saveBtnText = container.querySelector('#grammar-save-btn-text');
  const createGrammarBtn = container.querySelector('#btn-create-grammar');
  const deleteGrammarInModalBtn = container.querySelector('#btn-delete-grammar-in-modal');

  const closeEditBtn = container.querySelector('#btn-close-grammar-edit');
  const cancelEditBtn = container.querySelector('#btn-cancel-grammar-edit');
  const saveEditBtn = container.querySelector('#btn-save-grammar-edit');
  const btnAddMultilineBlock = container.querySelector('#btn-add-multiline-example-block');
  const multilineEditor = container.querySelector('#grammar-multiline-examples-editor');
  
  const editIdInput = container.querySelector('#edit-grammar-id');
  const editTitleInput = container.querySelector('#edit-grammar-title');
  const editDescInput = container.querySelector('#edit-grammar-desc');
  const editFormulaInput = container.querySelector('#edit-grammar-formula');
  const editHskSelect = container.querySelector('#edit-grammar-hsk');

  const createMultilineExampleBlock = (zh = '', py = '', vi = '', index = 1) => {
    const block = document.createElement('div');
    block.className = 'multiline-example-block bg-white p-3.5 rounded-2xl border border-slate-200/90 flex flex-col gap-1.5 relative shadow-2xs';
    block.innerHTML = `
      <div class="flex items-center justify-between text-2xs font-bold text-slate-400 mb-0.5">
        <span class="text-emerald-700 font-bold">Ví dụ #${index}</span>
        <button type="button" class="btn-remove-multiline-block text-slate-400 hover:text-red-500 font-bold text-base cursor-pointer" title="Xóa ví dụ này">&times;</button>
      </div>
      <!-- Dòng 1: Chữ Hán (Màu Đỏ) -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-400 shrink-0 select-none">${index}.</span>
        <input type="text" class="inp-ex-zh font-extrabold text-red-600 hanzi-font text-base bg-red-50/40 border border-red-200/60 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-red-500 focus:bg-white" placeholder="Chữ Hán (v.d. 我是学生。)" value="${escapeHtml(zh)}" />
      </div>
      <!-- Dòng 2: Pinyin (Màu Xanh, Font Pinyin) -->
      <div class="flex items-center gap-2 pl-5">
        <input type="text" class="inp-ex-py font-pinyin font-medium text-blue-600 text-sm bg-blue-50/40 border border-blue-200/60 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-blue-500 focus:bg-white" placeholder="Pinyin (v.d. wǒ shì xuésheng.)" value="${escapeHtml(py)}" />
      </div>
      <!-- Dòng 3: Dịch Tiếng Việt (Màu Xám) -->
      <div class="flex items-center gap-2 pl-5">
        <input type="text" class="inp-ex-vi text-slate-600 text-sm bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-slate-400 focus:bg-white" placeholder="Dịch Tiếng Việt (v.d. Tôi là học sinh)" value="${escapeHtml(vi)}" />
      </div>
    `;

    const inpHanzi = block.querySelector('.inp-ex-zh');
    const inpPinyin = block.querySelector('.inp-ex-py');

    inpHanzi.addEventListener('input', () => {
      const val = inpHanzi.value.trim();
      if (val && (!inpPinyin.value.trim() || inpPinyin.dataset.autoFilled === 'true')) {
        const autoPy = lookupPinyinForHanzi(val);
        if (autoPy) {
          inpPinyin.value = autoPy;
          inpPinyin.dataset.autoFilled = 'true';
        }
      }
    });

    block.querySelector('.btn-remove-multiline-block')?.addEventListener('click', () => {
      block.remove();
      updateMultilineBlockIndices();
    });

    return block;
  };

  const startGrammarCreate = () => {
    editIdInput.value = '';
    editTitleInput.value = '';
    editDescInput.value = '';
    editFormulaInput.value = '';
    if (editHskSelect) editHskSelect.value = 'HSK 1';

    multilineEditor.innerHTML = '';
    multilineEditor.appendChild(createMultilineExampleBlock('', '', '', 1));

    if (modalIcon) modalIcon.textContent = '➕';
    if (modalTitleText) modalTitleText.textContent = 'Tạo Mới Cấu Trúc Ngữ Pháp';
    if (saveBtnText) saveBtnText.textContent = 'Tạo Cấu Trúc Ngữ Pháp';
    if (deleteGrammarInModalBtn) deleteGrammarInModalBtn.classList.add('hidden');

    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
  };

  if (createGrammarBtn) {
    createGrammarBtn.addEventListener('click', () => {
      startGrammarCreate();
    });
  }

  const closeEditModal = () => {
    editModal?.classList.add('hidden');
    editModal?.classList.remove('flex');
  };

  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  if (deleteGrammarInModalBtn) {
    deleteGrammarInModalBtn.addEventListener('click', () => {
      const gid = editIdInput.value;
      if (gid) {
        closeEditModal();
        deleteGrammarItem(gid);
      }
    });
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      const title = editTitleInput.value.trim();
      const desc = editDescInput.value.trim();
      const formula = editFormulaInput.value.trim();
      const hskLevel = editHskSelect ? editHskSelect.value : 'HSK 1';

      if (!title) {
        alert('⚠️ Vui lòng nhập Tên Cấu Trúc Ngữ Pháp!');
        editTitleInput.focus();
        return;
      }
      if (!desc) {
        alert('⚠️ Vui lòng nhập Giải thích & Cách dùng!');
        editDescInput.focus();
        return;
      }
      if (!formula) {
        alert('⚠️ Vui lòng nhập Công thức Cấu trúc!');
        editFormulaInput.focus();
        return;
      }

      const blocks = multilineEditor.querySelectorAll('.multiline-example-block');
      const newExamples = [];

      blocks.forEach(blk => {
        const zh = blk.querySelector('.inp-ex-zh').value.trim();
        let py = blk.querySelector('.inp-ex-py').value.trim();
        let vi = blk.querySelector('.inp-ex-vi').value.trim();
        if (zh) {
          if (!py) py = lookupPinyinForHanzi(zh) || zh;
          if (vi && !vi.startsWith('(')) vi = `(${vi})`;
          newExamples.push(`${zh} | ${py} | ${vi || '(Chưa có bản dịch)'}`);
        }
      });

      const gid = editIdInput.value;
      if (gid) {
        const gIndex = grammarData.findIndex(x => x.id === gid);
        if (gIndex > -1) {
          grammarData[gIndex].title = title;
          grammarData[gIndex].desc = desc;
          grammarData[gIndex].formula = formula;
          grammarData[gIndex].hskLevel = hskLevel;
          grammarData[gIndex].examples = newExamples;

          localStorage.setItem('customGrammarData', JSON.stringify(grammarData));
          closeEditModal();
          renderGrammarView(container);
          alert(`🎉 Đã cập nhật thành công cấu trúc ngữ pháp "${title}"!`);
        }
      } else {
        const newId = 'g_' + Date.now();
        const newGrammarItem = {
          id: newId,
          title: title,
          desc: desc,
          formula: formula,
          hskLevel: hskLevel,
          examples: newExamples,
          isCustom: true
        };

        grammarData.unshift(newGrammarItem);
        localStorage.setItem('customGrammarData', JSON.stringify(grammarData));
        closeEditModal();
        renderGrammarView(container);
        alert(`🎉 Đã tạo thành công cấu trúc ngữ pháp mới "${title}"!`);
      }
    });
  }

  const startGrammarEdit = (grammarId) => {
    const gIndex = grammarData.findIndex(x => x.id === grammarId);
    const g = grammarData[gIndex];
    if (!g) return;

    if (modalIcon) modalIcon.textContent = '✏️';
    if (modalTitleText) modalTitleText.textContent = 'Chỉnh Sửa Cấu Trúc Ngữ Pháp';
    if (saveBtnText) saveBtnText.textContent = 'Lưu Cấu Trúc Ngữ Pháp';
    if (deleteGrammarInModalBtn) deleteGrammarInModalBtn.classList.remove('hidden');

    editIdInput.value = g.id;
    editTitleInput.value = g.title;
    editDescInput.value = g.desc;
    editFormulaInput.value = g.formula;
    if (editHskSelect) editHskSelect.value = g.hskLevel || getGrammarHskLevel(g, gIndex);

    multilineEditor.innerHTML = '';

    (g.examples || []).forEach((ex, idx) => {
      const parts = ex.split('|').map(s => s.trim());
      if (parts.length === 3) {
        let zh = parts[0];
        let py = parts[1];
        let vi = parts[2];
        if (vi.startsWith('(') && vi.endsWith(')')) vi = vi.slice(1, -1);
        multilineEditor.appendChild(createMultilineExampleBlock(zh, py, vi, idx + 1));
      } else {
        const match = ex.match(/^(.*?)[。？！]?\s*\((.*?)\)$/);
        if (match) {
          multilineEditor.appendChild(createMultilineExampleBlock(match[1], '', match[2], idx + 1));
        } else {
          multilineEditor.appendChild(createMultilineExampleBlock(ex, '', '', idx + 1));
        }
      }
    });

    if ((g.examples || []).length === 0) {
      multilineEditor.appendChild(createMultilineExampleBlock('', '', '', 1));
    }

    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
  };

  // Practice Config Modal Logic
  const configModal = container.querySelector('#grammar-config-modal');
  const btnOpenConfig = container.querySelector('#btn-open-grammar-config');
  const btnLaunchChallengeCard = container.querySelector('#btn-launch-challenge-card');
  const btnCloseConfig = container.querySelector('#btn-close-grammar-config');
  const btnCancelConfig = container.querySelector('#btn-cancel-grammar-config');
  const btnStartConfiguredGame = container.querySelector('#btn-start-configured-game');
  const btnSelectAllConfig = container.querySelector('#btn-config-select-all');
  const btnDeselectAllConfig = container.querySelector('#btn-config-deselect-all');
  const configSearchInput = container.querySelector('#config-search-grammar');
  const configGrammarListEl = container.querySelector('#config-grammar-list');
  const configSelectedCountEl = container.querySelector('#config-selected-count');
  const configTotalCountEl = container.querySelector('#config-total-count');
  const configCountOptions = container.querySelector('#config-count-options');

  let selectedGrammarIds = new Set(grammarData.map(g => g.id));
  let practiceOrderMode = 'random'; // 'random' | 'sequential'
  let practiceQuestionLimit = 10; // 5 | 10 | 20 | 'all'

  const updateConfigSelectedCount = () => {
    if (configSelectedCountEl) configSelectedCountEl.textContent = selectedGrammarIds.size;
    if (configTotalCountEl) configTotalCountEl.textContent = grammarData.length;
  };

  const renderConfigGrammarList = (filterTerm = '') => {
    if (!configGrammarListEl) return;
    const term = filterTerm.toLowerCase().trim();
    const filtered = grammarData.filter(g => 
      !term || g.title.toLowerCase().includes(term) || g.desc.toLowerCase().includes(term)
    );

    configGrammarListEl.innerHTML = filtered.map((g, idx) => {
      const isChecked = selectedGrammarIds.has(g.id);
      return `<label class="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 hover:border-red-300 transition cursor-pointer select-none">
        <input type="checkbox" class="chk-config-item text-red-600 rounded focus:ring-red-500 w-4 h-4 cursor-pointer" data-id="${g.id}" ${isChecked ? 'checked' : ''} />
        <div class="truncate text-xs font-bold text-slate-700">
          <span class="text-red-700 font-extrabold">#${idx + 1}.</span> ${escapeHtml(g.title)}
        </div>
      </label>`;
    }).join('');

    updateConfigSelectedCount();
  };

  const openConfigModal = () => {
    if (selectedGrammarIds.size === 0) {
      selectedGrammarIds = new Set(grammarData.map(g => g.id));
    }
    renderConfigGrammarList();
    configModal?.classList.remove('hidden');
    configModal?.classList.add('flex');
  };

  const closeConfigModal = () => {
    configModal?.classList.add('hidden');
    configModal?.classList.remove('flex');
  };

  if (btnOpenConfig) btnOpenConfig.addEventListener('click', openConfigModal);
  if (btnLaunchChallengeCard) btnLaunchChallengeCard.addEventListener('click', openConfigModal);
  if (btnCloseConfig) btnCloseConfig.addEventListener('click', closeConfigModal);
  if (btnCancelConfig) btnCancelConfig.addEventListener('click', closeConfigModal);

  if (btnSelectAllConfig) {
    btnSelectAllConfig.addEventListener('click', () => {
      selectedGrammarIds = new Set(grammarData.map(g => g.id));
      renderConfigGrammarList(configSearchInput?.value || '');
    });
  }

  if (btnDeselectAllConfig) {
    btnDeselectAllConfig.addEventListener('click', () => {
      selectedGrammarIds.clear();
      renderConfigGrammarList(configSearchInput?.value || '');
    });
  }

  if (configSearchInput) {
    configSearchInput.addEventListener('input', (e) => {
      renderConfigGrammarList(e.target.value);
    });
  }

  if (configGrammarListEl) {
    configGrammarListEl.addEventListener('change', (e) => {
      const chk = e.target.closest('.chk-config-item');
      if (chk) {
        const gid = chk.getAttribute('data-id');
        if (chk.checked) {
          selectedGrammarIds.add(gid);
        } else {
          selectedGrammarIds.delete(gid);
        }
        updateConfigSelectedCount();
      }
    });
  }

  if (configCountOptions) {
    configCountOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-count-opt');
      if (btn) {
        configCountOptions.querySelectorAll('.btn-count-opt').forEach(b => {
          b.className = 'btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer';
        });
        btn.className = 'btn-count-opt px-4 py-2 rounded-xl border-2 border-red-500 bg-red-50 font-black text-xs text-red-800 shadow-2xs cursor-pointer active-count';
        const cnt = btn.getAttribute('data-count');
        practiceQuestionLimit = cnt === 'all' ? 'all' : parseInt(cnt);
      }
    });
  }

  const modeRadios = container.querySelectorAll('input[name="practice-order-mode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      practiceOrderMode = e.target.value;
      const lblRandom = container.querySelector('#lbl-mode-random');
      const lblSeq = container.querySelector('#lbl-mode-sequential');
      if (practiceOrderMode === 'random') {
        lblRandom?.classList.add('border-red-500', 'bg-red-50/40');
        lblRandom?.classList.remove('border-slate-200', 'bg-white');
        lblSeq?.classList.remove('border-red-500', 'bg-red-50/40');
        lblSeq?.classList.add('border-slate-200', 'bg-white');
      } else {
        lblSeq?.classList.add('border-red-500', 'bg-red-50/40');
        lblSeq?.classList.remove('border-slate-200', 'bg-white');
        lblRandom?.classList.remove('border-red-500', 'bg-red-50/40');
        lblRandom?.classList.add('border-slate-200', 'bg-white');
      }
    });
  });

  const startCustomConfiguredPractice = () => {
    if (selectedGrammarIds.size === 0) {
      alert('⚠️ Vui lòng chọn ít nhất 1 cấu trúc ngữ pháp để luyện tập!');
      return;
    }

    const selectedItems = grammarData.filter(g => selectedGrammarIds.has(g.id));
    const pool = [];

    selectedItems.forEach(g => {
      (g.examples || []).forEach(ex => {
        const parsed = parseExampleItem(ex);
        pool.push({
          grammarTitle: g.title,
          grammarId: g.id,
          ...parsed
        });
      });
    });

    if (pool.length === 0) {
      alert('⚠️ Các cấu trúc ngữ pháp đã chọn chưa có ví dụ nào!');
      return;
    }

    if (practiceOrderMode === 'random') {
      pool.sort(() => Math.random() - 0.5);
    }
    // If sequential mode: pool is already ordered by grammarData structure sequence!

    let limit = pool.length;
    if (practiceQuestionLimit !== 'all' && typeof practiceQuestionLimit === 'number') {
      limit = Math.min(practiceQuestionLimit, pool.length);
    }

    questionsPool = pool.slice(0, limit);
    gameMode = practiceOrderMode;

    currentQuestionIndex = 0;
    streakCount = 0;
    if (streakCountEl) streakCountEl.textContent = streakCount;

    closeConfigModal();
    loadQuestionAtIndex(0);
    gameModal?.classList.remove('hidden');
    gameModal?.classList.add('flex');
  };

  if (btnStartConfiguredGame) {
    btnStartConfiguredGame.addEventListener('click', startCustomConfiguredPractice);
  }

  // Game Logic & State
  const gameModal = container.querySelector('#grammar-game-modal');
  const closeGameBtn = container.querySelector('#btn-close-grammar-game');
  const meaningEl = container.querySelector('#grammar-game-meaning');
  const answerArea = container.querySelector('#grammar-game-answer-area');
  const optionsArea = container.querySelector('#grammar-game-options-area');
  const checkBtn = container.querySelector('#btn-check-grammar-game');
  const nextBtn = container.querySelector('#btn-next-grammar-game');
  const feedbackEl = container.querySelector('#grammar-game-feedback');
  const ttsBtn = container.querySelector('#btn-game-tts');
  const pinyinToggleBtn = container.querySelector('#btn-toggle-pinyin-hint');
  const streakCountEl = container.querySelector('#game-streak-count');
  const progressLabelEl = container.querySelector('#game-progress-label');
  const badgeEl = container.querySelector('#grammar-game-badge');
  const btnGlobalGame = container.querySelector('#btn-start-global-grammar-game');
  const btnLaunchGameCard = container.querySelector('#btn-launch-game-card');

  let gameMode = 'single'; // 'single' | 'global'
  let questionsPool = [];
  let currentQuestionIndex = 0;
  let streakCount = 0;
  let showPinyin = false;

  let currentTargetChinese = '';
  let currentTargetPinyin = '';
  let currentTargetMeaning = '';
  let currentAnswer = [];
  let availableWords = [];

  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const resetGameFeedback = () => {
    feedbackEl.textContent = '';
    feedbackEl.className = 'font-bold text-sm sm:text-base transition-all duration-300';
    checkBtn?.classList.remove('hidden');
    nextBtn?.classList.add('hidden');
  };

  const getPinyin = (w) => {
    if (window.pinyinPro) {
      return window.pinyinPro.pinyin(w, { toneType: 'mark' });
    }
    return '';
  };

  const renderGameWords = () => {
    answerArea.innerHTML = currentAnswer.map((word, idx) => 
      '<button class="btn-game-word-answer px-3.5 py-2 bg-red-100 text-red-800 border border-red-200/80 font-bold rounded-xl shadow-xs hover:bg-red-200 transition text-base sm:text-lg flex flex-col items-center leading-none min-w-[3rem] cursor-pointer" data-idx="' + idx + '">'
      + (showPinyin ? '<span class="text-2xs text-blue-600 font-pinyin opacity-90 mb-1">' + getPinyin(word) + '</span>' : '')
      + '<span>' + word + '</span>'
      + '</button>'
    ).join('');

    optionsArea.innerHTML = availableWords.map((word, idx) => 
      '<button class="btn-game-word-option px-3.5 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl shadow-xs hover:border-red-400 hover:text-red-600 hover:bg-red-50/50 transition text-base sm:text-lg flex flex-col items-center leading-none min-w-[3rem] cursor-pointer" data-idx="' + idx + '">'
      + (showPinyin ? '<span class="text-2xs text-blue-600 font-pinyin opacity-90 mb-1">' + getPinyin(word) + '</span>' : '')
      + '<span>' + word + '</span>'
      + '</button>'
    ).join('');
  };

  const parseExampleItem = (ex) => {
    let chinese = ex;
    let pinyin = '';
    let vietnamese = 'Không có bản dịch';

    const parts = ex.split('|').map(s => s.trim());
    if (parts.length === 3) {
      chinese = parts[0];
      pinyin = parts[1];
      vietnamese = parts[2];
    } else {
      const match = ex.match(/^(.*?)[。？！]?\s*\((.*?)\)$/);
      if (match) {
        chinese = match[1];
        vietnamese = match[2];
      } else {
        const fallbackParts = ex.split('(');
        chinese = fallbackParts[0].trim().replace(/[。？！]$/, '');
        if (fallbackParts[1]) vietnamese = fallbackParts[1].replace(')', '').trim();
      }
    }
    if (vietnamese.startsWith('(') && vietnamese.endsWith(')')) {
      vietnamese = vietnamese.slice(1, -1);
    }
    return { chinese, pinyin, vietnamese };
  };

  const loadQuestionAtIndex = (index) => {
    if (!questionsPool || questionsPool.length === 0 || index >= questionsPool.length) {
      feedbackEl.textContent = `🎉 Hoàn thành xuất sắc ${questionsPool.length} câu ví dụ! Chuỗi đúng: ${streakCount}`;
      feedbackEl.className = 'font-black text-red-600 text-base';
      checkBtn?.classList.add('hidden');
      nextBtn?.classList.add('hidden');
      return;
    }

    const q = questionsPool[index];
    currentTargetChinese = q.chinese;
    currentTargetPinyin = q.pinyin;
    currentTargetMeaning = q.vietnamese;

    if (badgeEl) badgeEl.textContent = q.grammarTitle || 'Tất cả cấu trúc';
    if (progressLabelEl) progressLabelEl.textContent = `Câu ${index + 1} / ${questionsPool.length}`;

    meaningEl.textContent = currentTargetMeaning;

    // Split sentence into characters, stripping punctuation for unscramble
    const cleanChars = currentTargetChinese.replace(/[。？！，、]/g, '').split('');
    currentAnswer = [];
    availableWords = [...cleanChars];
    availableWords.sort(() => Math.random() - 0.5);

    resetGameFeedback();
    renderGameWords();
  };

  const startGrammarGame = (grammarId) => {
    const g = grammarData.find(x => x.id === grammarId);
    if (!g || !g.examples || g.examples.length === 0) {
      alert('⚠️ Cấu trúc ngữ pháp này chưa có ví dụ để luyện tập!');
      return;
    }

    gameMode = 'single';
    questionsPool = g.examples.map(ex => {
      const parsed = parseExampleItem(ex);
      return {
        grammarId: g.id,
        grammarTitle: g.title,
        ...parsed
      };
    });
    // Shuffle pool
    questionsPool.sort(() => Math.random() - 0.5);

    currentQuestionIndex = 0;
    streakCount = 0;
    if (streakCountEl) streakCountEl.textContent = streakCount;

    loadQuestionAtIndex(0);
    gameModal.classList.remove('hidden');
    gameModal.classList.add('flex');
  };

  const startGlobalGrammarGame = () => {
    const allQuestions = [];
    grammarData.forEach(g => {
      (g.examples || []).forEach(ex => {
        const parsed = parseExampleItem(ex);
        allQuestions.push({
          grammarId: g.id,
          grammarTitle: g.title,
          ...parsed
        });
      });
    });

    if (allQuestions.length === 0) {
      alert('⚠️ Chưa có ví dụ ngữ pháp nào để luyện tập!');
      return;
    }

    gameMode = 'global';
    allQuestions.sort(() => Math.random() - 0.5);
    // Select up to 10 questions per round
    questionsPool = allQuestions.slice(0, Math.min(10, allQuestions.length));

    currentQuestionIndex = 0;
    streakCount = 0;
    if (streakCountEl) streakCountEl.textContent = streakCount;

    loadQuestionAtIndex(0);
    gameModal.classList.remove('hidden');
    gameModal.classList.add('flex');
  };

  if (btnGlobalGame) {
    btnGlobalGame.addEventListener('click', startGlobalGrammarGame);
  }
  if (btnLaunchGameCard) {
    btnLaunchGameCard.addEventListener('click', startGlobalGrammarGame);
  }

  if (pinyinToggleBtn) {
    pinyinToggleBtn.addEventListener('click', () => {
      showPinyin = !showPinyin;
      pinyinToggleBtn.textContent = showPinyin ? '🙈 Ẩn Pinyin' : '👁️ Hiện Pinyin';
      renderGameWords();
    });
  }

  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      speakText(currentTargetChinese);
    });
  }

  container.addEventListener('click', (e) => {
    const btnEdit = e.target.closest('.btn-grammar-edit');
    if (btnEdit) {
      const gid = btnEdit.getAttribute('data-id');
      startGrammarEdit(gid);
      return;
    }

    const btnGame = e.target.closest('.btn-grammar-game');
    if (btnGame) {
      const gid = btnGame.getAttribute('data-id');
      startGrammarGame(gid);
      return;
    }

    const btnOption = e.target.closest('.btn-game-word-option');
    if (btnOption) {
      const idx = parseInt(btnOption.getAttribute('data-idx'));
      currentAnswer.push(availableWords[idx]);
      availableWords.splice(idx, 1);
      resetGameFeedback();
      renderGameWords();
      return;
    }

    const btnAnswer = e.target.closest('.btn-game-word-answer');
    if (btnAnswer) {
      const idx = parseInt(btnAnswer.getAttribute('data-idx'));
      availableWords.push(currentAnswer[idx]);
      currentAnswer.splice(idx, 1);
      resetGameFeedback();
      renderGameWords();
      return;
    }
  });

  const updateHeaderLearnedCount = () => {
    let learnedCount = 0;
    grammarData.forEach(g => {
      const info = getGrammarMasteryInfo(g.id);
      if (info.isLearned) learnedCount++;
    });
    const learnedEl = container.querySelector('#grammar-learned-display');
    if (learnedEl) {
      learnedEl.innerHTML = `${learnedCount} <span class="text-lg text-slate-400 font-bold">/ ${grammarData.length}</span>`;
    }
  };

  closeGameBtn?.addEventListener('click', () => {
    gameModal?.classList.add('hidden');
    gameModal?.classList.remove('flex');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    renderGrammarView(container);
  });

  checkBtn?.addEventListener('click', () => {
    const cleanTarget = currentTargetChinese.replace(/[。？！，、]/g, '');
    const userAnswer = currentAnswer.join('');
    const currentQ = questionsPool[currentQuestionIndex];
    const gId = currentQ?.grammarId;

    if (userAnswer === cleanTarget) {
      speakText(currentTargetChinese);
      streakCount++;
      if (streakCountEl) streakCountEl.textContent = streakCount;

      let currentScore = getGrammarScore() + 10;
      saveGrammarScore(currentScore);

      if (gId) {
        const map = getGrammarMasteryMap();
        if (!map[gId]) map[gId] = { correct: 0, total: 0 };
        map[gId].correct = (map[gId].correct || 0) + 1;
        map[gId].total = (map[gId].total || 0) + 1;
        saveGrammarMasteryMap(map);
      }

      const scoreEl = container.querySelector('#grammar-score-display');
      if (scoreEl) scoreEl.textContent = currentScore;
      updateHeaderLearnedCount();

      feedbackEl.textContent = '🎉 Chính xác! Tuyệt vời! (+10 điểm)';
      feedbackEl.className = 'font-black text-red-600 text-base sm:text-lg animate-bounce';

      checkBtn.classList.add('hidden');
      nextBtn?.classList.remove('hidden');
    } else {
      streakCount = 0;
      if (streakCountEl) streakCountEl.textContent = streakCount;

      if (gId) {
        const map = getGrammarMasteryMap();
        if (!map[gId]) map[gId] = { correct: 0, total: 0 };
        map[gId].total = (map[gId].total || 0) + 1;
        saveGrammarMasteryMap(map);
      }

      feedbackEl.textContent = `❌ Chưa đúng! Đáp án đúng: "${currentTargetChinese}"`;
      feedbackEl.className = 'font-bold text-red-500 text-sm';
      answerArea.style.transform = 'translateX(-8px)';
      setTimeout(() => answerArea.style.transform = 'translateX(-8px)', 100);
      setTimeout(() => answerArea.style.transform = 'translateX(8px)', 200);
      setTimeout(() => answerArea.style.transform = 'translateX(0)', 300);
    }
  });

  nextBtn?.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsPool.length) {
      loadQuestionAtIndex(currentQuestionIndex);
    } else {
      const finalScore = getGrammarScore();
      feedbackEl.textContent = `🏆 Bạn đã hoàn thành vòng luyện tập với tổng điểm: ${finalScore}!`;
      feedbackEl.className = 'font-black text-red-700 text-base';
      checkBtn?.classList.add('hidden');
      nextBtn?.classList.add('hidden');
    }
  });

  let activeFilter = 'all';
  let activeHskFilter = 'all';
  const searchInput = container.querySelector('#search-grammar-input');
  const filterTabsContainer = container.querySelector('#grammar-filter-tabs');
  const hskFilterTabsContainer = container.querySelector('#grammar-hsk-filter-tabs');

  const applyCardFilters = () => {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const cards = container.querySelectorAll('.grammar-card-wrapper');
    cards.forEach(card => {
      const title = card.getAttribute('data-title').toLowerCase();
      const desc = card.getAttribute('data-desc').toLowerCase();
      const status = card.getAttribute('data-status');
      const cardHsk = card.getAttribute('data-hsk') || '';

      const matchesSearch = !term || title.includes(term) || desc.includes(term);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;
      const matchesHsk = activeHskFilter === 'all' || cardHsk.toUpperCase() === activeHskFilter.toUpperCase();

      if (matchesSearch && matchesFilter && matchesHsk) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  if (filterTabsContainer) {
    filterTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-filter-tab');
      if (btn) {
        filterTabsContainer.querySelectorAll('.btn-filter-tab').forEach(b => {
          b.className = 'btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap';
        });
        btn.className = 'btn-filter-tab px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-bold text-xs shadow-md shadow-red-500/30 flex items-center gap-2 cursor-pointer active-filter whitespace-nowrap';
        activeFilter = btn.getAttribute('data-filter');
        applyCardFilters();
      }
    });
  }

  if (hskFilterTabsContainer) {
    hskFilterTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-hsk-filter-tab');
      if (btn) {
        hskFilterTabsContainer.querySelectorAll('.btn-hsk-filter-tab').forEach(b => {
          b.className = 'btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap';
        });
        btn.className = 'btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-extrabold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-xs cursor-pointer active-hsk-filter whitespace-nowrap transition-all';
        activeHskFilter = btn.getAttribute('data-hsk');
        applyCardFilters();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyCardFilters);
  }
}


  // ------------------------------------------------------

// --------------------------------------------------------------------------
// HELPER FUNCTIONS & EXPORTS
// --------------------------------------------------------------------------

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getGrammarHskLevel(g, idx) {
  if (g && g.hskLevel) return g.hskLevel;
  const num = parseInt((g && g.id ? g.id : '').replace('g', '')) || (idx + 1);
  if (num <= 10) return 'HSK 1';
  if (num <= 20) return 'HSK 2';
  if (num <= 30) return 'HSK 3';
  if (num <= 40) return 'HSK 4';
  if (num <= 48) return 'HSK 5';
  return 'HSK 6';
}

function getGrammarMasteryMap() {
  try {
    const raw = localStorage.getItem('hanzo_grammar_mastery_map');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveGrammarMasteryMap(map) {
  try {
    localStorage.setItem('hanzo_grammar_mastery_map', JSON.stringify(map));
  } catch (e) {}
}

function getGrammarMasteryInfo(gId) {
  const map = getGrammarMasteryMap();
  const data = map[gId] || { correct: 0, total: 0 };
  const total = data.total || 0;
  const correct = data.correct || 0;
  if (total === 0) {
    return { level: 0, stars: '☆☆☆☆☆', label: 'Chưa Ôn', color: 'slate', isLearned: false, status: 'unlearned', percent: 0 };
  }
  const pct = Math.round((correct / total) * 100);
  if (pct >= 85 && total >= 3) {
    return { level: 4, stars: '⭐⭐⭐⭐⭐', label: 'Chuyên Gia', color: 'amber', isLearned: true, status: 'mastered', percent: pct };
  } else if (pct >= 70) {
    return { level: 3, stars: '⭐⭐⭐⭐☆', label: 'Thành Thạo', color: 'emerald', isLearned: true, status: 'learning', percent: pct };
  } else if (pct >= 50) {
    return { level: 2, stars: '⭐⭐⭐☆☆', label: 'Đạt Yêu Cầu', color: 'blue', isLearned: true, status: 'learning', percent: pct };
  } else {
    return { level: 1, stars: '⭐☆☆☆☆', label: 'Mới Bắt Đầu', color: 'rose', isLearned: true, status: 'learning', percent: pct };
  }
}

function getGrammarScore() {
  try {
    return parseInt(localStorage.getItem('hanzo_grammar_score') || '0', 10);
  } catch (e) {
    return 0;
  }
}

function saveGrammarScore(score) {
  try {
    localStorage.setItem('hanzo_grammar_score', String(score));
  } catch (e) {}
}

function renderCard(g, idx) {
  const hskLevel = getGrammarHskLevel(g, idx);
  const mastery = getGrammarMasteryInfo(g.id);
  const examples = g.examples || [];

  const exampleItemsHtml = examples.map((ex, exIdx) => {
    const parts = ex.split('|').map(s => s.trim());
    if (parts.length === 3) {
      return `<div class="bg-white/90 p-3 rounded-2xl border border-rose-100/80 shadow-2xs">
        <div class="font-extrabold text-red-600 text-base leading-snug hanzi-font flex items-center justify-between">
          <span>${escapeHtml(parts[0])}</span>
          <button class="btn-speech-ex text-xs opacity-70 hover:opacity-100 transition cursor-pointer p-1" title="Phát âm" data-speech="${escapeHtml(parts[0])}">🔊</button>
        </div>
        <div class="text-xs font-pinyin text-blue-600 font-medium mt-0.5">${escapeHtml(parts[1])}</div>
        <div class="text-2xs text-slate-600 mt-1 font-semibold">${escapeHtml(parts[2])}</div>
      </div>`;
    } else {
      return `<div class="bg-white/90 p-3 rounded-2xl border border-rose-100/80 shadow-2xs text-xs font-medium text-slate-700">${escapeHtml(ex)}</div>`;
    }
  }).join('');

  return `
    <div class="grammar-card-wrapper glass-panel rounded-3xl p-5 border border-rose-200/80 bg-white/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
         data-id="${g.id}"
         data-title="${escapeHtml(g.title)}"
         data-desc="${escapeHtml(g.desc)}"
         data-hsk="${hskLevel}"
         data-status="${mastery.status}">
      <div>
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-red-100 text-red-800 uppercase tracking-wider">${hskLevel}</span>
            <span class="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-${mastery.color}-100 text-${mastery.color}-800 border border-${mastery.color}-200">${mastery.label} (${mastery.percent}%)</span>
          </div>
          <div class="text-xs font-bold text-amber-500 tracking-widest">${mastery.stars}</div>
        </div>

        <h3 class="font-black text-lg text-red-950 mb-1 leading-tight">
          <span class="text-red-600 font-extrabold mr-1">#${idx + 1}.</span> ${escapeHtml(g.title)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mb-3 leading-relaxed">${escapeHtml(g.desc)}</p>

        <div class="bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-2xl border border-red-200/60 mb-4">
          <div class="text-3xs font-black uppercase tracking-wider text-red-800/70 mb-0.5">Công Thức Cấu Trúc</div>
          <div class="text-xs font-black text-red-900 font-mono">${escapeHtml(g.formula)}</div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="text-3xs font-black uppercase tracking-wider text-slate-400">Ví Dụ Ứng Dụng (${examples.length})</div>
          ${exampleItemsHtml}
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-rose-100 gap-2 mt-auto">
        <button class="btn-grammar-game text-xs font-extrabold px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5" data-id="${g.id}">
          <span>🎮</span> <span>Luyện Tập</span>
        </button>
        <button class="btn-grammar-edit text-xs font-bold px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-700 transition cursor-pointer flex items-center gap-1" data-id="${g.id}">
          <span>✏️</span> <span>Sửa</span>
        </button>
      </div>
    </div>
  `;
}

function updateMultilineBlockIndices() {
  const container = document.querySelector('#grammar-multiline-examples-editor');
  if (!container) return;
  const blocks = container.querySelectorAll('.multiline-example-block');
  blocks.forEach((blk, idx) => {
    const titleEl = blk.querySelector('.text-emerald-700');
    if (titleEl) titleEl.textContent = `Ví dụ #${idx + 1}`;
    const numEl = blk.querySelector('.select-none');
    if (numEl) numEl.textContent = `${idx + 1}.`;
  });
}

function deleteGrammarItem(gid) {
  const data = getStoredGrammarData();
  const idx = data.findIndex(x => x.id === gid);
  if (idx > -1) {
    const title = data[idx].title;
    if (confirm(`⚠️ Bạn có chắc chắn muốn xóa cấu trúc ngữ pháp "${title}" không?`)) {
      data.splice(idx, 1);
      saveStoredGrammarData(data);
      const container = document.querySelector('#app') || document.body;
      renderGrammarView(container);
      alert(`🗑️ Đã xóa cấu trúc ngữ pháp "${title}"!`);
    }
  }
}

function exportGrammarToExcel() {
  const data = getStoredGrammarData();
  let csvContent = '\uFEFF';
  csvContent += 'Tên Cấu Trúc Ngữ Pháp,Mô Tả / Ý Nghĩa,Công Thức Cấu Trúc,Các Ví Dụ Ứng Dụng\n';

  data.forEach(g => {
    const title = `"${(g.title || '').replace(/"/g, '""')}"`;
    const desc = `"${(g.desc || '').replace(/"/g, '""')}"`;
    const formula = `"${(g.formula || '').replace(/"/g, '""')}"`;
    const examples = `"${(g.examples || []).join('\n').replace(/"/g, '""')}"`;
    csvContent += `${title},${desc},${formula},${examples}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Hanzo_Grammar_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importGrammarFromExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('⚠️ Tệp Excel/CSV rỗng hoặc không đúng định dạng!');
        return;
      }
      
      const currentData = getStoredGrammarData();
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = [];
        let inQuote = false;
        let field = '';
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            cols.push(field.trim());
            field = '';
          } else {
            field += char;
          }
        }
        cols.push(field.trim());

        if (cols.length >= 1 && cols[0]) {
          const title = cols[0].replace(/^"|"$/g, '').trim();
          const desc = (cols[1] || '').replace(/^"|"$/g, '').trim();
          const formula = (cols[2] || '').replace(/^"|"$/g, '').trim();
          const exRaw = (cols[3] || '').replace(/^"|"$/g, '').trim();
          const examples = exRaw ? exRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

          if (title) {
            currentData.unshift({
              id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              title,
              desc: desc || 'Cấu trúc ngữ pháp bổ sung',
              formula: formula || title,
              examples,
              isCustom: true
            });
            importedCount++;
          }
        }
      }

      if (importedCount > 0) {
        saveStoredGrammarData(currentData);
        alert(`🎉 Đã nhập thành công ${importedCount} cấu trúc ngữ pháp từ tệp Excel!`);
        if (callback) callback();
      } else {
        alert('⚠️ Không tìm thấy cấu trúc hợp lệ trong tệp Excel!');
      }
    } catch (err) {
      alert('❌ Lỗi khi đọc tệp Excel: ' + err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function downloadSampleGrammarExcelTemplate() {
  let csv = '\uFEFF';
  csv += 'Tên Cấu Trúc Ngữ Pháp,Mô Tả / Ý Nghĩa,Công Thức Cấu Trúc,Các Ví Dụ Ứng Dụng\n';
  csv += '"Câu với 是 (shì)","Dùng để xác định, giới thiệu người hoặc sự vật.","A + 是 + B","我是学生。 | wǒ shì xuésheng. | (Tôi là học sinh)\n这是我的书。 | zhè shì wǒ de shū. | (Đây là sách của tôi)"\n';
  csv += '"Phủ định với 不 (bù)","Dùng để phủ định hành động, trạng thái hoặc thói quen.","不 + Động từ/Tính từ","我不吃辣。 | wǒ bù chī là. | (Tôi không ăn cay)\n他不高。 | tā bù gāo. | (Anh ấy không cao)"\n';

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Hanzo_Grammar_Template_Mau.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


  // --------------------------------------------------------------------------
  // MODULE: js\views\readingView.js
  // --------------------------------------------------------------------------
// Module: Đọc & Dịch Văn Bản Tiếng Trung (js/views/readingView.js)

/**
 * Tách đoạn văn bản tiếng Trung thành danh sách các câu đơn lẻ dựa vào dấu câu (。！？!?;\n)
 */
function splitChineseSentences(text) {
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
function getSentencePinyin(sentence) {
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
function autoTranslateChineseToVietnamese(sentence) {
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
function extractSuggestedWords(text) {
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

function renderReadingView(container) {
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


  // --------------------------------------------------------------------------
  // MODULE: js\views\adminUsersView.js
  // --------------------------------------------------------------------------
// adminUsersView.js - Dedicated Admin User & Content Management View (Redesigned 100% matching exact reference mockup)

function renderAdminUsersView(container) {
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


  // --------------------------------------------------------------------------
  // MODULE: js\views\userProfileModal.js
  // --------------------------------------------------------------------------

function renderUserProfileModalContent(container, appInstance, activeTabName = 'profile') {
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


  // --------------------------------------------------------------------------
  // MODULE: js\app.js
  // --------------------------------------------------------------------------
window.__shownJsErrors = window.__shownJsErrors || new Set();
window.onerror = function(message, source, lineno, colno, error) {
  // Bỏ qua lỗi "Script error." bị trình duyệt che giấu (cross-origin) phát sinh từ
  // script bên ngoài (CDN / tiện ích mở rộng trình duyệt như từ điển tra chữ Hán khi rê chuột).
  // Các lỗi này không có thông tin dòng/stack, không xuất phát từ mã của ứng dụng.
  const msgStr = String(message || '');
  if (/^script error\.?$/i.test(msgStr.trim()) || (!lineno && !colno && !error)) {
    console.warn('Ignored cross-origin script error:', message, source);
    return true;
  }

  console.error("Global JS Error:", message, lineno, colno, error);

  // Không hiển thị lặp lại cùng một lỗi & giới hạn số hộp lỗi trên màn hình
  const errKey = msgStr + '@' + lineno + ':' + colno;
  if (window.__shownJsErrors.has(errKey)) return false;
  if (document.querySelectorAll('.js-runtime-error-box').length >= 3) return false;
  window.__shownJsErrors.add(errKey);

  const errDiv = document.getElementById('js-error-catch') || document.body;
  if (errDiv) {
    const safe = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const errBox = document.createElement('div');
    errBox.className = 'js-runtime-error-box';
    errBox.style.cssText = 'position:relative; color:red; background:#fee; padding:16px 40px 16px 16px; margin:16px; border:2px solid red; font-family:monospace; z-index:999999;';
    errBox.innerHTML = '<button type="button" title="Đóng" style="position:absolute; top:6px; right:10px; font-weight:bold; cursor:pointer;">&times;</button>' +
      '<b>JS ERROR:</b> ' + safe(msgStr) + ' at line ' + lineno + ':' + colno + '<br><pre style="white-space:pre-wrap;">' + safe(error ? error.stack : '') + '</pre>';
    errBox.querySelector('button').addEventListener('click', () => errBox.remove());
    errDiv.appendChild(errBox);
  }
  return false;
};

// Global Custom Toast Notification System (Replaces browser "This page says" alert popups - Centered)
window.showToast = function(message) {
  if (!message) return;
  const strMsg = String(message);

  let toastContainer = document.getElementById('global-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'global-toast-container';
    toastContainer.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999999] flex flex-col items-center gap-3 max-w-md w-[90vw] sm:w-auto pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-slate-900/95 text-white px-6 py-4 rounded-3xl shadow-2xl border border-rose-500/50 flex items-center justify-between gap-4 text-sm font-extrabold backdrop-blur-md transition-all duration-300 transform scale-100 opacity-100 shadow-rose-950/40 text-center animate-fade-in';

  let icon = '🔔';
  if (strMsg.includes('🎉') || strMsg.includes('thành công') || strMsg.includes('tạo') || strMsg.includes('cập nhật')) icon = '🎉';
  else if (strMsg.includes('⚠️') || strMsg.includes('Lỗi') || strMsg.includes('không') || strMsg.includes('khóa')) icon = '⚠️';
  else if (strMsg.includes('🔒')) icon = '🔒';
  else if (strMsg.includes('🗑️')) icon = '🗑️';
  else if (strMsg.includes('👋')) icon = '👋';

  const cleanText = strMsg.replace(/^[🎉⚠️🔒🗑️🔑👋]\s*/, '');

  toast.innerHTML = `
    <div class="flex items-center justify-center gap-3 flex-1 min-w-0">
      <span class="text-xl shrink-0">${icon}</span>
      <span class="leading-snug text-slate-100 font-bold text-sm whitespace-normal">${cleanText}</span>
    </div>
    <button type="button" class="text-white/60 hover:text-white text-base font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition">&times;</button>
  `;

  const removeToast = () => {
    toast.classList.add('opacity-0', 'scale-90');
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector('button').addEventListener('click', removeToast);

  toastContainer.appendChild(toast);

  setTimeout(removeToast, 3500);
};

// Override window.alert globally to prevent browser's native "This page says" dialogs
window.alert = function(msg) {
  window.showToast(msg);
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
    renderAuthModal();
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
    const userMenuWrapper = document.getElementById('user-menu-dropdown-wrapper');
    const userDropdownMenu = document.getElementById('user-account-dropdown-menu');
    const authBtn = document.getElementById('header-auth-btn');
    const modal = document.getElementById('user-profile-modal');
    const closeBtn = document.getElementById('btn-close-user-profile-modal');

    // Toggle User Account Dropdown Menu
    if (profileBtn && userDropdownMenu) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('hidden');
      });
    }

    // Close Dropdown when clicking outside
    window.addEventListener('click', (e) => {
      if (userMenuWrapper && userDropdownMenu && !userDropdownMenu.classList.contains('hidden')) {
        if (!userMenuWrapper.contains(e.target)) {
          userDropdownMenu.classList.add('hidden');
        }
      }
    });

    // Dropdown Item Handlers
    document.getElementById('dropdown-item-profile')?.addEventListener('click', () => {
      userDropdownMenu?.classList.add('hidden');
      if (modal) {
        modal.classList.remove('hidden');
        renderUserProfileModalContent(modal, this);
      }
    });

    document.getElementById('dropdown-item-settings')?.addEventListener('click', () => {
      userDropdownMenu?.classList.add('hidden');
      this.switchTab('settings');
    });

    document.getElementById('dropdown-item-admin')?.addEventListener('click', () => {
      userDropdownMenu?.classList.add('hidden');
      this.switchTab('admin-users');
    });

    document.getElementById('dropdown-item-learning')?.addEventListener('click', () => {
      userDropdownMenu?.classList.add('hidden');
      this.switchTab('practice');
    });

    document.getElementById('dropdown-item-notif')?.addEventListener('click', () => {
      userDropdownMenu?.classList.add('hidden');
      const notifBtn = document.getElementById('header-notification-btn');
      if (notifBtn) notifBtn.click();
    });

    document.getElementById('dropdown-item-logout')?.addEventListener('click', () => {
      userDropdownMenu?.classList.add('hidden');
      logoutUser();
      this.updateHeaderStats();
      this.switchTab('dashboard');
      if (typeof window.showToast === 'function') {
        window.showToast('👋 Bạn đã đăng xuất thành công!');
      } else {
        alert('👋 Bạn đã đăng xuất thành công!');
      }
    });

    if (authBtn) {
      authBtn.addEventListener('click', () => {
        const auth = renderAuthModal(document.body, (user) => {
          this.updateHeaderStats();
          if (user && (user.isAdmin || user.role === 'Admin')) {
            this.switchTab('admin-users');
          } else {
            this.renderCurrentView();
          }
        });
        if (auth && auth.openModal) {
          auth.openModal('login');
        }
      });
    }

    window.addEventListener('open-auth-modal', (e) => {
      const mode = e.detail || 'login';
      const auth = renderAuthModal(document.body, (user) => {
        this.updateHeaderStats();
        if (user && (user.isAdmin || user.role === 'Admin')) {
          this.switchTab('admin-users');
        } else {
          this.renderCurrentView();
        }
      });
      if (auth && auth.openModal) {
        auth.openModal(mode);
      }
    });

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
    
    // Topbar Pill Elements
    const avatarEl = document.getElementById('header-user-avatar');
    if (avatarEl && activeUser.avatar) avatarEl.src = activeUser.avatar;

    const nameEl = document.getElementById('header-user-name');
    if (nameEl) nameEl.innerText = activeUser.name;

    const roleEl = document.getElementById('header-user-role');
    if (roleEl) {
      const type = getUserAccountType(activeUser);
      if (activeUser.isAdmin || activeUser.role === 'Admin') {
        roleEl.innerHTML = `<span class="text-amber-500">👑</span> Admin`;
      } else if (type === 'Premium') {
        roleEl.innerHTML = `<span class="text-amber-500">⭐</span> Premium`;
      } else {
        roleEl.innerHTML = `<span class="text-emerald-500">🌱</span> ${activeUser.role || 'Học viên'}`;
      }
    }

    // Dropdown Popover Elements (Matching Reference Image)
    const dropAvatarEl = document.getElementById('dropdown-user-avatar');
    if (dropAvatarEl && activeUser.avatar) dropAvatarEl.src = activeUser.avatar;

    const dropNameEl = document.getElementById('dropdown-user-name');
    if (dropNameEl) dropNameEl.innerText = activeUser.name;

    const dropRoleEl = document.getElementById('dropdown-user-role');
    if (dropRoleEl) dropRoleEl.innerText = activeUser.role || 'Học viên';

    const dropBadgeContainer = document.getElementById('dropdown-badge-container');
    if (dropBadgeContainer) {
      dropBadgeContainer.innerHTML = getUserAccountBadgeHTML(activeUser);
    }

    const authBtn = document.getElementById('header-auth-btn');
    const isLoggedIn = activeUser && activeUser.id && activeUser.id !== 'guest';

    if (authBtn) {
      if (isLoggedIn) {
        authBtn.classList.add('hidden');
      } else {
        authBtn.classList.remove('hidden');
      }
    }

    const dropAdminBtn = document.getElementById('dropdown-item-admin');
    const dropSettingsAdminBadge = document.getElementById('dropdown-settings-admin-badge');
    const sidebarAdminBtn = document.getElementById('sidebar-admin-users-btn');
    const isAdmin = activeUser && (activeUser.isAdmin || activeUser.role === 'Admin');

    if (dropAdminBtn) {
      if (isAdmin) {
        dropAdminBtn.classList.remove('hidden');
      } else {
        dropAdminBtn.classList.add('hidden');
      }
    }

    if (dropSettingsAdminBadge) {
      if (isAdmin) {
        dropSettingsAdminBadge.classList.remove('hidden');
      } else {
        dropSettingsAdminBadge.classList.add('hidden');
      }
    }

    if (sidebarAdminBtn) {
      if (isAdmin) {
        sidebarAdminBtn.classList.remove('hidden');
      } else {
        sidebarAdminBtn.classList.add('hidden');
      }
    }

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
      case 'grammar':
        renderGrammarView(this.appRoot);
        break;
      case 'reading':
        renderReadingView(this.appRoot);
        break;
      case 'admin-users':
        renderAdminUsersView(this.appRoot);
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
