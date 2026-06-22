// ===== تسجيل الدخول والخروج =====

function switchTab(tab) {
  document.getElementById('tab-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('tab-register').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

function doLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (!phone || !pass) return showMsg('يرجى ملء جميع الحقول');
  const user = DB.findUser(phone, pass);
  if (!user) return showMsg('رقم الهاتف أو كلمة المرور غير صحيحة');
  localStorage.setItem('current_user', JSON.stringify(user));
  if (user.role === 'admin') window.location.href = 'admin.html';
  else window.location.href = 'student.html';
}

function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const grade = document.getElementById('reg-grade').value;
  const pass = document.getElementById('reg-pass').value.trim();
  if (!name || !phone || !grade || !pass) return showMsg('يرجى ملء جميع الحقول');
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const pending = DB.get('pending');
  pending.push({ id: Date.now(), name, phone, grade, password: pass, otp, date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) });
  DB.set('pending', pending);
  showMsg('تم إرسال طلبك! انتظر موافقة المعلم وسيعطيك الكود: ' + otp, 5000);
  setTimeout(() => switchTab('login'), 3000);
}

function logout() {
  localStorage.removeItem('current_user');
  window.location.href = 'index.html';
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('current_user')); }
  catch { return null; }
}

function showMsg(msg, duration = 3000) {
  const t = document.getElementById('toast') || document.createElement('div');
  t.className = 'toast show';
  t.textContent = msg;
  if (!t.parentNode) { t.id = 'toast'; document.body.appendChild(t); }
  setTimeout(() => t.classList.remove('show'), duration);
}

// حماية: إذا كان مسجلاً دخوله، اذهب مباشرة
const u = getCurrentUser();
if (u) window.location.href = u.role === 'admin' ? 'admin.html' : 'student.html';

// دعم الضغط على Enter
document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
