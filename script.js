(() => {
  const book = document.getElementById('book');
  const sheets = [...document.querySelectorAll('.sheet')];
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const leftZone = document.getElementById('pageZoneLeft');
  const rightZone = document.getElementById('pageZoneRight');
  const openBook = document.getElementById('openBook');
  const currentPage = document.getElementById('currentPage');
  const totalPages = document.getElementById('totalPages');
  const progressBar = document.getElementById('progressBar');
  const pageStatus = document.getElementById('pageStatus');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let moving = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastWheelAt = 0;

  const twoDigits = value => String(value).padStart(2, '0');

  function updateInterface() {
    const pageNumber = index + 1;
    currentPage.textContent = twoDigits(pageNumber);
    totalPages.textContent = twoDigits(sheets.length);
    progressBar.style.width = `${(pageNumber / sheets.length) * 100}%`;
    prevButton.disabled = index === 0;
    nextButton.disabled = index === sheets.length - 1;
    leftZone.disabled = index === 0;
    rightZone.disabled = index === sheets.length - 1;
    book.classList.toggle('is-open', index > 0);
    pageStatus.textContent = `Stranica ${pageNumber} od ${sheets.length}: ${sheets[index].getAttribute('aria-label')}`;
  }

  function cleanSheet(sheet) {
    sheet.classList.remove('is-active', 'turn-out-next', 'turn-in-next', 'turn-out-prev', 'turn-in-prev');
  }

  function goTo(nextIndex) {
    if (moving || nextIndex === index || nextIndex < 0 || nextIndex >= sheets.length) return;
    moving = true;

    const oldIndex = index;
    const direction = nextIndex > oldIndex ? 'next' : 'prev';
    const outgoing = sheets[oldIndex];
    const incoming = sheets[nextIndex];

    cleanSheet(incoming);
    incoming.classList.add(direction === 'next' ? 'turn-in-next' : 'turn-in-prev');
    outgoing.classList.remove('is-active');
    outgoing.classList.add(direction === 'next' ? 'turn-out-next' : 'turn-out-prev');
    index = nextIndex;
    updateInterface();

    const finish = () => {
      cleanSheet(outgoing);
      cleanSheet(incoming);
      incoming.classList.add('is-active');
      moving = false;
    };

    if (reducedMotion) finish();
    else setTimeout(finish, 800);
  }

  const next = () => goTo(index + 1);
  const previous = () => goTo(index - 1);

  nextButton.addEventListener('click', next);
  rightZone.addEventListener('click', next);
  openBook.addEventListener('click', next);
  prevButton.addEventListener('click', previous);
  leftZone.addEventListener('click', previous);

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      next();
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      previous();
    }
    if (event.key === 'Home') goTo(0);
    if (event.key === 'End') goTo(sheets.length - 1);
  });

  book.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  book.addEventListener('touchend', event => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      deltaX < 0 ? next() : previous();
    }
  }, { passive: true });

  window.addEventListener('wheel', event => {
    const now = Date.now();
    if (now - lastWheelAt < 900 || Math.abs(event.deltaY) < 18) return;
    lastWheelAt = now;
    event.deltaY > 0 ? next() : previous();
  }, { passive: true });

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      // Fullscreen nije dostupan u svakom ugrađenom pregledniku.
    }
  });

  updateInterface();
})();
