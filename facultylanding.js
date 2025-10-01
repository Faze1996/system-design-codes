// facultylanding.js
// Populate faculty landing placeholders from globals or API endpoints

(function () {
  function el(q){ return document.querySelector(q); }
  function safeText(node, v){ if (!node) return; node.textContent = v == null ? '' : String(v); }

  async function fetchJson(url){
    try { const r = await fetch(url, { credentials: 'include' }); if (!r.ok) return null; return await r.json(); } catch(e){ return null; }
  }

  function populateFromGlobals(){
    const user = window.USER_DATA || null;
    const faculty = window.FACULTY || null;
    if (user) safeText(el('#user-firstname'), user.firstName || user.FirstName || user.name || 'User');
    if (faculty) safeText(el('#faculty-name'), (faculty.FirstName || faculty.firstName || '') + ' ' + (faculty.LastName || faculty.lastName || ''));
    return !!(user || faculty);
  }

  async function fetchAndPopulate(){
    const session = await fetchJson('/api/session');
    const facultyInfo = await fetchJson('/api/faculty/me');
    if (session && session.firstName) safeText(el('#user-firstname'), session.firstName);
    if (facultyInfo) safeText(el('#faculty-name'), (facultyInfo.FirstName || facultyInfo.firstName || '') + ' ' + (facultyInfo.LastName || facultyInfo.lastName || ''));
  }

  document.addEventListener('DOMContentLoaded', function () {
    const ok = populateFromGlobals();
    if (!ok) fetchAndPopulate();
  });
})();
