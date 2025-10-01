// viewminorrequirements.js
// Populate the minor requirements page from globals or API endpoints.

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
    if (window.MINOR && window.REQUIREMENTS) {
      setMinor(window.MINOR);
      render(window.REQUIREMENTS);
      return true;
    }
    return false;
  }

  function setMinor(m){
    if (!m) return;
    const name = m.name || m.MinorName || m.Minor || '';
    const credits = m.creditsRequired || m.CreditsRequired || m.credits || 0;
    const id = m.id || m.MinorID || m.minorId || '';
    const link = el('#add-req-link');
    const title = el('#page-title');
    const mn1 = el('#minor-name');
    const mn2 = el('#minor-name-2');
    const creditsEl = el('#credits-required');
    if (mn1) mn1.textContent = name;
    if (mn2) mn2.textContent = name;
    if (creditsEl) creditsEl.textContent = credits;
    if (link && id) link.href = `addMinorRequirement.php?MinorID=${encodeURIComponent(id)}`;
    if (title) title.textContent = `${name} Requirements | Oracle University`;
  }

  function fetchAndPopulate(){
    const link = el('#add-req-link');
    let minorId = null;
    if (link) {
      const href = link.getAttribute('href') || '';
      const m = href.match(/[?&]MinorID=([^&]+)/);
      if (m) minorId = decodeURIComponent(m[1]);
    }

    const minorUrl = minorId ? `/api/minor/${encodeURIComponent(minorId)}` : '/api/minor/current';
    const reqUrl = minorId ? `/api/minor/${encodeURIComponent(minorId)}/requirements` : '/api/minor/requirements';

    Promise.allSettled([
      fetch(minorUrl, { credentials: 'include' }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(reqUrl, { credentials: 'include' }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(results => {
      const minor = results[0] && results[0].status === 'fulfilled' ? results[0].value : null;
      const reqs = results[1] && results[1].status === 'fulfilled' ? results[1].value : [];
      if (minor) setMinor(minor);
      render(reqs || []);
    }).catch(err => {
      console.debug('viewminorrequirements: fetch error', err);
      render([]);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const fromGlobals = populateFromGlobals();
    if (!fromGlobals) fetchAndPopulate();
  });
})();
