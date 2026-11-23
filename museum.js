import { rooms } from './museum-data.js?v=20261123-pan-dismiss';
import { photos } from './exhibit-data.js?v=20261123-pan-dismiss';
import { text, escape, cite } from './deck-content.js?v=20261123-pan-dismiss';
import { objectNotes } from './mode-content.js?v=20261123-pan-dismiss';

export function initMuseum() {
  const $=selector=>document.querySelector(selector);
  const shell=$('.museum-shell'), intro=$('#room-intro'), directory=$('#museum-directory');
  const exhibit=$('#exhibit-dialog'), finish=$('#museum-finish'), panel=$('#exhibit-panel');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const states=rooms.map(()=>({photo:null,viewPhoto:null}));
  const rail=[...document.querySelectorAll('[data-room]')];
  let current=-1, entered=false, scene, lastOpener=null, travelling=false;

  function setDirectory(open,focus=false) {
    directory.hidden=!open;shell.dataset.directory=open?'open':'closed';
    $('#open-room-map').setAttribute('aria-expanded',String(open));
    if(open&&focus)shell.scrollIntoView({behavior:'instant',block:'start'});
    if(focus)(open?$('#directory-close'):$('#open-room-map')).focus({preventScroll:true});
  }

  function image(id) {
    const photo=photos[id];
    return '<figure class="object-photo"><button class="photo-button" type="button" data-photo="'+id+'" aria-label="Enlarge '+escape(photo.title)+'"><img src="'+photo.src+'" alt="'+escape(photo.alt)+'"><span class="enlarge-icon" aria-hidden="true">⤢</span></button><figcaption>'+text(photo.place)+'</figcaption></figure>';
  }
  function selectPhoto(id) {
    if(!rooms[current].photos.includes(id))return;
    states[current].photo=id;$('#exhibit-photograph').innerHTML=image(id);
    $('#exhibit-title').innerHTML=text(photos[id].title);
    const object=objectNotes[id];
    panel.innerHTML='<p>'+text(object.note)+' '+cite(object.sources)+'</p>';
    document.querySelectorAll('[data-exhibit-photo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exhibitPhoto===id)));
  }
  function renderExhibit(photoId) {
    const room=rooms[current];$('#exhibit-date').textContent=room.label+' · '+room.date;
    $('#exhibit-reading').href='read.html#'+room.id;
    $('#exhibit-photos').innerHTML=room.photos.length>1?room.photos.map(id=>'<button class="photo-choice" type="button" data-exhibit-photo="'+id+'" aria-pressed="false">'+text(photos[id].title.split('（')[0].trim())+'</button>').join(''):'';
    selectPhoto(room.photos.includes(photoId)?photoId:states[current].photo||room.photos[0]);
  }
  function updateRoom() {
    const room=rooms[Math.max(0,current)];
    shell.dataset.location=entered?'gallery':'hall';
    intro.hidden=!entered;
    $('#room-objects').hidden=!entered;
    const focused=entered?states[current].viewPhoto:null;
    $('#exhibit-hotspots').innerHTML=focused?'<button type="button" class="exhibit-hotspot" data-wall-object="'+focused+'" aria-label="Explore '+escape(photos[focused].title)+'" hidden>Explore</button>':'';
    if(entered){
      const focused=states[current].viewPhoto;
      $('#room-objects').innerHTML='<button type="button" data-room-view aria-pressed="'+!focused+'">Room view</button>'+room.photos.map(id=>'<button type="button" data-focus-object="'+id+'" aria-pressed="'+(focused===id)+'">'+text(photos[id].title.split('（')[0].trim())+'</button>').join('');
      $('#room-objects').querySelectorAll('button').forEach(button=>button.disabled=travelling);
      const active=$('#room-objects').querySelector('[aria-pressed="true"]');
      if(active)$('#room-objects').scrollLeft=active.offsetLeft-($('#room-objects').clientWidth-active.offsetWidth)/2;
    }
    $('#room-date').textContent=room.date;$('#room-title').textContent=room.label;$('#room-question').textContent=room.question;
    $('#room-count').textContent='3D Museum / '+(entered?room.label:'Main hall');
    $('#directory-location').textContent=entered?'Gallery '+(current+1)+' of 8 · '+room.label:'Main hall';
    $('#previous-room').disabled=current<=0||travelling;
    $('#previous-room').textContent='Previous gallery';
    $('#next-room').textContent=!entered?'Start the visit':current===7?'Finish visit':'Next gallery';
    $('#return-hall').hidden=!entered;
    $('#fallback-photo').src=photos[room.photos[0]].src;$('#fallback-photo').alt=photos[room.photos[0]].alt;
    rail.forEach((button,index)=>{if(entered&&index===current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    document.title=(entered?room.label+' · 3D museum':'Eight-room museum')+' · Money in China';
  }
  function goTo(index,{push=true,animate=true}={}) {
    if(travelling&&animate)return;
    current=Math.max(-1,Math.min(7,index));entered=current>=0;
    shell.dataset.photoFocus='false';if(entered)states[current].viewPhoto=null;
    setDirectory(!entered);$('#gallery-hover').hidden=true;
    if(push)history.pushState(null,'','#'+(entered?rooms[current].id:'hall'));
    updateRoom();scene?.show(current,animate); if(exhibit.open){if(entered)renderExhibit();else exhibit.close();}
    if(push)shell.scrollIntoView({behavior:'instant',block:'start'});
  }
  function openExhibit(photoId) {
    if(!entered||travelling)return;
    renderExhibit(photoId);lastOpener=$('#explore-room');exhibit.showModal();scene?.setPaused(true);
  }
  function focusObject(id) {
    if(travelling||!entered||!rooms[current].photos.includes(id))return;
    if(states[current].viewPhoto===id)return;
    shell.scrollIntoView({behavior:'instant',block:'start'});
    states[current].viewPhoto=id;states[current].photo=id;shell.dataset.photoFocus='true';
    updateRoom();scene?.focusPhoto(id);
  }
  function leaveObject() {
    if(travelling||!entered||!states[current].viewPhoto)return;
    states[current].viewPhoto=null;shell.dataset.photoFocus='false';
    updateRoom();scene?.show(current,true);
  }
  function followHash() {
    if(location.hash==='#videos')return;
    const index=rooms.findIndex(room=>room.id===location.hash.slice(1));
    if(index>=0)goTo(index,{push:false,animate:false});
    else goTo(-1,{push:false,animate:false});
  }
  $('#return-hall').addEventListener('click',()=>goTo(-1));
  $('#explore-room').addEventListener('click',()=>openExhibit());
  $('#previous-room').addEventListener('click',()=>{if(entered)goTo(current-1);});
  $('#next-room').addEventListener('click',()=>{
    if(!entered)goTo(0);
    else if(current<7)goTo(current+1);
    else{lastOpener=$('#next-room');finish.showModal();scene?.setPaused(true);}
  });
  rail.forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.room))));
  $('#open-room-map').addEventListener('click',()=>setDirectory(directory.hidden,true));
  $('#directory-close').addEventListener('click',()=>setDirectory(false,true));
  let directoryPointer=null;
  const outsideDirectory=target=>!target.closest('#museum-directory,#open-room-map,dialog');
  document.addEventListener('pointerdown',event=>{
    directoryPointer=!directory.hidden&&event.isPrimary&&event.button===0&&outsideDirectory(event.target)
      ? {id:event.pointerId,x:event.clientX,y:event.clientY} : null;
  },true);
  document.addEventListener('pointermove',event=>{
    if(directoryPointer?.id===event.pointerId&&Math.hypot(event.clientX-directoryPointer.x,event.clientY-directoryPointer.y)>8)directoryPointer=null;
  },true);
  document.addEventListener('pointercancel',()=>{directoryPointer=null;},true);
  document.addEventListener('click',event=>{
    const dismiss=directoryPointer&&!directory.hidden&&outsideDirectory(event.target);
    directoryPointer=null;
    if(dismiss)setDirectory(false);
  });
  $('#room-objects').addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||travelling||!entered)return;
    const id=button.dataset.focusObject;
    if(id){focusObject(id);return;}
    leaveObject();
  });
  $('#exhibit-hotspots').addEventListener('click',event=>{
    const button=event.target.closest('[data-wall-object]');
    if(button&&!travelling)openExhibit(button.dataset.wallObject);
  });
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
  for(const dialog of [exhibit,finish]) {
    dialog.addEventListener('close',()=>{scene?.setPaused(false);lastOpener?.focus({preventScroll:true});});
  }
  $('#restart-museum').addEventListener('click',()=>{finish.close();goTo(-1);});
  $('#exhibit-photos').addEventListener('click',event=>{const b=event.target.closest('[data-exhibit-photo]');if(b)selectPhoto(b.dataset.exhibitPhoto);});
  $('#museum-canvas').addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();leaveObject();}
    if(event.key==='ArrowRight'){event.preventDefault();goTo(entered?Math.min(7,current+1):0);}
    if(event.key==='ArrowLeft'){event.preventDefault();goTo(Math.max(-1,current-1));}
    if(event.key==='Enter'){event.preventDefault();if(entered)openExhibit();else goTo(0);}
  });
  directory.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();setDirectory(false,true);}});
  window.addEventListener('hashchange',followHash);followHash();updateRoom();
  import('./museum-scene.js?v=20261123-pan-dismiss').then(({createMuseum})=>createMuseum($('#museum-canvas'),{
    initialRoom:current,reducedMotion:reduce.matches,onSelect:focusObject,onLeaveObject:leaveObject,onRoom:index=>goTo(index),
    onObjectPositions(positions){
      positions.forEach(({id,x,y,visible})=>{
        const button=$('#exhibit-hotspots [data-wall-object="'+id+'"]');
        if(!button)return;
        button.hidden=!visible;button.style.left=x+'px';button.style.top=y+'px';
      });
    },
    onHover(index,x,y){
      const hint=$('#gallery-hover');hint.hidden=index<0||entered||travelling;
      if(!hint.hidden){hint.textContent='Enter '+rooms[index].label;hint.style.left=Math.min(shell.clientWidth-210,Math.max(12,x+18))+'px';hint.style.top=Math.max(12,y-44)+'px';}
    },
    onTravel(value){
      travelling=value;shell.classList.toggle('is-travelling',value);
      shell.querySelectorAll('button').forEach(button=>button.disabled=value);updateRoom();
    },
    onReady(){document.body.dataset.renderer='webgl';$('#museum-loading').hidden=true;}
  })).then(result=>{
    scene=result;scene.show(current,false);scene.setPaused(exhibit.open||finish.open);
    reduce.addEventListener('change',event=>scene.setReducedMotion(event.matches));
  }).catch(error=>{
    document.body.dataset.renderer='fallback';$('#museum-loading').hidden=true;$('#museum-canvas').hidden=true;$('#rotate-hint').hidden=true;
    console.warn('Museum is using the photographic view.',error.message);
  });
}
