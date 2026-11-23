import Plyr from './vendor/plyr/plyr.esm.js';

const english = {
  restart: 'Restart',
  rewind: 'Rewind {seektime}s',
  play: 'Play',
  pause: 'Pause',
  fastForward: 'Forward {seektime}s',
  seek: 'Seek',
  seekLabel: '{currentTime} of {duration}',
  played: 'Played',
  buffered: 'Buffered',
  currentTime: 'Current time',
  duration: 'Duration',
  volume: 'Volume',
  mute: 'Mute',
  unmute: 'Unmute',
  enableCaptions: 'Enable captions',
  disableCaptions: 'Disable captions',
  enterFullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  frameTitle: 'Player for {title}',
  captions: 'Captions',
  settings: 'Settings',
  menuBack: 'Back',
  speed: 'Playback speed',
  normal: 'Normal',
  disabled: 'Off',
  enabled: 'On',
};

document.querySelectorAll('#videos video').forEach(video => {
  const title = document.getElementById(video.getAttribute('aria-labelledby'))?.textContent.trim();
  new Plyr(video, {
    title,
    controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
    settings: ['captions', 'speed'],
    i18n: english,
    captions: { active: true, language: 'en', update: false },
    speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
    tooltips: { controls: true, seek: true },
    keyboard: { focused: true, global: false },
    fullscreen: { enabled: true, fallback: true, iosNative: false },
    storage: { enabled: false },
    invertTime: false,
    toggleInvert: false,
    iconUrl: new URL('./vendor/plyr/plyr.svg', import.meta.url).href,
  });
});
