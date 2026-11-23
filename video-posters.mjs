import { readFile, writeFile } from 'node:fs/promises';

export async function buildVideoPosters() {
  const imageData = async path => 'data:image/jpeg;base64,' + (await readFile(new URL(path, import.meta.url))).toString('base64');
  const museum = await imageData('assets/videos/website-introduction.jpg');
  const coin = await imageData('assets/museum/han-banliang-closeup.jpg');
  const common = 'font-family="Trebuchet MS, Arial, sans-serif"';

  const guide = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="shade"><stop stop-color="#07131e"/><stop offset=".46" stop-color="#07131e" stop-opacity=".94"/><stop offset="1" stop-color="#07131e" stop-opacity=".18"/></linearGradient>
    <linearGradient id="base" x2="0" y2="1"><stop stop-color="#07131e" stop-opacity="0"/><stop offset="1" stop-color="#07131e" stop-opacity=".85"/></linearGradient>
    <linearGradient id="top" x2="0" y2="1"><stop offset=".55" stop-color="#07131e"/><stop offset="1" stop-color="#07131e" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1280" height="720" fill="#0d1823"/>
  <image href="${museum}" x="0" y="-15" width="1400" height="735" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1280" height="720" fill="url(#shade)"/>
  <rect width="1280" height="120" fill="url(#top)"/>
  <rect y="490" width="1280" height="230" fill="url(#base)"/>
  <path d="M76 145h68" stroke="#bad7e2" stroke-width="5"/>
  <g ${common} fill="#edf4f6">
    <text x="76" y="106" font-size="25">Money in China</text>
    <text x="76" y="283" font-size="76" font-weight="700" letter-spacing="-2">How to use</text>
    <text x="76" y="376" font-size="76" font-weight="700" letter-spacing="-2">the website</text>
    <text x="1198" y="106" font-size="30" text-anchor="end" fill="#bcd6df">01</text>
  </g>
</svg>`;

  const journey = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="back" x2="1" y2="1"><stop stop-color="#172b3b"/><stop offset="1" stop-color="#0a1722"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="20" stdDeviation="22" flood-color="#000" flood-opacity=".4"/></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#back)"/>
  <circle cx="998" cy="380" r="270" fill="none" stroke="#d4b88b" stroke-opacity=".14"/>
  <circle cx="998" cy="380" r="302" fill="none" stroke="#d4b88b" stroke-opacity=".07"/>
  <path d="M76 145h68" stroke="#d4b88b" stroke-width="5"/>
  <g transform="rotate(6 963 370)">
    <rect x="726" y="204" width="470" height="324" rx="5" fill="#ebdfc8" opacity=".5"/>
  </g>
  <g transform="rotate(-5 957 366)" filter="url(#shadow)">
    <rect x="710" y="190" width="490" height="330" rx="5" fill="#f5f1e8"/>
    <image href="${coin}" x="730" y="222" width="450" height="225"/>
    <path d="M739 480h430" stroke="#cabfaa"/>
  </g>
  <g ${common} fill="#edf4f6">
    <text x="76" y="106" font-size="25">Money in China</text>
    <text x="76" y="283" font-size="76" font-weight="700" letter-spacing="-2">My Journey</text>
    <text x="76" y="376" font-size="76" font-weight="700" letter-spacing="-2"><tspan font-family="Arial, sans-serif" fill="#d4b88b">&amp;</tspan> Reflections</text>
    <text x="76" y="609" font-size="26" fill="#d4c4ab">Cao Jingyuan</text>
    <text x="1198" y="106" font-size="30" text-anchor="end" fill="#d4b88b">02</text>
  </g>
</svg>`;
  await writeFile(new URL('assets/videos/website-introduction-cover.svg', import.meta.url), guide);
  await writeFile(new URL('assets/videos/journey-and-reflections-cover.svg', import.meta.url), journey);
}
