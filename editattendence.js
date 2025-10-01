// editattendence.js
// Populate the Edit Attendance page and handle updates.

(function () {
  function el(q){ return document.querySelector(q); }
  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  async function fetchJson(url){
    try {
      const r = await fetch(url, { credentials: 'include' });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  async function loadClassDates(crn){
    const select = el('#classDate');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose Date --</option>';

    // Prefer global if provided
    if (window.CLASS_DATES && Array.isArray(window.CLASS_DATES)) {
      window.CLASS_DATES.forEach(d => {
        const opt = document.createElement('option'); opt.value = d; opt.textContent = d; select.appendChild(opt);
      });
      return;
    }

    const url = `/api/classDates?crn=${encodeURIComponent(crn)}`;
    const data = await fetchJson(url) || [];
    data.forEach(d => {
      const opt = document.createElement('option'); opt.value = d; opt.textContent = d; select.appendChild(opt);
    });
  }

  async function loadStudents(crn, date){
    const tbody = el('#students-list');
    tbody.innerHTML = '';
    if (!crn || !date) return;

    // Prefer global if provided
    let students = null;
    let attendance = null;
    if (window.STUDENTS) students = window.STUDENTS;
    if (window.ATTENDANCE_RECORDS) attendance = window.ATTENDANCE_RECORDS;

    if (!students) {
      students = await fetchJson(`/api/students?crn=${encodeURIComponent(crn)}`) || [];
    }
    if (!attendance) {
      attendance = await fetchJson(`/api/attendance?crn=${encodeURIComponent(crn)}&date=${encodeURIComponent(date)}`) || {};
    }

    if (!Array.isArray(students) || students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="no-data">No students found.</td></tr>';
      return;
    }

    students.forEach(s => {
      const id = s.UserID || s.userID || s.id;
      const name = `${s.FirstName || s.firstName || ''} ${s.LastName || s.lastName || ''}`.trim();
      const checked = attendance && attendance[id] ? 'checked' : '';
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${escapeHtml(id)}</td>
          <td>${escapeHtml(name)}</td>
          <td><input type="checkbox" name="attendance[${escapeHtml(id)}]" value="1" ${checked}></td>
        </tr>
      `);
    });
  }

  function showError(msg){ const e = el('#error'); if (!e) return; e.textContent = msg; e.style.display = msg ? '' : 'none'; }

  async function submitAttendance(e){
    e.preventDefault();
    const form = e.target;
    const crn = el('#attendance-crn').value;
    const classDate = el('#attendance-classDate').value;
    if (!crn || !classDate) { showError('Missing class or date.'); return; }

    const data = new URLSearchParams();
    data.append('crn', crn);
    data.append('classDate', classDate);

    // collect checkboxes
    el('#students-list').querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const name = cb.getAttribute('name');
      if (!name) return;
      if (cb.checked) data.append(name, cb.value);
    });

    try {
      const resp = await fetch('updateAttendance.php', { method: 'POST', body: data, credentials: 'include' });
      if (!resp.ok) throw new Error('Network error');
      const text = await resp.text();
      showError('Attendance updated successfully.');
      // Optionally refresh attendance from server
    } catch (err) {
      console.error('submitAttendance error', err);
      showError('Failed to update attendance (local view only).');
    }
  }

  document.addEventListener('DOMContentLoaded', async function () {
    // If server provided CRN in a global, use it; otherwise try to parse from URL
    let crn = window.CRN || null;
    if (!crn) {
      const m = location.search.match(/[?&]crn=([^&]+)/);
      if (m) crn = decodeURIComponent(m[1]);
    }
    if (!crn) crn = '';
    el('#crn-input').value = crn;
    el('#attendance-crn').value = crn;

    await loadClassDates(crn);

    const select = el('#classDate');
    select.addEventListener('change', async function () {
      const date = select.value;
      el('#attendance-classDate').value = date;
      await loadStudents(crn, date);
    });

    // wire submit
    const attendanceForm = el('#attendance-form');
    if (attendanceForm) attendanceForm.addEventListener('submit', submitAttendance);

    // if there is a selected date in query, set it
    const urlDate = (() => { const m = location.search.match(/[?&]classDate=([^&]+)/); return m ? decodeURIComponent(m[1]) : null; })();
    if (urlDate) {
      select.value = urlDate;
      el('#attendance-classDate').value = urlDate;
      await loadStudents(crn, urlDate);
    }

  });

})();
