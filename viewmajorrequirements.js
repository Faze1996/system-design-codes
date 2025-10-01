// viewmajorrequirements.js
// Populate viewmajorrequirements.html with either injected globals or via fetch.

(function () {
  function el(q){ return document.querySelector(q); }
  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function render(rows){
    const tbody = el('#requirements-list');
    const noData = el('#no-data');
    if (!tbody) return;
    if (!rows || rows.length === 0) {
      if (noData) noData.style.display = '';
      tbody.innerHTML = '';
      return;
    }
    if (noData) noData.style.display = 'none';
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.CourseID || r.courseId || '')}</td>
        <td>${escapeHtml(r.CourseName || r.courseName || r.name || '')}</td>
        <td>${escapeHtml(r.MinimumGrade || r.minimumGrade || '')}</td>
        <td>${renderRequirementType(r)}</td>
      </tr>
    `).join('');
  }

  function renderRequirementType(r){
    const group = r.GroupID ?? r.groupId ?? 0;
    const coursesRequired = r.CoursesRequired ?? r.coursesRequired ?? r.courses_required ?? 0;
    if (Number(group) === 0) return 'Required';
    return `Group ${escapeHtml(String(group))} (${escapeHtml(String(coursesRequired))} required)`;
  }

  function populateFromGlobals(){
    if (window.MAJOR && window.REQUIREMENTS) {
      setMajor(window.MAJOR);
      render(window.REQUIREMENTS);
      return true;
    }
    return false;
  }

  function setMajor(m){
    if (!m) return;
    const name = m.name || m.MajorName || m.Major || '';
    const credits = m.creditsRequired || m.CreditsRequired || m.credits || 0;
    const id = m.id || m.MajorID || m.majorId || '';
    const link = el('#add-req-link');
    const title = el('#page-title');
    const mn1 = el('#major-name');
    const mn2 = el('#major-name-2');
    const creditsEl = el('#credits-required');
    if (mn1) mn1.textContent = name;
    if (mn2) mn2.textContent = name;
    if (creditsEl) creditsEl.textContent = credits;
    if (link && id) link.href = `addMajorRequirement.php?MajorID=${encodeURIComponent(id)}`;
    if (title) title.textContent = `${name} Requirements | Oracle University`;
  }

  function fetchAndPopulate(){
    // Try to read majorId from the add link's query param if present
    const link = el('#add-req-link');
    let majorId = null;
    if (link) {
      const href = link.getAttribute('href') || '';
      const m = href.match(/[?&]MajorID=([^&]+)/);
      if (m) majorId = decodeURIComponent(m[1]);
    }

    const majorUrl = majorId ? `/api/major/${encodeURIComponent(majorId)}` : '/api/major/current';
    const reqUrl = majorId ? `/api/major/${encodeURIComponent(majorId)}/requirements` : '/api/major/requirements';

    Promise.allSettled([
      fetch(majorUrl, { credentials: 'include' }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(reqUrl, { credentials: 'include' }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(results => {
      const major = results[0] && results[0].status === 'fulfilled' ? results[0].value : null;
      const reqs = results[1] && results[1].status === 'fulfilled' ? results[1].value : [];
      if (major) setMajor(major);
      render(reqs || []);
    }).catch(err => {
      console.debug('viewmajorrequirements: fetch error', err);
      render([]);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const fromGlobals = populateFromGlobals();
    if (!fromGlobals) fetchAndPopulate();
  });
})();
