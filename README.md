# The Changing Forms of Money in China

An interactive history exhibit created for NUS HY2206. It asks why monetary forms changed, what problems they addressed, and why different forms continued to coexist.

Revised 21 November 2026 following professor feedback. The intended audience is university students, especially non-history majors who use digital payments but are new to imperial Chinese history. The structure follows **audience → message → form**.

The opening combines a short website overview, two personal-video spaces and a compact chapter guide. The planned recordings cover the website's purpose and the student's journey and reflection, each up to five minutes. Two course-linked analyses develop state standardisation and institutional dependence. The visual treatment references the student's HAWKY GPT Sites portfolio; the existing GitHub website remains the project home.

The site uses the short name **Money in China** with an original square-hole coin mark. Following the student's request to respect readers' attention, the pages omit decorative labels, revision metadata, repeated prompts and production footnotes. Chapter headings identify their subject directly. Bibliography, photo credits and project notes are collapsed until requested; citation links open the relevant group. Essential tasks, historical excerpts, interpretations and course connections stay in the reading flow.

## The historical route

1. **Short prologue:** shells and shaped money before imperial unification.
2. **Qin and Han:** inspect a coin's form, inscription, and issuing rules, then read a passage from the *Records of the Grand Historian*.
3. **Song Sichuan:** complete one fictional cloth purchase to compare iron cash with a private jiaozi note, its issuer’s promise and the trader’s acceptance. This is the deepest interactive case.
4. **Ming and Qing:** examine a photographed Ming museum object and explore broad Qing patterns of copper and silver use.
5. **Modern epilogue:** distinguish money from a payment service through a conceptual PayNow example.

The route selects turning points rather than covering every dynasty. It does not present a simple progression in which each form replaces the last.

## Run the demo

No package installation or build is required. With Node.js installed, run:

```sh
node preview.mjs
```

Open the address shown, normally `http://127.0.0.1:8768/`. To use a different port, run `node preview.mjs 8769`.

Open `consultation.html` for the revised project brief: audience, message, medium, historical scope, analyses, reflection and submission boundaries. The filename is retained for existing links; the brief includes a print button.

The site uses local styles, scripts, photographs and illustrations. External research links require internet access. The documented preview workflow uses a local HTTP server.

## Included interactions

- Two clearly labelled recording spaces at the start, followed by a clickable guide to the five historical stops.
- A coin workbench with shape, inscription, and issuing-rule explanations.
- Two credited CC0 museum photographs with an enlarged view, Escape-to-close and focus return.
- One illustrated Song market, one goal (buy a roll of cloth), and immediate outcomes: coins accepted, paper accepted after checking, or an unchecked note refused by this fictional trader.
- Visible feedback, source links, payment comparisons, and restart; no journal, separate talk button, hidden lesson, or time jump.
- Five excerpts from three Song-related historical and literary texts, with source context, working translations, and critical-reading notes.
- Links from merchant decisions to relevant passages, plus a three-question evidence exercise.
- Qing transaction choices that illustrate copper and silver's different uses.
- Three selectable layers of a modern payment illustration.
- Twelve linked bibliography entries, two course references and concise image credits in expandable source groups, plus an English project brief.
- Responsive layouts, keyboard-operable controls, visible focus, and reduced-motion support.

The website is in English, with necessary Chinese terms in traditional characters inside parentheses. Original photographed museum labels remain unchanged. No personal video or personal museum photos have been supplied; the credited photographs are by others. Personal reflection is an AI-assisted draft grounded in the student's decisions and course reflection, for author review.

Choices are held in browser memory and reset on refresh. The exhibit does not collect visitor responses or make payments.

## Historical and visual boundaries

The merchant, dialogue, transaction situations and payment receipt are learning devices. The displayed AI-generated market scene is interpretive artwork. The earlier issuing-office image remains in the assets but is not part of the simplified activity. Currency diagrams are original schematic drawings. Museum photographs are documentary images separately credited in `IMAGE-CREDITS.md`. No historical prices, fixed exchange rates or measured coin weights are assigned to the drawings or photographs.

The chapter summary by Richard von Glahn was consulted, not the full scholarly chapter. Museum records and university teaching resources support the broader route. Digital historical-text passages were checked, but the full scholarship and critical editions remain to be reviewed before final submission.

The *History of the Song* is a Yuan compilation. The Kaifeng memoir and Hangzhou lyric offer comparative cultural perspectives, not direct evidence of Sichuan jiaozi use. English excerpts are AI-assisted working translations made for the exhibit, not quotations from a published English translator.

The Ming object and Qing transaction patterns are separate examples. Local practices varied. PayNow is a transfer service, not the same kind of instrument as jiaozi, and the exhibit does not assert a direct line from jiaozi to digital payment services.

## Adding the two personal recordings

Both spaces currently say **Recording coming soon**. No recording or simulated playback has been added.

1. **Why use this website?** Introduce the audience, purpose and how to explore; planned length up to five minutes.
2. **My journey & reflection.** Explain how the idea became a website, the course connections and personal learning; planned length up to five minutes.

Once the recordings are ready, place the compressed MP4 files in `assets/videos/` (for example, `website-introduction.mp4` and `journey-reflection.mp4`). In `index.html`, set the matching video's empty `data-src` attribute to its relative file path. `journal.js` replaces that space with a native player, including playback controls and fullscreen support. Empty paths make no media requests; a failed recording displays an unavailable message. No video autoplays.

English WebVTT captions can be added as a `<track kind="captions" srclang="en" label="English" src="assets/videos/filename.vtt" default>` child of the corresponding `<video>`. Review the recordings and captions before publishing them. Keep each file below GitHub's repository file-size limit; use a separately hosted video if a compressed recording is still too large.

## Files

- `index.html`: historical route, activities, source list, and methodology.
- `style.css`: shared visual language, responsive layout, and print styles.
- `journal.css` / `journal.js`: revised presentation, audience and reflection sections, and museum-photo viewer.
- `currency.css` / `currency.js`: timeline, coin inspection, and coexistence chapter.
- `game.css` / `app.js`: single-purchase Song activity and modern payment layers.
- `evidence.css` / `evidence.js`: reading panels, passage navigation, and evidence exercise.
- `consultation.html` / `brief.js`: revised English project brief and print action.
- `assets/`: local schematic SVGs, two interpretive PNG scenes and two museum photographs.
- `IMAGE-CREDITS.md`: photo provenance, licences and interpretation limits.
- `ASSET-PROMPTS.md`: exact image-generation prompts and asset attribution.
- `AI-USE.md`: assistance record and key research prompts.
- `preview.mjs`: local preview server.
- `.nojekyll`: serves this as a plain static site on GitHub Pages.

## Repository and hosting

Repository: [littlecrawler/HY2206-Passion-Project](https://github.com/littlecrawler/HY2206-Passion-Project).

The static files can be served from the root of the `main` branch. Pushing repository files and enabling a GitHub Pages deployment are separate actions. Verify the actual Pages deployment status before sharing a public website URL.

## Before the final submission

Review the assisted reflection in the student's own voice; read the full scholarship and appropriate critical editions; review translations and historical claims; test with readers; and complete the separate 500–800-word explanation, bibliography and AI disclosure. Personal recorded commentary can be added when supplied. The website reflects the reported consultation feedback but does not claim that final assessment requirements are complete.
