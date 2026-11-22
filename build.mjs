import { writeFile, mkdir, copyFile } from 'node:fs/promises';
import { photos, periods, references, recordings } from './exhibit-data.js';
import { deckPage } from './deck-template.mjs';
import { readingAdditions } from './deck-content.js';
import { museumPage } from './museum-template.mjs';

const version = '20261122-museum-title';
await mkdir(new URL('vendor/three/', import.meta.url), { recursive: true });
for (const [source, target] of [['build/three.module.min.js','three.module.min.js'],['build/three.core.min.js','three.core.min.js'],['examples/jsm/environments/RoomEnvironment.js','RoomEnvironment.js'],['examples/jsm/objects/Reflector.js','Reflector.js'],['LICENSE','LICENSE']]) {
  await copyFile(new URL('node_modules/three/' + source, import.meta.url), new URL('vendor/three/' + target, import.meta.url));
}
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = value => escape(value).replace(/（([^）]+)）/g, '<span lang="zh-Hant">（$1）</span>');
const cite = ids => ids.map(id => '<a class="citation" href="references.html#source-' + id + '" aria-label="Reference ' + id + '">[' + id + ']</a>').join(' ');
const brand = '<a class="brand" href="index.html" aria-label="Money in China home"><img src="assets/coin-mark.svg" width="38" height="38" alt=""><span>Money in China</span></a>';
const navItems = [['museum', '3D Museum', 'museum.html'], ['cards', 'Flashcards', 'cards.html'], ['read', 'Read the history', 'read.html'], ['videos', 'Videos', 'index.html#videos'], ['project', 'My project', 'project.html'], ['references', 'References', 'references.html']];

function layout(title, page, body) {
  const nav = navItems.map(([id, label, href]) => '<a href="' + href + '"' + (page === id ? ' aria-current="page"' : '') + '>' + label + '</a>').join('');
  const engineMap = ['museum', 'cards'].includes(page) ? '<script type="importmap">{"imports":{"three":"./vendor/three/three.module.min.js"}}</script>' : '';
  const museumAssets = engineMap + (page === 'museum' ? '<link rel="stylesheet" href="deck.css?v=' + version + '"><link rel="stylesheet" href="museum.css?v=' + version + '">' : page === 'cards' ? '<link rel="stylesheet" href="deck-3d.css?v=' + version + '">' : page === 'home' ? '<link rel="stylesheet" href="museum-home.css?v=' + version + '">' : '');
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0d1823"><meta name="description" content="Explore eight 3D museum rooms about money in China, with real objects, historical texts and interactive exhibits."><title>' + title + ' · Money in China</title><link rel="icon" href="assets/coin-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="site.css?v=' + version + '">' + (page === 'cards' ? '<link rel="stylesheet" href="deck.css?v=' + version + '">' : '') + museumAssets + '<link rel="stylesheet" href="exhibition-theme.css?v=' + version + '"><script type="module" src="site.js?v=' + version + '"></script></head>\n' +
    '<body data-page="' + page + '" id="top"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner">' + brand + '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" hidden>Menu</button><nav id="main-nav" aria-label="Main navigation">' + nav + '</nav></div></header>\n' +
    '<main id="main">' + body + '</main>\n<footer class="site-footer wrap">' + brand + '<div><span>Cao Jingyuan · HY2206</span><a href="#top">Back to top</a></div></footer>' +
    '<dialog class="photo-dialog" id="photo-dialog" aria-labelledby="photo-dialog-title"><div class="dialog-heading"><h2 id="photo-dialog-title">Photograph</h2><button class="button secondary" type="button" data-close-photo autofocus>Close</button></div><img class="dialog-photo" id="dialog-photo" alt=""><p id="dialog-caption"></p><a id="dialog-source" target="_blank" rel="noopener noreferrer">Original photograph and credit</a></dialog>\n</body></html>\n';
}

function photo(id, eager = false) {
  const p = photos[id];
  return '<figure class="object-photo"><button class="photo-button" type="button" data-photo="' + id + '" aria-label="Enlarge ' + escape(p.title) + '"><img src="' + p.src + '" alt="' + escape(p.alt) + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async"><span class="enlarge-icon" aria-hidden="true">⤢</span></button><figcaption>' + text(p.title) + '<span>' + text(p.place) + '</span></figcaption></figure>';
}

function timeline(page) {
  return '<nav class="timeline" aria-label="Periods in the history of money">' + periods.map((p, i) => '<a href="' + page + '#' + p.id + '"' + (page === 'cards.html' ? ' data-period="' + i + '"' : '') + '><span class="timeline-dot" aria-hidden="true"></span><strong>' + text(p.label.replace(' and ', '–')) + '</strong><span class="timeline-date">' + text(p.date.replace('20th–21st centuries', '20th–21st c.')) + '</span></a>').join('') + '</nav>';
}

function quote(q) {
  if (!q) return '';
  return '<blockquote><p>“' + text(q.english) + '”</p><p lang="zh-Hant">（' + text(q.chinese) + '）</p><cite>' + text(q.attribution) + ' ' + cite([q.source]) + '</cite></blockquote>';
}

function recording(video) {
  const track = video.captions ? '<track kind="captions" src="' + escape(video.captions) + '" srclang="en" label="English" default>' : '';
  const screen = video.src
    ? '<video controls playsinline preload="metadata" src="' + escape(video.src) + '" aria-labelledby="' + video.id + '-title">' + track + 'Your browser does not support video playback.</video>'
    : '<div class="video-placeholder"><svg width="52" height="44" viewBox="0 0 52 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="32" height="30" rx="4"/><path d="m34 16 15-8v28l-15-8z"/></svg><p>Recording coming soon</p><span>Up to 5 minutes</span></div>';
  return '<article class="recording"><h3 id="' + video.id + '-title">' + video.title + '</h3><p>' + video.description + '</p><div class="video-screen">' + screen + '</div></article>';
}

const home = museumPage() +
  '<section class="videos-section wrap" id="videos"><h2>About this project</h2><div class="video-grid">' + recordings.map(recording).join('') + '</div><div class="actions"><a class="text-link" href="project.html">Read my journey and reflection</a><a class="text-link" href="#hall">Return to the museum</a></div></section>';
const cards = deckPage(timeline('cards.html'));

const read = '<div class="wrap"><header class="page-heading"><h1>Read the history</h1><p class="lead">The same eight periods, open for you to browse.</p><a class="text-link" href="museum.html">Visit the museum</a></header>' + timeline('read.html') +
  periods.map(p => '<article class="history-period" id="' + p.id + '"><div class="history-copy"><p class="period-date">' + text(p.date) + '</p><h2>' + text(p.era) + '</h2><h3>' + text(p.answerTitle) + '</h3><p>' + text(p.story) + ' ' + cite(p.sources) + '</p>' + quote(p.quote) + '<details class="context"><summary>' + (p.extra ? 'More context and historical writing' : 'More context') + '</summary><p>' + text(p.more) + (p.moreSources ? ' ' + cite(p.moreSources) : '') + '</p>' + (readingAdditions[p.id] || '') + (p.extra || '') + '</details></div><div class="history-photos' + (p.photos.length > 1 ? ' multiple' : '') + '">' + p.photos.map(id => photo(id)).join('') + '</div></article>').join('') +
  '<div class="reading-end"><p>New forms could solve one problem while creating another. Their usefulness depended on the people and institutions around them.</p><a class="button secondary" href="project.html">My journey and reflection</a></div></div>';

const project = '<div class="wrap project-page"><header class="page-heading"><h1>My journey and reflection</h1><p class="lead">Why I chose money, how the website changed, and what HY2206 helped me see.</p><a class="text-link" href="index.html#videos">Watch the project videos</a></header>' +
  '<div class="project-layout"><aside class="project-intro"><h2>Who is this for?</h2><p>Students who use money every day but may be new to Chinese history.</p><h2>What I want to share</h2><p>Monetary change was shaped by practical needs, political choices and social acceptance. A new form could join older ones, rather than replace them.</p></aside><div class="project-writing">' +
  '<section><h2>From an interest to a website</h2><p>I first considered two topics: the development of money and the development of architecture. I chose money because it connects ancient objects with something familiar in daily life. Song jiaozi（交子）was my starting point, but I wanted to understand the longer history around it.</p><p>A website let me put objects, historical writing and my own explanation together. My professor’s feedback changed the order of my thinking: audience first, then message, then form. That helped me focus on students encountering this history for the first time.</p></section>' +
  '<section><h2>Learning to simplify</h2><p>I initially wanted visible merchants and a game. As the prototype grew, its purpose became harder to follow. Long explanations and too many small headings also asked the reader to do too much at once.</p><p>I chose a deck of picture cards so the reader can focus on one period at a time. The first version became too much like a short history summary, so I brought object exploration, comparisons and historical texts back into the cards. I later added a three-dimensional museum while keeping the flashcards and a reading view, so visitors can choose how they explore. The challenge is to make each interaction contribute to understanding while keeping the reading manageable.</p></section>' +
  '<section><h2>Two ideas from HY2206</h2><h3>State power could shape everyday money.</h3><p>The course’s discussion of Qin standardisation helped me see coins as more than objects. A shared standard also expressed authority. The Han Salt and Iron Debate raised a related question: how far should government intervene in economic life? These ideas gave me a way to connect monetary rules with wider political choices. ' + cite([16]) + '</p><h3>Convenience depended on institutions.</h3><p>The Song lectures connected commercial growth with monetary innovation and debates over government involvement. Jiaozi made carrying value easier, but paper alone could not guarantee repayment. I therefore came to ask who issued money, who accepted it and what supported the promise. ' + cite([1, 6, 17]) + '</p></section>' +
  '<section><h2>What I take away</h2><p>I now ask, “Better for whom, for which transaction, and under which conditions?” A lighter form could be convenient without making every payment easier. Several forms could remain useful together.</p><p>I also learned to keep different kinds of evidence distinct. A coin shows a material object; an official history explains institutions; a poem evokes a city. Reading them together is valuable when I also recognise what each can—and cannot—tell me.</p></section>' +
  '</div></div></div>';

const referencePage = '<div class="wrap references-page"><header class="page-heading"><h1>Reference list</h1><p>Historical sources, course readings and image credits.</p></header><ol class="reference-list">' + references.map(r => '<li id="source-' + r.id + '">' + r.html + '</li>').join('') + '</ol></div>';

for (const [filename, title, page, body] of [
  ['index.html', 'A history of money in China', 'museum', home],
  ['cards.html', 'Explore the flashcards', 'cards', cards],
  ['museum.html', 'Eight-room museum', 'museum', museumPage()],
  ['read.html', 'Read the history', 'read', read],
  ['project.html', 'My journey and reflection', 'project', project],
  ['references.html', 'Reference list', 'references', referencePage],
  ['consultation.html', 'My journey and reflection', 'project', project]
]) {
  await writeFile(new URL(filename, import.meta.url), layout(title, page, body));
  console.log('Built ' + filename);
}
