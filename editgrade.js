// editgrade.js
// Client-side handling for editgrade.html

(function () {
  function el(q){ return document.querySelector(q); }
  function showMessage(text, type='success'){
    const msg = el('#message');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'alert ' + (type === 'error' ? 'error' : 'success');
    msg.style.display = '';
    setTimeout(()=>{ msg.style.display = 'none'; }, 4000);
  }

  function escapeHtml(s){ if (s == null) return ''; return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  async function submitForm(e){
    e.preventDefault();
    const grade = el('#grade').value.trim();
    if (!grade) { showMessage('Please enter a grade.', 'error'); return; }

    const data = new URLSearchParams();
    data.append('grade', grade);

    // If server provided identifiers (e.g., studentId, crn), include them
    if (window.EDIT_GRADE_CONTEXT) {
      const ctx = window.EDIT_GRADE_CONTEXT;
      if (ctx.studentId) data.append('studentId', ctx.studentId);
      if (ctx.crn) data.append('crn', ctx.crn);
      if (ctx.term) data.append('term', ctx.term);
    }

    try {
      const resp = await fetch('updateGrade.php', { method: 'POST', body: data, credentials: 'include' });
      if (!resp.ok) throw new Error('Network error');
      const text = await resp.text();
      showMessage('Grade updated successfully.');
    } catch (err) {
      console.error('updateGrade error', err);
      showMessage('Failed to update grade. (local change only)', 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Prefill current grade if server injected it
    if (window.CURRENT_GRADE) {
      el('#grade').value = window.CURRENT_GRADE;
      el('#current-grade-val').textContent = window.CURRENT_GRADE;
      el('#current-grade').style.display = '';
    }

    const form = el('#edit-grade-form');
    if (form) form.addEventListener('submit', submitForm);
  });
})();
