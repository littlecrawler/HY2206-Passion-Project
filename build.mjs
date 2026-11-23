import { writeFile, mkdir, copyFile } from 'node:fs/promises';
import { photos, periods, references, recordings } from './exhibit-data.js';
import { deckPage } from './deck-template.mjs';
import { readingAdditions } from './deck-content.js';
import { museumPage } from './museum-template.mjs';

const version = '20261123-gallery-titles';
await mkdir(new URL('vendor/three/', import.meta.url), { recursive: true });
for (const [source, target] of [['build/three.module.min.js','three.module.min.js'],['build/three.core.min.js','three.core.min.js'],['examples/jsm/environments/RoomEnvironment.js','RoomEnvironment.js'],['examples/jsm/objects/Reflector.js','Reflector.js'],['examples/jsm/renderers/CSS3DRenderer.js','CSS3DRenderer.js'],['LICENSE','LICENSE']]) {
  await copyFile(new URL('node_modules/three/' + source, import.meta.url), new URL('vendor/three/' + target, import.meta.url));
}
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = value => escape(value).replace(/（([^）]+)）/g, '<span lang="zh-Hant">（$1）</span>');
const labelText = value => value.replaceAll('&amp;', '<span class="ampersand">&amp;</span>');
const cite = ids => ids.map(id => '<a class="citation" href="references.html#source-' + id + '" aria-label="Reference ' + id + '">[' + id + ']</a>').join(' ');
const brand = '<a class="brand" href="index.html" aria-label="Money in China home"><img src="assets/coin-mark.svg" width="38" height="38" alt=""><span>Money in China</span></a>';
const navItems = [['museum', '3D Museum', 'museum.html'], ['cards', 'Flashcards', 'cards.html'], ['read', 'Read the history', 'read.html'], ['videos', 'Videos', 'index.html#videos'], ['project', 'My Journey &amp; Reflections', 'project.html'], ['references', 'References', 'references.html']];

function layout(title, page, body) {
  const nav = navItems.map(([id, label, href]) => '<a href="' + href + '"' + (page === id ? ' aria-current="page"' : '') + '>' + labelText(label) + '</a>').join('');
  const engineMap = ['museum', 'cards'].includes(page) ? '<script type="importmap">{"imports":{"three":"./vendor/three/three.module.min.js"}}</script>' : '';
  const museumAssets = engineMap + (page === 'museum' ? '<link rel="stylesheet" href="deck.css?v=' + version + '"><link rel="stylesheet" href="museum.css?v=' + version + '">' : page === 'cards' ? '<link rel="stylesheet" href="deck-3d.css?v=' + version + '">' : page === 'home' ? '<link rel="stylesheet" href="museum-home.css?v=' + version + '">' : '');
  return '<!doctype html>\n<html lang="en"><head><script>document.documentElement.classList.add("js-menu")</script><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0d1823"><meta name="description" content="Explore eight 3D museum rooms about money in China, with real objects, historical texts and interactive exhibits."><title>' + title + ' · Money in China</title><link rel="icon" href="assets/coin-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="site.css?v=' + version + '">' + (page === 'cards' ? '<link rel="stylesheet" href="deck.css?v=' + version + '">' : '') + museumAssets + '<link rel="stylesheet" href="exhibition-theme.css?v=' + version + '"><script type="module" src="site.js?v=' + version + '"></script></head>\n' +
    '<body data-page="' + page + '"' + (page === 'cards' ? ' data-deck-renderer="loading"' : '') + ' id="top"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner">' + brand + '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" hidden>Menu</button><nav id="main-nav" aria-label="Main navigation">' + nav + '</nav></div></header>\n' +
    '<main id="main">' + body + '</main>\n<footer class="site-footer wrap">' + brand + '<div><span>Cao Jingyuan · HY2206</span><a href="#top">Back to top</a></div></footer>' +
    '<dialog class="photo-dialog" id="photo-dialog" aria-labelledby="photo-dialog-title"><div class="dialog-heading"><h2 id="photo-dialog-title">Photograph</h2><button class="button secondary" type="button" data-close-photo autofocus>Close</button></div><img class="dialog-photo" id="dialog-photo" alt=""><p id="dialog-caption"></p><a id="dialog-source" target="_blank" rel="noopener noreferrer">Original photograph and credit</a></dialog>\n</body></html>\n';
}

function photo(id, eager = false) {
  const p = photos[id];
  return '<figure class="object-photo"><button class="photo-button" type="button" data-photo="' + id + '" aria-label="Enlarge ' + escape(p.title) + '"><img src="' + p.src + '" alt="' + escape(p.alt) + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async"><span class="enlarge-icon" aria-hidden="true">⤢</span></button><figcaption>' + text(p.title) + '<span>' + text(p.place) + '</span></figcaption></figure>';
}

function timeline(page) {
  return '<nav class="timeline" aria-label="Periods in the history of money">' + periods.map((p, i) => '<a href="' + page + '#' + p.id + '"' + (page === 'cards.html' ? ' data-period="' + i + '"' : '') + '><span class="timeline-dot" aria-hidden="true"></span><strong>' + text(p.label.replace(' and ', '–')) + '</strong><span class="timeline-date">' + text(p.date) + '</span></a>').join('') + '</nav>';
}

function quote(q) {
  if (!q) return '';
  return '<blockquote><p>“' + text(q.english) + '”</p><p lang="zh-Hant">（' + text(q.chinese) + '）</p><cite>' + text(q.attribution) + ' ' + cite([q.source]) + '</cite></blockquote>';
}

function historyPeriod(period) {
  const comparisonPhotos = period.id === 'today' ? ['paynow'] : [];
  const mainPhotos = period.photos.filter(id => !comparisonPhotos.includes(id));
  return '<article class="history-period" id="' + period.id + '"><div class="history-copy"><p class="period-date">' + text(period.date) + '</p><h2>' + text(period.era) + '</h2><h3>' + text(period.answerTitle) + '</h3><p>' + text(period.story) + ' ' + cite(period.sources) + '</p>' + quote(period.quote) +
    '<details class="context"><summary>' + (period.extra ? 'More context and historical writing' : 'More context') + '</summary><p>' + text(period.more) + (period.moreSources ? ' ' + cite(period.moreSources) : '') + '</p>' + (readingAdditions[period.id] || '') + (period.extra || '') +
    (comparisonPhotos.length ? '<div class="context-photos">' + comparisonPhotos.map(id => photo(id)).join('') + '</div>' : '') + '</details></div>' +
    '<div class="history-photos' + (mainPhotos.length > 1 ? ' multiple' : '') + '">' + mainPhotos.map(id => photo(id)).join('') + '</div></article>';
}

function recording(video) {
  const track = video.captions ? '<track kind="captions" src="' + escape(video.captions) + '" srclang="en" label="English" default>' : '';
  const screen = video.src
    ? '<video controls playsinline preload="metadata" src="' + escape(video.src) + '" aria-labelledby="' + video.id + '-title">' + track + 'Your browser does not support video playback.</video>'
    : '<div class="video-placeholder"><svg width="52" height="44" viewBox="0 0 52 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="32" height="30" rx="4"/><path d="m34 16 15-8v28l-15-8z"/></svg><p>Recording coming soon</p><span>Up to 5 minutes</span></div>';
  return '<article class="recording"><h3 id="' + video.id + '-title">' + labelText(video.title) + '</h3><p>' + video.description + '</p><div class="video-screen">' + screen + '</div></article>';
}

const home = museumPage() +
  '<section class="videos-section wrap" id="videos"><h2>About this project</h2><div class="video-grid">' + recordings.map(recording).join('') + '</div><div class="actions"><a class="text-link" href="project.html">Read my journey &amp; reflections</a><a class="text-link" href="#hall">Return to the museum</a></div></section>';
const cards = deckPage(timeline('cards.html'));

const read = '<div class="wrap"><header class="page-heading"><h1>Read the history</h1><p class="lead">From early shells to modern payments, with historical texts and analysis.</p><a class="text-link" href="museum.html">Visit the museum</a></header>' + timeline('read.html') +
  periods.map(historyPeriod).join('') +
  '<div class="reading-end"><p>New forms could solve one problem while creating another. Their usefulness depended on the people and institutions around them.</p><a class="button secondary" href="project.html">' + labelText('My Journey &amp; Reflections') + '</a></div></div>';

const project = '<div class="wrap project-page"><header class="page-heading"><h1>' + labelText('My Journey &amp; Reflections') + '</h1><p class="lead">Why I chose money, how the website changed, and what HY2206 helped me see.</p><a class="text-link" href="index.html#videos">Watch the project videos</a></header>' +
  '<div class="project-layout"><aside class="project-intro"><h2>Who is this for?</h2><p>Students who use money every day but may be new to Chinese history.</p><h2>What I want to share</h2><p>Monetary change was shaped by practical needs, political choices and social acceptance. A new form could join older ones, rather than replace them.</p></aside><div class="project-writing">' +
  '<section><h2>From an interest to a website</h2><p>I first considered two topics: the development of money and the development of architecture. I chose money because it connects ancient objects with something familiar in daily life. Song jiaozi（交子）was my starting point, but I wanted to understand the longer history around it.</p><p>A website let me put objects, historical writing and my own explanation together. Based on consultation feedback, I reconsidered the website in this order: audience, message, then form. I focused on students encountering this history for the first time.</p></section>' +
  '<section><h2>Learning to simplify</h2><p>I initially wanted visible merchants and a game. As the prototype grew, its purpose became harder to follow. Long explanations and too many small headings also asked the reader to do too much at once.</p><p>I chose a deck of picture cards so the reader can focus on one period at a time. The first version became too much like a short history summary, so I brought object exploration, comparisons and historical texts back into the cards. I later added a three-dimensional museum while keeping the flashcards and a reading view, so visitors can choose how they explore. I now give the modes different roles: the museum invites close looking, the cards ask focused questions, and the history pages bring together the fuller narrative and historical sources.</p></section>' +
  '<section><h2>Reflections on HY2206</h2><h3>Political authority shapes monetary rules</h3><p>The course’s discussion of Qin standardisation and the Han Salt and Iron Debate helped me see money as part of governing an empire. ' + cite([16]) + ' The <cite>Records of the Grand Historian</cite> describes a Han policy that prohibited minting in the commanderies and kingdoms and reserved it to three imperial offices. ' + cite([11]) + '</p><p>I read this as a change in who controlled money. Shared standards could make coins more familiar across regions, while restricting minting concentrated authority in the central government. This changed my idea of monetary “progress”: a reform could solve practical problems and strengthen political control at the same time. Convenience alone is therefore not enough to judge its effects.</p><h3>Trust depends on promises being kept</h3><p>I understand trust in money as two connected expectations: that someone else will accept it, and that whoever makes a promise can fulfil it. For a holder of jiaozi, a light note was useful only if it could still be passed on or redeemed.</p><p>The Song lectures connect commercial growth with monetary innovation. ' + cite([17]) + ' The <cite>History of the Song</cite> describes private issuers whose finances weakened until they could no longer redeem holders’ notes for coins, leading to repeated disputes. Private jiaozi made money easier to carry, but holders faced the risk that issuers could not redeem their notes. ' + cite([6]) + '</p><p>Even today, trust matters in people’s payment choices: research on WeChat Pay and Alipay found that users who trusted the platform more were more willing to continue using it. ' + cite([26]) + '</p></section>' +
  '<section><h2>How my understanding changed</h2><p>I now understand monetary development as changes in convenience, rules and trust. Paper reduced carrying weight; the issuer’s ability to exchange notes for coins still mattered. Modern payment apps also rely on accounts and services to carry out a transaction. ' + cite([6,22,23]) + ' The conclusion I draw is that convenience lasts only when the people and institutions involved can do what users expect: redeem a note or complete a payment.</p><p>Building the website changed how I communicate history, too. Each question needs an answer supported by an object or source. I want visitors to leave with a reason for a historical change, and an understanding of what that change solved or left unresolved.</p></section>' +
  '</div></div></div>';

const referencePage = '<div class="wrap references-page"><header class="page-heading"><h1>Reference list</h1><p>Historical sources, course readings and image credits.</p></header><ol class="reference-list">' + references.map(r => '<li id="source-' + r.id + '">' + r.html + '</li>').join('') + '</ol></div>';

for (const [filename, title, page, body] of [
  ['index.html', 'A history of money in China', 'museum', home],
  ['cards.html', 'Explore the flashcards', 'cards', cards],
  ['museum.html', 'Eight-room museum', 'museum', museumPage()],
  ['read.html', 'Read the history', 'read', read],
  ['project.html', 'My Journey &amp; Reflections', 'project', project],
  ['references.html', 'Reference list', 'references', referencePage],
  ['consultation.html', 'My Journey &amp; Reflections', 'project', project]
]) {
  await writeFile(new URL(filename, import.meta.url), layout(title, page, body));
  console.log('Built ' + filename);
}
