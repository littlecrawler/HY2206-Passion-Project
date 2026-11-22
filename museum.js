import { rooms } from './museum-data.js';
import { photos } from './exhibit-data.js';
import { activity, evidence, defaults, text, escape, cite } from './deck-content.js';

export function initMuseum() {
  const $=selector=>document.querySelector(selector);
  const shell=$('.museum-shell'), intro=$('#room-intro'), welcome=$('#museum-welcome');
  const exhibit=$('#exhibit-dialog'), map=$('#room-map'), finish=$('#museum-finish'), panel=$('#exhibit-panel');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const states=rooms.map(()=>({...defaults(),pane:'story'}));
  const rail=[...document.querySelectorAll('[data-room]')];
  let current=2, entered=false, scene, lastOpener=null;

  function image(id) {
    const photo=photos[id];
    return '<figure class="object-photo"><button class="photo-button" type="button" data-photo="'+id+'" aria-label="Enlarge '+escape(photo.title)+'"><img src="'+photo.src+'" alt="'+escape(photo.alt)+'"><span class="enlarge-icon" aria-hidden="true">⤢</span></button><figcaption>'+text(photo.title)+'<span>'+text(photo.place)+'</span></figcaption></figure>';
  }
  function selectPhoto(id) {
    if(!rooms[current].photos.includes(id))return;
    states[current].photo=id;$('#exhibit-photograph').innerHTML=image(id);
    document.querySelectorAll('[data-exhibit-photo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exhibitPhoto===id)));
  }
  function renderPanel() {
    const room=rooms[current],state=states[current];
    document.querySelectorAll('[data-exhibit-pane]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exhibitPane===state.pane)));
    panel.innerHTML=state.pane==='story'?'<div class="exhibit-story"><h3>'+text(room.answerTitle)+'</h3><p>'+text(room.story)+' '+cite(room.sources)+'</p></div>':state.pane==='sources'?evidence(room,state):activity(room,state);
  }
  function renderExhibit(photoId) {
    const room=rooms[current];$('#exhibit-date').textContent=room.date;$('#exhibit-title').textContent=room.label;
    $('#exhibit-reading').href='read.html#'+room.id;
    $('#exhibit-photos').innerHTML=room.photos.length>1?room.photos.map(id=>'<button class="photo-choice" type="button" data-exhibit-photo="'+id+'" aria-pressed="false">'+text(photos[id].title.split('（')[0].trim())+'</button>').join(''):'';
    selectPhoto(room.photos.includes(photoId)?photoId:states[current].photo||room.photos[0]);renderPanel();
  }
  function updateRoom() {
    const room=rooms[current];
    document.body.style.setProperty('--museum-accent',room.accent);
    $('#room-date').textContent=room.date;$('#room-title').textContent=room.label;$('#room-question').textContent=room.question;
    $('#room-count').textContent=entered?'Room '+(current+1)+' of 8':'Eight rooms to explore';
    $('#previous-room').disabled=!entered||current===0;
    $('#next-room').textContent=!entered?'Begin the visit':current===7?'Finish visit':'Next room';
    $('#fallback-photo').src=photos[room.photos[0]].src;$('#fallback-photo').alt=photos[room.photos[0]].alt;
    rail.forEach((button,index)=>{if(entered&&index===current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    document.querySelectorAll('[data-map-room]').forEach(button=>{if(entered&&Number(button.dataset.mapRoom)===current)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
    document.title=(entered?room.label+' · 3D museum':'Eight-room museum')+' · Money in China';
  }
  function goTo(index,{push=true,animate=true}={}) {
    current=Math.max(0,Math.min(7,index));entered=true;welcome.hidden=true;intro.hidden=false;
    if(push)history.pushState(null,'','#'+rooms[current].id);
    updateRoom();scene?.show(current,animate); if(exhibit.open)renderExhibit();
  }
  function openExhibit(photoId) {
    if(!entered)goTo(current,{animate:false});
    renderExhibit(photoId);lastOpener=$('#explore-room');exhibit.showModal();scene?.setPaused(true);
  }
  function followHash() {
    const index=rooms.findIndex(room=>room.id===location.hash.slice(1));
    if(index>=0)goTo(index,{push:false,animate:false});
    else if(location.hash===''&&entered){entered=false;current=2;welcome.hidden=false;intro.hidden=true;updateRoom();scene?.show(2,false);}
  }
  $('#enter-museum').addEventListener('click',()=>goTo(0));
  $('#explore-room').addEventListener('click',()=>openExhibit());
  $('#previous-room').addEventListener('click',()=>{if(entered&&current>0)goTo(current-1);});
  $('#next-room').addEventListener('click',()=>{
    if(!entered)goTo(0);
    else if(current<7)goTo(current+1);
    else{lastOpener=$('#next-room');finish.showModal();scene?.setPaused(true);}
  });
  rail.forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.room))));
  $('#open-room-map').addEventListener('click',()=>{lastOpener=$('#open-room-map');map.showModal();scene?.setPaused(true);});
  map.addEventListener('click',event=>{
    const button=event.target.closest('[data-map-room]');if(!button)return;
    map.close();goTo(Number(button.dataset.mapRoom));
  });
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
  for(const dialog of [exhibit,map,finish]) {
    dialog.addEventListener('close',()=>{scene?.setPaused(false);lastOpener?.focus({preventScroll:true});});
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  }
  $('#restart-museum').addEventListener('click',()=>{finish.close();goTo(0);});
  $('#exhibit-photos').addEventListener('click',event=>{const b=event.target.closest('[data-exhibit-photo]');if(b)selectPhoto(b.dataset.exhibitPhoto);});
  $('.exhibit-discovery .discovery-tabs').addEventListener('click',event=>{
    const button=event.target.closest('[data-exhibit-pane]');if(!button)return;
    states[current].pane=button.dataset.exhibitPane;renderPanel();
  });
  const keys={detail:'detail',money:'money',issuer:'issuer',yuan:'yuanStage',transaction:'transaction',payment:'paymentLayer',document:'document'};
  panel.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button||button.tagName!=='BUTTON')return;
    const state=states[current],action=button.dataset.action;
    if(action==='coin') {
      state.coinBack=!state.coinBack;$('#coin-flipper').classList.toggle('is-reverse',state.coinBack);
      $('.coin-obverse').setAttribute('aria-hidden',String(state.coinBack));$('.coin-reverse').setAttribute('aria-hidden',String(!state.coinBack));
      button.setAttribute('aria-pressed',String(state.coinBack));$('#coin-side').textContent=state.coinBack?'Reverse · the other face':'Obverse · the inscription';return;
    }
    if(!keys[action])return;const value=button.dataset.value;
    state[keys[action]]=['yuan','payment'].includes(action)?Number(value):value;renderPanel();
    panel.querySelectorAll('[data-action]').forEach(b=>{if(b.dataset.action===action&&b.dataset.value===value)b.focus({preventScroll:true});});
  });
  panel.addEventListener('input',event=>{
    const input=event.target,state=states[current];
    if(input.dataset.action==='zoom') {state.zoom=Number(input.value);$('#lens-photo').style.transform='scale('+state.zoom+')';$('#zoom-value').textContent=state.zoom.toFixed(1)+'×';input.setAttribute('aria-valuetext',state.zoom.toFixed(1)+' times');}
    if(input.dataset.action==='compare') {state.compare=Number(input.value);$('.image-comparison').style.setProperty('--reveal',state.compare+'%');input.setAttribute('aria-valuetext',state.compare+' percent spade photograph');}
  });
  $('#museum-canvas').addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();goTo(entered?Math.min(7,current+1):0);}
    if(event.key==='ArrowLeft'){event.preventDefault();goTo(Math.max(0,current-1));}
    if(event.key==='Enter'){event.preventDefault();openExhibit();}
  });
  window.addEventListener('hashchange',followHash);followHash();updateRoom();
  import('./museum-scene.js?v=20261122-museum').then(({createMuseum})=>createMuseum($('#museum-canvas'),{
    initialRoom:current,reducedMotion:reduce.matches,onSelect:openExhibit,
    onReady(){document.body.dataset.renderer='webgl';$('#museum-loading').hidden=true;}
  })).then(result=>{
    scene=result;scene.show(current,false);scene.setPaused(exhibit.open||map.open||finish.open);
    reduce.addEventListener('change',event=>scene.setReducedMotion(event.matches));
  }).catch(error=>{
    document.body.dataset.renderer='fallback';$('#museum-loading').hidden=true;$('#museum-canvas').hidden=true;$('#rotate-hint').hidden=true;
    console.warn('Museum is using the photographic view.',error.message);
  });
}
