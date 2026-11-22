import { photos } from './exhibit-data.js?v=20261122-viewfit';

export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const text = value => escape(value).replace(/（([^）]+)）/g, '<span lang="zh-Hant">（$1）</span>');
export const cite = ids => ids.map(id => '<a class="citation" href="references.html#source-' + id + '" aria-label="Reference ' + id + '">[' + id + ']</a>').join(' ');
export const defaults = () => ({ pane: 'activity', zoom: 1, compare: 50, detail: 'shape', coinBack: false, money: 'iron', issuer: 'repaid', yuanStage: 0, transaction: 'market', paymentLayer: 0, document: 'history' });

function choices(action, options, selected, label) {
  return '<div class="activity-choices" role="group" aria-label="' + label + '">' + options.map(([value, label]) => '<button type="button" data-action="' + action + '" data-value="' + value + '" aria-pressed="' + (String(selected) === String(value)) + '">' + label + '</button>').join('') + '</div>';
}
function picture(id, className = '') {
  const p = photos[id];
  return '<button type="button" class="activity-photo ' + className + '" data-photo="' + id + '" aria-label="Enlarge ' + escape(p.title) + '"><img src="' + p.src + '" alt="' + escape(p.alt) + '"></button>';
}
function feedback(title, body, sources = []) {
  return '<div class="activity-result" role="status"><h4>' + title + '</h4><p>' + body + ' ' + cite(sources) + '</p></div>';
}
function quote(english, chinese, attribution, source) {
  return '<blockquote><p>“' + text(english) + '”</p><p lang="zh-Hant">（' + chinese + '）</p><cite>' + text(attribution) + ' ' + cite([source]) + '</cite></blockquote>';
}

export const readingAdditions = {
  'qin-han': '<div class="text-evidence"><h3>Money and state power</h3><p>The same Han account also describes permission for private casting. The course’s discussion of standardisation helps connect coins with a wider question: who could set the rules of economic life? A recognisable form could endure while rules about weight and production changed. ' + cite([11,16]) + '</p></div>',
  song: '<div class="text-evidence"><h3>From carrying costs to repayment</h3>' +
    quote('They could not repay what they owed.', '不能償所負', 'History of the Song（宋史）, vol. 181', 6) +
    quote('They requested a jiaozi bureau in Yizhou.', '請置益州交子務', 'History of the Song（宋史）, vol. 181', 6) +
    '<p>The account brings together metal’s inconvenience, private repayment problems and the creation of an official issuing office. My reading is that monetary innovation shifted the burden: carrying less metal could mean depending more visibly on an issuer. The Song course materials connect commercial expansion with debates over government involvement. ' + cite([1,17]) + '</p></div>',
  'ming-qing': '<div class="text-evidence"><h3>What the Ming note shows</h3><p><strong>Denomination:</strong> the note names one guan<span lang="zh-Hant">（一貫）</span>. <strong>Coin imagery:</strong> ten groups represent 1,000 cash coins. <strong>Printed rules:</strong> instructions and a warning against forgery express the issuer’s authority. ' + cite([5]) + '</p><p>My reading is that paper borrowed familiar monetary language to communicate its value. The picture and printed denomination do not, by themselves, establish how much a user could always redeem.</p></div>'
};

export function activity(period, state) {
  switch (period.id) {
    case 'early-money':
      return '<h3 class="activity-title">Look closely at the shells</h3><div class="object-lens"><img id="lens-photo" src="' + photos.cowries.src + '" alt="' + photos.cowries.alt + '" style="transform:scale(' + state.zoom + ')"></div>' +
        '<label class="range-label" for="object-zoom">Magnification <output id="zoom-value" for="object-zoom">' + state.zoom.toFixed(1) + '×</output></label><input class="activity-range" id="object-zoom" data-action="zoom" type="range" min="1" max="2.5" step="0.1" value="' + state.zoom + '" aria-valuetext="' + state.zoom.toFixed(1) + ' times">' +
        '<p class="activity-caption">A natural object could be recognised as money. Later makers copied the shell’s form in bronze. ' + cite([10]) + '</p>';
    case 'warring-states':
      return '<h3 class="activity-title">Compare two shapes of money</h3><div class="image-comparison" style="--reveal:' + state.compare + '%"><img src="' + photos.knives.src + '" alt="' + photos.knives.alt + '"><div class="comparison-overlay"><img src="' + photos.spades.src + '" alt="' + photos.spades.alt + '"></div><span class="comparison-divider" aria-hidden="true"></span></div>' +
        '<div class="comparison-labels"><span>Spade money<span lang="zh-Hant">（布幣）</span></span><span>Knife money<span lang="zh-Hant">（刀幣）</span></span></div>' +
        '<label class="sr-only" for="shape-comparison">Reveal spade money or knife money</label><input class="activity-range" id="shape-comparison" data-action="compare" type="range" min="0" max="100" value="' + state.compare + '" aria-valuetext="' + state.compare + ' percent spade photograph">' +
        '<p class="activity-caption">Move the slider to compare Warring States forms. Different regions could use different money at the same time. ' + cite([9]) + '</p>';
    case 'qin-han': {
      const details = {
        shape: ['The square opening', 'Round coins with square holes became a lasting form. Their shared shape made a common standard visible.', 9],
        inscription: ['A name could outlast a weight', 'Banliang means “half-liang”（半兩）. Yet the Han account describes four-zhu coins（四銖錢）retaining that inscription.', 11],
        rules: ['Who could make money?', 'The same Han passage describes permission for private casting under Emperor Wen. Coins also reflected decisions about authority and production.', 11]
      };
      const d = details[state.detail];
      return '<h3 class="activity-title">Read a coin in three ways</h3>' +
        choices('detail', [['shape','Shape'],['inscription','Inscription'],['rules','Rules']], state.detail, 'Inspect the coin') +
        '<div class="coin-detail-visual" data-detail="' + state.detail + '"><figure>' + picture('banliangDetail',state.detail === 'rules' ? '' : 'coin-obverse-photo') + '<figcaption class="coin-photo-credit">Fred Cherrygarden ' + cite([21]) + '</figcaption></figure><div class="coin-inscription">' + (state.detail === 'inscription' ? '<span lang="zh-Hant">兩 ← 半</span><span>Read right to left: Ban liang<span lang="zh-Hant">（半兩）</span>.</span>' : state.detail === 'rules' ? '<span>Who may cast?</span><span>Permission could change.</span>' : '<span>Round coin.</span><span>Square opening.</span>') + '</div></div>' + feedback(d[0], text(d[1]), [d[2]]);
    }
    case 'tang':
      return '<h3 class="activity-title">Turn the coin itself</h3><div class="coin-turntable"><div class="coin-flipper' + (state.coinBack ? ' is-reverse' : '') + '" id="coin-flipper"><div class="coin-surface coin-obverse" aria-hidden="' + state.coinBack + '"></div><div class="coin-surface coin-reverse" aria-hidden="' + !state.coinBack + '"></div></div></div>' +
        '<div class="coin-turn-controls"><button class="button secondary" type="button" data-action="coin" aria-pressed="' + state.coinBack + '">Turn the coin</button><span id="coin-side" role="status">' + (state.coinBack ? 'Reverse · the other face' : 'Obverse · the inscription') + '</span></div>' +
        '<p class="activity-caption">On the inscribed face, find Kaiyuan tongbao<span lang="zh-Hant">（開元通寶）</span>. The new naming convention began in 621. ' + cite([13]) + '</p>';
    case 'song': {
      const isPaper = state.money === 'paper';
      const repaid = state.issuer === 'repaid';
      return '<h3 class="activity-title">What would you carry to market?</h3>' +
        choices('money', [['iron','Iron cash'],['paper','Paper note']], state.money, 'Choose what to carry') +
        '<div class="journey-comparison"><div class="journey-object">' + (isPaper ? '<figure class="paper-photograph">' + picture('songpaper') + '<figcaption>Reproduction<span lang="zh-Hant">（復刻圖）</span> ' + cite([20]) + '</figcaption></figure>' : picture('iron')) + '</div><dl class="trade-measures"><div><dt>Carrying it</dt><dd>' + (isPaper ? 'Lighter' : 'Heavy') + '</dd><span class="burden-track" aria-hidden="true"><span style="width:' + (isPaper ? '18%' : '90%') + '"></span></span></div><div><dt>What matters?</dt><dd>' + (isPaper ? 'The issuer’s promise' : 'Local acceptance') + '</dd></div></dl></div>' +
        (isPaper ? choices('issuer', [['repaid','If the issuer repays'],['failed','If repayment fails']], state.issuer, 'Compare repayment outcomes') : '') +
        feedback(isPaper ? (repaid ? 'A promise honoured' : 'A problem recorded in the source') : 'Metal has a carrying cost', isPaper ? (repaid ? 'If the issuer fulfils the promise, the holder can receive the money owed. The paper saves carrying weight; repayment makes the promise useful.' : 'The History of the Song records private issuers who “could not repay what they owed”（不能償所負）, followed by continuing disputes. Carrying less weight did not remove this risk.') : 'The History of the Song describes heavy iron money as inconvenient for trade. Try paper to see which problem changes—and which remains.', [6]);
    }
    case 'yuan': {
      const stages = [
        ['1260 · A unified issue', 'Kublai introduced a unified paper currency before the Yuan dynasty was formally named.', 'A common paper issue'],
        ['Yuan · A state monetary system', 'Paper occupied a central place in a state-run monetary system. The note belonged to an institutional arrangement larger than its printed surface.', 'Paper at the centre'],
        ['Fourteenth century · A changing system', 'As Mongol rule weakened, silver displaced paper notes in private commerce. A monetary form depended on more than its convenience.', 'Silver gains ground']
      ];
      const s = stages[state.yuanStage];
      return '<h3 class="activity-title">Follow the paper system</h3>' + choices('yuan', [['0','1260'],['1','Yuan rule'],['2','14th century']], state.yuanStage, 'Explore stages of Yuan money') +
        '<div class="yuan-system" data-stage="' + state.yuanStage + '"><span class="institution-node">State</span><span class="system-link" aria-hidden="true"></span>' + picture('yuan') + '<span class="system-link" aria-hidden="true"></span><span class="institution-node">' + (state.yuanStage === 2 ? 'Silver in commerce' : 'Commerce') + '</span></div>' +
        feedback(s[0], s[1], [14]);
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
        ['A familiar interface', 'The phone helps you identify a recipient and initiate a payment. Look beneath it to find the accounts involved.'],
        ['Funds move between accounts', 'PayNow transfers Singapore-dollar funds between participating bank or e-wallet accounts. The transfer is more than the number shown on a screen.'],
        ['What makes a payment work', 'Easy payments also rely on banks, payment networks and accurate transaction records.']
      ];
      const l = layers[state.paymentLayer];
      return '<h3 class="activity-title">Look behind a PayNow payment</h3>' +
        choices('payment', [['0','Phone'],['1','Transfer'],['2','Institutions']], state.paymentLayer, 'Explore payment layers') +
        '<div class="payment-model" data-layer="' + state.paymentLayer + '"><div class="paynow-screen"><img src="' + photos.paynow.src + '" alt="PayNow"><span>Pay a recipient</span></div><div class="account-route"><span>Sender’s<br>account</span><span class="payment-connector" aria-hidden="true"><i></i></span><span>Recipient’s<br>account</span></div><div class="institution-band">Providers · shared rules · records</div></div>' +
        feedback(l[0], l[1], [state.paymentLayer === 2 ? 4 : 3]);
    }
    default: return '';
  }
}

export function evidence(period, state) {
  if (period.id === 'song') {
    const documents = {
      history: '<h3 class="activity-title">An official history: Sichuan</h3>' +
        quote('Iron cash was heavy, inconvenient for trade.', '鐵錢重，不便貿易', 'History of the Song（宋史）, vol. 181', 6) +
        quote('They could not repay what they owed.', '不能償所負', 'The same account, on private issuers', 6) +
        quote('They requested a jiaozi bureau in Yizhou.', '請置益州交子務', 'The same account, on official issuance', 6) +
        '<p>Carrying costs, repayment failures and official issuance appear in one account. Compiled under the Yuan, it is a later history of the Song.</p>',
      memoir: '<h3 class="activity-title">A remembered city: Kaifeng</h3>' +
        quote('Night markets lasted until the third watch.', '夜市直至三更盡', 'Meng Yuanlao, Dreams of the Splendour of the Eastern Capital（東京夢華錄）, vol. 3', 7) +
        '<p>Meng remembers busy urban markets. The passage helps us imagine commercial life, but its city is Kaifeng: it does not establish which money a Sichuan trader accepted.</p>',
      poem: '<h3 class="activity-title">A poet’s city: Hangzhou</h3>' +
        quote('Markets display pearls and gems; households brim with fine silks.', '市列珠璣，戶盈羅綺', 'Liu Yong, Wang hai chao（望海潮）', 8) +
        '<p>Liu Yong presents prosperity through vivid objects and abundance. Poetry offers a way to examine how wealth was represented, rather than a measurement of every household’s income.</p>'
    };
    return choices('document', [['history','Official history'],['memoir','City memoir'],['poem','Poem']], state.document, 'Choose a historical text') +
      '<div class="evidence-reading">' + documents[state.document] + '</div>';
  }
  let source = period.quote ? quote(period.quote.english, period.quote.chinese, period.quote.attribution, period.quote.source) : '';
  if (period.id === 'ming-qing') {
    return '<h3 class="activity-title">Read the Ming banknote</h3><div class="note-reading">' + picture('ming') + '<div><p><strong>The denomination:</strong> one guan<span lang="zh-Hant">（一貫）</span>, a familiar unit associated with strings of coins.</p><p><strong>The picture:</strong> ten groups representing 1,000 cash coins.</p><p><strong>The rules:</strong> printed instructions and a warning against forgery express the issuer’s authority.</p></div></div><p>Paper used the language and imagery of older money. Its printed value alone does not establish a constant redemption value. ' + cite([5]) + '</p>';
  }
  return '<h3 class="activity-title">' + (period.quote ? 'Read the historical account' : 'Look beyond the object') + '</h3><div class="evidence-reading">' + source + '<p>' + text(period.more) + ' ' + cite(period.moreSources || period.sources) + '</p>' +
    (period.id === 'qin-han' ? '<p>The course’s discussion of standardisation connects the coin to imperial authority. A familiar shape could endure while production rules changed. ' + cite([16]) + '</p>' : '') +
    (period.extra || '') + '<a class="text-link" href="read.html#' + period.id + '">Open the full reading</a></div>';
}
