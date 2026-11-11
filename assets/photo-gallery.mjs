export function initPhotoGallery(signal) {
  const gallery = document.querySelector('.photo-gallery');
  const viewer = document.querySelector('#photo-viewer');
  if (!gallery || !viewer) return;
  const image = viewer.querySelector('img');
  const title = viewer.querySelector('#photo-viewer-title');
  const caption = viewer.querySelector('.photo-caption');
  const credit = viewer.querySelector('.photo-credit');
  const hover = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
  let opener, openTimer, closeTimer, pinned = false;

  function clearTimers() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  }
  function fill(link) {
    const figure = link.closest('figure');
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    title.textContent = link.dataset.photoTitle;
    caption.textContent = figure.querySelector('.photo-caption').textContent;
    credit.textContent = figure.querySelector('.photo-credit')?.textContent || '';
    credit.hidden = !credit.textContent;
  }
  function scheduleClose() {
    clearTimers();
    if (!pinned) closeTimer = setTimeout(() => viewer.close(), 180);
  }
  gallery.querySelectorAll('[data-gallery-photo]').forEach(link => {
    link.addEventListener('pointerenter', () => {
      clearTimers();
      if (!hover.matches || pinned || typeof viewer.show !== 'function') return;
      openTimer = setTimeout(() => {
        fill(link);
        const left = gallery.getBoundingClientRect().right + 18;
        viewer.style.setProperty('--preview-left', left + 'px');
        viewer.style.setProperty('--preview-width', Math.min(760, innerWidth - left - 24) + 'px');
        viewer.classList.add('is-hover-preview');
        const previousFocus = document.activeElement;
        viewer.show();
        if (previousFocus === document.body) document.activeElement?.blur();
        else previousFocus?.focus({ preventScroll: true });
      }, 220);
    }, { signal });
    link.addEventListener('pointerleave', scheduleClose, { signal });
  });
  viewer.addEventListener('pointerenter', clearTimers, { signal });
  viewer.addEventListener('pointerleave', scheduleClose, { signal });
  gallery.addEventListener('click', event => {
    const link = event.target.closest('[data-gallery-photo]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    clearTimers();
    opener = link;
    if (viewer.open) viewer.close();
    viewer.classList.remove('is-hover-preview');
    fill(link);
    pinned = true;
    viewer.showModal();
  }, { signal });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  }, { signal });
  viewer.addEventListener('close', () => {
    if (viewer.open) return;
    if (pinned && opener?.isConnected) opener.focus({ preventScroll: true });
    pinned = false;
    viewer.classList.remove('is-hover-preview');
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && viewer.open) viewer.close();
  }, { signal });
  signal.addEventListener('abort', () => { clearTimers(); viewer.close(); }, { once: true });
}
