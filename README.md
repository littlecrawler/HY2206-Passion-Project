# The Changing Forms of Money in China

An interactive history exhibit created for NUS HY2206. It asks why monetary forms changed, what problems they addressed, and why different forms continued to coexist.

This is a consultation demo, updated 2 November 2026, not the final assessed submission.

## The historical route

1. **Short prologue:** shells and shaped money before imperial unification.
2. **Qin and Han:** inspect a coin's form, inscription, and issuing rules, then read a passage from the *Records of the Grand Historian*.
3. **Song Sichuan:** play a fictional merchant's three encounters about iron cash, private jiaozi, and institutional support. This is the deepest interactive case.
4. **Ming and Qing:** examine a linked Ming museum object and explore broad Qing patterns of copper and silver use.
5. **Modern epilogue:** distinguish money from a payment service through a conceptual PayNow example.

The route selects turning points rather than covering every dynasty. It does not present a simple progression in which each form replaces the last.

## Run the demo

No package installation or build is required. With Node.js installed, run:

```sh
node preview.mjs
```

Open the address shown, normally `http://127.0.0.1:8768/`. To use a different port, run `node preview.mjs 8769`.

Open `consultation.html` from the website for the proposed scope, one-minute English pitch, demonstration route, recording plan, and questions for the professor. The brief includes a print button.

The site uses local styles, scripts, and illustrations. External research links require internet access. The documented preview workflow uses a local HTTP server.

## Included interactions

- A clickable chronological route with three core chapters.
- A coin workbench with shape, inscription, and issuing-rule explanations.
- Two illustrated Song scenes with a player merchant, trader, and issuing clerk; conversation hotspot; illustrated choices; animated handover; document inspection; and three journal entries.
- Previous-step navigation, replay, and a selection recap for the merchant story.
- Five excerpts from three Song-related historical and literary texts, with source context, working translations, and critical-reading notes.
- Links from merchant decisions to relevant passages, plus a three-question evidence exercise.
- Qing transaction choices that illustrate copper and silver's different uses.
- Three selectable layers of a modern payment illustration.
- Twelve linked bibliography entries, research limitations, and an English consultation brief.
- Responsive layouts, keyboard-operable controls, visible focus, and reduced-motion support.

The website is in English, with necessary Chinese terms in traditional characters inside parentheses. Personal recorded commentary is planned; no personal video has been supplied or embedded.

Choices are held in browser memory and reset on refresh. The exhibit does not collect visitor responses or make payments.

## Historical and visual boundaries

The merchant, dialogue, transaction situations, and payment receipt are learning devices. The two AI-generated scenes are interpretive artwork. Currency diagrams are original schematic drawings, not photographs or facsimiles of surviving objects. No historical prices, fixed exchange rates, or measured coin weights are assigned to them.

The chapter summary by Richard von Glahn was consulted, not the full scholarly chapter. Museum records and university teaching resources support the broader route. Digital historical-text passages were checked, but the full scholarship and critical editions remain to be reviewed before final submission.

The *History of the Song* is a Yuan compilation. The Kaifeng memoir and Hangzhou lyric offer comparative cultural perspectives, not direct evidence of Sichuan jiaozi use. English excerpts are AI-assisted working translations made for the exhibit, not quotations from a published English translator.

The Ming object and Qing transaction patterns are separate examples. Local practices varied. PayNow is a transfer service, not the same kind of instrument as jiaozi, and the exhibit does not assert a direct line from jiaozi to digital payment services.

## Files

- `index.html`: historical route, activities, source list, and methodology.
- `style.css`: shared visual language, responsive layout, and print styles.
- `currency.css` / `currency.js`: timeline, coin inspection, and coexistence chapter.
- `game.css` / `app.js`: Song merchant adventure and modern payment layers.
- `evidence.css` / `evidence.js`: reading panels, passage navigation, and evidence exercise.
- `consultation.html` / `brief.js`: English consultation brief and print action.
- `assets/`: local schematic SVGs and two interpretive PNG scenes.
- `ASSET-PROMPTS.md`: exact image-generation prompts and asset attribution.
- `AI-USE.md`: assistance record and key research prompts.
- `preview.mjs`: local preview server.
- `.nojekyll`: serves this as a plain static site on GitHub Pages.

## Repository and hosting

Repository: [littlecrawler/HY2206-Passion-Project](https://github.com/littlecrawler/HY2206-Passion-Project).

The static files can be served from the root of the `main` branch. Pushing repository files and enabling a GitHub Pages deployment are separate actions. Verify the actual Pages deployment status before sharing a public website URL.

## Before the final submission

Confirm scope and expected depth with the professor; read the full scholarship and appropriate critical editions; review translations and historical claims; add the student's recorded interpretation; test with readers; and complete the separate 500–800-word explanation, bibliography, and AI disclosure.
