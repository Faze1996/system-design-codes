// managestudent.js
// Populate the course dropdown and fetch students for the selected CRN

(function () {
  function el(q){ return document.querySelector(q); }
  function escapeHtml(s){ return String(s || '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function populateCourses(courses){
    const sel = el('#courseDropdown');
    sel.innerHTML = '<option value="">-- Select a Course --</option>' + (courses || []).map(c => {
      const label = `${c.CourseName} - Sec ${c.SectionNumber} (${c.SemesterName} ${c.SemesterYear})`;
      return `<option value="${escapeHtml(c.CRN)}">${escapeHtml(label)}</option>`;
    }).join('');
  }

  async function fetchStudentsFor(crn){
    const tbody = el('#studentTable tbody');
    const attendanceBtn = el('#attendanceBtn');
    const err = el('#error');
    err.style.display = 'none';
    tbody.innerHTML = '';
    attendanceBtn.style.display = 'none';

    if (!crn) {
      tbody.innerHTML = '<tr><td colspan="3">Please select a course.</td></tr>';
      return;
    }

    // Try global first
    if (window.COURSE_STUDENTS && window.COURSE_STUDENTS[crn]) {
      renderStudents(window.COURSE_STUDENTS[crn], crn);
      return;
    }

    const api1 = `fetch_students.php?crn=${encodeURIComponent(crn)}`;
    const api2 = `/api/fetch_students?crn=${encodeURIComponent(crn)}`;

    try {
      let res = await fetch(api1, { credentials: 'include' });
      if (!res.ok) res = await fetch(api2, { credentials: 'include' });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.error) { err.textContent = data.error; err.style.display = ''; return; }
      renderStudents(data, crn);
    } catch (e) {
      console.error('fetchStudentsFor error', e);
      err.textContent = 'Failed to load students.'; err.style.display = '';
      tbody.innerHTML = '<tr><td colspan="3">Failed to load students.</td></tr>';
    }
  }

  function renderStudents(list, crn){
    const tbody = el('#studentTable tbody');
    const attendanceBtn = el('#attendanceBtn');
    tbody.innerHTML = (list || []).map(stu => `
      <tr>
        <td>${escapeHtml(stu.UserID)}</td>
        <td>${escapeHtml((stu.FirstName || '') + ' ' + (stu.LastName || ''))}</td>
        <td><a href="editGrade.php?studentID=${encodeURIComponent(stu.UserID)}&crn=${encodeURIComponent(crn)}" class="btn">Edit Grade</a></td>
      </tr>
    `).join('');

    attendanceBtn.href = `editAttendance.php?crn=${encodeURIComponent(crn)}`;
    attendanceBtn.style.display = 'inline-block';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // populate courses either from global or from server
    if (window.COURSES && Array.isArray(window.COURSES)) {
      populateCourses(window.COURSES);
    } else {
      // try to fetch /api/courses
      fetch('/api/mycourses', { credentials: 'include' }).then(r=> r.ok? r.json(): null).then(data => { if (data) populateCourses(data); }).catch(()=>{});
    }

    const sel = el('#courseDropdown');
    if (sel) sel.addEventListener('change', function () { fetchStudentsFor(this.value); });
  });
})();
