// ===== قاعدة البيانات المحلية =====

const DB = {

  init() {
    if (localStorage.getItem('db_initialized')) return;
    
    this.set('users', [
      { id: 1, name: 'محمد علي', phone: '0000', password: 'admin', role: 'admin' },
      { id: 2, name: 'أحمد محمد علي', phone: '0100', password: '1234', role: 'student', grade: 'الصف الأول الإعدادي', group: 'مجموعة أ', absences: 1, paid: true, joined: '2024-09-01' },
      { id: 3, name: 'سارة حسن إبراهيم', phone: '0101', password: '1234', role: 'student', grade: 'الصف الأول الإعدادي', group: 'مجموعة أ', absences: 0, paid: true, joined: '2024-09-01' },
      { id: 4, name: 'محمود عبد الله', phone: '0102', password: '1234', role: 'student', grade: 'الصف السادس الابتدائي', group: 'مجموعة ب', absences: 3, paid: false, joined: '2024-09-05' },
      { id: 5, name: 'نور الدين خالد', phone: '0103', password: '1234', role: 'student', grade: 'الصف الثاني الإعدادي', group: 'مجموعة ج', absences: 0, paid: true, joined: '2024-09-03' },
      { id: 6, name: 'ريم أحمد فاروق', phone: '0104', password: '1234', role: 'student', grade: 'الصف السادس الابتدائي', group: 'مجموعة ب', absences: 2, paid: false, joined: '2024-09-10' },
      { id: 7, name: 'عمر سامي حسن', phone: '0105', password: '1234', role: 'student', grade: 'الصف الثالث الإعدادي', group: 'مجموعة د', absences: 1, paid: true, joined: '2024-09-02' },
    ]);

    this.set('groups', [
      { id: 1, name: 'مجموعة أ', grade: 'الأول الإعدادي', day: 'الثلاثاء والخميس', time: '4:00 م' },
      { id: 2, name: 'مجموعة ب', grade: 'السادس الابتدائي', day: 'الاثنين والأربعاء', time: '5:00 م' },
      { id: 3, name: 'مجموعة ج', grade: 'الثاني الإعدادي', day: 'الأحد والثلاثاء', time: '6:00 م' },
      { id: 4, name: 'مجموعة د', grade: 'الثالث الإعدادي', day: 'السبت والاثنين', time: '3:00 م' },
    ]);

    this.set('announcements', [
      { id: 1, title: 'تذكير موعد الامتحان الشهري', body: 'يُذكَّر جميع الطلاب بأن الامتحان الشهري سيكون يوم الثلاثاء القادم الساعة 4 مساءً. يُرجى المراجعة جيداً.', date: '15 يونيو 2025', target: 'الكل', likes: 12, likedBy: [] },
      { id: 2, title: 'إضافة ملخصات الفصل الثالث', body: 'تم رفع ملخصات الفصل الثالث في قسم الموارد التعليمية لمجموعة أ ومجموعة ب.', date: '12 يونيو 2025', target: 'مجموعة أ', likes: 8, likedBy: [] },
      { id: 3, title: 'تغيير موعد حصة الخميس', body: 'سيتم تغيير موعد حصة يوم الخميس لتكون الساعة 5 مساءً بدلاً من 4 مساءً لهذا الأسبوع فقط.', date: '10 يونيو 2025', target: 'الكل', likes: 5, likedBy: [] },
    ]);

    this.set('resources', [
      { id: 1, name: 'ملخص الفصل الثالث - جبر', type: 'pdf', group: 'مجموعة أ', size: '2.3MB', date: '12 يونيو 2025', url: '#' },
      { id: 2, name: 'شرح معادلات الدرجة الأولى', type: 'pdf', group: 'مجموعة أ', size: '1.8MB', date: '10 يونيو 2025', url: '#' },
      { id: 3, name: 'صور توضيحية - الهندسة', type: 'img', group: 'مجموعة ب', size: '4.1MB', date: '8 يونيو 2025', url: '#' },
      { id: 4, name: 'امتحان تجريبي شهر مايو', type: 'pdf', group: 'مجموعة ب', size: '1.2MB', date: '5 يونيو 2025', url: '#' },
      { id: 5, name: 'ملخص الهندسة الفضائية', type: 'pdf', group: 'مجموعة ج', size: '3.0MB', date: '1 يونيو 2025', url: '#' },
      { id: 6, name: 'تمارين محلولة - جبر', type: 'pdf', group: 'مجموعة د', size: '2.5MB', date: '28 مايو 2025', url: '#' },
    ]);

    this.set('pending', [
      { id: 1, name: 'ياسين عبد الرحمن', grade: 'الصف الخامس الابتدائي', phone: '0100-123-4567', password: '1234', otp: '748362', date: '18 يونيو 2025' },
      { id: 2, name: 'لمياء أحمد سيد', grade: 'الصف الأول الإعدادي', phone: '0115-987-6543', password: '5678', otp: '293847', date: '17 يونيو 2025' },
      { id: 3, name: 'كريم حسن محمود', grade: 'الصف الثاني الإعدادي', phone: '0122-654-3210', password: '9012', otp: '516739', date: '16 يونيو 2025' },
    ]);

    this.set('attendance', [
      { id: 1, studentId: 2, date: '2025-06-15', present: true, time: '4:03 م' },
      { id: 2, studentId: 3, date: '2025-06-15', present: true, time: '4:01 م' },
      { id: 3, studentId: 4, date: '2025-06-15', present: false, time: null },
      { id: 4, studentId: 5, date: '2025-06-15', present: true, time: '4:05 م' },
      { id: 5, studentId: 6, date: '2025-06-15', present: false, time: null },
      { id: 6, studentId: 7, date: '2025-06-15', present: true, time: '4:02 م' },
    ]);

    this.set('session_qr', { code: 'ST-' + Math.floor(100000 + Math.random() * 900000), date: '2025-06-15', active: true });
    localStorage.setItem('db_initialized', '1');
  },

  get(table) {
    try { return JSON.parse(localStorage.getItem('db_' + table)) || []; }
    catch { return []; }
  },

  set(table, data) {
    localStorage.setItem('db_' + table, JSON.stringify(data));
  },

  findUser(phone, password) {
    return this.get('users').find(u => u.phone === phone && u.password === password);
  },

  getStudents() { return this.get('users').filter(u => u.role === 'student'); },

  getStudentById(id) { return this.get('users').find(u => u.id === parseInt(id)); },

  updateStudent(id, data) {
    const users = this.get('users');
    const idx = users.findIndex(u => u.id === parseInt(id));
    if (idx !== -1) { users[idx] = { ...users[idx], ...data }; this.set('users', users); }
  },

  addStudent(student) {
    const users = this.get('users');
    student.id = Date.now();
    student.role = 'student';
    users.push(student);
    this.set('users', users);
    return student;
  },

  deleteStudent(id) {
    this.set('users', this.get('users').filter(u => u.id !== parseInt(id)));
  },

  getGroups() { return this.get('groups'); },

  addGroup(group) {
    const groups = this.get('groups');
    group.id = Date.now();
    groups.push(group);
    this.set('groups', groups);
  },

  getAnnouncements() { return [...this.get('announcements')].reverse(); },

  addAnnouncement(ann) {
    const anns = this.get('announcements');
    ann.id = Date.now();
    ann.likes = 0;
    ann.likedBy = [];
    ann.date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    anns.push(ann);
    this.set('announcements', anns);
  },

  toggleLike(annId, userId) {
    const anns = this.get('announcements');
    const idx = anns.findIndex(a => a.id === parseInt(annId));
    if (idx === -1) return null;
    const likedBy = anns[idx].likedBy || [];
    if (likedBy.includes(userId)) {
      anns[idx].likedBy = likedBy.filter(id => id !== userId);
      anns[idx].likes = Math.max(0, (anns[idx].likes || 0) - 1);
    } else {
      anns[idx].likedBy.push(userId);
      anns[idx].likes = (anns[idx].likes || 0) + 1;
    }
    this.set('announcements', anns);
    return anns[idx];
  },

  deleteAnnouncement(id) {
    this.set('announcements', this.get('announcements').filter(a => a.id !== parseInt(id)));
  },

  getResources(group) {
    const res = this.get('resources');
    return group ? res.filter(r => r.group === group) : res;
  },

  addResource(resource) {
    const res = this.get('resources');
    resource.id = Date.now();
    resource.date = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
    res.push(resource);
    this.set('resources', res);
  },

  deleteResource(id) {
    this.set('resources', this.get('resources').filter(r => r.id !== parseInt(id)));
  },

  getAttendance(date) {
    const att = this.get('attendance');
    return date ? att.filter(a => a.date === date) : att;
  },

  getStudentAttendance(studentId) {
    return this.get('attendance').filter(a => a.studentId === parseInt(studentId));
  },

  toggleAttendance(studentId, date) {
    const att = this.get('attendance');
    const idx = att.findIndex(a => a.studentId === parseInt(studentId) && a.date === date);
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    if (idx !== -1) {
      att[idx].present = !att[idx].present;
      att[idx].time = att[idx].present ? time : null;
    } else {
      att.push({ id: Date.now(), studentId: parseInt(studentId), date, present: true, time });
    }
    this.set('attendance', att);
    return idx !== -1 ? att[idx] : att[att.length - 1];
  },

  getSessionQR() { return this.get('session_qr') || {}; },

  regenerateQR() {
    const qr = { code: 'ST-' + Math.floor(100000 + Math.random() * 900000), date: new Date().toISOString().split('T')[0], active: true };
    this.set('session_qr', qr);
    return qr;
  },

  getPending() { return this.get('pending'); },

  approvePending(id, group) {
    const pending = this.get('pending');
    const req = pending.find(p => p.id === parseInt(id));
    if (req) {
      this.addStudent({ name: req.name, phone: req.phone.replace(/-/g, ''), password: req.password, grade: req.grade, group: group || 'مجموعة أ', absences: 0, paid: false, joined: new Date().toISOString().split('T')[0] });
      this.set('pending', pending.filter(p => p.id !== parseInt(id)));
    }
  },

  rejectPending(id) {
    this.set('pending', this.get('pending').filter(p => p.id !== parseInt(id)));
  },

  togglePayment(studentId) {
    const users = this.get('users');
    const idx = users.findIndex(u => u.id === parseInt(studentId));
    if (idx !== -1) { users[idx].paid = !users[idx].paid; this.set('users', users); return users[idx].paid; }
  },
};
