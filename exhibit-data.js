// Shared by the static reading pages and the flashcards.
// Historical photographs are documented in IMAGE-CREDITS.md.
export const photos = {
  wechatpay: { src: 'assets/wechatpay-logo.svg', title: 'WeChat Pay（微信支付）', place: 'China · Tencent', credit: 'Official WeChat Pay artwork · Tencent / Tenpay', url: 'https://pay.weixin.qq.com/index.php/public/wechatpay_en', alt: 'Official WeChat Pay logo identifying the mobile payment service.', background: '#ffffff' },
  alipay: { src: 'assets/alipay-logo.png', title: 'Alipay（支付寶）', place: 'China · Alipay', credit: 'Official Alipay artwork', url: 'https://www.alipay.cn/', alt: 'Official Alipay logo, with its Chinese and English name.', background: '#ffffff' },
  banliangDetail: { src: 'assets/museum/han-banliang-closeup.jpg', title: 'Western Han banliang（半兩錢）', place: 'Cherrygarden collection · Obverse and reverse', credit: 'Fred Cherrygarden · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ban_Liang_(Western_Han).jpg', alt: 'Close-up photographs of a Western Han bronze banliang coin: the inscription 半兩 is read from right to left around a square opening; the reverse has no inscription.' },
  songpaper: { src: 'assets/museum/song-paper-reproduction.jpg', title: 'Jiaozi illustration（交子示意圖）', place: 'Printing-plate design · disputed identification', credit: 'Scan from 社會歷史博物館 · Wikimedia Commons · Public domain', url: 'https://commons.wikimedia.org/wiki/File:Jiao_zi.jpg', alt: 'A printing-plate design with coin symbols and an illustrated scene, used to illustrate jiaozi; its identification is debated, and this is not an original surviving note.' },
  cowries: { src: 'assets/museum/cowries.jpg', title: 'Cowrie money（貝幣）', place: 'Shanghai Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Cowrie_Shells_Used_as_Currency.jpg', alt: 'A display of natural cowrie shells used as currency in the Shanghai Museum.' },
  spades: { src: 'assets/museum/spade-money.jpg', title: 'Spade money（布幣）', place: 'Shanghai Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Spade_Coins,_Warring_States.jpg', alt: 'Four flat bronze spade-shaped coins from the Warring States period.' },
  knives: { src: 'assets/museum/knife-money.jpg', title: 'Knife money（刀幣）', place: 'Shanghai Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Knife_Coins,_Warring_States_03.jpg', alt: 'Three long bronze knife coins with a hole at the end of each handle.' },
  banliang: { src: 'assets/museum/banliang-coins.jpg', title: 'Banliang coins（半兩錢）', place: 'Shanghai Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Banliang_Coins_of_Qin_and_Han_Dynasties_01.jpg', alt: 'Round, square-holed banliang coins of different sizes displayed at the Shanghai Museum.' },
  tang: { src: 'assets/museum/tang-coin.jpg', title: 'Kaiyuan tongbao（開元通寶）', place: 'Gary Lee Todd collection', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:103_S-312_Tang_Kaiyuan,_Gaozu,_618-626_ff,_24.5mm.jpg', alt: 'The front and back of a Tang Kaiyuan tongbao coin photographed on dark cloth.' },
  iron: { src: 'assets/museum/song-iron.jpg', title: 'Northern Song iron cash（鐵錢）', place: 'Handan Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Northern_Song_Ancient_Chinese_Iron_Coin_(15872889818).jpg', alt: 'A Northern Song Yuanyou tongbao iron coin displayed in the Handan Museum.' },
  yuan: { src: 'assets/museum/yuan-note.jpg', title: 'Zhiyuan paper money（至元通行寶鈔）', place: 'National Museum of China', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Yuan_Paper_Currency.jpg', alt: 'A museum display of Yuan paper currency, with printed Chinese text and coin imagery.' },
  ming: { src: 'assets/museum/ming-banknote.jpg', title: 'Ming banknote（大明通行寶鈔）', place: 'British Museum', credit: 'BabelStone · CC0', url: 'https://commons.wikimedia.org/wiki/File:British_Museum_Ming_banknote.jpg', alt: 'A Ming paper note with printed strings of coins and Chinese text.' },
  copper: { src: 'assets/museum/qing-coins.jpg', title: 'Qing copper cash（銅錢）', place: 'Handan Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Qing_Qianlong_Chinese_Coins_(16058576611).jpg', alt: 'Qianlong-era square-holed cash coins displayed at the Handan Museum.' },
  silver: { src: 'assets/museum/qing-silver.jpg', title: 'Qing silver ingot（銀錠）', place: 'Shanghai Museum', credit: 'Gary Lee Todd · CC0', url: 'https://commons.wikimedia.org/wiki/File:Silver_Ingots_of_the_Qing_Dynasty.jpg', alt: 'An actual boat-shaped Qing silver ingot in a Shanghai Museum display.' },
  paynow: { src: 'assets/paynow-logo.jpg', title: 'PayNow · Singapore', place: 'Association of Banks in Singapore', credit: 'Official PayNow artwork', url: 'https://www.abs.org.sg/e-payments/pay-now', alt: 'Official PayNow logo identifying the Singapore payment service.' }
};

export const periods = [
  {
    id: 'early-money', label: 'Early money', date: 'Before 770 BCE', era: 'Shang and Western Zhou',
    question: 'What counted as money before coins?',
    answerTitle: 'Shells could carry value.',
    story: 'Cowrie shells（貝幣）were among the objects used as money in early China. Their shape was also copied in bronze. Money did not begin with one uniform coin: people recognised value in different materials and forms.',
    sources: [9, 10], photos: ['cowries'],
    more: 'The earliest monetary objects existed alongside other ways of exchanging and storing wealth. The shells are an entry into this history, rather than proof that every region followed the same path.'
  },
  {
    id: 'warring-states', label: 'Eastern Zhou', date: '770–221 BCE', era: 'Spring and Autumn · Warring States',
    question: 'Why did money come in so many shapes?',
    answerTitle: 'Different states, different money.',
    story: 'Spade money（布幣）, knife money（刀幣）and round coins circulated in different regions. These forms belonged to a politically divided world. Before imperial unification, there was no single coin standard across all the states.',
    sources: [9, 10], photos: ['spades', 'knives'],
    more: 'The photographs show Warring States objects. The different shapes help make regional diversity visible; they were not simply successive steps in a single chain of replacements.'
  },
  {
    id: 'qin-han', label: 'Qin and Han', date: '221 BCE–220 CE', era: 'Qin and Han',
    question: 'What changed when an empire set the standard?',
    answerTitle: 'Coins became an imperial standard.',
    story: 'Qin promoted banliang coins（半兩錢）as a common standard. The round coin with a square hole endured, but its weight and rules could change. Under the Han, wuzhu coins（五銖錢）became an important new standard.',
    sources: [9, 11], photos: ['banliangDetail','banliang'],
    quote: { english: 'They then cast four-zhu coins, inscribed ‘half-liang’.', chinese: '乃更鑄四銖錢，其文為「半兩」', attribution: 'Records of the Grand Historian（史記）, vol. 30', source: 11 },
    more: 'The passage describes a Han coin whose inscription still said “half-liang” after its prescribed weight changed. It shows why an inscription cannot automatically be treated as a measurement. Standardisation connected money with political authority.'
  },
  {
    id: 'tang', label: 'Tang', date: '618–907', era: 'Tang',
    question: 'What can a coin’s name tell us?',
    answerTitle: 'A new name on a familiar shape.',
    story: 'Introduced in 621, Kaiyuan tongbao（開元通寶）moved away from naming coins by weight. Its name referred to circulating treasure. The round, square-holed form continued while the language used to describe money changed.',
    sources: [13], photos: ['tang'],
    more: 'This coin helps us distinguish a change in naming and monetary conventions from a change in material. Its copper-alloy form was familiar, even as the inscription established a new model for later coinage.'
  },
  {
    id: 'song', label: 'Song', date: '960–1279', era: 'Song',
    question: 'Why start paying with paper?',
    answerTitle: 'Paper was lighter. Trust still mattered.',
    story: 'In Sichuan, heavy iron cash made payments cumbersome. Merchants issued paper jiaozi（交子）, and the government later took over issuance. Paper reduced the burden of carrying coins, but its usefulness depended on acceptance and the issuer’s ability to honour it.',
    sources: [1, 2, 6], photos: ['iron'],
    quote: { english: 'Iron cash was heavy, inconvenient for trade.', chinese: '鐵錢重，不便貿易', attribution: 'History of the Song（宋史）, vol. 181', source: 6 },
    more: 'The History of the Song also describes private issuers who lacked the funds to redeem holders’ jiaozi for coins. Compiled under the Yuan, it is a later historical account of the Song. The pictured Northern Song iron coin illustrates the material; it is not a surviving jiaozi note.',
    extra: '<div class="text-evidence"><h3>Commerce in Song writing</h3><blockquote><p>“Night markets lasted until the third watch.”</p><p lang="zh-Hant">（夜市直至三更盡）</p><cite>Meng Yuanlao, Dreams of the Splendour of the Eastern Capital（東京夢華錄）, vol. 3. <a href="references.html#source-7">[7]</a></cite></blockquote><p>Meng recalls the markets of Kaifeng. In a different city, Liu Yong evokes Hangzhou: “Markets display pearls and gems; households brim with fine silks.” <span lang="zh-Hant">（市列珠璣，戶盈羅綺）</span> <a href="references.html#source-8">[8]</a></p><p>Memoir and poetry bring urban commerce into view. Neither passage tells us how widely jiaozi circulated in Sichuan.</p></div>'
  },
  {
    id: 'yuan', label: 'Yuan', date: '1271–1368', era: 'Yuan',
    question: 'Could paper anchor an empire’s money?',
    answerTitle: 'Paper moved to the centre of the system.',
    story: 'Kublai introduced a unified paper currency in 1260, before the Yuan dynasty was formally named. Paper became central to the state’s monetary system. As Mongol rule weakened in the fourteenth century, silver displaced notes in private commerce.',
    sources: [14], photos: ['yuan'],
    more: 'The Yuan case extends the Song story: paper was now part of a much wider state monetary project. Its fortunes also depended on political and fiscal conditions, rather than on the material alone.'
  },
  {
    id: 'ming-qing', label: 'Ming and Qing', date: '1368–1912', era: 'Ming and Qing',
    question: 'Did a new form make the old ones disappear?',
    answerTitle: 'Different forms worked side by side.',
    story: 'The early Ming issued paper notes（大明通行寶鈔）. Silver（白銀）later became important for larger payments and taxation, while copper cash（銅錢）served everyday exchange. Under the Qing, silver and copper continued to meet different needs.',
    sources: [5, 12], photos: ['ming', 'copper', 'silver'],
    more: 'The Ming note pictures strings of coins: one monetary form represented value through another. In the Qing economy, changing between silver and copper mattered because their exchange rate was not fixed everywhere or for all time.'
  },
  {
    id: 'today', label: 'Today', date: '21st century', era: 'Mobile payments in contemporary China',
    question: 'What happens when we scan to pay?',
    answerTitle: 'A scan starts a payment.',
    story: 'In contemporary China, people can pay with WeChat Pay（微信支付）and Alipay（支付寶）by scanning a merchant’s code or showing their own payment code. These services change how a payment begins. The money still comes from a funding source: Alipay, for example, offers payment from a wallet balance or linked bank card.',
    sources: [22, 23], photos: ['wechatpay', 'alipay', 'paynow'],
    more: 'Between the imperial period and today, China moved through silver-based monetary arrangements towards modern fiat currency.',
    moreSources: [15]
  }
];

export const references = [
  { id: 1, html: 'von Glahn, Richard. “Northern Song Monetary Policy and the Invention of Paper Currency in Sichuan.” In <cite>The Rise and Demise of Paper Money in Imperial China</cite>, 113–146. Cambridge University Press, 2026. <a href="https://doi.org/10.1017/9781009699440.007">Chapter summary</a>.' },
  { id: 2, html: 'Asia for Educators, Columbia University. <a href="https://afe.easia.columbia.edu/songdynasty-module/econ-rev-money.html">“The Song Economic Revolution: From Copper Coins to Paper Notes.”</a>' },
  { id: 3, html: 'Association of Banks in Singapore. <a href="https://www.abs.org.sg/e-payments/pay-now">“PayNow.”</a> Includes the official PayNow logo.' },
  { id: 4, html: 'McLeay, Michael, Amar Radia, and Ryland Thomas. <a href="https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-in-the-modern-economy-an-introduction">“Money in the Modern Economy: An Introduction.”</a> <cite>Bank of England Quarterly Bulletin</cite>, 2014 Q1.' },
  { id: 5, html: 'British Museum. <a href="https://artsandculture.google.com/asset/great-ming-circulating-treasure-note/iAFKr9bi4LqIRA">“Great Ming Circulating Treasure Note.”</a> 1375. Registration no. 1942,0805.1. Collection record, Google Arts &amp; Culture.' },
  { id: 6, html: 'Toqto’a and others. <cite>History of the Song（宋史）</cite>, vol. 181. Siku Quanshu edition. <a href="https://zh.wikisource.org/zh-hant/宋史_(四庫全書本)/卷181">Digital transcription</a>.' },
  { id: 7, html: 'Meng Yuanlao（孟元老）. <cite>Dreams of the Splendour of the Eastern Capital（東京夢華錄）</cite>, vol. 3, <a href="https://zh.wikisource.org/zh-hant/東京夢華錄/卷三#馬行街鋪席">“Shops on Maxing Street（馬行街鋪席）.”</a> Preface dated 1147.' },
  { id: 8, html: 'Liu Yong（柳永）. <a href="https://zh.wikisource.org/zh-hant/望海潮_(柳永)"><cite>Wang hai chao（望海潮）</cite></a>. Northern Song. Digital transcription.' },
  { id: 9, html: 'Shanghai Museum. <a href="https://www.shanghaimuseum.net/mu/frontend/pg/article/id/RI00004052">“Chinese Numismatics Gallery.”</a>' },
  { id: 10, html: 'National Museum of China. <a href="https://en.chnmuseum.cn/exhibition/exhibition_series/special_exhibitions/202102/t20210210_248989.html">“Ancient Chinese Money.”</a>' },
  { id: 11, html: 'Sima Qian（司馬遷）. <cite>Records of the Grand Historian（史記）</cite>, vol. 30, <a href="https://zh.wikisource.org/zh-hant/史記/卷030">“Treatise on the Balanced Standard（平準書）.”</a> Digital transcription.' },
  { id: 12, html: 'Asia for Educators, Columbia University. <a href="https://afe.easia.columbia.edu/qing/economy.html">“The Qing Economy.”</a> <cite>The Grandeur of the Qing</cite>.' },
  { id: 13, html: 'Shanghai Museum. <a href="https://www.shanghaimuseum.net/mu/frontend/pg/m/article/id/CI00004048">“Kaiyuan Tongbao.”</a> Collection record.' },
  { id: 14, html: 'von Glahn, Richard. “Yuan Paper Currencies and the Transition to the Silver Standard.” In <cite>The Rise and Demise of Paper Money in Imperial China</cite>, 265–302. Cambridge University Press, 2026. <a href="https://doi.org/10.1017/9781009699440.012">Chapter summary</a>.' },
  { id: 15, html: 'Li, Dan, and Hongzhong Yan. <a href="https://www.cambridge.org/core/books/abs/cambridge-economic-history-of-china/money-and-the-macroeconomy/B140BA209339A37CEBFECF25D3ACEC22">“Money and the Macro-economy.”</a> In <cite>The Cambridge Economic History of China</cite>, 2022. Chapter summary.' },
  { id: 16, html: 'HY2206. <cite>The Creation of Empire (Unit 1)</cite>, Week 4, slides 11 and 13; Tutorial 2, <cite>The Debate on Salt and Iron</cite>. Course materials.' },
  { id: 17, html: 'HY2206. <cite>The Northern Song Dynasty</cite>, Week 8, slides 6 and 15. Course materials.' },
  { id: 18, html: 'Todd, Gary Lee. Photographs of Chinese monetary objects. Wikimedia Commons, CC0. ' + ['cowries','spades','knives','banliang','tang','iron','yuan','copper','silver'].map(id => '<a href="' + photos[id].url + '">' + photos[id].title + '</a>').join('; ') + '.' },
  { id: 19, html: 'BabelStone. <a href="' + photos.ming.url + '">British Museum Ming banknote</a>. Photograph, 2010. Wikimedia Commons, CC0.' },
  { id: 20, html: '<a href="https://commons.wikimedia.org/wiki/File:Jiao_zi.jpg">Paper-money reproduction</a>. Scan from <cite>社會歷史博物館</cite>, ISBN 7-5347-1397-8; Wikimedia Commons, public domain. Used as an illustrative reproduction. On the absence of surviving original jiaozi notes, see <a href="https://dawb.xmu.edu.cn/wbglzx/dawbts/wbzc/sdbz/14.htm">Xiamen University, “策展人說：世界上最早的紙幣——交子”</a>, 17 January 2025.' },
  { id: 21, html: 'Cherrygarden, Fred. <a href="' + photos.banliangDetail.url + '">Ban Liang (Western Han)</a>. Photograph, 5 June 2020. Wikimedia Commons, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Displayed at reduced resolution. No retouching.' },
  { id: 22, html: 'Shanghai Municipal Government. <a href="https://english.shanghai.gov.cn/en-Individuals-BankingandPayments-Payments/20260920/4fc94c2f0e6b47e7939969415e5feb04.html">“How to Use Mobile Payments in Shanghai.”</a> International Services Shanghai. Accessed 23 November 2026.' },
  { id: 23, html: 'Shanghai Municipal Government. <a href="https://english.shanghai.gov.cn/en-UsefulApps/20240312/f2968c5dcb2d41c895643afa9219ce89.html">“How to Use Alipay.”</a> International Services Shanghai. Updated 21 July 2026.' },
  { id: 24, html: 'Brand artwork: <a href="' + photos.wechatpay.url + '">WeChat Pay / Tencent</a>; <a href="' + photos.alipay.url + '">Alipay</a>. Official website logos, accessed 23 November 2026.' },
  { id: 25, html: 'Xie Yuanlu（謝元魯）. <a href="https://www.sicnu.edu.cn/info/1121/32821.htm">“交子為何出於成都.”</a> Interview by Wu Yizheng, <cite>Chengdu Daily</cite>, 10 March 2019; republished by Sichuan Normal University, 15 March 2019. Discusses the disputed identification of the commonly reproduced printing-plate design.' },
  { id: 26, html: 'Shao, Zhen, Lin Zhang, Xiaotong Li, and Yue Guo. “Antecedents of Trust and Continuance Intention in Mobile Payment Platforms: The Moderating Effect of Gender.” <cite>Electronic Commerce Research and Applications</cite> 33 (2019): 100823. <a href="https://doi.org/10.1016/j.elerap.2018.100823">DOI</a>. <a href="https://kclpure.kcl.ac.uk/portal/en/publications/antecedents-of-trust-and-continuance-intention-in-mobile-payment-/">Abstract</a>.' }
];

export const recordings = [
  { id: 'purpose', title: 'How to use the website', description: 'Who it is for, what it explores, and how to begin.', src: 'assets/videos/website-introduction.mp4', captions: 'assets/videos/website-introduction.en.vtt', poster: 'assets/videos/website-introduction.jpg' },
  { id: 'journey', title: 'My Journey &amp; Reflections', description: 'How the idea took shape and what I learned.', src: 'assets/videos/journey-and-reflections.mp4?v=20261123-historian', captions: 'assets/videos/journey-and-reflections.en.vtt', poster: 'assets/videos/journey-and-reflections.jpg' }
];
