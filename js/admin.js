// ===== واجهة المعلم =====

const user = getCurrentUser();
if (!user || user.role !== 'admin') window.location.href = 'index.html';

let currentPage = 'dashboard';
let currentFilter = 'الكل';
let todayDate = new Date().toISOString().split('T')[0];

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('current_user')); }
  catch { return null; }
}

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
  const pages = { dashboard, students, attendance, announcements, more };
  const fn = pages[page] || pages['dashboard'];
  document.getElementById('main-content').innerHTML = fn();
  bindPageEvents(page);
}

function bindPageEvents(page) {
  if (page === 'attendance') {
    document.querySelectorAll('.filter-chip').forEach(c => {
      c.addEventListener('click', () => {
        currentFilter = c.dataset.group;
        document.querySelectorAll('.filter-chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        renderAttendanceList();
      });
    });
  }
}

// ===== لوحة التحكم =====
function dashboard() {
  const students = DB.getStudents();
  const paid = students.filter(s => s.paid).length;
  const unpaid = students.filter(s => !s.paid).length;
  const totalAbs = students.reduce((a, s) => a + (s.absences || 0), 0);
  const pending = DB.getPending().length;

  return `
    <div style="margin-bottom:16px">
      <div style="font-size:13px;color:#6B6B6B">مرحباً، أ. محمد علي 👋</div>
      <div style="font-size:20px;font-weight:700;color:#1A1A1A">لوحة التحكم</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-num" style="color:#1A1A1A">${students.length}</div><div class="stat-lbl">إجمالي الطلاب</div></div>
      <div class="stat-card stat-green"><div class="stat-num">${paid}</div><div class="stat-lbl">دفعوا هذا الشهر</div></div>
      <div class="stat-card stat-red"><div class="stat-num">${unpaid}</div><div class="stat-lbl">لم يدفعوا بعد</div></div>
      <div class="stat-card stat-amber"><div class="stat-num">${totalAbs}</div><div class="stat-lbl">غيابات الشهر</div></div>
    </div>

    ${pending > 0 ? `
    <div style="background:#FAEEDA;border:1.5px solid #EF9F27;border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;cursor:pointer" onclick="loadPage('more')">
      <i class="ti ti-user-check" style="font-size:22px;color:#854F0B"></i>
      <div style="flex:1"><div style="font-size:14px;font-weight:600;color:#633806">${pending} طلبات انتساب تنتظر</div><div style="font-size:12px;color:#854F0B">اضغط للمراجعة</div></div>
      <i class="ti ti-chevron-left" style="color:#854F0B"></i>
    </div>
    ` : ''}

    <div class="card">
      <div class="card-title"><i class="ti ti-users"></i> حالة الطلاب - يونيو 2025</div>
      ${students.map(s => `
        <div class="student-row">
          <div class="student-avatar">${s.name.charAt(0)}</div>
          <div class="student-info">
            <div class="student-name">${s.name}</div>
            <div class="student-sub">${s.group} · ${s.absences || 0} غياب</div>
          </div>
          <span class="pill ${s.paid ? 'pill-green' : 'pill-red'}">${s.paid ? '✓ مدفوع' : '✕ غير مدفوع'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== الطلاب =====
function students() {
  const studentList = DB.getStudents();
  const groups = ['الكل', ...DB.getGroups().map(g => g.name)];
  const filtered = currentFilter === 'الكل' ? studentList : studentList.filter(s => s.group === currentFilter);

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:20px;font-weight:700">الطلاب (${studentList.length})</div>
      <button class="btn btn-primary btn-sm" onclick="openAddStudent()"><i class="ti ti-plus"></i> إضافة</button>
    </div>

    <div class="filter-row">
      ${groups.map(g => `<button class="filter-chip ${g === currentFilter ? 'active' : ''}" onclick="filterStudents('${g}')">${g}</button>`).join('')}
    </div>

    <div class="card" style="padding:0">
      ${filtered.length === 0 ? '<div class="empty-state"><i class="ti ti-users-off"></i><p>لا يوجد طلاب في هذه المجموعة</p></div>' :
        filtered.map(s => `
          <div class="student-row" style="padding:12px 14px">
            <div class="student-avatar">${s.name.charAt(0)}</div>
            <div class="student-info">
              <div class="student-name">${s.name}</div>
              <div class="student-sub">${s.grade} · ${s.group}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px">
              <span class="pill ${s.paid ? 'pill-green' : 'pill-red'}" style="font-size:10px">${s.paid ? 'مدفوع' : 'غير مدفوع'}</span>
              <span class="pill pill-gray" style="font-size:10px">${s.absences || 0} غياب</span>
            </div>
            <button class="icon-btn" onclick="openStudentDetails(${s.id})" style="margin-right:6px"><i class="ti ti-dots-vertical"></i></button>
          </div>
        `).join('')}
    </div>
  `;
}

function filterStudents(group) {
  currentFilter = group;
  loadPage('students');
}

function openAddStudent() {
  const groups = DB.getGroups();
  openModal('إضافة طالب جديد', `
    <div class="form-group"><label>الاسم الكامل</label><input type="text" class="input-field" id="m-name" placeholder="اسم الطالب"></div>
    <div class="form-group"><label>رقم الهاتف</label><input type="tel" class="input-field" id="m-phone" placeholder="01XXXXXXXXX" inputmode="numeric"></div>
    <div class="form-group"><label>الصف الدراسي</label>
      <select class="input-field" id="m-grade">
        <option value="">اختر الصف</option>
        <option>الصف الرابع الابتدائي</option><option>الصف الخامس الابتدائي</option>
        <option>الصف السادس الابتدائي</option><option>الصف الأول الإعدادي</option>
        <option>الصف الثاني الإعدادي</option><option>الصف الثالث الإعدادي</option>
      </select>
    </div>
    <div class="form-group"><label>المجموعة</label>
      <select class="input-field" id="m-group">
        ${groups.map(g => `<option>${g.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>كلمة المرور</label><input type="text" class="input-field" id="m-pass" placeholder="كلمة مرور للطالب"></div>
    <button class="btn btn-primary btn-block" onclick="saveStudent()"><i class="ti ti-check"></i> حفظ الطالب</button>
  `);
}

function saveStudent() {
  const name = document.getElementById('m-name').value.trim();
  const phone = document.getElementById('m-phone').value.trim();
  const grade = document.getElementById('m-grade').value;
  const group = document.getElementById('m-group').value;
  const pass = document.getElementById('m-pass').value.trim();
  if (!name || !phone || !grade || !group || !pass) return showToast('يرجى ملء جميع الحقول');
  DB.addStudent({ name, phone, password: pass, grade, group, absences: 0, paid: false, joined: new Date().toISOString().split('T')[0] });
  closeModal();
  showToast('✓ تم إضافة الطالب بنجاح');
  loadPage('students');
}

function openStudentDetails(id) {
  const s = DB.getStudentById(id);
  if (!s) return;
  openModal('تفاصيل الطالب', `
    <div style="text-align:center;padding:16px 0 20px">
      <div style="width:60px;height:60px;border-radius:50%;background:var(--primary-light);color:var(--primary-dark);font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">${s.name.charAt(0)}</div>
      <div style="font-size:18px;font-weight:700">${s.name}</div>
      <div style="font-size:13px;color:#6B6B6B;margin-top:4px">${s.grade} · ${s.group}</div>
    </div>
    <div style="background:#F5F5F5;border-radius:10px;padding:12px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #E8E8E8"><span style="color:#6B6B6B;font-size:13px">رقم الهاتف</span><span style="font-size:13px;font-family:monospace">${s.phone}</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #E8E8E8"><span style="color:#6B6B6B;font-size:13px">الغيابات</span><span style="font-size:13px;color:${s.absences > 2 ? '#E24B4A' : '#1A1A1A'}">${s.absences || 0} أيام</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:#6B6B6B;font-size:13px">حالة الدفع</span><span class="pill ${s.paid ? 'pill-green' : 'pill-red'}" style="font-size:11px">${s.paid ? 'مدفوع' : 'غير مدفوع'}</span></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn btn-primary btn-block" onclick="togglePaymentAdmin(${s.id})"><i class="ti ti-credit-card"></i> ${s.paid ? 'إلغاء تسجيل الدفع' : 'تسجيل الدفع'}</button>
      <button class="btn btn-block" style="color:#E24B4A;border-color:#E24B4A" onclick="deleteStudentConfirm(${s.id})"><i class="ti ti-trash"></i> حذف الطالب</button>
    </div>
  `);
}

function togglePaymentAdmin(id) {
  const paid = DB.togglePayment(id);
  closeModal();
  showToast(paid ? '✓ تم تسجيل الدفع' : 'تم إلغاء تسجيل الدفع');
  loadPage(currentPage);
}

function deleteStudentConfirm(id) {
  const s = DB.getStudentById(id);
  if (confirm('هل أنت متأكد من حذف ' + s.name + '؟')) {
    DB.deleteStudent(id);
    closeModal();
    showToast('تم حذف الطالب');
    loadPage('students');
  }
}

// ===== الحضور =====
function attendance() {
  const groups = DB.getGroups();
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:20px;font-weight:700">الحضور والغياب</div>
      <span class="pill pill-blue">اليوم</span>
    </div>
    <div class="filter-row">
      <button class="filter-chip active" data-group="الكل">الكل</button>
      ${groups.map(g => `<button class="filter-chip" data-group="${g.name}">${g.name}</button>`).join('')}
    </div>
    <div id="att-list"></div>
    <button class="btn btn-primary btn-block" style="margin-top:8px" onclick="openQRPage()">
      <i class="ti ti-qrcode"></i> عرض كود QR للحصة
    </button>
  `;
}

function renderAttendanceList() {
  const allStudents = DB.getStudents();
  const filtered = currentFilter === 'الكل' ? allStudents : allStudents.filter(s => s.group === currentFilter);
  const todayAtt = DB.getAttendance(todayDate);

  document.getElementById('att-list').innerHTML = `
    <div class="card" style="padding:0">
      ${filtered.length === 0 ? '<div class="empty-state"><i class="ti ti-calendar-off"></i><p>لا يوجد طلاب</p></div>' :
        filtered.map(s => {
          const att = todayAtt.find(a => a.studentId === s.id);
          const present = att ? att.present : false;
          return `
            <div class="student-row" style="padding:12px 14px">
              <div class="student-avatar">${s.name.charAt(0)}</div>
              <div class="student-info">
                <div class="student-name">${s.name}</div>
                <div class="student-sub">${s.group} ${att && att.time ? '· ' + att.time : ''}</div>
              </div>
              <button class="att-toggle ${present ? 'present' : 'absent'}" id="att-${s.id}" onclick="toggleAtt(${s.id})"></button>
            </div>
          `;
        }).join('')}
    </div>
  `;
}

function toggleAtt(studentId) {
  const result = DB.toggleAttendance(studentId, todayDate);
  const btn = document.getElementById('att-' + studentId);
  if (btn) {
    btn.classList.toggle('present', result.present);
    btn.classList.toggle('absent', !result.present);
  }
  showToast(result.present ? '✓ تم تسجيل الحضور' : 'تم تسجيل الغياب');
}

function openQRPage() {
  loadPage('qr');
  setNavActive('attendance');
}

// ===== QR =====
function qr() {
  const session = DB.getSessionQR();
  const todayAtt = DB.getAttendance(todayDate);
  const presentStudents = DB.getStudents().filter(s => todayAtt.find(a => a.studentId === s.id && a.present));

  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">كود QR الحصة</div>
    <div class="qr-box">
      <div style="font-size:14px;color:#6B6B6B;margin-bottom:4px">كود الحصة الحالية</div>
      <div class="qr-display"><i class="ti ti-qrcode"></i></div>
      <div class="qr-code-text">${session.code || 'ST-000000'}</div>
      <div style="font-size:12px;color:#AAAAAA;margin-bottom:16px">اعرض هذا الكود للطلاب ليسجلوا حضورهم</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn btn-primary" onclick="refreshQR()"><i class="ti ti-refresh"></i> تجديد الكود</button>
        <button class="btn" onclick="copyQR()"><i class="ti ti-copy"></i> نسخ</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><i class="ti ti-check"></i> سجّلوا حضورهم (${presentStudents.length})</div>
      ${presentStudents.length === 0 ? '<div style="text-align:center;color:#AAAAAA;padding:16px;font-size:13px">لم يسجل أحد بعد</div>' :
        presentStudents.map(s => `
          <div class="student-row">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--primary);flex-shrink:0"></div>
            <div class="student-info"><div class="student-name">${s.name}</div></div>
          </div>
        `).join('')}
    </div>
  `;
}

function refreshQR() {
  DB.regenerateQR();
  showToast('✓ تم تجديد الكود');
  loadPage('qr');
  setNavActive('attendance');
}

function copyQR() {
  const session = DB.getSessionQR();
  navigator.clipboard?.writeText(session.code).then(() => showToast('✓ تم نسخ الكود'))
    .catch(() => showToast('الكود: ' + session.code));
}

// ===== الإعلانات =====
function announcements() {
  const anns = DB.getAnnouncements();
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:20px;font-weight:700">الإعلانات</div>
      <button class="btn btn-primary btn-sm" onclick="openAddAnn()"><i class="ti ti-plus"></i> إضافة</button>
    </div>
    ${anns.length === 0 ? '<div class="empty-state"><i class="ti ti-speakerphone"></i><p>لا توجد إعلانات بعد</p></div>' :
      anns.map(a => `
        <div class="ann-card">
          <div class="ann-header">
            <div class="ann-avatar">م</div>
            <div class="ann-meta">
              <div class="ann-title">${a.title}</div>
              <div class="ann-date">${a.date} · ${a.target}</div>
            </div>
          </div>
          <div class="ann-body">${a.body}</div>
          <div class="ann-footer">
            <span style="font-size:12px;color:#6B6B6B"><i class="ti ti-heart" style="vertical-align:-2px"></i> ${a.likes || 0} إعجاب</span>
            <button class="btn btn-sm" style="color:#E24B4A;border-color:#E24B4A" onclick="deleteAnn(${a.id})"><i class="ti ti-trash"></i> حذف</button>
          </div>
        </div>
      `).join('')}
  `;
}

function openAddAnn() {
  const groups = DB.getGroups();
  openModal('إعلان جديد', `
    <div class="form-group"><label>العنوان</label><input type="text" class="input-field" id="ann-title" placeholder="عنوان الإعلان"></div>
    <div class="form-group"><label>النص</label><textarea class="input-field" id="ann-body" rows="4" placeholder="اكتب الإعلان هنا..." style="resize:none"></textarea></div>
    <div class="form-group"><label>الجمهور المستهدف</label>
      <select class="input-field" id="ann-target">
        <option>الكل</option>
        ${groups.map(g => `<option>${g.name}</option>`).join('')}
      </select>
    </div>
    <button class="btn btn-primary btn-block" onclick="saveAnn()"><i class="ti ti-send"></i> نشر الإعلان</button>
  `);
}

function saveAnn() {
  const title = document.getElementById('ann-title').value.trim();
  const body = document.getElementById('ann-body').value.trim();
  const target = document.getElementById('ann-target').value;
  if (!title || !body) return showToast('يرجى ملء جميع الحقول');
  DB.addAnnouncement({ title, body, target });
  closeModal();
  showToast('✓ تم نشر الإعلان');
  loadPage('announcements');
}

function deleteAnn(id) {
  if (confirm('هل تريد حذف هذا الإعلان؟')) {
    DB.deleteAnnouncement(id);
    showToast('تم حذف الإعلان');
    loadPage('announcements');
  }
}

// ===== المزيد =====
function more() {
  const pending = DB.getPending();
  const groups = DB.getGroups();
  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">المزيد</div>

    <div class="more-item" onclick="loadPage('qr');setNavActive('attendance')">
      <div class="more-icon" style="background:#E1F5EE;color:#0F6E56"><i class="ti ti-qrcode"></i></div>
      <div class="more-info"><div class="more-title">كود QR الحصة</div><div class="more-sub">عرض وتجديد كود الحصة</div></div>
      <i class="ti ti-chevron-left more-arrow"></i>
    </div>

    <div class="more-item" onclick="loadPage('resources-admin')">
      <div class="more-icon" style="background:#E6F1FB;color:#0C447C"><i class="ti ti-books"></i></div>
      <div class="more-info"><div class="more-title">المكتبة التعليمية</div><div class="more-sub">رفع وإدارة الملفات والمواد</div></div>
      <i class="ti ti-chevron-left more-arrow"></i>
    </div>

    <div class="more-item" onclick="loadPage('payments-admin')">
      <div class="more-icon" style="background:#EAF3DE;color:#27500A"><i class="ti ti-credit-card"></i></div>
      <div class="more-info"><div class="more-title">المدفوعات</div><div class="more-sub">تتبع دفعات الطلاب الشهرية</div></div>
      <i class="ti ti-chevron-left more-arrow"></i>
    </div>

    <div class="more-item" onclick="loadPage('groups-admin')">
      <div class="more-icon" style="background:#EEEDFE;color:#3C3489"><i class="ti ti-users-group"></i></div>
      <div class="more-info"><div class="more-title">المجموعات</div><div class="more-sub">${groups.length} مجموعات · إدارة وإضافة</div></div>
      <i class="ti ti-chevron-left more-arrow"></i>
    </div>

    <div class="more-item ${pending.length > 0 ? '' : ''}" onclick="loadPage('pending-admin')">
      <div class="more-icon" style="background:#FAEEDA;color:#633806"><i class="ti ti-user-check"></i></div>
      <div class="more-info">
        <div class="more-title">طلبات الانتساب ${pending.length > 0 ? `<span class="pill pill-amber" style="font-size:10px;margin-right:6px">${pending.length} جديد</span>` : ''}</div>
        <div class="more-sub">مراجعة وقبول الطلاب الجدد</div>
      </div>
      <i class="ti ti-chevron-left more-arrow"></i>
    </div>
  `;
}

// ===== الموارد (للمعلم) =====
function resourcesAdmin() {
  const groups = DB.getGroups();
  const allRes = DB.getResources();
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:20px;font-weight:700">المكتبة التعليمية</div>
      <button class="btn btn-primary btn-sm" onclick="openAddResource()"><i class="ti ti-upload"></i> رفع</button>
    </div>
    ${groups.map(g => {
      const res = DB.getResources(g.name);
      return `
        <div class="card">
          <div class="card-title"><i class="ti ti-folder"></i> ${g.name} <span class="pill pill-blue" style="font-size:11px">${res.length} ملف</span></div>
          ${res.length === 0 ? '<div style="text-align:center;color:#AAAAAA;font-size:13px;padding:8px">لا توجد ملفات</div>' :
            res.map(r => `
              <div class="resource-item">
                <div class="resource-icon ${r.type === 'pdf' ? 'res-pdf' : 'res-img'}">
                  <i class="ti ${r.type === 'pdf' ? 'ti-file-type-pdf' : 'ti-photo'}"></i>
                </div>
                <div class="resource-info">
                  <div class="resource-name">${r.name}</div>
                  <div class="resource-meta">${r.size} · ${r.date}</div>
                </div>
                <button class="icon-btn" onclick="deleteRes(${r.id})" style="color:#E24B4A"><i class="ti ti-trash"></i></button>
              </div>
            `).join('')}
        </div>
      `;
    }).join('')}
  `;
}

function openAddResource() {
  const groups = DB.getGroups();
  openModal('رفع ملف جديد', `
    <div class="form-group"><label>اسم الملف</label><input type="text" class="input-field" id="res-name" placeholder="مثال: ملخص الفصل الثالث"></div>
    <div class="form-group"><label>نوع الملف</label>
      <select class="input-field" id="res-type">
        <option value="pdf">PDF - ملف</option>
        <option value="img">صورة</option>
      </select>
    </div>
    <div class="form-group"><label>المجموعة</label>
      <select class="input-field" id="res-group">
        ${groups.map(g => `<option>${g.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>رابط الملف (Google Drive أو أي رابط)</label><input type="url" class="input-field" id="res-url" placeholder="https://..."></div>
    <button class="btn btn-primary btn-block" onclick="saveResource()"><i class="ti ti-check"></i> حفظ الملف</button>
  `);
}

function saveResource() {
  const name = document.getElementById('res-name').value.trim();
  const type = document.getElementById('res-type').value;
  const group = document.getElementById('res-group').value;
  const url = document.getElementById('res-url').value.trim() || '#';
  if (!name) return showToast('يرجى كتابة اسم الملف');
  DB.addResource({ name, type, group, url, size: '—' });
  closeModal();
  showToast('✓ تم إضافة الملف');
  loadPage('resources-admin');
}

function deleteRes(id) {
  if (confirm('حذف هذا الملف؟')) {
    DB.deleteResource(id);
    showToast('تم حذف الملف');
    loadPage('resources-admin');
  }
}

// ===== المدفوعات =====
function paymentsAdmin() {
  const students = DB.getStudents();
  const paid = students.filter(s => s.paid).length;
  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">المدفوعات - يونيو 2025</div>
    <div class="stats-grid" style="grid-template-columns:1fr 1fr">
      <div class="stat-card stat-green"><div class="stat-num">${paid}</div><div class="stat-lbl">دفعوا</div></div>
      <div class="stat-card stat-red"><div class="stat-num">${students.length - paid}</div><div class="stat-lbl">لم يدفعوا</div></div>
    </div>
    <div class="card" style="padding:0">
      ${students.map(s => `
        <div class="student-row" style="padding:12px 14px">
          <div class="student-avatar">${s.name.charAt(0)}</div>
          <div class="student-info">
            <div class="student-name">${s.name}</div>
            <div class="student-sub">${s.group}</div>
          </div>
          <button class="btn ${s.paid ? '' : 'btn-primary'} btn-sm" onclick="togglePay(${s.id})">
            ${s.paid ? '<i class="ti ti-x"></i> إلغاء' : '<i class="ti ti-check"></i> تسجيل دفع'}
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function togglePay(id) {
  const paid = DB.togglePayment(id);
  showToast(paid ? '✓ تم تسجيل الدفع' : 'تم إلغاء الدفع');
  loadPage('payments-admin');
}

// ===== المجموعات =====
function groupsAdmin() {
  const groups = DB.getGroups();
  const students = DB.getStudents();
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:20px;font-weight:700">المجموعات</div>
      ${groups.length < 10 ? `<button class="btn btn-primary btn-sm" onclick="openAddGroup()"><i class="ti ti-plus"></i> إضافة</button>` : ''}
    </div>
    ${groups.map(g => {
      const cnt = students.filter(s => s.group === g.name).length;
      return `
        <div class="card">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:12px;background:var(--primary-light);color:var(--primary-dark);display:flex;align-items:center;justify-content:center;font-size:22px"><i class="ti ti-users"></i></div>
            <div style="flex:1">
              <div style="font-size:15px;font-weight:600">${g.name} - ${g.grade}</div>
              <div style="font-size:12px;color:#6B6B6B">${g.day} · ${g.time} · ${cnt} طالب</div>
            </div>
          </div>
        </div>
      `;
    }).join('')}
    <div style="background:#F5F5F5;border:2px dashed #DDD;border-radius:12px;padding:20px;text-align:center;cursor:pointer" onclick="openAddGroup()">
      <i class="ti ti-plus" style="font-size:28px;color:#AAAAAA;display:block;margin-bottom:6px"></i>
      <div style="font-size:13px;color:#6B6B6B">إضافة مجموعة جديدة</div>
      <div style="font-size:11px;color:#AAAAAA">${10 - groups.length} مجموعة متبقية</div>
    </div>
  `;
}

function openAddGroup() {
  openModal('إضافة مجموعة جديدة', `
    <div class="form-group"><label>اسم المجموعة</label><input type="text" class="input-field" id="g-name" placeholder="مثال: مجموعة هـ"></div>
    <div class="form-group"><label>الصف الدراسي</label>
      <select class="input-field" id="g-grade">
        <option>الرابع الابتدائي</option><option>الخامس الابتدائي</option>
        <option>السادس الابتدائي</option><option>الأول الإعدادي</option>
        <option>الثاني الإعدادي</option><option>الثالث الإعدادي</option>
      </select>
    </div>
    <div class="form-group"><label>أيام الحصص</label><input type="text" class="input-field" id="g-day" placeholder="مثال: الثلاثاء والخميس"></div>
    <div class="form-group"><label>وقت الحصة</label><input type="text" class="input-field" id="g-time" placeholder="مثال: 4:00 م"></div>
    <button class="btn btn-primary btn-block" onclick="saveGroup()"><i class="ti ti-check"></i> حفظ المجموعة</button>
  `);
}

function saveGroup() {
  const name = document.getElementById('g-name').value.trim();
  const grade = document.getElementById('g-grade').value;
  const day = document.getElementById('g-day').value.trim();
  const time = document.getElementById('g-time').value.trim();
  if (!name || !day || !time) return showToast('يرجى ملء جميع الحقول');
  DB.addGroup({ name, grade, day, time });
  closeModal();
  showToast('✓ تم إضافة المجموعة');
  loadPage('groups-admin');
}

// ===== طلبات الانتساب =====
function pendingAdmin() {
  const pending = DB.getPending();
  return `
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">طلبات الانتساب</div>
    ${pending.length === 0 ? '<div class="empty-state"><i class="ti ti-user-check"></i><p>لا توجد طلبات معلقة</p></div>' :
      pending.map(p => `
        <div class="pending-card">
          <div class="pending-header">
            <div class="pending-avatar">${p.name.charAt(0)}</div>
            <div class="pending-info">
              <div class="pending-name">${p.name}</div>
              <div class="pending-sub">${p.grade} · ${p.phone}</div>
              <div class="pending-sub">${p.date}</div>
            </div>
          </div>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:#6B6B6B;margin-bottom:6px">كود التحقق OTP (أعطه للطالب):</div>
            <div class="otp-display" style="justify-content:flex-start">
              ${p.otp.split('').map(d => `<div class="otp-digit">${d}</div>`).join('')}
            </div>
          </div>
          <div class="pending-actions">
            <button class="btn btn-primary" style="flex:1" onclick="approveReq(${p.id})"><i class="ti ti-check"></i> قبول وإضافة</button>
            <button class="btn" style="color:#E24B4A;border-color:#E24B4A" onclick="rejectReq(${p.id})"><i class="ti ti-x"></i> رفض</button>
          </div>
        </div>
      `).join('')}
  `;
}

function approveReq(id) {
  const groups = DB.getGroups();
  const groupOptions = groups.map(g => `<option>${g.name}</option>`).join('');
  openModal('قبول الطالب', `
    <div style="margin-bottom:14px;font-size:14px;color:#6B6B6B">اختر المجموعة المناسبة للطالب</div>
    <div class="form-group"><label>المجموعة</label>
      <select class="input-field" id="approve-group">${groupOptions}</select>
    </div>
    <button class="btn btn-primary btn-block" onclick="confirmApprove(${id})"><i class="ti ti-check"></i> تأكيد القبول</button>
  `);
}

function confirmApprove(id) {
  const group = document.getElementById('approve-group').value;
  DB.approvePending(id, group);
  closeModal();
  showToast('✓ تم قبول الطالب وإضافته');
  loadPage('pending-admin');
}

function rejectReq(id) {
  if (confirm('هل تريد رفض هذا الطلب؟')) {
    DB.rejectPending(id);
    showToast('تم رفض الطلب');
    loadPage('pending-admin');
  }
}

// ===== توجيه الصفحات =====
const extraPages = {
  'qr': qr,
  'resources-admin': resourcesAdmin,
  'payments-admin': paymentsAdmin,
  'groups-admin': groupsAdmin,
  'pending-admin': pendingAdmin,
};

const originalLoadPage = loadPage;
window.loadPage = function(page) {
  if (extraPages[page]) {
    currentPage = page;
    document.getElementById('main-content').innerHTML = extraPages[page]();
    bindPageEvents(page);
  } else {
    originalLoadPage(page);
  }
};

// تحميل الصفحة الأولى
loadPage('dashboard');

// إعادة renderAttendanceList بعد تحميل صفحة الحضور
const origBind = bindPageEvents;
window.bindPageEvents = function(page) {
  origBind(page);
  if (page === 'attendance') setTimeout(renderAttendanceList, 0);
};
