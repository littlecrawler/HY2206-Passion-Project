(() => {
  'use strict';

  const decisions = [
    {
      title: 'You arrive at the market.',
      description: 'Choose a payment from your satchel and offer it to the trader.',
      shortTitle: 'The journey',
      choices: [
        { icon: 'coins', title: 'Offer iron cash', description: 'Take a string of coins from your satchel.', heading: 'Familiar does not mean effortless.', text: 'You keep the payment in metal form. That makes transport and handling part of the transaction. You would still need to know whether these coins are accepted where you intend to trade.', question: 'What would make the additional burden worth accepting?' },
        { icon: 'note', title: 'Offer a paper note', description: 'Bring out a privately issued jiaozi note.', heading: 'A lighter object brings another question.', text: 'Paper reduces the physical burden. But you need to establish who issued the note, what it promises, and whether the person you are paying will accept it.', question: 'What information would you want before exchanging your coins?' }
      ]
    },
    {
      title: 'The trader shows you another note.',
      description: 'This note is unfamiliar. Inspect the document or ask about the promise behind it.',
      shortTitle: 'The promise',
      choices: [
        { icon: 'document', title: 'Inspect the note', description: 'Look closely at the document and its terms.', heading: 'Authenticity is one part of reliability.', text: 'You inspect the instrument and its stated terms. That helps you understand the claim. It leaves a further question: can the issuer fulfil its obligations?', question: 'Could a genuine document still represent an unreliable promise?' },
        { icon: 'issuer', title: 'Ask about the issuer', description: 'Find out who stands behind the promise.', heading: 'The person behind the paper matters.', text: 'You investigate the issuer and its ability to honour the note. This is a different task from checking whether the document is genuine. Both questions can matter to acceptance.', question: 'How would you find reliable information about an unfamiliar issuer?' }
      ]
    },
    {
      title: 'Your story moves to the 1020s.',
      description: 'The state has taken over jiaozi issuance. Visit an imagined issuing office and question the clerk.',
      shortTitle: 'The institution',
      choices: [
        { icon: 'circulation', title: 'Ask where to use it', description: 'Explore which payments accept the notes.', heading: 'Acceptance is a practical question.', text: 'You ask where and for what purposes the instrument can be used. A change of issuer matters, but its effects need to be understood in a specific place and setting.', question: 'Does a note need to be accepted everywhere to be useful?' },
        { icon: 'office', title: 'Ask about public support', description: 'Explore the institutions behind circulation.', heading: 'Institutions give the promise a setting.', text: 'You look beyond the note to the arrangements supporting its use. The historical case connects monetary circulation with state finances and public payments.', question: 'What more would you need to learn before calling a monetary system reliable?' }
      ]
    }
  ];

  const encounters = [
    { background: 'assets/song-market.png', alt: 'A travelling merchant in teal offers a payment to a cloth trader in a fictional Song-inspired market.', location: 'Sichuan market · around 1000', npc: 'The trader', inventory: 'YOUR SATCHEL · CHOOSE AN ITEM TO OFFER', greeting: 'Welcome, traveller. How would you like to pay?', hint: 'Choose an item from your satchel below to see my response.', replies: ['A string of iron cash! You have carried the weight all the way here. Let us see what we can agree on.', 'A paper note? Before I accept it, tell me who issued it — and who else will take it from me.'], discoveries: ['Question 1 · What makes a payment convenient?', 'Question 1 · What makes a payment convenient?'] },
    { background: 'assets/song-market.png', alt: 'The merchant and trader examine a fictional paper promise at the same market counter.', location: 'The same counter · an unfamiliar promise', npc: 'The trader', inventory: 'YOUR NEXT MOVE · INVESTIGATE THE PROMISE', greeting: 'Someone offered me this note. What would you want to know before taking it?', hint: 'You can examine the note or ask about its issuer. Each reveals a different question.', replies: ['Look carefully. Even if the document is genuine, we still need to ask whether its promise can be honoured.', 'Who stands behind it? That is a useful question. A promise is only as dependable as the arrangements supporting it.'], discoveries: ['Question 2 · What makes a promise reliable?', 'Question 2 · What makes a promise reliable?'] },
    { background: 'assets/song-issuing-office.png', alt: 'The travelling merchant speaks with a clerk at an imagined public issuing office in Song Sichuan.', location: 'An imagined issuing office · the 1020s', npc: 'The clerk', inventory: 'YOUR NEXT MOVE · QUESTION THE CLERK', greeting: 'You have come to ask about the notes we issue. What would you like to understand?', hint: 'Ask about acceptance or the public arrangements behind the notes.', replies: ['Think about the payments you want to make. You need to know where a note is accepted and under what conditions.', 'Look beyond this counter: public revenues and payments belong in the story too. The paper is one part of a wider arrangement.'], discoveries: ['Question 3 · What supports a monetary system?', 'Question 3 · What supports a monetary system?'] }
  ];

  const readingConnections = [
    { fragment: 'passage-weight', label: 'Carrying money', description: 'Follow this question to the first excerpt in the History of the Song.' },
    { fragment: 'passage-issuer', label: 'Honouring a promise', description: 'Follow this question to the second excerpt in the History of the Song.' },
    { fragment: 'passage-office', label: 'An institutional response', description: 'Follow this question to the third excerpt in the History of the Song.' }
  ];

  // Original schematic inventory art: not a reproduction of a historical object.
  const iconPaths = {
    coins: '<path d="M17 20C10 8 48 7 45 23L41 52" fill="none" stroke="#9c613d" stroke-width="4"/><g fill="#999966" stroke="#354d36" stroke-width="2"><circle cx="24" cy="29" r="15"/><circle cx="41" cy="38" r="15"/><circle cx="24" cy="47" r="15"/></g><g fill="#e9e1bf" stroke="#52613e" stroke-width="2"><path d="M20 25h8v8h-8zM37 34h8v8h-8zM20 43h8v8h-8z"/></g>',
    note: '<path d="M14 7h39v52H14z" fill="#e6d4a0" stroke="#66734b" stroke-width="2"/><path d="M19 12h29v42H19z" fill="none" stroke="#75815a"/><path d="M24 20h19M24 24h19M24 42h19M24 46h14" stroke="#75815a" stroke-width="2"/><circle cx="33" cy="33" r="6" fill="none" stroke="#75815a" stroke-width="2"/><path d="M31 31h4v4h-4z" fill="#75815a"/>',
    document: '<path d="M10 7h34v47H10z" fill="#e5d4a1" stroke="#65724b" stroke-width="2"/><path d="M16 17h20M16 23h16M16 30h17" stroke="#7b8562" stroke-width="2"/><circle cx="40" cy="39" r="12" fill="#e7ebd5" fill-opacity=".8" stroke="#384f40" stroke-width="4"/><path d="M48 49l11 12" stroke="#7c5e38" stroke-width="7"/>',
    issuer: '<path d="M8 20l24-13 24 13v7H8z" fill="#ac7345" stroke="#655439" stroke-width="2"/><path d="M13 27v28h39V27" fill="#d6c7a1" stroke="#655439" stroke-width="2"/><path d="M25 55V36h14v19M18 29v25M47 29v25" fill="#766b49" stroke="#655439" stroke-width="2"/><path d="M6 58h52" stroke="#655439" stroke-width="3"/>',
    circulation: '<path d="M8 13l16-6 17 7 15-6v44l-15 6-17-7-16 6z" fill="#dedab5" stroke="#677a54" stroke-width="2"/><path d="M24 7v44M41 14v44" stroke="#9da579"/><path d="M16 40q8-22 18-9t15-9" fill="none" stroke="#a45335" stroke-width="3" stroke-dasharray="4 3"/><circle cx="16" cy="40" r="4" fill="#a45335"/><path d="M45 16l5 6 5-7" fill="none" stroke="#a45335" stroke-width="2"/>',
    office: '<path d="M7 25l25-16 25 16z" fill="#586c53" stroke="#3c523e" stroke-width="2"/><path d="M13 27h38v27H13z" fill="#c8bb8d" stroke="#586c53" stroke-width="2"/><path d="M18 30v21M28 30v21M38 30v21M47 30v21" stroke="#586c53" stroke-width="4"/><path d="M8 55h48v5H8z" fill="#9c6a40"/><circle cx="45" cy="44" r="10" fill="#9e5037"/><path d="M40 39h10v10H40z" fill="none" stroke="#e8d8ac"/>'
  };
  function itemIcon(kind) {
    return `<svg viewBox="0 0 64 68" aria-hidden="true" focusable="false">${iconPaths[kind]}</svg>`;
  }

  const layers = [
    { title: 'The visible part', text: 'A number on a screen communicates information about a payment. The display alone is not the entire monetary arrangement.' },
    { title: 'Funds move between accounts', text: 'PayNow transfers Singapore-dollar funds between participating bank or e-wallet accounts. A mobile number or a QR code can help identify the recipient; the transaction involves the accounts behind the interface.', sources: [3] },
    { title: 'Acceptance has an institutional setting', text: 'Modern money operates through institutions and shared expectations about its use. Compare the questions people ask of these arrangements with the questions you asked in Song Sichuan, while keeping the historical differences visible.', sources: [4] }
  ];

  const stage = document.getElementById('stage');
  const stageTitle = document.getElementById('stage-title');
  const stageDescription = document.getElementById('stage-description');
  const counter = document.getElementById('stage-counter');
  const choicesContainer = document.getElementById('choice-grid');
  const hint = document.getElementById('choice-hint');
  const feedback = document.getElementById('decision-feedback');
  const fieldNote = document.getElementById('field-note');
  const scene = document.getElementById('game-scene');
  const dialogue = document.getElementById('character-dialogue');
  const nextButton = document.getElementById('next-step');
  const previousButton = document.getElementById('previous-step');
  const complete = document.getElementById('experience-complete');
  const summary = document.getElementById('choice-summary');
  let currentStep = 0;
  let selections = [null, null, null];

  function paragraph(className, text) {
    const p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text;
    return p;
  }

  function renderFeedback(animate = false) {
    const selected = selections[currentStep];
    feedback.replaceChildren();
    feedback.hidden = selected === null;
    fieldNote.hidden = selected === null;
    nextButton.disabled = selected === null;
    hint.hidden = selected !== null;
    choicesContainer.querySelectorAll('button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === selected));
    });
    updateScene(animate);
    if (selected === null) return;
    const choice = decisions[currentStep].choices[selected];
    const title = document.createElement('h4');
    title.textContent = choice.heading;
    feedback.append(paragraph('feedback-label', 'Consider the trade-off'), title, paragraph('', choice.text), paragraph('feedback-question', choice.question));
    const connection = readingConnections[currentStep];
    const evidence = document.createElement('aside');
    evidence.className = 'decision-source';
    const link = document.createElement('a');
    link.href = `#${connection.fragment}`;
    link.textContent = `Read the evidence: ${connection.label} ↗`;
    evidence.append(paragraph('decision-source-label', 'FROM THE HISTORICAL RECORD'), paragraph('', connection.description), link);
    feedback.append(evidence);
  }

  function updateScene(animate) {
    const encounter = encounters[currentStep];
    const selected = selections[currentStep];
    const image = document.getElementById('scene-background');
    if (image.getAttribute('src') !== encounter.background) image.src = encounter.background;
    image.alt = encounter.alt;
    scene.dataset.encounter = String(currentStep);
    scene.dataset.action = selected === null ? 'none' : decisions[currentStep].choices[selected].icon;
    document.getElementById('scene-location').textContent = encounter.location;
    document.getElementById('npc-label').textContent = encounter.npc;
    document.getElementById('dialogue-speaker').textContent = encounter.npc.toUpperCase();
    document.getElementById('talk-character').setAttribute('aria-label', `Talk to ${encounter.npc.toLowerCase()}`);
    document.getElementById('inventory-title').textContent = encounter.inventory;
    hint.textContent = `Choose an action to see ${encounter.npc.toLowerCase()}'s response. You can try both.`;
    document.getElementById('journal-count').textContent = `Journal ${selections.filter(value => value !== null).length} / 3`;
    dialogue.textContent = selected === null ? encounter.greeting : encounter.replies[selected];
    const discovery = document.getElementById('scene-discovery');
    discovery.hidden = selected === null;
    const inspection = document.getElementById('inspection-card');
    inspection.hidden = selected === null || currentStep === 0;
    const movingItem = document.getElementById('moving-item');
    movingItem.replaceChildren();
    if (selected !== null) {
      const choice = decisions[currentStep].choices[selected];
      document.getElementById('discovery-label').textContent = encounter.discoveries[selected];
      if (currentStep === 0) movingItem.innerHTML = itemIcon(choice.icon);
      else {
        document.getElementById('inspection-art').innerHTML = itemIcon(choice.icon);
        document.getElementById('inspection-label').textContent = choice.title;
      }
    }
    scene.classList.remove('is-acting');
    if (animate && selected !== null) {
      void scene.offsetWidth;
      scene.classList.add('is-acting');
    }
  }

  function updateProgress(finished = false) {
    document.querySelectorAll('[data-step]').forEach((item, index) => {
      item.classList.toggle('active', !finished && index === currentStep);
      item.classList.toggle('complete', finished || index < currentStep);
      if (!finished && index === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }

  function renderStep(moveFocus = false) {
    const decision = decisions[currentStep];
    complete.hidden = true;
    stage.hidden = false;
    fieldNote.open = false;
    stageTitle.textContent = decision.title;
    stageDescription.textContent = decision.description;
    counter.textContent = `DECISION ${String(currentStep + 1).padStart(2, '0')} / 03`;
    choicesContainer.replaceChildren();
    decision.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.setAttribute('aria-pressed', 'false');
      const icon = document.createElement('span');
      icon.className = 'choice-symbol';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = itemIcon(choice.icon);
      const text = document.createElement('span');
      const title = document.createElement('b');
      title.textContent = choice.title;
      const description = document.createElement('small');
      description.textContent = choice.description;
      text.append(title, description);
      button.append(icon, text);
      button.addEventListener('click', () => {
        selections[currentStep] = index;
        fieldNote.open = false;
        renderFeedback(true);
      });
      choicesContainer.append(button);
    });
    previousButton.hidden = currentStep === 0;
    nextButton.replaceChildren(document.createTextNode(currentStep === 2 ? 'Open your journal ' : currentStep === 1 ? 'Visit the issuing office ' : 'Continue the encounter '));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    nextButton.append(arrow);
    renderFeedback();
    updateProgress();
    if (moveFocus) stageTitle.focus({ preventScroll: true });
  }

  function finishExperience() {
    if (selections.some(selection => selection === null)) return;
    summary.replaceChildren();
    decisions.forEach((decision, index) => {
      const group = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = `${String(index + 1).padStart(2, '0')} / ${decision.shortTitle}`;
      description.textContent = decision.choices[selections[index]].title;
      group.append(term, description);
      summary.append(group);
    });
    stage.hidden = true;
    complete.hidden = false;
    updateProgress(true);
    complete.focus({ preventScroll: true });
    complete.scrollIntoView({ block: 'start' });
  }

  function resetExperience() {
    currentStep = 0;
    selections = [null, null, null];
    renderStep(true);
    stageTitle.scrollIntoView({ block: 'start' });
  }

  nextButton.addEventListener('click', () => {
    if (selections[currentStep] === null) return;
    if (currentStep === decisions.length - 1) finishExperience();
    else {
      currentStep += 1;
      renderStep(true);
      stageTitle.scrollIntoView({ block: 'start' });
    }
  });
  previousButton.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep(true);
      stageTitle.scrollIntoView({ block: 'start' });
    }
  });
  document.getElementById('reset-experience').addEventListener('click', resetExperience);
  document.getElementById('replay-experience').addEventListener('click', resetExperience);
  document.getElementById('talk-character').addEventListener('click', () => {
    const selected = selections[currentStep];
    dialogue.textContent = selected === null ? encounters[currentStep].hint : encounters[currentStep].replies[selected];
    const panel = document.querySelector('.dialogue-panel');
    panel.classList.remove('speaking');
    void panel.offsetWidth;
    panel.classList.add('speaking');
  });

  document.querySelectorAll('[data-layer]').forEach(button => {
    if (button.tagName !== 'BUTTON') return;
    button.addEventListener('click', () => {
      const index = Number(button.dataset.layer);
      const layer = layers[index];
      const explanation = document.getElementById('layer-explanation');
      const title = document.createElement('h3');
      title.textContent = layer.title;
      const text = paragraph('', layer.text);
      for (const source of layer.sources || []) {
        const link = document.createElement('a');
        link.className = 'source-ref';
        link.href = `#source-${source}`;
        link.textContent = `[${source}]`;
        link.setAttribute('aria-label', `Source ${source}`);
        text.append(document.createTextNode(' '), link);
      }
      explanation.replaceChildren(title, text);
      document.querySelectorAll('.layer-button').forEach(candidate => {
        const active = candidate === button;
        candidate.classList.toggle('active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      document.getElementById('payment-visual').dataset.layer = String(index);
    });
  });

  renderStep();
})();
