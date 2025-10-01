// editdepartment.js
// Populate the edit department form from DEPT_DATA and FACULTY_LIST globals, and simulate submit
(function(){
  'use strict';
  const form = document.getElementById('edit-dept-form');
  const msgArea = document.getElementById('message-area');
  const chairSelect = document.getElementById('DeptChair');
  const managerSelect = document.getElementById('DeptManager');

  function showMessage(text, type){
    if (!msgArea) return alert(text);
    msgArea.innerHTML = '<div class="message '+(type==='ok'?'success':'error')+'">'+text+'</div>';
  }

  function populateFaculty(list){
    if (!list || !Array.isArray(list)) return;
    function addOptions(select){
      select.innerHTML = '';
      list.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.FacultyID;
        opt.textContent = f.FullName;
        select.appendChild(opt);
      });
    }
    addOptions(chairSelect);
    addOptions(managerSelect);
  }

  // If data is provided as globals, populate fields
  if (window.FACULTY_LIST) populateFaculty(window.FACULTY_LIST);
  if (window.DEPT_DATA){
    const d = window.DEPT_DATA;
    document.getElementById('DeptName').value = d.DeptName || '';
    document.getElementById('Email').value = d.Email || '';
    document.getElementById('PhoneNumber').value = d.PhoneNumber || '';
    if (d.ChairID) chairSelect.value = d.ChairID;
    if (d.DeptManager) managerSelect.value = d.DeptManager;
    const heading = document.getElementById('edit-heading'); if (heading) heading.textContent = 'Update Information for ' + (d.DeptName || 'Department');
  }

  if (!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    // simple client-side validation
    const name = document.getElementById('DeptName').value.trim();
    const email = document.getElementById('Email').value.trim();
    if (!name || !email){ showMessage('Please provide valid name and email.', 'err'); return; }
    // Simulate save
    showMessage('Changes saved (simulated).', 'ok');
    // In a real app, you'd POST to a server endpoint and handle the response here.
  });
})();
