import { photos, periods } from './exhibit-data.js';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = value => escape(value).replace(/（([^）]+)）/g, '<span lang="zh-Hant">（$1）</span>');
const cite = ids => ids.map(id => '<a class="citation" href="references.html#source-' + id + '" aria-label="Reference ' + id + '">[' + id + ']</a>').join(' ');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Old bookmarks remain useful after the long page is split into two modes.
if (document.body.dataset.page === 'home') {
  const aliases = {
    experience: 'cards.html#song', story: 'read.html#song', metal: 'read.html#qin-han',
    beginnings: 'read.html#early-money', coexistence: 'read.html#ming-qing',
    today: 'read.html#today', 'reading-room': 'read.html#song',
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
window.matchMedia('(min-width: 781px)').addEventListener('change', closeMenu);

const dialog = document.querySelector('#photo-dialog');
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

function initCards() {
  const experience = document.querySelector('#card-experience');
  if (!experience) return;
  const timelineLinks = [...document.querySelectorAll('[data-period]')];
  const front = document.querySelector('#card-front');
  const back = document.querySelector('#card-back');
  const flip = document.querySelector('#flip-card');
  const previous = document.querySelector('#previous-card');
  const next = document.querySelector('#next-card');
  const finish = document.querySelector('#tour-finish');
  const flashcard = document.querySelector('#flashcard');
  let current = 0;
  let flipped = false;
  let finished = false;

  function animate() {
    flashcard.classList.remove('changing');
    requestAnimationFrame(() => flashcard.classList.add('changing'));
  }
  function showPhoto(id) {
    const p = photos[id];
    document.querySelector('#card-photo').innerHTML = '<figure class="object-photo"><button class="photo-button" type="button" data-photo="' + id + '" aria-label="Enlarge ' + escape(p.title) + '"><img src="' + p.src + '" alt="' + escape(p.alt) + '"><span class="enlarge-icon" aria-hidden="true">⤢</span></button><figcaption>' + text(p.title) + '<span>' + text(p.place) + '</span></figcaption></figure>';
    document.querySelectorAll('[data-object]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.object === id)));
  }
  function showSide(answer) {
    flipped = answer;
    flashcard.dataset.flipped = String(answer);
    front.hidden = answer;
    back.hidden = !answer;
    flip.setAttribute('aria-pressed', String(answer));
    flip.textContent = answer ? 'Show question' : 'Flip card';
    document.querySelector('#card-side').textContent = answer ? 'Answer' : 'Question';
    // Announce the newly revealed text without moving focus away from the flip button.
    document.querySelector('#card-count').textContent = 'Card ' + (current + 1) + ' of ' + periods.length + (answer ? ' · Answer revealed' : '');
    animate();
  }
  function showCard(index) {
    current = Math.max(0, Math.min(periods.length - 1, index));
    finished = false;
    const p = periods[current];
    experience.hidden = false;
    finish.hidden = true;
    document.querySelector('#card-date').textContent = p.date;
    document.querySelector('#card-title').textContent = p.label;
    document.querySelector('#card-question').textContent = p.question;
    document.querySelector('#answer-title').textContent = p.answerTitle;
    document.querySelector('#card-story').innerHTML = text(p.story) + ' ' + cite(p.sources);
    // Longer primary-source excerpts stay in the reading mode.
    document.querySelector('#card-quote').replaceChildren();
    document.querySelector('#read-current').href = 'read.html#' + p.id;
    previous.disabled = current === 0;
    next.textContent = current === periods.length - 1 ? 'Finish' : 'Next period';
    document.querySelector('#photo-choices').innerHTML = p.photos.length > 1 ? p.photos.map(id => '<button class="photo-choice" type="button" data-object="' + id + '" aria-pressed="false">' + text(photos[id].title.split('（')[0].trim()) + '</button>').join('') : '';
    showPhoto(p.photos[0]);
    showSide(false);
    timelineLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    const timeline = timelineLinks[current].parentElement;
    if (timeline.scrollWidth > timeline.clientWidth) {
      timeline.scrollTo({ left: timelineLinks[current].offsetLeft - timeline.offsetLeft - (timeline.clientWidth - timelineLinks[current].clientWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    document.title = p.label + ' · Flashcards · Money in China';
  }
  function finishTour() {
    finished = true;
    experience.hidden = true;
    finish.hidden = false;
    document.querySelector('#finish-title').focus({ preventScroll: true });
    finish.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    document.title = 'Journey complete · Money in China';
  }
  function goTo(id, scroll = true) {
    history.pushState(null, '', '#' + id);
    renderRoute(scroll);
  }
  function renderRoute(scroll = false) {
    const id = location.hash.slice(1);
    if ((id === 'top' || id === 'main') && (finished || !experience.hidden)) return;
    if (id === 'complete') { finishTour(); return; }
    const index = periods.findIndex(p => p.id === id);
    showCard(index < 0 ? 0 : index);
    if (scroll && window.innerWidth <= 780) {
      document.querySelector('.card-status').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }
  timelineLinks.forEach(link => link.addEventListener('click', event => {
    // Retain ordinary open-in-new-tab behaviour.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    goTo(periods[Number(link.dataset.period)].id);
  }));
  document.querySelector('#photo-choices').addEventListener('click', event => {
    const button = event.target.closest('[data-object]');
    if (button && periods[current].photos.includes(button.dataset.object)) showPhoto(button.dataset.object);
  });
  flip.addEventListener('click', () => showSide(!flipped));
  previous.addEventListener('click', () => { if (!finished && current > 0) goTo(periods[current - 1].id); });
  next.addEventListener('click', () => goTo(current === periods.length - 1 ? 'complete' : periods[current + 1].id));
  document.querySelector('#restart-cards').addEventListener('click', () => {
    goTo(periods[0].id, false);
    flip.focus({ preventScroll: true });
    document.querySelector('.flashcards-page').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  window.addEventListener('hashchange', () => renderRoute());
  renderRoute();
}

initCards();
