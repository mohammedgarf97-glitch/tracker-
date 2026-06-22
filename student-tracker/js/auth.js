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
  if (!phone || !pass) { showMsg('يرجى ملء جميع الحقول'); return; }
  const user = DB.findUser(phone, pass);
  if (!user) { showMsg('رقم الهاتف أو كلمة المرور غير صحيحة'); return; }
  localStorage.setItem('current_user', JSON.stringify(user));
  window.location.href = user.role === 'admin' ? 'admin.html' : 'student.html';
}

function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const grade = document.getElementById('reg-grade').value;
  const pass = document.getElementById('reg-pass').value.trim();
  if (!name || !phone || !grade || !pass) { showMsg('يرجى ملء جميع الحقول'); return; }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const pending = DB.get('pending');
  pending.push({ id: Date.now(), name, phone, grade, password: pass, otp,
    date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) });
  DB.set('pending', pending);
  showMsg('تم إرسال طلبك! الكود: ' + otp, 5000);
  setTimeout(() => switchTab('login'), 3500);
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
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doLogin();
});
