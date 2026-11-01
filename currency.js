(() => {
  'use strict';

  const coinDetails = {
    shape: {
      kicker: 'WHAT CAN THE SHAPE TELL US?',
      title: 'A shared, recognisable form',
      text: 'The round coin with a square hole became characteristic of imperial Chinese cash. A common form is evidence of standardisation; it does not establish that every coin had the same weight or value.',
      question: 'Look closely: what can appearance tell you, and what would you still need to check?',
      source: 9
    },
    inscription: {
      kicker: 'READ THE NAME, THEN CHECK THE CONTEXT',
      title: 'An inscription is a historical clue',
      text: 'Banliang means “half-liang” （半兩）. Yet the Han account below describes four-zhu coins retaining that inscription. A name can continue while the monetary rule behind it changes.',
      question: 'Read the short passage below. Would the inscription alone prove a coin’s actual weight?',
      source: 11
    },
    rules: {
      kicker: 'WHO SET THE TERMS?',
      title: 'Money also depended on policy',
      text: 'The same passage describes permission for private casting under Emperor Wen. A coin points beyond its material to decisions about who could make money and on what terms.',
      question: 'What further evidence would you need to know how a coin was produced and accepted?',
      source: 11
    }
  };

  const coinButtons = [...document.querySelectorAll('[data-coin-detail]')];
  const coinExplanation = document.getElementById('coin-explanation');
  const coinObject = document.getElementById('coin-object');
  coinButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.coinDetail;
    const detail = coinDetails[key];
    coinButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    coinObject.dataset.focus = key;
    coinExplanation.innerHTML = `<span class="detail-kicker">${detail.kicker}</span><h3>${detail.title}</h3><p>${detail.text} <a class="source-ref" href="#source-${detail.source}" aria-label="Source ${detail.source}">[${detail.source}]</a></p><p class="detail-question">${detail.question}</p>`;
  }));

  const transactions = {
    market: {
      money: 'copper', kicker: 'EVERYDAY EXCHANGE', title: 'Small purchases, copper cash',
      text: 'Copper coins were commonly used for everyday transactions. The useful question is which denominations and forms a local market would accept.'
    },
    trade: {
      money: 'silver', kicker: 'LARGER PAYMENTS', title: 'Silver enters the transaction',
      text: 'Silver was important for larger transactions. Copper still circulated alongside it, making conversion between monetary forms part of commercial life.'
    },
    tax: {
      money: 'silver', kicker: 'OBLIGATIONS TO THE STATE', title: 'A payment shaped by fiscal needs',
      text: 'Silver was important in tax payments, while some obligations could involve copper cash. What a household earned and what it owed might therefore require conversion. The exact practice depended on place, period, and levy.'
    }
  };

  const transactionButtons = [...document.querySelectorAll('[data-transaction]')];
  const transactionResult = document.getElementById('transaction-result');
  const moneyTable = document.getElementById('money-table');
  transactionButtons.forEach(button => button.addEventListener('click', () => {
    const detail = transactions[button.dataset.transaction];
    transactionButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    moneyTable.dataset.money = detail.money;
    transactionResult.innerHTML = `<span class="detail-kicker">${detail.kicker}</span><h3>${detail.title}</h3><p>${detail.text} <a class="source-ref" href="#source-12" aria-label="Source 12">[12]</a></p>`;
  }));
})();
