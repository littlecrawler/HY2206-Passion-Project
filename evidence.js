(() => {
  'use strict';

  const readingButtons = [...document.querySelectorAll('[data-reading]')];
  const readingPanels = [...document.querySelectorAll('[data-reading-panel]')];
  document.querySelector('.reading-pages').classList.add('is-enhanced');

  function showText(name) {
    readingPanels.forEach(panel => { panel.hidden = panel.dataset.readingPanel !== name; });
    readingButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.reading === name));
    });
  }

  readingButtons.forEach(button => button.addEventListener('click', () => showText(button.dataset.reading)));

  function followPassage() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    const panel = target && target.closest('[data-reading-panel]');
    if (!panel) return;
    showText(panel.dataset.readingPanel);
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }

  showText('history');
  followPassage();
  window.addEventListener('hashchange', followPassage);
  // Reveal a linked panel even when the fragment already matches the current URL.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    let id;
    try { id = decodeURIComponent(link.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    const panel = target && target.closest('[data-reading-panel]');
    if (panel) showText(panel.dataset.readingPanel);
  });

  const claims = [
    {
      question: 'Which text directly reports repayment problems in Sichuan?',
      options: ['History of the Song', 'The Kaifeng city memoir', 'Liu Yong’s lyric'],
      correct: 0,
      explanation: 'The official history reports repayment failures. The memoir and poem concern urban life elsewhere.'
    },
    {
      question: 'Can the Kaifeng market passage establish that a Sichuan trader accepted jiaozi?',
      options: ['Yes — both places belong to the Song', 'No — the place and the claim differ', 'Yes — busy markets always use paper'],
      correct: 1,
      explanation: 'Shared dynastic labels do not make local practices identical. This passage describes Kaifeng’s markets, not a Sichuan payment.'
    },
    {
      question: 'What can the lyric help us investigate?',
      options: ['The exact price of a paper note', 'How urban prosperity was represented', 'The income of every household'],
      correct: 1,
      explanation: 'Poetry offers a crafted representation. Its imagery invites analysis of prosperity, rather than a count of household wealth.'
    }
  ];
  let currentClaim = 0;
  let answers = [null, null, null];
  const question = document.getElementById('check-question');
  const options = document.getElementById('check-options');
  const feedback = document.getElementById('check-feedback');
  const next = document.getElementById('check-next');

  function renderClaim(moveFocus = false) {
    const claim = claims[currentClaim];
    const answer = answers[currentClaim];
    document.getElementById('check-counter').textContent = `CLAIM ${String(currentClaim + 1).padStart(2, '0')} / 03`;
    question.textContent = claim.question;
    options.replaceChildren();
    claim.options.forEach((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'check-option';
      button.textContent = label;
      button.setAttribute('aria-pressed', String(index === answer));
      button.addEventListener('click', () => {
        answers[currentClaim] = index;
        showAnswer();
      });
      options.append(button);
    });
    showAnswer();
    if (moveFocus) question.focus({ preventScroll: true });
  }

  function showAnswer() {
    const claim = claims[currentClaim];
    const answer = answers[currentClaim];
    feedback.hidden = answer === null;
    next.disabled = answer === null;
    options.querySelectorAll('button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === answer));
    });
    if (answer !== null) {
      const isCorrect = answer === claim.correct;
      feedback.classList.toggle('is-correct', isCorrect);
      feedback.textContent = `${isCorrect ? 'That claim fits the evidence. ' : 'Look at the source’s scope. '}${claim.explanation}`;
    }
    document.getElementById('check-progress').textContent = `${answers.filter(answer => answer !== null).length} / 3 claims examined`;
    next.textContent = currentClaim === claims.length - 1 ? 'Try again ↻' : 'Next claim →';
  }

  next.addEventListener('click', () => {
    if (answers[currentClaim] === null) return;
    if (currentClaim < claims.length - 1) currentClaim += 1;
    else { currentClaim = 0; answers = [null, null, null]; }
    renderClaim(true);
  });

  document.getElementById('evidence-check').hidden = false;
  renderClaim();
})();
