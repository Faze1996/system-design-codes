// departmentinformation.js
// Small helper to populate department information placeholders when data is available
(function(){
  'use strict';
  // Example: we could fetch department data from an API and fill the fields.
  // For now this file provides a utility to fill data if a global `DEPT_DATA` is present.
  if (window.DEPT_DATA && typeof window.DEPT_DATA === 'object'){
    const d = window.DEPT_DATA;
    function set(id, value){ const el = document.getElementById(id); if (el) el.textContent = value || el.textContent; }
    set('dept-name', (d.DeptName || 'Department') + ' Department');
    set('dept-chair', d.Chair || 'TBD');
    set('dept-manager', d.DeptManager || 'TBD');
    set('dept-email', d.Email || 'info@example.edu');
    set('dept-phone', d.PhoneNumber || '(000) 000-0000');
    set('dept-room', d.RoomID || '000');
    set('dept-building', d.BuildingName || 'Building');
    if (d.EditLink) {
      const a = document.getElementById('edit-link'); if (a) a.href = d.EditLink;
    }
  }
})();
