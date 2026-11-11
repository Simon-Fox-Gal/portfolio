export function initPhotoGallery(signal) {
  const gallery = document.querySelector('.photo-gallery');
  const viewer = document.querySelector('#photo-viewer');
  if (!gallery || !viewer) return;

  const image = viewer.querySelector('img');
  const title = viewer.querySelector('#photo-viewer-title');
  const caption = viewer.querySelector('.photo-caption');
  const credit = viewer.querySelector('.photo-credit');
  let opener;

  gallery.addEventListener('click', event => {
    const link = event.target.closest('[data-gallery-photo]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    const figure = link.closest('figure');
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    title.textContent = link.dataset.photoTitle;
    caption.textContent = figure.querySelector('.photo-caption').textContent;
    credit.textContent = figure.querySelector('.photo-credit')?.textContent || '';
    credit.hidden = !credit.textContent;
    viewer.showModal();
  }, { signal });

  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  }, { signal });

  viewer.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }, { signal });
  signal.addEventListener('abort', () => viewer.close(), { once: true });
}
