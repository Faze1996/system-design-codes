// departmentmajors.js
// Populate majors table when MAJORS_DATA is available as a JS array of objects
(function(){
  'use strict';
  const container = document.getElementById('majors-container');
  const info = document.getElementById('no-majors');
  if (!container) return;

  function renderRows(majors){
    if (!majors || majors.length === 0){
      if (info) info.style.display = 'block';
      return;
    }
    info && (info.style.display = 'none');
    const tbody = document.createElement('tbody');
    majors.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (m.MajorID || '') +'</td>'+
                     '<td>'+ (m.MajorName || '') +'</td>'+
                     '<td>'+ (m.NumberOfCreditsRequired || '') +'</td>'+
                     '<td><a class="btn" style="background:#5bc0de;" href="viewMajorRequirements.html?MajorID='+encodeURIComponent(m.MajorID)+'">View Courses</a></td>';
      tbody.appendChild(tr);
    });
    container.innerHTML = '';
    container.appendChild(tbody);
  }

  if (window.MAJORS_DATA) renderRows(window.MAJORS_DATA);
  // Expose for dynamic use
  window.renderMajors = renderRows;
})();
