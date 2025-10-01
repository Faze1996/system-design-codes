// addmajorrequirement.js
// Client-side handling for Add Major Requirement form
(function(){
  'use strict';

  function qs(id){ return document.getElementById(id); }
  const form = qs('add-major-form');
  const msg = qs('message');
  const submitBtn = qs('submit-btn');

  if (!form) return;

  function showMessage(text, type){
    msg.innerHTML = '<div class="msg" style="color:'+(type==='ok'?'green':'red')+'">'+text+'</div>';
  }

  function setLoading(on){
    if (!submitBtn) return;
    submitBtn.disabled = on;
    if (on){
      submitBtn.dataset.orig = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Saving...';
    } else {
      submitBtn.innerHTML = submitBtn.dataset.orig || 'Add Requirement';
      delete submitBtn.dataset.orig;
    }
  }

  function serialize(form){
    const params = new URLSearchParams();
    Array.from(new FormData(form)).forEach(([k,v]) => params.append(k, v));
    return params.toString();
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    msg.innerHTML = '';

    const major = form.majorName.value.trim();
    const course = form.courseID.value.trim();
    const grade = form.minimumGrade.value;
    const group = form.groupID.value;

    if (!major || !course || !grade || !group){
      showMessage('Please fill in all fields correctly.', 'err');
      return;
    }

    setLoading(true);

    fetch(form.action || window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: serialize(form),
      credentials: 'same-origin'
    }).then(resp => resp.text())
      .then(text => {
        // Try to detect success by presence of typical success text, otherwise show returned HTML/text
        if (/success/i.test(text) || /added/i.test(text)){
          showMessage('Major requirement added successfully.', 'ok');
          form.reset();
        } else {
          // Show server response (trimmed)
          const preview = text.replace(/<[^>]+>/g, '').trim().slice(0,400);
          showMessage(preview || 'Server returned an unexpected response.', 'err');
        }
      }).catch(err => {
        showMessage('Network or server error: ' + err.message, 'err');
      }).finally(() => setLoading(false));
  });

})();
