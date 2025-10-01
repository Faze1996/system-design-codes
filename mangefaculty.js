// mangefaculty.js
// Client-side population and simple add/remove actions for mangefaculty.html

(function () {
  function el(q) { return document.querySelector(q); }
  function safeText(node, text) { if (!node) return; node.textContent = text == null ? '' : String(text); }

  // Render helpers
  function renderOptions(available) {
    const sel = el('#faculty_id');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Select Faculty --</option>' + (available || []).map(f => {
      const id = encodeURIComponent(f.FacultyID || f.id || f.id);
      const name = (f.FullName || f.fullName || f.name || '').replace(/</g,'&lt;');
      return `<option value="${id}">${name}</option>`;
    }).join('');
  }

  function renderTable(list) {
    const tbody = el('#faculty-list');
    if (!tbody) return;
    tbody.innerHTML = (list || []).map(f => {
      const id = (f.FacultyID || f.id || '');
      const name = (f.FullName || f.fullName || f.name || '');
      const specialty = f.Specialty || f.specialty || '';
      const rank = f.FacultyRank || f.rank || '';
      return `
        <tr>
          <td>${escapeHtml(id)}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(specialty)}</td>
          <td>${escapeHtml(rank)}</td>
          <td>
            <button data-id="${escapeHtml(id)}" class="remove-btn">Remove</button>
          </td>
        </tr>
      `;
    }).join('');

    // attach remove handlers
    tbody.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        if (!id) return;
        removeFaculty(id);
      });
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  function showMessage(type, text) {
    const container = el('#messages');
    if (!container) return;
    container.innerHTML = `<div class="${type}">${escapeHtml(text)}</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 5000);
  }

  // Network actions (best-effort; does not require server)
  function postForm(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data),
      credentials: 'include'
    }).then(r => r.ok ? r.text() : Promise.reject(new Error('Request failed')));
  }

  function addFaculty(facultyId) {
    // Best-effort POST to server endpoint; fallback to updating UI only
    if (!facultyId) { showMessage('error', 'Please select a faculty member to add.'); return; }
    const url = '/admin/addFaculty.php';
    postForm(url, { add_faculty_id: facultyId }).then(txt => {
      showMessage('success', 'Faculty added (server acknowledged).');
      // Try to refresh list from server or update local view (optimistic)
      fetchDataAndRender();
    }).catch(() => {
      // optimistic local update when server not available
      showMessage('success', 'Faculty added (local view).');
      // Note: without server persistence this is transient
      addLocalFacultyById(facultyId);
    });
  }

  function removeFaculty(facultyId) {
    if (!facultyId) return;
    const url = '/admin/removeFaculty.php';
    postForm(url, { remove_faculty_id: facultyId }).then(txt => {
      showMessage('success', 'Faculty removed (server acknowledged).');
      fetchDataAndRender();
    }).catch(() => {
      showMessage('success', 'Faculty removed (local view).');
      removeLocalFacultyById(facultyId);
    });
  }

  // Local optimistic helpers (modify in-memory arrays)
  let AVAILABLE = window.AVAILABLE_FACULTY || [];
  let LIST = window.FACULTY_LIST || [];

  function addLocalFacultyById(id) {
    const idx = AVAILABLE.findIndex(x => String(x.FacultyID || x.id) === String(id));
    if (idx === -1) return;
    const item = AVAILABLE.splice(idx,1)[0];
    LIST.push(item);
    renderOptions(AVAILABLE);
    renderTable(LIST);
  }

  function removeLocalFacultyById(id) {
    const idx = LIST.findIndex(x => String(x.FacultyID || x.id) === String(id));
    if (idx === -1) return;
    const item = LIST.splice(idx,1)[0];
    AVAILABLE.push(item);
    renderOptions(AVAILABLE);
    renderTable(LIST);
  }

  // Data fetching: try globals, then try /api endpoints
  function fetchDataAndRender() {
    if (window.AVAILABLE_FACULTY && window.FACULTY_LIST && window.DEPT_INFO) {
      AVAILABLE = window.AVAILABLE_FACULTY;
      LIST = window.FACULTY_LIST;
      safeText(document.getElementById('dept-name'), window.DEPT_INFO.DeptName || window.DEPT_INFO.name || 'Department');
      renderOptions(AVAILABLE);
      renderTable(LIST);
      return;
    }

    const availUrl = '/api/availableFaculty';
    const listUrl = '/api/facultyList';
    const deptUrl = '/api/department';

    Promise.allSettled([
      fetch(availUrl, { credentials: 'include' }).then(r=>r.ok? r.json(): []).catch(()=>[]),
      fetch(listUrl, { credentials: 'include' }).then(r=>r.ok? r.json(): []).catch(()=>[]),
      fetch(deptUrl, { credentials: 'include' }).then(r=>r.ok? r.json(): {}).catch(()=>({}))
    ]).then(res => {
      const avail = res[0] && res[0].status === 'fulfilled' ? res[0].value : [];
      const list = res[1] && res[1].status === 'fulfilled' ? res[1].value : [];
      const dept = res[2] && res[2].status === 'fulfilled' ? res[2].value : {};
      AVAILABLE = avail || [];
      LIST = list || [];
      safeText(document.getElementById('dept-name'), dept.DeptName || dept.name || 'Department');
      renderOptions(AVAILABLE);
      renderTable(LIST);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetchDataAndRender();

    const addForm = el('#add-faculty-form');
    if (addForm) {
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const sel = el('#faculty_id');
        const val = sel && sel.value;
        addFaculty(val);
      });
    }
  });

})();
