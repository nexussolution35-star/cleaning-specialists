/* Cupboard Warehouse — light interactions */
(function () {
  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  var scrim = document.querySelector('.nav-scrim');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      if (scrim) scrim.classList.toggle('show');
    });
    if (scrim) scrim.addEventListener('click', function () {
      nav.classList.remove('open');
      scrim.classList.remove('show');
    });
  }

  // Gallery filter
  var filterBtns = document.querySelectorAll('.filters button');
  var items = document.querySelectorAll('.gallery-grid .gal');
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      filterBtns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      var f = b.getAttribute('data-filter');
      items.forEach(function (it) {
        var show = f === 'all' || it.getAttribute('data-cat') === f;
        it.style.display = show ? '' : 'none';
      });
    });
  });

  // Simple form guard (static demo — no backend)
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = f.querySelector('.form-success');
      if (!note) {
        note = document.createElement('p');
        note.className = 'form-success';
        note.style.cssText = 'margin:.8rem 0 0;color:#6cbe1e;font-weight:600;text-align:center;font-size:.9rem';
        f.appendChild(note);
      }
      note.textContent = 'Thanks! Your nearest Cupboard Warehouse designer will call you back shortly.';
      f.reset();
    });
  });
})();
