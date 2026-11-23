// Each mode uses the same objects, with a different level of explanation.
export const flashcardContent = {
  'early-money': { intro: 'Before minted coins, familiar objects could carry value.', answer: 'Cowrie shells（貝幣）could be recognised as money. Value did not require a minted coin; people also used natural objects.', sources: [9, 10], interactive: true },
  'warring-states': { intro: 'Money took different forms across a divided political world.', answer: 'Different states and regions used different forms, including spade money（布幣）and knife money（刀幣）. There was no single standard across them all.', sources: [9, 10], interactive: true },
  'qin-han': { intro: 'An imperial standard did not mean coins never changed.', answer: 'Imperial rule promoted common coin standards. But a familiar shape or name could remain even when the prescribed weight and rules of production changed.', sources: [9, 11], interactive: true },
  tang: { intro: 'The shape endured while the language of money changed.', answer: 'Kaiyuan tongbao（開元通寶）named money as circulating treasure rather than by weight. The inscription changed while the familiar round, square-holed form continued.', sources: [13], interactive: true },
  song: { intro: 'Carrying less metal meant relying more on a promise.', answer: 'Paper was easier to carry than heavy iron cash. Its usefulness also depended on people accepting it and the issuer keeping the promise to repay.', sources: [1, 6], interactive: true },
  yuan: { intro: 'Paper became a tool of government across an empire.', answer: 'Under the Yuan, paper became central to the state’s monetary system. Its success depended on political and fiscal conditions as well as everyday convenience.', sources: [14], interactive: true },
  'ming-qing': { intro: 'Paper, silver and copper met different needs.', answer: 'New forms did not simply replace old ones. In the Qing, copper cash served everyday exchange while silver mattered for larger payments and taxation.', sources: [12], interactive: true },
  today: { intro: 'A quick scan connects people, funds and payment services.', answer: 'WeChat Pay（微信支付）and Alipay（支付寶）let people start payments with a code. Completing the payment still depends on funds, participating merchants and service providers.', sources: [22, 23], interactive: true }
};

export const cardChallenges = {
  'early-money': {
    title: 'What can the photograph tell you?', photos: ['cowries'],
    prompt: 'Which question needs evidence beyond this photograph?',
    options: [['shape', 'What shape are the shells?'], ['acceptance', 'Who accepted them as payment?']], correct: 'acceptance',
    responses: {
      shape: ['Look again', 'Their shape is visible. Who accepted them—and how widely—is not shown.'],
      acceptance: ['Beyond appearance', 'The photo shows shells. Other evidence is needed to establish where they circulated and who accepted them.']
    }, sources: [9, 10]
  },
  'warring-states': {
    title: 'Compare the two forms', photos: ['spades', 'knives'],
    prompt: 'How should these objects fit into the story?',
    options: [['sequence', 'One form replaced the other'], ['regions', 'Different forms coexisted']], correct: 'regions',
    responses: {
      sequence: ['Not a simple sequence', 'These forms belonged to different regions. The photographs do not establish that one replaced the other.'],
      regions: ['Regional variety', 'Spade and knife money coexisted across different regions. Their shapes do not mark a simple sequence of replacements.']
    }, sources: [9, 10]
  },
  'qin-han': {
    title: 'Does the name fix the weight?', photos: ['banliangDetail'],
    prompt: 'The Han account describes four-zhu coins still inscribed “half-liang”. What follows?',
    options: [['weight', 'The name always states the weight'], ['name', 'A name can outlast a weight standard']], correct: 'name',
    responses: {
      weight: ['Read the account', 'The name stayed “half-liang” while the account gives a four-zhu weight. The inscription alone is not a measurement.'],
      name: ['Name and weight differ', 'The name remained while the prescribed weight changed. The text tells us what the inscription alone cannot.']
    }, sources: [11]
  },
  tang: {
    title: 'What changed in the inscription?', photos: ['tang'],
    prompt: 'Banliang means “half-liang”. Kaiyuan tongbao uses the language of “circulating treasure”. What changed?',
    options: [['naming', 'How money was named'], ['shape', 'The round, square-holed shape']], correct: 'naming',
    responses: {
      naming: ['A change in naming', 'The inscription moved away from a weight-based name. The round outline and square opening continued.'],
      shape: ['The shape continued', 'Look at the outline and opening. The clearer change is the inscription: “circulating treasure” replaces a weight-based name.']
    }, sources: [13]
  },
  yuan: {
    title: 'A printed amount, a lasting value?', photos: ['yuan'],
    prompt: 'A note keeps its printed denomination. Does that mean its value must remain stable?',
    options: [['number', 'Yes, the printed number fixes its value'], ['system', 'No, the monetary system also matters']], correct: 'system',
    responses: {
      number: ['Look beyond the number', 'A printed amount does not fix a note’s value in trade. Political and fiscal conditions also mattered.'],
      system: ['A changing system', 'As Mongol rule weakened, silver displaced notes in private commerce. Printed denominations did not guarantee lasting value.']
    }, sources: [14]
  }
};

export const objectNotes = {
  wechatpay: { note: 'The WeChat Pay mark identifies a payment service used in China. Customers can scan a merchant’s code or show their own payment code for the merchant to scan.', sources: [22] },
  alipay: { note: 'Alipay’s logo appears at the point of payment and in the app. A payment can draw on a wallet balance or a linked card; the app brings these options to the screen.', sources: [23] },
  cowries: { note: 'Look at the openings and curved backs of these natural shells. Their recognisable form was also copied in bronze when shells were used as money.', sources: [10] },
  spades: { note: 'The broad shoulders and two feet give these bronze coins their spade-like outline. Compare them with the longer knife money displayed in this gallery.', sources: [9, 10] },
  knives: { note: 'Follow the long blade-like body down to the ring at the handle. This form makes regional differences in pre-imperial money visible.', sources: [9, 10] },
  banliangDetail: { note: 'Read the two characters from right to left around the square opening: ban liang（半兩）. The reverse has no inscription. The close-up lets you inspect both faces.', sources: [21] },
  banliang: { note: 'Compare the coins’ sizes. They share a round outline and square opening, but the name “banliang” did not always mean the same prescribed weight.', sources: [11] },
  tang: { note: 'Find the four characters Kaiyuan tongbao（開元通寶）around the square hole. The photograph shows the inscribed face beside the reverse.', sources: [13] },
  iron: { note: 'This Northern Song iron coin has a round shape and a square opening. The problem was weight: paying for goods meant carrying heavy loads of iron coins, making trade inconvenient.', sources: [6] },
  songpaper: { note: 'A printing-plate image used to illustrate jiaozi（交子）. No original jiaozi note is known to survive, and this design’s identification is debated.', sources: [20, 25] },
  yuan: { note: 'Notice the printed text, border and coin imagery on this Zhiyuan note. A paper surface could carry both a denomination and the language of issuing authority.', sources: [14, 18] },
  ming: { note: 'Find one guan（一貫）and the ten groups of coins beneath it. The note pictures 1,000 cash coins, expressing paper’s value through a familiar form of money.', sources: [5] },
  copper: { note: 'These Qing cash coins retain the round shape and square opening. Compare their small, cast form with the silver ingot elsewhere in this gallery.', sources: [12] },
  silver: { note: 'Notice the ingot’s boat-like shape. Silver was assessed by weight and purity; an ingot did not function like a coin with one fixed face value.', sources: [12] },
  paynow: { note: 'This logo identifies a payment service. PayNow transfers Singapore-dollar funds between participating accounts; the logo and phone interface are what users see of that process.', sources: [3] }
};
