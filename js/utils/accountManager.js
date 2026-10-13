// Module Quản Lý Tài Khoản, Lộ Trình Học Cá Nhân Hóa & Kết Quả Học Tập (accountManager.js)

export const DEFAULT_ACCOUNTS = [
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

export function getUserAccountType(user) {
  if (!user || user.id === 'guest') return 'Free';
  if (user.accountType) return user.accountType;
  if (user.isAdmin || user.role === 'Admin' || user.role === 'Học viên Cao Cấp') return 'Premium';
  return 'Free';
}

export function getUserAccountBadgeHTML(user, options = {}) {
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

export function getStoredAccounts() {
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

export function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accounts));
  } catch (e) {}
}

export function getActiveUser() {
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

export function setActiveUser(userId) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
}

export function logoutUser() {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'guest');
  return true;
}

export function authenticateUser(idOrEmail, password) {
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

export function requestRegisterEmailVerification(id, email, password, name) {
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

export function confirmRegisterOTP(enteredOTP) {
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

export function requestPasswordResetOTP(email) {
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

export function resetPasswordWithOTP(enteredOTP, newPassword) {
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

export function saveUserAccount(accountObj) {
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

export function adminCreateUser(userObj) {
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

export function adminUpdateUser(oldId, userObj) {
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

export function toggleLockUserAccount(userId) {
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

export function deleteUserAccount(userId) {
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

export function getScopedStorageKey(baseKey) {
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

export function getFavoriteDictWords() {
  try {
    const key = getScopedStorageKey('hanzo_dict_favorites');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function toggleFavoriteDictWord(wordId) {
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
export function getPersonalizedRoadmap(userObj) {
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
export const DEFAULT_PERMISSIONS = {
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

export function getContentPermissionsConfig() {
  try {
    const data = localStorage.getItem('hanzo_content_permissions_config');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));
}

export function saveContentPermissionsConfig(config) {
  try {
    localStorage.setItem('hanzo_content_permissions_config', JSON.stringify(config));
    return true;
  } catch (e) {
    return false;
  }
}
