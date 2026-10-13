// authModal.js - Handling Auth Modals (Login, Register with Email OTP, Forgot Password with OTP)
import { 
  authenticateUser, 
  requestRegisterEmailVerification, 
  confirmRegisterOTP, 
  requestPasswordResetOTP, 
  resetPasswordWithOTP, 
  getActiveUser,
  saveUserAccount
} from '../utils/accountManager.js';

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

export function renderAuthModal(container = document.body, onAuthSuccess = null) {
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
