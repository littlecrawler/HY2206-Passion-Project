(() => {
  'use strict';

  const coinDetails = {
    shape: {
      title: 'A shared, recognisable form',
      text: 'The round coin with a square hole became characteristic of imperial Chinese cash. A common form is evidence of standardisation; it does not establish that every coin had the same weight or value.',
      source: 9
    },
    inscription: {
      title: 'An inscription is a historical clue',
      text: 'Banliang means “half-liang” （半兩）. Yet the Han account below describes four-zhu coins （四銖錢） retaining that inscription. A name can continue while the monetary rule behind it changes.',
      source: 11
    },
    rules: {
      title: 'Money also depended on policy',
      text: 'The same passage describes permission for private casting under Emperor Wen. A coin points beyond its material to decisions about who could make money and on what terms.',
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
    coinExplanation.innerHTML = `<h3>${detail.title}</h3><p>${detail.text} <a class="source-ref" href="#source-${detail.source}" aria-label="Source ${detail.source}">[${detail.source}]</a></p>`;
  }));

  const transactions = {
    market: {
      money: 'copper', title: 'Small purchases, copper cash',
      text: 'Copper coins （銅錢） were commonly used for everyday transactions. The useful question is which denominations and forms a local market would accept.'
    },
    trade: {
      money: 'silver', title: 'Silver enters the transaction',
      text: 'Silver （白銀） was important for larger transactions. Copper still circulated alongside it, making conversion between monetary forms part of commercial life.'
    },
    tax: {
      money: 'silver', title: 'A payment shaped by fiscal needs',
      text: 'Silver （白銀） was important in tax payments, while some obligations could involve copper cash （銅錢）. What a household earned and what it owed might therefore require conversion. The exact practice depended on place, period, and levy.'
    }
  };

  const transactionButtons = [...document.querySelectorAll('[data-transaction]')];
  const transactionResult = document.getElementById('transaction-result');
  const moneyTable = document.getElementById('money-table');
  transactionButtons.forEach(button => button.addEventListener('click', () => {
    const detail = transactions[button.dataset.transaction];
    transactionButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    moneyTable.dataset.money = detail.money;
    transactionResult.innerHTML = `<h3>${detail.title}</h3><p>${detail.text} <a class="source-ref" href="#source-12" aria-label="Source 12">[12]</a></p>`;
  }));
})();
