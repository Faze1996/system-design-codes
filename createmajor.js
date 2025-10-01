// createmajor.js
// Client-side form handler for Create Major
(function(){
  'use strict';
  const form = document.getElementById('create-major-form');
  const btn = document.getElementById('create-major-btn');
  const msgContainer = document.getElementById('message');
  if (!form) return;

  function showMessage(text, type){
    if (!msgContainer) return alert(text);
    msgContainer.innerHTML = '<p class="message '+(type==='ok'?'success':'error')+'">'+text+'</p>';
  }

  function setLoading(on){
    if (!btn) return;
    btn.disabled = on;
    btn.textContent = on ? 'Creating...' : 'Create Major';
  }

  function serialize(form){
    return new URLSearchParams(new FormData(form)).toString();
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = form.major_name.value.trim();
    const credits = form.credits_required.value;
    if (!name || !credits || Number(credits) <= 0){
      showMessage('Please provide a valid major name and credits.', 'err');
      return;
    }

    setLoading(true);
    fetch(form.action || window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: serialize(form),
      credentials: 'same-origin'
    }).then(r => r.text()).then(text => {
      if (/success|created|added/i.test(text)){
        showMessage('Major created successfully.', 'ok');
        form.reset();
      } else {
        const preview = text.replace(/<[^>]+>/g,'').trim().slice(0,400);
        showMessage(preview || 'Unexpected server response.', 'err');
      }
    }).catch(err => {
      showMessage('Network error: '+err.message, 'err');
    }).finally(()=> setLoading(false));
  });

})();
