(() => {
  'use strict';

  const photos = {
    ming: {
      title: 'A Ming paper note, with coins in its design',
      src: 'assets/museum/ming-banknote.jpg',
      alt: 'Ming banknote with a one-guan denomination, ten groups of pictured coins, red seals and printed instructions.',
      description: 'Great Ming Circulating Treasure Note（大明通行寶鈔）, dated 1375 in the British Museum record; registration 1942,0805.1. Look beneath the large denomination for the coin strings. This is a Ming object, not Song jiaozi.',
      credit: 'Photographed by BabelStone, 21 August 2010. CC0 1.0. Wikimedia thumbnail; no retouching.',
      source: 'https://commons.wikimedia.org/wiki/File:British_Museum_Ming_banknote.jpg'
    },
    coins: {
      title: 'Banliang coins in the Shanghai Museum',
      src: 'assets/museum/banliang-coins.jpg',
      alt: 'Shanghai Museum display of Qin and Han banliang coins, with repeated square openings and different coin sizes.',
      description: 'Banliang coins（半兩錢）in the Shanghai Museum Coin Gallery. Compare the shared round shape and square opening with the differences in size. The original museum labels are preserved in the photograph. Size in this image does not establish weight or value.',
      credit: 'Photographed by Gary Lee Todd, 23 August 2008. CC0 1.0. Wikimedia thumbnail; no retouching.',
      source: 'https://commons.wikimedia.org/wiki/File:Banliang_Coins_of_Qin_and_Han_Dynasties_01.jpg'
    }
  };

  const dialog = document.getElementById('photo-dialog');
  function revealCitation(hash) {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      revealCitation(link.getAttribute('href'));
    }
  });
  window.addEventListener('hashchange', () => revealCitation(location.hash));
  revealCitation(location.hash);
  let opener;
  document.querySelectorAll('[data-photo]').forEach(button => {
    button.addEventListener('click', () => {
      const photo = photos[button.dataset.photo];
      opener = button;
      document.getElementById('photo-dialog-title').textContent = photo.title;
      const img = document.getElementById('photo-dialog-image');
      img.src = photo.src;
      img.alt = photo.alt;
      document.getElementById('photo-dialog-description').textContent = photo.description;
      document.getElementById('photo-dialog-credit').textContent = photo.credit;
      document.getElementById('photo-dialog-source').href = photo.source;
      dialog.showModal();
      document.body.classList.add('viewing-photo');
    });
  });
  document.getElementById('close-photo').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewing-photo');
    opener?.focus({ preventScroll: true });
  });
})();
