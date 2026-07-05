(function () {
  const spreads = Array.from(document.querySelectorAll('.spread'));
  const total = spreads.length;
  const dots = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageNow = document.getElementById('pageNow');
  const pageTotal = document.getElementById('pageTotal');
  const bookEl = document.getElementById('book');

  let current = 0;
  let animating = false;
  const ANIM_MS = 680;

  pageTotal.textContent = total;

  function applyStates(direction) {
    spreads.forEach((el, i) => {
      if (i === current) {
        el.dataset.state = 'current';
      } else if (direction === 'fwd' && i === current - 1) {
        el.dataset.state = 'turning-out-fwd';
      } else if (direction === 'back' && i === current + 1) {
        el.dataset.state = 'turning-out-back';
      } else if (i === current + 1) {
        el.dataset.state = 'waiting-fwd';
      } else if (i === current - 1) {
        el.dataset.state = 'waiting-back';
      } else {
        el.dataset.state = 'hidden';
      }
    });
  }

  function updateChrome() {
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    pageNow.textContent = current + 1;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function goTo(index, direction) {
    if (index < 0 || index > total - 1 || index === current || animating) return;
    animating = true;
    current = index;
    applyStates(direction);
    updateChrome();
    window.setTimeout(() => { animating = false; }, ANIM_MS);
  }

  function next() { if (current < total - 1) goTo(current + 1, 'fwd'); }
  function prev() { if (current > 0) goTo(current - 1, 'back'); }

  applyStates(null);
  updateChrome();

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.goto, 10);
      if (target === current) return;
      goTo(target, target > current ? 'fwd' : 'back');
    });
  });

  document.querySelectorAll('[data-goto]:not(.dot)').forEach((el) => {
    el.addEventListener('click', () => {
      const target = parseInt(el.dataset.goto, 10);
      if (Number.isNaN(target) || target === current) return;
      goTo(target, target > current ? 'fwd' : 'back');
    });
  });

  document.querySelector('.spread.cover').addEventListener('click', (e) => {
    if (e.target.closest('.open-btn') || !e.target.closest('.open-btn')) next();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  let touchStartX = null;
  bookEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  bookEl.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    touchStartX = null;
  }, { passive: true });

  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.textContent = 'Hvala! Poruka je zabilježena (demo forma, bez pravog slanja).';
      form.reset();
      window.setTimeout(() => { note.textContent = ''; }, 4000);
    });
  }
})();
