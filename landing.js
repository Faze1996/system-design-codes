// landing.js
// Populate placeholders on landing.html: #user-firstname and #dept-name

(function () {
  function safeText(el, value) {
    if (!el) return;
    el.textContent = value == null ? '' : String(value);
  }

  function populate(user, dept) {
    const firstEl = document.getElementById('user-firstname');
    const deptEl = document.getElementById('dept-name');
    if (user) {
      const name = user.firstName || user.FirstName || user.first_name || user.firstname || user.name || '';
      safeText(firstEl, name || 'User');
    }
    if (dept) {
      const dname = dept.name || dept.DeptName || dept.deptName || dept.dept_name || dept.name || '';
      safeText(deptEl, dname || 'Department');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 1) Prefer explicit globals injected by server-side rendering or other scripts
    if (window.USER_DATA || window.DEPT_DATA) {
      populate(window.USER_DATA || null, window.DEPT_DATA || null);
      return;
    }

    // 2) Try a safe fetch fallback (best-effort; won't error if endpoints don't exist)
    // This keeps the UI usable even when server-side integration isn't ready.
    const sessionUrl = '/api/session';
    const deptUrl = '/api/department';

    // Attempt to fetch both in parallel; ignore failures.
    Promise.allSettled([
      fetch(sessionUrl, { credentials: 'include' }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(deptUrl, { credentials: 'include' }).then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(results => {
      const user = results[0] && results[0].status === 'fulfilled' ? results[0].value : null;
      const dept = results[1] && results[1].status === 'fulfilled' ? results[1].value : null;
      if (user || dept) populate(user, dept);
      else {
        // No data anywhere; use small graceful defaults (the HTML already has them)
        // Optionally log for debugging.
        console.debug('landing.js: no USER_DATA/DEPT_DATA and fetch fallback returned nothing.');
      }
    });
  });
})();
