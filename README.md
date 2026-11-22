# Money in China

An English-language HY2206 Individual Passion Project by Cao Jingyuan. Necessary Chinese monetary terms appear in Traditional Chinese in parentheses.

Live site: https://littlecrawler.github.io/HY2206-Passion-Project/

## Visitor experience

- **Home:** a short overview, three real monetary-object photographs, a timeline, and spaces for two personal videos.
- **Flashcards:** eight periods, one visible at a time. An object and a question on the front; a short explanation on the back. Visitors can flip, move backwards/forwards, jump on the timeline, or switch to the matching reading section. No quiz, score, locked stage, or purchase simulation.
- **Read the history:** the same chronology with additional context and primary-source excerpts.
- **My project:** audience, message, personal journey, reflection, and two course connections.
- **References:** one numbered list covering historical texts, scholarship, course materials, and photographs.

The sequence covers early money, Eastern Zhou, Qin–Han, Tang, Song, Yuan, Ming–Qing, and a modern comparison. It selects periods rather than claiming to cover every dynasty. PayNow is explicitly a Singapore comparison, not a Chinese currency.

## Editing and previewing

No dependencies are required. Use a recent Node.js version.

    node build.mjs
    node preview.mjs 8769

Then open http://127.0.0.1:8769/

- **exhibit-data.js** contains the shared historical copy, image metadata, references, and recording paths.
- **build.mjs** generates index.html, cards.html, read.html, project.html, references.html, and the compatibility page consultation.html.
- **site.css** contains the current responsive layout and typography.
- **site.js** handles flashcards, image enlargement, navigation, and old bookmark redirects.
- Generated HTML is committed so GitHub Pages can serve the repository root directly, without a build service.

After changing content or the page templates, run the build command above. Avoid editing generated HTML directly.

The older app.js, currency.js, evidence.js, journal.js, brief.js and related styles remain as prototype history; the current pages do not load them.

## Personal videos

No recordings have been supplied yet. Both honest placeholders say “Recording coming soon” and “Up to 5 minutes”.

In the **recordings** array in exhibit-data.js, fill **src** with the relative path to the recording and optionally fill **captions** with a WebVTT file path. Then rebuild. The page will render a native, accessible video player in place of the placeholder.

1. Why use this website?
2. My journey and reflection

## Sources and images

Historical photographs are served locally, with the intact photograph available in an enlargement dialog. Their photographers, original URLs and licences are in IMAGE-CREDITS.md and the Reference list. No photograph is presented as the student's own museum visit.

The photographed Ming banknote is not used as a Song jiaozi. The Song card shows a labelled Northern Song iron coin. Historical-text translations are working translations; the accessible summaries of the cited von Glahn chapters were consulted rather than the full chapters.

AI-USE.md records AI assistance. ASSET-PROMPTS.md retains the older generated-illustration record; those merchant illustrations are not part of the current flashcards.

## Hosting

GitHub Pages uses **main** and **/ (root)**. Keep .nojekyll. No /docs setting or native Sites deployment is needed.

The qa/ folder and *.log files are ignored. They hold local screenshots and verification utilities, not public project content.
