# AI assistance record

## Interactive 3D deck — 22 November 2026

The student said the first flashcard version had lost too much interaction and content. They explicitly requested preservation of the two personal video spaces, 3D turning effects and cards overlapping like a playing-card deck.

AI assisted with a two-sided CSS 3D card, layered card backs, animated dealing, swipe and keyboard navigation, and an interactive back for each period. Restored content includes coin shape/inscription/rules, the Song relationship between carrying costs and issuer acceptance, Qing copper/silver transaction patterns, PayNow layers, and the three historical/literary source views. Longer readings were restored to the reading version as well.

The Tang coin turn shows the two halves of the existing documentary photograph, not an invented reverse. The Song paper token is a schematic interface symbol, not a claimed surviving jiaozi specimen; carrying-cost bars are qualitative illustrations, not measured weights. The scenario outcomes are explanations of historical trade-offs, not reconstructions of identified transactions. Yuan and modern-payment diagrams likewise support the reading without introducing numerical historical simulations.

Both recording entries and their video locations remain intact. No personal video file has been supplied in this checkout. No new AI-generated image, voice or student recording was introduced.

## Flashcard redesign — 22 November 2026

The student said the website was difficult to read and requested two modes: a chronological, one-period-at-a-time experience and a separate reading version. The student then clarified the desired format: “我想说的是那个闪卡形式”. This superseded the earlier merchant-game design.

AI assisted with implementing eight image flashcards, short question-and-explanation pairs, an interactive timeline, a compact reading version, a separate personal-reflection page and a single numbered Reference list. The old purchase simulation and evidence quiz are no longer in the visitor flow. Primary-source excerpts remain in the reading version. The reflection draft incorporates the student's stated design choices and feedback; it does not claim a museum visit or completed visitor study.

AI located and checked eight additional CC0 documentary photographs, including actual shells, shaped coins, Tang and Song coins, Yuan paper currency, and Qing copper and silver. Source and licence records are in IMAGE-CREDITS.md. No new AI-generated historical imagery was used. New historical context was checked against Shanghai Museum material and accessible Cambridge chapter summaries. The full scholarly chapters have not been read for this demo.

The two personal videos remain unrecorded placeholders, with no synthetic voice or invented student recording. Current copy and metadata live in exhibit-data.js; generated HTML is committed for the existing GitHub Pages hosting.

Earlier entries below document the development process and may describe features superseded by this version.

Working record for the consultation demo, 1–2 November 2026. This is not a substitute for the final assignment's AI-use statement.

## Assistance used

The assistant helped compare topics, propose a focused historical question, locate sources, draft explanatory copy, design the learning interaction, write HTML/CSS/JavaScript, draw schematic inventory graphics in code, generate two interpretive character scenes with the built-in image tool, and check the resulting interface. The student chose the money topic, the website medium, the English-only presentation, the repository, and requested visible merchants and a more game-like experience. Exact image prompts are recorded in `ASSET-PROMPTS.md`.

## Key project prompts

The following are English translations or concise summaries of the student's requests, rather than a verbatim transcript:

1. Read the Individual Passion Project requirements and explain what must be done.
2. Compare a project on ancient coins and paper money with one on architectural styles from antiquity to the present.
3. Explain how the money topic could connect with modern society.
4. Clarify which examples on the course showcase correspond to the current creative project.
5. Develop the idea as a website and consider GitHub Pages hosting.
6. Build a demo for a consultation the next day and explain whether the scope should include periods beyond the Song.
7. Make the demo entirely English, adding necessary Chinese terminology only in parentheses using traditional characters.
8. Add visible merchants and visual interactions: the text-based version does not feel enough like a game.
9. Expand the project concept and consider incorporating personally recorded videos.
10. Add more support and visible presentation from literary and historical sources.
11. Make the development of money the main theme, rather than limiting the project to Song jiaozi.
12. Revise the website around the agreed broader theme, then push it to the chosen GitHub repository.
13. Add traditional Chinese annotations to the ancient currency names while keeping English as the main language.

## Research discovery and verification

Discovery included targeted searches for Song paper money, the origins of Sichuan jiaozi, the institutions behind money, and the operation of PayNow. Key search formulations included:

- `site.britishmuseum.org China paper money coins Ming banknote Song`
- `site.afe.easia.columbia.edu song paper money merchants`
- `site.bankofengland.co.uk money modern economy introduction trust bank deposits electronic money`
- `site.abs.org.sg PayNow transfer bank account mobile number`

The resulting publisher, university, museum, central-bank, and payment-association pages were opened. The website identifies the scope of each source, including the limitation that only the accessible summary of the main scholarly chapter has been consulted so far.

## Historical-text addition, 2 November 2026

The assistant located and checked five short excerpts in three texts, wrote working English translations, drafted source-context and critical-reading notes, and integrated them into the reading room and merchant decisions. The added evidence exercise asks visitors to distinguish a supported claim from an inference beyond a text's scope. The student's videos remain a proposed component; none has been supplied or inserted.

Key source-discovery queries included `宋史 卷181 蜀人 鐵錢 交子 富民 十六戶`, `東京夢華錄 夜市 直至三更盡 五更 開張 卷二`, and `柳永 望海潮 市列珠璣 戶盈羅綺 原文`. Checking the text established that the selected night-market sentence is in volume 3, “Shops on Maxing Street,” rather than the volume suggested in the initial search.

Texts consulted: the [Siku Quanshu transcription of Song shi, vol. 181](https://zh.wikisource.org/zh-hant/宋史_(四庫全書本)/卷181); [Dongjing meng Hua lu, vol. 3](https://zh.wikisource.org/zh-hant/東京夢華錄/卷三) and its [preface](https://zh.wikisource.org/zh-hant/東京夢華錄#序); and [Liu Yong's Wang hai chao](https://zh.wikisource.org/zh-hant/望海潮_(柳永)). The excerpt attribution names the Siku version specifically. Chinese originals are short, with punctuation added where needed. The English is an AI-assisted working translation for the exhibit. The poem and memoir are used as comparisons from different places, and the official history is identified as a later Yuan compilation.

## Broader monetary-history revision, 2 November 2026

Following the student's correction of the scope, the assistant reorganised the exhibit into Qin–Han metal money, Song paper money, and Ming–Qing coexistence, with a short early prologue and modern epilogue. The Song merchant game and reading room remain the most detailed case. The consultation brief now presents this broader research question and the student's proposed video commentary.

Research searches included `site.shanghaimuseum.net Chinese Numismatics Gallery Qin`, `site.chnmuseum.cn Ancient Chinese Money`, `site.afe.easia.columbia.edu qing economy copper silver`, and `史記 平準書 半兩 四銖`. The Shanghai Museum and National Museum of China introductions, Columbia's Qing economy resource, and the digital Shiji passage were opened and checked. The added excerpt uses the verified sentence about four-zhu coins retaining the banliang inscription. It does not infer an actual specimen's weight from the diagram.

The assistant drafted an English working translation, contextual notes, a coin-inspection activity, and broad Qing transaction examples. Original code-drawn SVGs illustrate early monetary shapes, a coin diagram, and copper cash beside a silver ingot. They are labelled schematic and are not museum reproductions. No additional image-generation model was used for these diagrams. A linked Ming museum object is kept distinct from the Qing activity and from Song jiaozi.

The interpretation emphasises coexistence and regional differences, rather than presenting paper or electronic payments as inevitable replacements for older forms. The modern comparison distinguishes monetary instruments from services that transfer funds.

## Student review still needed

The 21 November revision also adds an assisted first-person reflection. Its factual basis is the student's documented topic choices, project feedback and existing course reflection. The student should review this wording in their own voice.

Read the full historical scholarship, compare the digital historical-text transcriptions with critical editions, review the translations and interpretation, check every final historical claim, and incorporate the relevant original research prompts into the final written documentation. AI-generated prose is not itself a historical source.

## Audience, reflection and museum revision, 21 November 2026

The student relayed professor feedback about the website's importance, a personal journey from idea to product, course-based analysis, one or two analytical ideas and museum photographs. The student corrected the order to **audience, message, form** and authorised revision with “开始调整”. The assistant viewed the student's HAWKY GPT Sites portfolio as a read-only design reference and revised this repository.

Key prompts: “Why it is important to use this website”; “personal reflection: Personal journey”; “How do I have the idea turning real”; “Analysis Using from the course”; “Knowledge of wisdom”; “1-2 idea of analysis”; “Add the photos from the museum”; “老师说要先考虑网站的受众 再考虑自己要传达的信息”; “本地gpt的site网页”. The student also requested a less formulaic visual style inspired by their homepage.

AI assisted with the opening, two analytical passages, personal reflection, visual treatment, photo viewer and project brief. The reflection uses documented choices and the student's existing course reflection: topic choice, broader chronology, requests for characters and textual evidence, the Salt and Iron tutorial, and programming a classroom board game. It does not invent a museum visit, personal photographs, user testing, professor quotations or testing outcomes.

Course material inspected locally: Week 4, *The Creation of Empire (Unit 1)*, slides 11 and 13; Week 8, *The Northern Song Dynasty*, slides 6 and 15. Relevant ideas were paraphrased and applications labelled as interpretation. Private course documents are not reproduced in the repository.

Image discovery included `site:commons.wikimedia.org "Ban Liang" "Museum" coin file`. Commons photo descriptions and CC0 licences were checked, and the Ming catalogue record was matched to the photographed registration 1942,0805.1. Both photos were inspected and downloaded as official Wikimedia thumbnails without retouching. No new generated image was used. See `IMAGE-CREDITS.md`.


## Simplifying the merchant activity — 22 November 2026

The student said the game was confusing and its purpose unclear: “这个游戏有点不知所云 不知道在玩什么 能不能精简一下 我不知道这个的目的是什么”. AI assisted with replacing the three abstract encounters with one fictional cloth purchase. The task, the trader’s response, the outcome and the learning point are now visible together. The activity compares transport inconvenience with issuer repayment and acceptance; it removes the journal, conversation hotspot, issuing-office time jump and collapsed explanations. The repayment and weight links continue to use the existing History of the Song excerpts. Fictional outcomes are not evidence that every Song trader behaved this way.

The student then requested “手机既然以paynow为例不妨加上paynow的标志”. The assistant retrieved the unchanged PayNow logo from the official ABS website, added it to the phone illustration, adjusted spacing and recorded the asset source. The logo was not AI-generated.


The student reported that the text was too small and the side margins too wide, with a screenshot of the published site. The assistant widened the responsive content area, introduced shared reading-size settings, enlarged captions and controls, and checked desktop and narrow layouts while retaining the selected heading font and Times New Roman body text.

## Opening overview and personal-video spaces — 22 November 2026

The student requested fewer small introductory text fragments and two spaces in the first section for personally recorded videos: the website's purpose, and their personal journey and reflection, each up to five minutes. Key prompt: “类似这样的小字太多了…把这些类似的小字删除之后 第一节要有一个整个网页的概览以及放我这两个视频的地方”.

AI assisted with condensing the opening, removing the repeated introductory links and byline, simplifying the chapter guide, and implementing two responsive recording spaces. The existing heading font and Times New Roman reading text were retained. The Ming photograph remains in its historical chapter with its credit; the historical texts, course analysis and written reflection remain available. No personal recording was provided or generated. The visible spaces are explicitly marked as forthcoming, with native playback prepared for the student's future files.

## Reducing reading overhead and revising the identity — 22 November 2026

The student identified repeated labels, slogans, revision metadata and detailed photo-production notes as excessive: “类似这样的小标语太多了”, “类似这些小标题实在太多了”, and “每一个阅读都会消耗观众的精力”. The student also requested a new footer and logo and questioned the meaning of “Selected turning points”.

AI assisted with removing decorative heading labels and repeated instructions across the main exhibit and project brief, putting dynastic context into direct chapter headings, shortening visible captions, and placing the bibliography, image credits and production disclosures in expandable groups. Historical excerpts, interpretations, citations, museum-photo provenance and essential interaction feedback remain. The square-hole coin logo is an original SVG brand symbol, not a historical reconstruction. The short site name is now “Money in China”; the footer contains only the identity, author/course and a return-to-top link.
