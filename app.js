(() => {
  'use strict';

  // One fictional transaction: compare carrying coins with relying on a paper promise.
  const market = document.getElementById('merchant-game');
  const prompt = document.getElementById('market-prompt');
  const choices = document.getElementById('market-choices');
  const dialogue = document.getElementById('market-dialogue');
  const lesson = document.getElementById('market-lesson');
  const restart = document.getElementById('restart-trade');
  const token = document.getElementById('trade-token');

  const icons = {
    coins: '<path d="M17 20C10 8 48 7 45 23L41 52" fill="none" stroke="#9c613d" stroke-width="4"/><g fill="#999966" stroke="#354d36" stroke-width="2"><circle cx="24" cy="29" r="15"/><circle cx="41" cy="38" r="15"/><circle cx="24" cy="47" r="15"/></g><path d="M20 25h8v8h-8zM37 34h8v8h-8zM20 43h8v8h-8z" fill="#e9e1bf" stroke="#52613e" stroke-width="2"/>',
    note: '<path d="M14 7h39v52H14z" fill="#e6d4a0" stroke="#66734b" stroke-width="2"/><path d="M19 12h29v42H19z" fill="none" stroke="#75815a"/><path d="M24 20h19M24 24h19M24 42h19M24 46h14" stroke="#75815a" stroke-width="2"/><circle cx="33" cy="33" r="6" fill="none" stroke="#75815a" stroke-width="2"/>',
    cloth: '<path d="M17 16h32v34H17c-13 0-13-18 0-18h27" fill="#adc6c0" stroke="#345b54" stroke-width="3"/><ellipse cx="49" cy="33" rx="8" ry="17" fill="#d7e2d6" stroke="#345b54" stroke-width="3"/><path d="M14 32c7 0 7 18 0 18M24 17v14M31 17v14M24 34v15M31 34v15" fill="none" stroke="#71968c" stroke-width="2"/>'
  };
  function itemIcon(kind) {
    return '<svg viewBox="0 0 64 68" aria-hidden="true" focusable="false">' + icons[kind] + '</svg>';
  }
  const actions = {
    coins: { label: 'Pay with iron cash', translation: '（鐵錢）', detail: 'Carry the metal coins to the market.', icon: 'coins', next: 'coins' },
    paper: { label: 'Use a paper note', translation: '（交子）', detail: 'Carry a private issuer’s promise instead.', icon: 'note', next: 'paper' },
    check: { label: 'Check the issuer and acceptance', detail: 'Read the promise and ask whether the trader accepts it.', next: 'accepted' },
    offer: { label: 'Offer it without checking', detail: 'Hand over the note as it is.', next: 'declined' },
    comparePaper: { label: 'Try paying with paper', next: 'paper' },
    compareCoins: { label: 'Try paying with coins', next: 'coins' }
  };
  const states = {
    choose: {
      title: 'How will you pay?',
      dialogue: 'Welcome to my stall. How would you like to pay for the cloth?',
      status: 'Cloth: still at the stall', actions: ['coins', 'paper']
    },
    paper: {
      title: 'Will the trader accept your note?',
      dialogue: 'Before I take this paper, who issued it? Can they repay what it promises?',
      status: 'Cloth: waiting for payment', icon: 'note', actions: ['check', 'offer']
    },
    declined: {
      title: 'The cloth stays with the trader.',
      dialogue: 'I do not yet know who will repay this note. I will not accept it as it stands.',
      status: 'Cloth: still at the stall', icon: 'note',
      lesson: 'The paper saved weight, but this trader has not accepted its promise. Check the issuer, or try coins.',
      source: 'passage-issuer', sourceLabel: 'Read about repayment problems', actions: ['check', 'compareCoins']
    },
    coins: {
      title: 'You bought the cloth.',
      dialogue: 'I accept these iron coins. Here is your cloth.',
      status: 'Cloth: now in your bag', icon: 'cloth',
      lesson: 'Coins worked in this trade, but moving heavy iron cash was inconvenient. Jiaozi offered a lighter way to carry value.',
      source: 'passage-weight', sourceLabel: 'Read why iron cash was inconvenient', actions: ['comparePaper']
    },
    accepted: {
      title: 'You bought the cloth.',
      dialogue: 'Now that we have checked: I recognise this issuer and expect them to repay the note. I will accept it. Here is your cloth.',
      status: 'Cloth: now in your bag', icon: 'cloth',
      lesson: 'The note was easy to carry. It worked here because the trader expected its issuer to repay it. That expectation could still prove wrong.',
      source: 'passage-issuer', sourceLabel: 'Read about repayment problems', actions: ['compareCoins']
    }
  };

  function paragraph(className, text) {
    const p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text;
    return p;
  }

  function renderTrade(name, moveFocus = true) {
    const state = states[name];
    market.dataset.state = name;
    prompt.textContent = state.title;
    dialogue.textContent = state.dialogue;
    document.getElementById('trade-status').textContent = state.status;
    token.innerHTML = state.icon ? itemIcon(state.icon) : '';
    token.hidden = !state.icon;
    lesson.replaceChildren();
    lesson.hidden = !state.lesson;
    if (state.lesson) {
      const link = document.createElement('a');
      link.href = '#' + state.source;
      link.textContent = state.sourceLabel;
      lesson.append(paragraph('', state.lesson), link);
    }
    choices.replaceChildren();
    state.actions.forEach(key => {
      const action = actions[key];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'market-choice';
      if (action.icon) {
        const icon = document.createElement('span');
        icon.className = 'market-choice-icon';
        icon.innerHTML = itemIcon(action.icon);
        button.append(icon);
      }
      const copy = document.createElement('span');
      const label = document.createElement('b');
      label.textContent = action.label;
      if (action.translation) {
        const translation = document.createElement('span');
        translation.lang = 'zh-Hant';
        translation.textContent = action.translation;
        label.append(translation);
      }
      copy.append(label);
      if (action.detail) {
        const detail = document.createElement('span');
        detail.className = 'market-choice-detail';
        detail.textContent = action.detail;
        copy.append(detail);
      }
      button.append(copy);
      button.addEventListener('click', () => renderTrade(action.next));
      choices.append(button);
    });
    restart.hidden = name === 'choose';
    if (moveFocus) {
      prompt.focus({ preventScroll: true });
      prompt.scrollIntoView({ block: 'nearest' });
    }
  }

  restart.addEventListener('click', () => renderTrade('choose'));
  renderTrade('choose', false);

  const layers = [
    { title: 'The visible part', text: 'A number on a screen communicates information about a payment. The display alone is not the entire monetary arrangement.' },
    { title: 'Funds move between accounts', text: 'PayNow transfers Singapore-dollar funds between participating bank or e-wallet accounts. A mobile number or a QR code can help identify the recipient; the transaction involves the accounts behind the interface.', sources: [3] },
    { title: 'Acceptance has an institutional setting', text: 'Modern money operates through institutions and shared expectations about its use. Compare the questions people ask of these arrangements with the questions you asked in Song Sichuan, while keeping the historical differences visible.', sources: [4] }
  ];

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

})();
