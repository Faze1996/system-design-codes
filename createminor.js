// createminor.js
// Client-side form handling for Create Minor
(function(){
  'use strict';

  const form = document.getElementById('create-minor-form');
  const btn = document.getElementById('create-minor-btn');
  const msg = document.getElementById('message');
  if (!form) return;

  function showMessage(text, type){
    if (!msg) return alert(text);
    msg.innerHTML = '<p class="msg '+(type==='ok'?'success':'error')+'">'+text+'</p>';
  }

  function setLoading(on){
    if (!btn) return;
    btn.disabled = on;
    if (on){
      btn.dataset.orig = btn.innerHTML;
      btn.innerHTML = 'Creating...';
    } else {
      btn.innerHTML = btn.dataset.orig || 'Create Minor';
      delete btn.dataset.orig;
    }
  }

  function serialize(form){
    return new URLSearchParams(new FormData(form)).toString();
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    msg && (msg.innerHTML = '');

    const name = form.minor_name.value.trim();
    const credits = form.credits_required.value;
    if (!name || !credits || Number(credits) <= 0){
      showMessage('Please provide a valid minor name and credits.', 'err');
      return;
    }

    setLoading(true);

    fetch(form.action || window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: serialize(form),
      credentials: 'same-origin'
    }).then(response => {
      const ct = response.headers.get('content-type') || '';
      if (ct.indexOf('application/json') !== -1) return response.json();
      return response.text();
    }).then(data => {
      // If server returned JSON with success flag
      if (data && typeof data === 'object'){
        if (data.success) {
          showMessage(data.message || 'Minor created successfully.', 'ok');
          form.reset();
        } else {
          showMessage(data.message || 'Server returned an error.', 'err');
        }
      } else if (typeof data === 'string'){
        // Heuristic: look for success keywords
        if (/success|created|added/i.test(data)){
          showMessage('Minor created successfully.', 'ok');
          form.reset();
        } else {
          const preview = data.replace(/<[^>]+>/g,'').trim().slice(0,400);
          showMessage(preview || 'Unexpected server response.', 'err');
        }
      } else {
        showMessage('Unexpected server response.', 'err');
      }
    }).catch(err => {
      showMessage('Network or server error: ' + (err && err.message ? err.message : err), 'err');
    }).finally(()=> setLoading(false));
  });

})();
