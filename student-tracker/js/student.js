// ===== واجهة الطالب =====

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('current_user')); }
  catch { return null; }
}

const user = getCurrentUser();
if (!user || user.role !== 'student') window.location.href = 'index.html';

// تحديث اسم الطالب في الشريط العلوي
document.getElementById('student-name-header').textContent = user.name.split(' ')[0];

let currentPage = 'profile';

function logout() {
  localStorage.removeItem('current_user');
  window.location.href = 'index.html';
}

function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}

function setNavActive(page) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('nav-' + page);
  if (el) el.classList.add('active');
}

function loadPage(page) {
  currentPage = page;
  setNavActive(page);
  const pages = { profile, 'my-attendance': myAttendance, scan, announcements, resources };
  const fn = pages[page];
  document.getElementById('main-content').innerHTML = fn ? fn() : '';
}

// ===== الملف الشخصي =====
function profile() {
  // تحديث بيانات المستخدم من قاعدة البيانات
  const fresh = DB.getStudentById(user.id);
  const s = fresh || user;
  const attRecords = DB.getStudentAttendance(s.id);
  const presentCount = attRecords.filter(a => a.present).length;
  const absentCount = attRecords.filter(a => !a.present).length;

  return `
    <div class="profile-header">
      <div class="profile-avatar-lg">${s.name.charAt(0)}</div>
      <div class="profile-name">${s.name}</div>
      <div class="profile-grade">${s.grade} · ${s.group}</div>
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="v" style="color:var(--primary-dark)">${presentCount}</div>
          <div class="l">حصص حضرتها</div>
        </div>
        <div class="profile-stat">
          <div class="v" style="color:var(--danger)">${s.absences || 0}</div>
          <div class="l">غيابات</div>
        </div>
        <div class="profile-stat">
          <div class="v" style="color:${s.paid ? 'var(--primary-dark)' : 'var(--danger)'}">${s.paid ? '✓' : '✕'}</div>
          <div class="l">الدفع</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><i class="ti ti-user"></i> معلوماتي</div>
      <div style="display:flex;flex-direction:column;gap:0">
        ${[
          ['الاسم الكامل', s.name],
          ['الصف الدراسي', s.grade],
          ['المجموعة', s.group],
          ['رقم الهاتف', s.phone],
          ['تاريخ الانضمام', s.joined || '2024-09-01'],
        ].map(([lbl, val]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-muted)">${lbl}</span>
            <span style="font-size:13px;font-weight:500;color:var(--text)">${val}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
          <span style="font-size:13px;color:var(--text-muted)">حالة الدفع - يونيو</span>
          <span class="pill ${s.paid ? 'pill-green' : 'pill-red'}">${s.paid ? '✓ تم الدفع' : '✕ لم يتم الدفع'}</span>
        </div>
      </div>
    </div>

    ${!s.paid ? `
    <div style="background:var(--danger-light);border:1.5px solid var(--danger);border-radius:var(--radius);padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <i class="ti ti-alert-circle" style="font-size:22px;color:var(--danger)"></i>
        <div>
          <div style="font-size:14px;font-weight:600;color:#A32D2D">رسوم يونيو غير مدفوعة</div>
          <div style="font-size:12px;color:#A32D2D">يرجى التواصل مع الأستاذ محمد لتسوية الرسوم</div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="card">
      <div class="card-title"><i class="ti ti-calendar"></i> ملخص الحضور هذا الشهر</div>
      <div style="display:flex;gap:16px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)">
          <div style="width:12px;height:12px;border-radius:3px;background:var(--primary-light)"></div> حضور
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)">
          <div style="width:12px;height:12px;border-radius:3px;background:var(--danger-light)"></div> غياب
        </div>
      </div>
      ${buildMiniCalendar(s.id)}
    </div>
  `;
}

function buildMiniCalendar(studentId) {
  const attRecords = DB.getStudentAttendance(studentId);
  const days = Array.from({length: 15}, (_, i) => i + 1);
  return `<div class="cal-grid">
    ${days.map(d => {
      const dateStr = `2025-06-${String(d).padStart(2,'0')}`;
      const rec = attRecords.find(a => a.date === dateStr);
      let cls = 'cal-none', content = d;
      if (rec) cls = rec.present ? 'cal-present' : 'cal-absent';
      return `<div class="cal-day ${cls}">${content}</div>`;
    }).join('')}
  </div>`;
}

// ===== سجل الحضور =====
function myAttendance() {
  const s = DB.getStudentById(user.id) || user;
  const attRecords = DB.getStudentAttendance(s.id);
  const present = attRecords.filter(a => a.present).length;
  const absent = attRecords.filter(a => !a.present).length;
  const total = present + absent;
  const pct = total > 0 ? Math.round((present / total) * 100) : 100;

  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">سجل حضوري</div>

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card stat-green"><div class="stat-num">${present}</div><div class="stat-lbl">حضور</div></div>
      <div class="stat-card stat-red"><div class="stat-num">${absent}</div><div class="stat-lbl">غياب</div></div>
      <div class="stat-card"><div class="stat-num" style="font-size:20px">${pct}%</div><div class="stat-lbl">النسبة</div></div>
    </div>

    <div class="card">
      <div class="card-title"><i class="ti ti-calendar-month"></i> يونيو 2025</div>
      <div style="display:flex;gap:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)">
          <div style="width:12px;height:12px;border-radius:3px;background:var(--primary-light)"></div> حضور
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)">
          <div style="width:12px;height:12px;border-radius:3px;background:var(--danger-light)"></div> غياب
        </div>
      </div>
      ${buildMiniCalendar(s.id)}
    </div>

    <div class="card" style="padding:0">
      <div style="padding:14px 14px 10px;font-size:14px;font-weight:600;color:var(--text)">تفاصيل الحصص</div>
      ${attRecords.length === 0 ?
        '<div style="text-align:center;padding:20px;color:var(--text-hint);font-size:13px">لا توجد سجلات بعد</div>' :
        [...attRecords].reverse().map(a => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;font-family:monospace;color:var(--text-muted)">${a.date}</span>
            <span class="pill ${a.present ? 'pill-green' : 'pill-red'}">${a.present ? 'حاضر' : 'غائب'}</span>
            <span style="font-size:12px;color:var(--text-hint)">${a.time || '—'}</span>
          </div>
        `).join('')}
    </div>
  `;
}

// ===== مسح QR =====
function scan() {
  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:6px">تسجيل الحضور</div>
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">امسح كود QR الذي يعرضه أستاذ محمد</div>

    <div class="scan-area" onclick="simulateScan()">
      <i class="ti ti-scan"></i>
      <div class="scan-label">اضغط لتشغيل الكاميرا</div>
      <div class="scan-sub">وجّه الكاميرا نحو كود QR</div>
    </div>

    <div class="card">
      <div class="card-title"><i class="ti ti-keyboard"></i> أو أدخل الكود يدوياً</div>
      <div style="display:flex;gap:8px">
        <input type="text" class="input-field" id="manual-code"
          placeholder="ST-XXXXXX" style="margin:0;flex:1;text-align:center;font-family:monospace;font-size:16px;letter-spacing:2px">
        <button class="btn btn-primary" onclick="submitManualCode()"><i class="ti ti-check"></i></button>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><i class="ti ti-history"></i> آخر تسجيل</div>
      ${getLastAttendance()}
    </div>
  `;
}

function getLastAttendance() {
  const records = DB.getStudentAttendance(user.id);
  if (records.length === 0) return '<div style="text-align:center;color:var(--text-hint);font-size:13px;padding:8px">لا يوجد سجل سابق</div>';
  const last = records[records.length - 1];
  return `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:14px;height:14px;border-radius:50%;background:${last.present ? 'var(--primary)' : 'var(--danger)'}"></div>
      <div>
        <div style="font-size:14px;font-weight:500">${last.present ? 'تم تسجيل حضورك' : 'غائب'}</div>
        <div style="font-size:12px;color:var(--text-hint);font-family:monospace">${last.date} ${last.time ? '· ' + last.time : ''}</div>
      </div>
    </div>
  `;
}

function simulateScan() {
  // في التطبيق الحقيقي: تفتح الكاميرا وتقرأ QR
  // هنا نحاكي نجاح المسح باستخدام الكود الحالي
  const session = DB.getSessionQR();
  if (!session || !session.code) return showToast('لا توجد حصة نشطة الآن');
  processAttendance(session.code);
}

function submitManualCode() {
  const code = document.getElementById('manual-code').value.trim().toUpperCase();
  if (!code) return showToast('يرجى إدخال الكود');
  processAttendance(code);
}

function processAttendance(code) {
  const session = DB.getSessionQR();
  if (!session || session.code !== code) {
    showToast('❌ الكود غير صحيح أو منتهي الصلاحية');
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  const existing = DB.getAttendance(today).find(a => a.studentId === user.id && a.present);
  if (existing) {
    showToast('✓ حضورك مسجَّل مسبقاً اليوم');
    return;
  }
  DB.toggleAttendance(user.id, today);
  showToast('✓ تم تسجيل حضورك بنجاح!', 3000);
  setTimeout(() => loadPage('scan'), 500);
}

// ===== الإعلانات =====
function announcements() {
  const fresh = DB.getStudentById(user.id) || user;
  const allAnns = DB.getAnnouncements();
  // الطالب يرى الإعلانات العامة وإعلانات مجموعته فقط
  const visible = allAnns.filter(a => a.target === 'الكل' || a.target === fresh.group);

  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">الإعلانات</div>
    ${visible.length === 0 ?
      '<div class="empty-state"><i class="ti ti-bell-off"></i><p>لا توجد إعلانات حالياً</p></div>' :
      visible.map(a => {
        const liked = (a.likedBy || []).includes(user.id);
        return `
          <div class="ann-card">
            <div class="ann-header">
              <div class="ann-avatar">م</div>
              <div class="ann-meta">
                <div class="ann-title">${a.title}</div>
                <div class="ann-date">${a.date}</div>
              </div>
              <span class="pill ${a.target === 'الكل' ? 'pill-blue' : 'pill-purple'}" style="font-size:10px">${a.target}</span>
            </div>
            <div class="ann-body">${a.body}</div>
            <div class="ann-footer">
              <button class="like-btn ${liked ? 'liked' : ''}" id="like-btn-${a.id}" onclick="toggleLike(${a.id})">
                <i class="ti ${liked ? 'ti-heart-filled' : 'ti-heart'}"></i>
                <span id="like-count-${a.id}">${a.likes || 0}</span> إعجاب
              </button>
              <span style="font-size:11px;color:var(--text-hint)">${a.target}</span>
            </div>
          </div>
        `;
      }).join('')}
  `;
}

function toggleLike(annId) {
  const updated = DB.toggleLike(annId, user.id);
  if (!updated) return;
  const liked = (updated.likedBy || []).includes(user.id);
  const btn = document.getElementById('like-btn-' + annId);
  const cnt = document.getElementById('like-count-' + annId);
  if (btn) {
    btn.classList.toggle('liked', liked);
    btn.querySelector('i').className = 'ti ' + (liked ? 'ti-heart-filled' : 'ti-heart');
  }
  if (cnt) cnt.textContent = updated.likes || 0;
  showToast(liked ? '❤️ تم الإعجاب' : 'تم إلغاء الإعجاب');
}

// ===== موارد التعلم =====
function resources() {
  const fresh = DB.getStudentById(user.id) || user;
  const myRes = DB.getResources(fresh.group);

  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">موارد التعلم</div>

    <div style="background:var(--primary-light);border:1.5px solid var(--primary);border-radius:var(--radius);padding:14px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px">
        <i class="ti ti-folder-open" style="font-size:24px;color:var(--primary-dark)"></i>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--primary-dark)">${fresh.group} - ${fresh.grade}</div>
          <div style="font-size:12px;color:var(--primary)">${myRes.length} ملف متاح لك</div>
        </div>
      </div>
    </div>

    ${myRes.length === 0 ?
      '<div class="empty-state"><i class="ti ti-books"></i><p>لا توجد ملفات بعد في مجموعتك</p></div>' :
      `<div class="card" style="padding:0 14px">
        ${myRes.map(r => `
          <div class="resource-item">
            <div class="resource-icon ${r.type === 'pdf' ? 'res-pdf' : 'res-img'}">
              <i class="ti ${r.type === 'pdf' ? 'ti-file-type-pdf' : 'ti-photo'}"></i>
            </div>
            <div class="resource-info">
              <div class="resource-name">${r.name}</div>
              <div class="resource-meta">${r.size} · ${r.date}</div>
            </div>
            <a href="${r.url || '#'}" target="_blank" class="btn btn-primary btn-sm" onclick="event.stopPropagation();showToast('جاري فتح الملف...')">
              <i class="ti ti-download"></i>
            </a>
          </div>
        `).join('')}
      </div>`}

    <div style="background:#F5F5F5;border-radius:var(--radius);padding:14px;margin-top:12px;text-align:center">
      <i class="ti ti-lock" style="font-size:24px;color:var(--text-hint);display:block;margin-bottom:6px"></i>
      <div style="font-size:12px;color:var(--text-hint)">ملفات المجموعات الأخرى غير متاحة<br>لحماية خصوصية الطلاب</div>
    </div>
  `;
}

// ===== تحميل الصفحة الأولى =====
loadPage('profile');
