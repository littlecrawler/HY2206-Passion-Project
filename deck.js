import { photos, periods } from './exhibit-data.js?v=20261123-reflection';
import { activity, evidence, defaults, escape, text, cite } from './deck-content.js?v=20261123-reflection';

export function initDeck() {
  const experience = document.querySelector('#card-experience');
  if (!experience) return;
  const stage = document.querySelector('#deck-stage');
  const motion = document.querySelector('#deck-motion');
  const flipper = document.querySelector('#deck-flipper');
  const front = document.querySelector('#card-front');
  const back = document.querySelector('#card-back');
  const panel = document.querySelector('#discovery-panel');
  const flip = document.querySelector('#flip-card');
  const previous = document.querySelector('#previous-card');
  const next = document.querySelector('#next-card');
  const finish = document.querySelector('#tour-finish');
  const timeline = [...document.querySelectorAll('[data-period]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const states = periods.map(()=>({...defaults(),pane:'story'}));
  let current = 0;
  let flipped = false;
  let finished = false;
  let busy = false;
  let turning = false;
  let flipTimer;
  let serial = 0;
  let initialized = false;
  let pointerStart = null;
  let suppressClick = false;
  let deckScene;
  let engineReady = false;

  function fitCard() {
    if (finished) return;
    // Reserve the same space for photo choices on every card. Measuring the
    // current choices resized the camera when a period had more photographs.
    const photoToolsHeight=innerWidth>780?64:128;
    const frontHeight=Math.max(innerWidth>780?520:400,Math.min(960,innerHeight-document.querySelector('.site-header').offsetHeight-timeline[0].parentElement.offsetHeight-document.querySelector('.deck-status').offsetHeight-document.querySelector('.deck-controls').offsetHeight-photoToolsHeight-42));
    const height = engineReady ? frontHeight : Math.ceil((flipped ? back : front).offsetHeight);
    if (height) flipper.style.height = height + 'px';
  }
  const sizeObserver = new ResizeObserver(fitCard);
  sizeObserver.observe(front);
  sizeObserver.observe(back);
  stage.addEventListener('load', fitCard, true);
  window.addEventListener('resize',fitCard);

  function syncControls() {
    previous.disabled = busy || turning || current === 0;
    next.disabled = busy || turning;
    flip.disabled = busy || turning;
    stage.setAttribute('aria-busy', String(busy || turning));
    next.textContent = current === periods.length - 1 ? 'Finish' : 'Next card';
    stage.classList.toggle('is-turning', busy || turning);
  }
  function showSide(answer, immediate = false) {
    if ((busy || turning) && !immediate) return;
    clearTimeout(flipTimer);
    flipped = answer;
    if(answer)back.scrollTop=0;
    turning = !immediate && !reduce.matches;
    if (immediate) flipper.classList.add('no-transition');
    front.inert = engineReady || answer || turning;
    back.inert = !answer || turning;
    front.setAttribute('aria-hidden', String(engineReady || answer));
    back.setAttribute('aria-hidden', String(!answer));
    flipper.classList.toggle('is-flipped', answer);
    stage.classList.toggle('is-reading', engineReady && answer && !turning);
    deckScene?.flip(answer, immediate || reduce.matches);
    flip.setAttribute('aria-pressed', String(answer));
    flip.textContent = answer ? 'View object' : 'Turn card';
    document.querySelector('#card-count').textContent = 'Card ' + (current + 1) + ' of ' + periods.length;
    fitCard();
    syncControls();
    if (turning) { if(!engineReady) flipTimer = setTimeout(settleFlip, 850); }
    else deckScene?.setPaused(answer);
    if (immediate) {
      void flipper.offsetHeight;
      flipper.classList.remove('no-transition');
    }
  }
  function settleFlip() {
    clearTimeout(flipTimer);
    turning = false;
    front.inert = engineReady || flipped;
    back.inert = !flipped;
    stage.classList.toggle('is-reading', engineReady && flipped);
    deckScene?.setPaused(flipped);
    syncControls();
  }
  flipper.addEventListener('transitionend', event => {
    if (event.target === flipper && event.propertyName === 'transform') settleFlip();
  });
  function showPhoto(id) {
    const p = photos[id];
    states[current].photo = id;
    document.querySelector('#card-photo').innerHTML = '<figure class="object-photo"><button class="photo-button" type="button" data-photo="' + id + '" aria-label="Enlarge ' + escape(p.title) + '"><img src="' + p.src + '" alt="' + escape(p.alt) + '"><span class="enlarge-icon" aria-hidden="true">⤢</span></button><figcaption>' + text(p.title) + '<span>' + text(p.place) + '</span></figcaption></figure>';
    document.querySelectorAll('[data-object]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.object === id)));
    document.querySelector('#deck-photo-action').dataset.photo = id;
    document.querySelectorAll('[data-deck-photo]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.deckPhoto === id)));
    deckScene?.setPhoto(id);
    fitCard();
  }
  function renderPanel() {
    const p = periods[current];
    const state = states[current];
    document.querySelector('[data-pane="activity"]').hidden=p.hasActivity===false;
    if(p.hasActivity===false&&state.pane==='activity')state.pane='story';
    document.querySelectorAll('[data-pane]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pane === state.pane)));
    panel.innerHTML = state.pane === 'story' ? '<div class="mobile-story"><h3 class="activity-title">' + text(p.answerTitle) + '</h3><p>' + text(p.story) + ' ' + cite(p.sources) + '</p><a class="text-link" href="read.html#' + p.id + '">Read more</a></div>' : state.pane === 'sources' ? evidence(p, state) : activity(p, state);
    fitCard();
  }
  function renderCard(index, enter = false) {
    current = index;
    finished = false;
    experience.hidden = false;
    finish.hidden = true;
    const p = periods[current];
    document.querySelector('#card-date').textContent = p.date;
    document.querySelector('#back-date').textContent = p.date;
    document.querySelector('#card-title').textContent = p.label;
    document.querySelector('#back-title').textContent = p.label;
    document.querySelector('#card-question').textContent = p.question;
    document.querySelector('#answer-title').textContent = p.answerTitle;
    document.querySelector('#card-story').innerHTML = text(p.story) + ' ' + cite(p.sources);
    document.querySelectorAll('.deck-number').forEach(node => { node.textContent = String(current + 1).padStart(2, '0'); });
    document.querySelector('#read-current').href = 'read.html#' + p.id;
    stage.setAttribute('aria-label', p.label + '. ' + p.date + '. ' + p.question + ' Enter turns the card; left and right keys change periods.');
    document.querySelector('#photo-choices').innerHTML = p.photos.length > 1 ? p.photos.map(id => '<button class="photo-choice" type="button" data-object="' + id + '" aria-pressed="false">' + text(photos[id].title.split('（')[0].trim()) + '</button>').join('') : '';
    document.querySelector('#deck-photo-options').innerHTML = p.photos.length > 1 ? p.photos.map(id => '<button class="photo-choice" type="button" data-deck-photo="' + id + '" aria-pressed="false">' + text(photos[id].title.split('（')[0].trim()) + '</button>').join('') : '';
    deckScene?.show(current,states[current].photo||p.photos[0],enter);
    showPhoto(states[current].photo || p.photos[0]);
    renderPanel();
    showSide(false, true);
    document.querySelector('#pile-near-label').textContent = periods[(current + 1) % periods.length].label;
    document.querySelector('#pile-far-label').textContent = periods[(current + 2) % periods.length].label;
    document.querySelector('#pile-near-photo').src=photos[periods[(current+1)%periods.length].photos[0]].src;
    document.querySelector('#pile-far-photo').src=photos[periods[(current+2)%periods.length].photos[0]].src;
    document.querySelector('.pile-near').hidden=current+1>=periods.length;
    document.querySelector('.pile-far').hidden=current+2>=periods.length;
    timeline.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    const rail = timeline[current].parentElement;
    if (rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: timeline[current].offsetLeft - rail.offsetLeft - (rail.clientWidth - timeline[current].clientWidth) / 2, behavior: reduce.matches ? 'instant' : 'smooth' });
    document.title = p.label + ' · Interactive cards · Money in China';
    syncControls();
    initialized = true;
  }
  function finishTour() {
    finished = true;
    experience.hidden = true;
    finish.hidden = false;
    deckScene?.setPaused(true);
    document.querySelector('#finish-title').focus({ preventScroll: true });
    finish.scrollIntoView({ behavior: reduce.matches ? 'instant' : 'smooth', block: 'center' });
    document.title = 'Journey complete · Money in China';
  }
  async function play(frames, duration) {
    if (reduce.matches) return;
    try {
      const animation=motion.animate(frames, { duration, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
      await animation.finished;
    } catch { /* A history navigation can cancel an unfinished deal. */ }
  }
  async function navigate(index, { push = true, animate = true } = {}) {
    if (index < 0 || index > periods.length || ((busy || turning) && push)) return;
    const request = ++serial;
    const direction = index >= current ? -1 : 1;
    busy = true;
    syncControls();
    const ready=deckScene&&index<periods.length?deckScene.prepare(index,states[index].photo||periods[index].photos[0]):Promise.resolve();
    if (push) history.pushState(null, '', '#' + (index === periods.length ? 'complete' : periods[index].id));
    if (animate && !finished) {
      if(deckScene) {stage.classList.remove('is-reading');await deckScene.dealOut(direction);}
      else await play([{ transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 }, { transform: 'translate3d(' + direction * 19 + '%, -12px, 60px) rotate(' + direction * 7 + 'deg)', opacity: 0 }], 480);
    }
    await ready;
    if (request !== serial) return;
    if (index === periods.length) {
      busy = false;
      finishTour();
      return;
    }
    renderCard(index,animate);
    if (animate) {
      if(deckScene)await deckScene.dealIn(direction);
      else await play([{ transform: 'translate3d(' + -direction * 10 + '%, 20px, -50px) rotate(' + -direction * 4 + 'deg)', opacity: .3 }, { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 }], 520);
    }
    if (request !== serial) return;
    busy = false;
    motion.getAnimations().forEach(animation => animation.cancel());
    syncControls();
  }
  function followHash() {
    const hash = location.hash.slice(1);
    if (initialized && ['top','main'].includes(hash)) return;
    serial++;
    motion.getAnimations().forEach(animation => animation.cancel());
    deckScene?.cancel();
    busy = false;
    if (hash === 'complete') { initialized = true; finishTour(); return; }
    const index = periods.findIndex(p => p.id === hash);
    renderCard(index < 0 ? 0 : index);
  }
  timeline.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!busy && !turning) navigate(index);
  }));
  flip.addEventListener('click', () => showSide(!flipped));
  document.querySelector('[data-flip]').addEventListener('click', () => {
    flip.focus({ preventScroll: true });
    showSide(true);
  });
  previous.addEventListener('click', () => navigate(current - 1));
  next.addEventListener('click', () => navigate(current + 1));
  document.querySelector('#restart-cards').addEventListener('click', async () => {
    await navigate(0, { animate: false });
    flip.focus({ preventScroll: true });
    document.querySelector('.deck-page').scrollIntoView({ behavior: reduce.matches ? 'instant' : 'smooth' });
  });
  document.querySelector('#photo-choices').addEventListener('click', event => {
    const button = event.target.closest('[data-object]');
    if (button && periods[current].photos.includes(button.dataset.object)) showPhoto(button.dataset.object);
  });
  document.querySelector('#deck-photo-options').addEventListener('click', event => {
    const button=event.target.closest('[data-deck-photo]');
    if(button&&periods[current].photos.includes(button.dataset.deckPhoto))showPhoto(button.dataset.deckPhoto);
  });
  document.querySelector('.discovery-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-pane]');
    if (!button) return;
    states[current].pane = button.dataset.pane;
    renderPanel();
  });
  const actionKeys = { detail: 'detail', money: 'money', issuer: 'issuer', yuan: 'yuanStage', transaction: 'transaction', payment: 'paymentLayer', document: 'document' };
  panel.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const state = states[current];
    const action = button.dataset.action;
    if (action === 'coin') {
      state.coinBack = !state.coinBack;
      document.querySelector('#coin-flipper').classList.toggle('is-reverse', state.coinBack);
      document.querySelector('.coin-obverse').setAttribute('aria-hidden', String(state.coinBack));
      document.querySelector('.coin-reverse').setAttribute('aria-hidden', String(!state.coinBack));
      button.setAttribute('aria-pressed', String(state.coinBack));
      document.querySelector('#coin-side').textContent = state.coinBack ? 'Reverse · the other face' : 'Obverse · the inscription';
      return;
    }
    if (!actionKeys[action]) return;
    state[actionKeys[action]] = ['yuan','payment'].includes(action) ? Number(button.dataset.value) : button.dataset.value;
    const value = button.dataset.value;
    renderPanel();
    panel.querySelectorAll('button[data-action]').forEach(candidate => {
      if (candidate.dataset.action === action && candidate.dataset.value === value) candidate.focus({ preventScroll: true });
    });
  });
  panel.addEventListener('input', event => {
    if (event.target.dataset.action === 'zoom') {
      const zoom = Math.min(2.5, Math.max(1, Number(event.target.value)));
      states[current].zoom = zoom;
      document.querySelector('#lens-photo').style.transform = 'scale(' + zoom + ')';
      document.querySelector('#zoom-value').textContent = zoom.toFixed(1) + '×';
      event.target.setAttribute('aria-valuetext', zoom.toFixed(1) + ' times');
    }
  });
  stage.addEventListener('keydown', event => {
    if (event.target !== stage) return;
    if (['ArrowRight','ArrowLeft','Enter',' '].includes(event.key)) event.preventDefault();
    if (event.key === 'ArrowRight') navigate(current + 1);
    if (event.key === 'ArrowLeft') navigate(current - 1);
    if (event.key === 'Enter' || event.key === ' ') showSide(!flipped);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('input,select,textarea,[data-action],[data-pane]')) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointercancel', () => { pointerStart = null; });
  stage.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 65 || Math.abs(dy) > 50 || busy) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 400);
    navigate(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); suppressClick = false; }
  }, true);
  window.addEventListener('hashchange', followHash);
  window.addEventListener('resize', () => {
    fitCard();
  });
  followHash();
  const canvas=document.querySelector('#deck-canvas');
  import('./deck-scene.js?v=20261123-reflection').then(({createDeckScene})=>createDeckScene(canvas,{
    initialIndex:current,photoId:states[current].photo,backElement:back,reducedMotion:reduce.matches,
    onFlipEnd(){if(turning)settleFlip();},
    onFlip(){if(!busy&&!turning){flip.focus({preventScroll:true});showSide(!flipped);}}
  })).then(result=>{
    deckScene=result;engineReady=true;document.body.dataset.deckRenderer='webgl';canvas.hidden=false;
    document.querySelector('#deck-photo-tools').hidden=false;
    if(finished){deckScene.setPaused(true);return;}
    deckScene.show(current,states[current].photo);showSide(flipped,true);fitCard();
    reduce.addEventListener('change',event=>deckScene.setReducedMotion(event.matches));
  }).catch(error=>{console.warn('Flashcards are using the CSS view.',error.message);});
}
