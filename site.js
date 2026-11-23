import { photos } from './exhibit-data.js?v=20261123-dates-redemption';
import { initDeck } from './deck.js?v=20261123-dates-redemption';

// Keep bookmarks from earlier versions useful.
if (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) {
  const aliases = {
    experience: 'cards.html#song', story: 'read.html#song', metal: 'read.html#qin-han',
    beginnings: 'read.html#early-money', coexistence: 'read.html#ming-qing',
    'reading-room': 'read.html#song',
    journey: 'project.html', reflection: 'project.html', sources: 'references.html',
    'photo-credits': 'references.html#source-18', 'project-notes': 'project.html',
    'course-1': 'references.html#source-16', 'course-2': 'references.html#source-17'
  };
  function redirectLegacyBookmark() {
    const hash = location.hash.slice(1);
    if (aliases[hash]) location.replace(aliases[hash]);
    else if (/^source-\d+$/.test(hash)) location.replace('references.html#' + hash);
  }
  window.addEventListener('hashchange', redirectLegacyBookmark);
  redirectLegacyBookmark();
}

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
menu.hidden = false;
document.documentElement.classList.add('js-menu');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
navigation.addEventListener('click', closeMenu);
window.matchMedia('(min-width: 1061px)').addEventListener('change', closeMenu);

const videosSection = document.querySelector('#videos');
if (videosSection) {
  const museumLink = navigation.querySelector('a[href="museum.html"]');
  const videosLink = navigation.querySelector('a[href="index.html#videos"]');
  function markVideos(active) {
    (active ? museumLink : videosLink).removeAttribute('aria-current');
    (active ? videosLink : museumLink).setAttribute('aria-current', 'page');
  }
  function markVisibleSection() {
    const boundary = Math.max(document.querySelector('.site-header').getBoundingClientRect().bottom + 64, innerHeight * .55);
    markVideos(videosSection.getBoundingClientRect().top <= boundary);
  }
  let navigationFrame = 0;
  window.addEventListener('scroll', () => {
    if (navigationFrame) return;
    navigationFrame = requestAnimationFrame(() => { navigationFrame = 0; markVisibleSection(); });
  }, { passive: true });
  window.addEventListener('resize', markVisibleSection);
  window.addEventListener('hashchange', () => markVideos(location.hash === '#videos'));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (link?.hash === '#videos') markVideos(true);
  });
  markVideos(location.hash === '#videos');
}

const dialog = document.querySelector('#photo-dialog');
// Only a gesture that starts and ends on the backdrop dismisses a dialog.
// Dragging out of its content must not close it or an underlying dialog.
document.querySelectorAll('dialog').forEach(popup => {
  let backdropPointer = null;
  let backdropRelease = false;
  function onBackdrop(event) {
    if (event.target !== popup) return false;
    const bounds = popup.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  popup.addEventListener('pointerdown', event => {
    backdropPointer = event.isPrimary && event.button === 0 && onBackdrop(event) ? event.pointerId : null;
    backdropRelease = false;
  });
  popup.addEventListener('pointerup', event => {
    backdropRelease = event.pointerId === backdropPointer && onBackdrop(event);
  });
  popup.addEventListener('click', event => {
    const dismiss = backdropRelease && onBackdrop(event);
    backdropPointer = null;
    backdropRelease = false;
    if (dismiss) popup.close();
  });
  for (const type of ['pointercancel', 'close', 'cancel']) {
    popup.addEventListener(type, () => { backdropPointer = null; backdropRelease = false; });
  }
});
let photoOpener;
document.addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (!button || !photos[button.dataset.photo]) return;
  photoOpener = button;
  const photo = photos[button.dataset.photo];
  document.querySelector('#photo-dialog-title').textContent = photo.title;
  document.querySelector('#dialog-photo').src = photo.src;
  document.querySelector('#dialog-photo').alt = photo.alt;
  document.querySelector('#dialog-caption').textContent = photo.place + ' · ' + photo.credit;
  document.querySelector('#dialog-source').href = photo.url;
  dialog.showModal();
});
document.querySelector('[data-close-photo]').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => photoOpener?.focus());

initDeck();
if (document.body.dataset.page === 'museum') {
  import('./museum.js?v=20261123-gallery-dates').then(({ initMuseum }) => initMuseum());
}
