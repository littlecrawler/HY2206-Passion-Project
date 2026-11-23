import { photos } from './exhibit-data.js?v=20261123-photo-study';

export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const text = value => escape(value).replace(/（([^）]+)）/g, '<span lang="zh-Hant">（$1）</span>');
export const cite = ids => ids.map(id => '<a class="citation" href="references.html#source-' + id + '" aria-label="Reference ' + id + '">[' + id + ']</a>').join(' ');
export const defaults = () => ({ money: 'iron', issuer: 'repaid', transaction: 'market', paymentLayer: 0 });

function choices(action, options, selected, label) {
  return '<div class="activity-choices" role="group" aria-label="' + label + '">' + options.map(([value, label]) => '<button type="button" data-action="' + action + '" data-value="' + value + '" aria-pressed="' + (String(selected) === String(value)) + '">' + label + '</button>').join('') + '</div>';
}
function picture(id, className = '', enlargeLabel = false) {
  const p = photos[id];
  return '<button type="button" class="activity-photo ' + className + '" data-photo="' + id + '" aria-label="Enlarge ' + escape(p.title) + '"><img src="' + p.src + '" alt="' + escape(p.alt) + '">' + (enlargeLabel ? '<span class="photo-enlarge-label"><span aria-hidden="true">⤢</span> Enlarge</span>' : '') + '</button>';
}
function feedback(title, body, sources = []) {
  return '<div class="activity-result" role="status"><h4>' + title + '</h4><p>' + body + ' ' + cite(sources) + '</p></div>';
}
function quote(english, chinese, attribution, source) {
  return '<blockquote><p>“' + text(english) + '”</p><p lang="zh-Hant">（' + chinese + '）</p><cite>' + text(attribution) + ' ' + cite([source]) + '</cite></blockquote>';
}

export const readingAdditions = {
  'qin-han': '<div class="text-evidence"><h3>Money and state power</h3><p>The same Han account also describes permission for private casting. The course’s discussion of standardisation helps connect coins with a wider question: who could set the rules of economic life? A recognisable form could endure while rules about weight and production changed. ' + cite([11,16]) + '</p></div>',
  today: '<div class="text-evidence"><h3>Convenience and trust, then and now</h3><p>Song jiaozi reduced the burden of carrying metal, while repayment depended on the issuer. ' + cite([1,6]) + ' In China today, a payment app lets the customer initiate a transaction through a code, using funds connected to the service. ' + cite([22,23]) + '</p><p>The connection I draw is a question about trust: do people trust the material they hold, a familiar name, or the expectation that the other person will accept their payment? For me, this makes imperial monetary history relevant to an everyday action today.</p><h3>A comparison from Singapore</h3><p>PayNow transfers Singapore-dollar funds between participating bank or e-wallet accounts. It offers another way to examine how an easy payment depends on providers and records. ' + cite([3]) + '</p></div>',
  song: '<div class="text-evidence"><h3>From carrying costs to repayment</h3>' +
    quote('They could not repay what they owed.', '不能償所負', 'History of the Song（宋史）, vol. 181', 6) +
    quote('They requested a jiaozi bureau in Yizhou.', '請置益州交子務', 'History of the Song（宋史）, vol. 181', 6) +
    '<p>The account brings together metal’s inconvenience, private repayment problems and the creation of an official issuing office. My reading is that monetary innovation shifted the burden: carrying less metal could mean depending more visibly on an issuer. The Song course materials connect commercial expansion with debates over government involvement. ' + cite([1,17]) + '</p></div>',
  'ming-qing': '<div class="text-evidence"><h3>What the Ming note shows</h3><p><strong>Denomination:</strong> the note names one guan<span lang="zh-Hant">（一貫）</span>. <strong>Coin imagery:</strong> ten groups represent 1,000 cash coins. <strong>Printed rules:</strong> instructions and a warning against forgery express the issuer’s authority. ' + cite([5]) + '</p><p>My reading is that paper borrowed familiar monetary language to communicate its value. The picture and printed denomination do not, by themselves, establish how much a user could always redeem.</p></div>'
};

export function activity(period, state) {
  switch (period.id) {
    case 'song': {
      const isPaper = state.money === 'paper';
      const repaid = state.issuer === 'repaid';
      return '<h3 class="activity-title">What would you carry to market?</h3>' +
        choices('money', [['iron','Iron cash'],['paper','Paper note']], state.money, 'Choose what to carry') +
        '<div class="journey-comparison"><div class="journey-object">' + (isPaper ? '<figure class="paper-photograph">' + picture('songpaper') + '<figcaption>Jiaozi illustration<span lang="zh-Hant">（交子示意圖）</span> ' + cite([20,25]) + '</figcaption></figure>' : picture('iron')) + '</div><dl class="trade-measures"><div><dt>Carrying it</dt><dd>' + (isPaper ? 'Lighter' : 'Heavy') + '</dd><span class="burden-track" aria-hidden="true"><span style="width:' + (isPaper ? '18%' : '90%') + '"></span></span></div><div><dt>What matters?</dt><dd>' + (isPaper ? 'The issuer’s promise' : 'Local acceptance') + '</dd></div></dl></div>' +
        (isPaper ? choices('issuer', [['repaid','If the issuer repays'],['failed','If repayment fails']], state.issuer, 'Compare repayment outcomes') : '') +
        feedback(isPaper ? (repaid ? 'A promise honoured' : 'A problem recorded in the source') : 'Metal has a carrying cost', isPaper ? (repaid ? 'If the issuer fulfils the promise, the holder can receive the money owed. The paper saves carrying weight; repayment makes the promise useful.' : 'The History of the Song records private issuers who “could not repay what they owed”（不能償所負）, followed by continuing disputes. Carrying less weight did not remove this risk.') : 'The History of the Song describes heavy iron money as inconvenient for trade. Try paper to see which problem changes—and which remains.', [6]);
    }
    case 'ming-qing': {
      const transactions = {
        market: ['copper','Everyday purchases','Copper cash commonly served everyday exchange. Small denominations could suit local purchases.'],
        trade: ['silver','A larger trade','Silver mattered for larger transactions. Copper continued to circulate alongside it, so exchange between forms was part of commercial life.'],
        tax: ['silver','Meeting a tax payment','Silver was important for taxation. What a household earned and what it owed might therefore require conversion; practice depended on the levy and locality.']
      };
      const t = transactions[state.transaction];
      return '<h3 class="activity-title">Choose a Qing transaction</h3>' + choices('transaction', [['market','Everyday purchase'],['trade','Larger trade'],['tax','Tax payment']], state.transaction, 'Choose the transaction') +
        '<div class="money-pair"><div class="' + (t[0] === 'copper' ? 'selected-money' : '') + '">' + picture('copper') + '<span>Copper cash<span lang="zh-Hant">（銅錢）</span></span></div><div class="' + (t[0] === 'silver' ? 'selected-money' : '') + '">' + picture('silver') + '<span>Silver<span lang="zh-Hant">（白銀）</span></span></div></div>' +
        feedback(t[1], t[2], [12]);
    }
    case 'today': {
      const layers = [
        ['Start with a code', 'In China, WeChat Pay and Alipay let customers scan a merchant’s code or display their own payment code.', 22],
        ['Choose where the money comes from', 'For example, Alipay can use a wallet balance or a linked bank card. Scanning starts the payment; it does not supply the funds.', 23],
        ['Who do you trust?', 'The customer relies on the service to process the payment, and the merchant relies on its confirmation. This is the question I connect to jiaozi: what makes people willing to accept a payment?', 22]
      ];
      const l = layers[state.paymentLayer];
      return '<h3 class="activity-title">Look behind a mobile payment</h3>' +
        choices('payment', [['0','Scan'],['1','Funds'],['2','Trust']], state.paymentLayer, 'Explore a mobile payment') +
        '<div class="payment-model" data-layer="' + state.paymentLayer + '"><div class="payment-screen"><img src="' + photos.wechatpay.src + '" alt="WeChat Pay"><img src="' + photos.alipay.src + '" alt="Alipay"><span>Scan to pay</span></div><div class="account-route"><span>Card or<br>wallet balance</span><span class="payment-connector" aria-hidden="true"><i></i></span><span>Merchant<br>receives payment</span></div><div class="institution-band">Payment providers · confirmation · records</div></div>' +
        feedback(l[0], l[1], [l[2]]);
    }
    default:
      return '<div class="card-photo-study' + (period.photos.length > 1 ? ' paired' : '') + '">' +
        period.photos.map(id => '<figure>' + picture(id, '', true) + '<figcaption>' + text(photos[id].title) + '</figcaption></figure>').join('') + '</div>';
  }
}
