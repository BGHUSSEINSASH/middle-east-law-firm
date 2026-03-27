/* ================================================
   v47 - PREMIUM MOTION GRAPHICS + 3D ILLUSTRATION ENGINE
   Full cinematic animation system for all sections
   Non-destructive: never sets opacity:0 on existing elements
   ================================================ */
(function(){
'use strict';

var raf = requestAnimationFrame;
var $ = function(s,c){ return (c||document).querySelector(s); };
var $$ = function(s,c){ return [].slice.call((c||document).querySelectorAll(s)); };
var isMobile = function(){ return window.innerWidth <= 768; };
var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   1. MORPHING BLOBS - organic animated backgrounds
   ================================================================ */
function initBlobs(){
  var sections = $$('.section, .hero');
  var blobSections = [];
  for(var i = 0; i < sections.length; i++){
    if(sections[i].classList.contains('section--alt') || sections[i].classList.contains('hero')){
      blobSections.push(sections[i]);
    }
  }
  blobSections.forEach(function(sec, si){
    if(sec.querySelector('.mg-blob')) return;
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';
    var positions = [{top:'10%',left:'5%'},{top:'60%',right:'10%'},{top:'30%',left:'50%'}];
    var count = isMobile() ? 1 : 2;
    for(var i = 0; i < count; i++){
      var blob = document.createElement('div');
      blob.className = 'mg-blob mg-blob--' + (i%2===0?'blue':'accent');
      if(i>0) blob.classList.add('mg-blob--'+(i+1));
      var pos = positions[(si+i)%positions.length];
      Object.keys(pos).forEach(function(k){ blob.style[k] = pos[k]; });
      blob.setAttribute('aria-hidden','true');
      sec.appendChild(blob);
    }
  });
}

/* ================================================================
   2. SVG DRAW ANIMATION - service card icons
   ================================================================ */
function initSVGDraw(){
  var svgDefs = {
    building:'M3 21V7l9-4 9 4v14H3zm4-10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z',
    briefcase:'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z',
    heart:'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    gavel:'M1 21h12v2H1v-2zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828L5.245 8.07zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66L12.317 1zM3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657 2.828-2.828z',
    fileContract:'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h5v2H8v-2z',
    comments:'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
  };
  $$('.service-card__icon').forEach(function(iconWrap){
    if(iconWrap.querySelector('.mg-svg-draw')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width','24');
    svg.setAttribute('height','24');
    svg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.15';
    var path = document.createElementNS('http://www.w3.org/2000/svg','path');
    var keys = Object.keys(svgDefs);
    var idx = $$('.service-card__icon').indexOf(iconWrap);
    path.setAttribute('d', svgDefs[keys[idx%keys.length]]);
    path.classList.add('mg-svg-draw');
    svg.appendChild(path);
    iconWrap.style.position = 'relative';
    iconWrap.appendChild(svg);
    raf(function(){
      try{var len=path.getTotalLength();path.style.setProperty('--path-length',len);path.setAttribute('stroke-dasharray',len);path.setAttribute('stroke-dashoffset',len);}catch(e){}
    });
  });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        [].slice.call(e.target.querySelectorAll('.mg-svg-draw')).forEach(function(p){p.classList.add('mg-svg-drawn');});
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.3});
  $$('.service-card__icon').forEach(function(el){obs.observe(el);});
}

/* ================================================================
   3. GLOW RING, SHINE SWEEP, ELASTIC, GRADIENT TEXT, PULSE, REVEAL LINE
   ================================================================ */
function initGlowRings(){
  $$('.pricing-card--featured,.service-card,.monitor-card').forEach(function(el){ if(!el.classList.contains('mg-glow-ring')) el.classList.add('mg-glow-ring'); });
}
function initShineSweep(){
  if(isMobile()) return;
  $$('.team-card,.testi-card,.about__card,.library-cat,.app-feat').forEach(function(el){ if(!el.classList.contains('mg-shine-sweep')) el.classList.add('mg-shine-sweep'); });
}
function initElasticButtons(){
  $$('.btn').forEach(function(btn){ if(!btn.classList.contains('mg-elastic')) btn.classList.add('mg-elastic'); });
}
function initGradientText(){
  var t = $('.hero__title > span:first-child');
  if(t && !t.classList.contains('mg-gradient-text')) t.classList.add('mg-gradient-text');
}
function initPulseRings(){
  $$('.monitor-dot--lg,.chat-avatar__pulse').forEach(function(el){ if(!el.classList.contains('mg-pulse-ring')) el.classList.add('mg-pulse-ring'); });
}
function initRevealLines(){
  $$('.section__title').forEach(function(el){
    if(!el.closest('.hero') && !el.classList.contains('mg-reveal-line')) el.classList.add('mg-reveal-line');
  });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ setTimeout(function(){ e.target.classList.add('mg-reveal-line--visible'); },400); obs.unobserve(e.target); }
    });
  },{threshold:0.3});
  $$('.mg-reveal-line').forEach(function(el){obs.observe(el);});
}

/* ================================================================
   4. SECTION PROGRESS + DATA BARS + SCROLL SNAP
   ================================================================ */
function initSectionProgress(){
  $$('.section').forEach(function(sec){
    if(sec.classList.contains('hero')||sec.querySelector('.mg-section-line')) return;
    var line = document.createElement('div');
    line.className='mg-section-line';
    sec.style.position='relative';
    sec.appendChild(line);
  });
  var lines = $$('.mg-section-line');
  var parents = lines.map(function(l){return l.parentElement;});
  var ticking = false;
  function update(){
    var sy=window.scrollY,wh=window.innerHeight;
    for(var i=0;i<lines.length;i++){
      var r=parents[i].getBoundingClientRect(),st=r.top+sy,sh=parents[i].offsetHeight;
      if(sy+wh>st&&sy<st+sh){var p=(sy+wh-st)/(sh+wh);lines[i].style.width=(Math.max(0,Math.min(1,p))*100)+'%';}
    }
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;raf(update);}},{passive:true});
}
function initDataBars(){
  $$('.monitor-stat').forEach(function(stat){
    if(stat.querySelector('.mg-bar')) return;
    var bar=document.createElement('div');bar.className='mg-bar';
    var fill=document.createElement('div');fill.className='mg-bar__fill';
    bar.style.setProperty('--bar-pct',(70+Math.random()*30)+'%');
    bar.appendChild(fill);stat.appendChild(bar);
  });
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        [].slice.call(e.target.querySelectorAll('.mg-bar')).forEach(function(b,i){setTimeout(function(){b.classList.add('mg-bar--animated');},i*200);});
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.3});
  $$('.monitor-stats').forEach(function(el){obs.observe(el);});
}

/* ================================================================
   5. PARTICLE FIELDS — floating dots in each section
   ================================================================ */
function initParticleFields(){
  if(isMobile()) return;
  var sections = $$('.section, .hero');
  sections.forEach(function(sec){
    if(sec.querySelector('.mg-particle-field')) return;
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';
    var field = document.createElement('div');
    field.className = 'mg-particle-field';
    field.setAttribute('aria-hidden','true');
    var count = sec.classList.contains('hero') ? 12 : 8;
    for(var i=0;i<count;i++){
      var p = document.createElement('span');
      p.className = 'mg-particle';
      p.style.left = (Math.random()*100)+'%';
      p.style.top = (Math.random()*100)+'%';
      p.style.animationDelay = (-Math.random()*20)+'s';
      field.appendChild(p);
    }
    sec.appendChild(field);
  });
}

/* ================================================================
   6. GEOMETRIC DECORATIONS — floating shapes per section
   ================================================================ */
function initGeometricDecos(){
  if(isMobile()) return;
  var geoTypes = ['circle','diamond','triangle','dots','ring','wave'];
  var sections = $$('.section');
  sections.forEach(function(sec, si){
    if(sec.querySelector('.mg-geo')) return;
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';
    var count = 3;
    for(var i=0;i<count;i++){
      var geo = document.createElement('div');
      var type = geoTypes[(si*count+i) % geoTypes.length];
      geo.className = 'mg-geo mg-geo--' + type;
      geo.setAttribute('aria-hidden','true');
      /* random but seeded positioning */
      var positions = [
        {top:'15%',right:'8%'},
        {bottom:'20%',left:'5%'},
        {top:'50%',right:'3%'},
        {top:'10%',left:'12%'},
        {bottom:'10%',right:'15%'},
        {top:'70%',left:'8%'}
      ];
      var pos = positions[(si*count+i) % positions.length];
      Object.keys(pos).forEach(function(k){geo.style[k]=pos[k];});
      geo.style.animationDelay = (-i*4)+'s';
      sec.appendChild(geo);
    }
  });
}

/* ================================================================
   7. ACCENT LINES — subtle decorative lines
   ================================================================ */
function initAccentLines(){
  if(isMobile()) return;
  $$('.section__head').forEach(function(head){
    if(head.querySelector('.mg-accent-line--glow')) return;
    var line = document.createElement('div');
    line.className = 'mg-accent-line mg-accent-line--glow';
    line.setAttribute('aria-hidden','true');
    line.style.cssText = 'position:absolute;bottom:-10px;left:50%;transform:translateX(-50%)';
    head.style.position = 'relative';
    head.appendChild(line);
  });
}

/* ================================================================
   8. CORNER BRACKETS on featured cards
   ================================================================ */
function initCornerBrackets(){
  $$('.pricing-card--featured,.library-cta__box,.chat-box').forEach(function(el){
    if(!el.classList.contains('mg-corners')) el.classList.add('mg-corners');
  });
}

/* ================================================================
   9. CARD TILT GLOW — mouse-follow light effect
   ================================================================ */
function initTiltGlow(){
  if(isMobile()) return;
  $$('.service-card,.pricing-card,.about__card,.library-cat').forEach(function(card){
    if(card.querySelector('.mg-tilt-glow')) return;
    var glow = document.createElement('div');
    glow.className = 'mg-tilt-glow';
    card.style.position = 'relative';
    card.appendChild(glow);
    card.addEventListener('mousemove',function(e){
      var r = card.getBoundingClientRect();
      var x = ((e.clientX-r.left)/r.width*100);
      var y = ((e.clientY-r.top)/r.height*100);
      glow.style.setProperty('--mx',x+'%');
      glow.style.setProperty('--my',y+'%');
      glow.classList.add('mg-tilt-glow--active');
    });
    card.addEventListener('mouseleave',function(){
      glow.classList.remove('mg-tilt-glow--active');
    });
  });
}

/* ================================================================
   10. SECTION CONNECTORS — animated link between sections
   ================================================================ */
function initConnectors(){
  if(isMobile()) return;
  $$('.section').forEach(function(sec){
    if(sec.querySelector('.mg-connector') || sec.classList.contains('hero')) return;
    /* only add to sections that have a next sibling */
    if(!sec.nextElementSibling || !sec.nextElementSibling.classList.contains('section')) return;
    sec.style.position = 'relative';
    var conn = document.createElement('div');
    conn.className = 'mg-connector';
    conn.setAttribute('aria-hidden','true');
    sec.appendChild(conn);
  });
}

/* ================================================================
   11. ANIMATED BORDER on featured elements
   ================================================================ */
function initBorderAnim(){
  $$('.pricing-card--featured,.library-cta__box').forEach(function(el){
    if(!el.classList.contains('mg-border-anim')) el.classList.add('mg-border-anim');
  });
}

/* ================================================================
   12. 3D SVG ILLUSTRATIONS — per section
   Each section gets a floating animated 3D illustration
   ================================================================ */
function init3DIllustrations(){
  if(isMobile()) return;

  var illust = {
    hero: {
      cls:'mg-3d-scales',anim:'mg-illust--float',
      pos:{top:'20%',right:'5%'},
      svg:'<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs><rect x="55" y="15" width="10" height="70" rx="2" fill="url(#g1)" opacity="0.2"/><circle cx="60" cy="15" r="8" fill="url(#g1)" opacity="0.25"/><line x1="20" y1="45" x2="100" y2="45" stroke="url(#g1)" stroke-width="3" opacity="0.2"/><path d="M15 45 L10 70 L40 70 Z" fill="url(#g1)" opacity="0.15"/><path d="M85 45 L80 70 L110 70 Z" fill="url(#g1)" opacity="0.15"/><circle cx="25" cy="65" r="6" fill="none" stroke="#1976D2" stroke-width="1.5" opacity="0.2"><animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite"/></circle><circle cx="95" cy="65" r="6" fill="none" stroke="#1976D2" stroke-width="1.5" opacity="0.2"><animate attributeName="r" values="6;8;6" dur="3s" begin="1.5s" repeatCount="indefinite"/></circle></svg>'
    },
    about: {
      cls:'mg-3d-shield',anim:'mg-illust--float',
      pos:{top:'10%',left:'3%'},
      svg:'<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#1E88E5"/></linearGradient></defs><path d="M60 10 L105 35 L105 75 C105 100 60 130 60 130 C60 130 15 100 15 75 L15 35 Z" fill="url(#g2)" opacity="0.1" stroke="#1976D2" stroke-width="1.5"/><path d="M60 30 L90 45 L90 70 C90 88 60 108 60 108 C60 108 30 88 30 70 L30 45 Z" fill="url(#g2)" opacity="0.08"/><path d="M48 65 L55 75 L78 50" fill="none" stroke="#1976D2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.25"><animate attributeName="stroke-dashoffset" values="50;0" dur="2s" fill="freeze"/></path></svg>'
    },
    services: {
      cls:'mg-3d-gavel',anim:'mg-illust--swing',
      pos:{bottom:'15%',right:'3%'},
      svg:'<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs><rect x="50" y="20" width="20" height="50" rx="4" fill="url(#g3)" opacity="0.15" transform="rotate(-30 60 45)"/><rect x="55" y="60" width="10" height="40" rx="2" fill="url(#g3)" opacity="0.12"/><ellipse cx="60" cy="105" rx="35" ry="5" fill="#1976D2" opacity="0.06"/><circle cx="60" cy="30" r="15" fill="none" stroke="#1976D2" stroke-width="1" opacity="0.12"><animate attributeName="r" values="15;18;15" dur="4s" repeatCount="indefinite"/></circle></svg>'
    },
    laws: {
      cls:'mg-3d-book',anim:'mg-illust--float',
      pos:{top:'12%',right:'4%'},
      svg:'<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#1E88E5"/></linearGradient></defs><rect x="20" y="25" width="80" height="70" rx="4" fill="url(#g4)" opacity="0.1"/><rect x="25" y="20" width="70" height="70" rx="3" fill="url(#g4)" opacity="0.08"/><line x1="60" y1="25" x2="60" y2="90" stroke="#1976D2" stroke-width="1" opacity="0.15"/><line x1="35" y1="40" x2="55" y2="40" stroke="#1976D2" stroke-width="1.5" opacity="0.12"/><line x1="35" y1="50" x2="50" y2="50" stroke="#1976D2" stroke-width="1.5" opacity="0.12"/><line x1="35" y1="60" x2="52" y2="60" stroke="#1976D2" stroke-width="1.5" opacity="0.12"/><line x1="65" y1="40" x2="85" y2="40" stroke="#1976D2" stroke-width="1.5" opacity="0.12"/><line x1="65" y1="50" x2="80" y2="50" stroke="#1976D2" stroke-width="1.5" opacity="0.12"/><circle cx="90" cy="25" r="10" fill="none" stroke="#42a5f5" stroke-width="1" opacity="0.15"><animateTransform attributeName="transform" type="rotate" values="0 90 25;360 90 25" dur="10s" repeatCount="indefinite"/></circle></svg>'
    },
    assistant: {
      cls:'mg-3d-robot',anim:'mg-illust--pulse',
      pos:{top:'8%',right:'3%'},
      svg:'<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs><rect x="30" y="35" width="60" height="50" rx="12" fill="url(#g5)" opacity="0.12"/><circle cx="45" cy="55" r="6" fill="#1976D2" opacity="0.2"><animate attributeName="opacity" values="0.2;0.35;0.2" dur="2s" repeatCount="indefinite"/></circle><circle cx="75" cy="55" r="6" fill="#1976D2" opacity="0.2"><animate attributeName="opacity" values="0.2;0.35;0.2" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle><rect x="48" y="68" width="24" height="4" rx="2" fill="#1976D2" opacity="0.15"/><line x1="60" y1="20" x2="60" y2="35" stroke="#1976D2" stroke-width="2" opacity="0.15"/><circle cx="60" cy="16" r="5" fill="url(#g5)" opacity="0.15"><animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite"/></circle><rect x="15" y="50" width="12" height="5" rx="2" fill="url(#g5)" opacity="0.1"/><rect x="93" y="50" width="12" height="5" rx="2" fill="url(#g5)" opacity="0.1"/></svg>'
    },
    team: {
      cls:'mg-3d-people',anim:'mg-illust--float',
      pos:{bottom:'10%',left:'3%'},
      svg:'<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs><circle cx="50" cy="30" r="12" fill="url(#g6)" opacity="0.12"/><circle cx="90" cy="30" r="12" fill="url(#g6)" opacity="0.12"/><path d="M30 75 C30 55 50 48 50 48 C50 48 70 55 70 75" fill="url(#g6)" opacity="0.08"/><path d="M70 75 C70 55 90 48 90 48 C90 48 110 55 110 75" fill="url(#g6)" opacity="0.08"/><circle cx="70" cy="23" r="14" fill="url(#g6)" opacity="0.15"/><path d="M48 82 C48 58 70 50 70 50 C70 50 92 58 92 82" fill="url(#g6)" opacity="0.1"/></svg>'
    },
    monitor: {
      cls:'mg-3d-server',anim:'mg-illust--pulse',
      pos:{top:'10%',left:'4%'},
      svg:'<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g7" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#1E88E5"/></linearGradient></defs><rect x="15" y="10" width="70" height="30" rx="4" fill="url(#g7)" opacity="0.12"/><rect x="15" y="45" width="70" height="30" rx="4" fill="url(#g7)" opacity="0.1"/><rect x="15" y="80" width="70" height="30" rx="4" fill="url(#g7)" opacity="0.08"/><circle cx="30" cy="25" r="4" fill="#4caf50" opacity="0.3"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="30" cy="60" r="4" fill="#4caf50" opacity="0.3"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" begin="0.5s" repeatCount="indefinite"/></circle><circle cx="30" cy="95" r="4" fill="#4caf50" opacity="0.3"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" begin="1s" repeatCount="indefinite"/></circle><line x1="42" y1="25" x2="72" y2="25" stroke="#1976D2" stroke-width="2" opacity="0.12"/><line x1="42" y1="60" x2="68" y2="60" stroke="#1976D2" stroke-width="2" opacity="0.12"/><line x1="42" y1="95" x2="70" y2="95" stroke="#1976D2" stroke-width="2" opacity="0.12"/></svg>'
    },
    testimonials: {
      cls:'mg-3d-star',anim:'mg-illust--swing',
      pos:{top:'15%',right:'5%'},
      svg:'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g8" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffc107"/><stop offset="100%" stop-color="#ff9800"/></linearGradient></defs><polygon points="50,8 61,35 90,38 68,58 74,88 50,73 26,88 32,58 10,38 39,35" fill="url(#g8)" opacity="0.12" stroke="#ffc107" stroke-width="1" /><polygon points="50,20 57,38 77,40 62,52 66,72 50,63 34,72 38,52 23,40 43,38" fill="url(#g8)" opacity="0.08"/><circle cx="50" cy="50" r="42" fill="none" stroke="#ffc107" stroke-width="0.5" opacity="0.1"><animate attributeName="r" values="42;45;42" dur="4s" repeatCount="indefinite"/></circle></svg>'
    },
    pricing: {
      cls:'mg-3d-gem',anim:'mg-illust--float',
      pos:{top:'8%',left:'3%'},
      svg:'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g9" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="50%" stop-color="#42a5f5"/><stop offset="100%" stop-color="#1E88E5"/></linearGradient></defs><polygon points="50,10 80,35 65,85 35,85 20,35" fill="url(#g9)" opacity="0.1" stroke="#1976D2" stroke-width="1"/><polygon points="50,10 65,35 50,85 35,35" fill="url(#g9)" opacity="0.07"/><line x1="20" y1="35" x2="80" y2="35" stroke="#1976D2" stroke-width="0.8" opacity="0.15"/><line x1="50" y1="10" x2="35" y2="35" stroke="#1976D2" stroke-width="0.5" opacity="0.1"/><line x1="50" y1="10" x2="65" y2="35" stroke="#1976D2" stroke-width="0.5" opacity="0.1"/><circle cx="50" cy="50" r="35" fill="none" stroke="#42a5f5" stroke-width="0.5" opacity="0.08"><animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="20s" repeatCount="indefinite"/></circle></svg>'
    },
    faq: {
      cls:'mg-3d-question',anim:'mg-illust--swing',
      pos:{bottom:'15%',right:'4%'},
      svg:'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g10" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs><circle cx="50" cy="50" r="38" fill="url(#g10)" opacity="0.08" stroke="#1976D2" stroke-width="1"/><text x="50" y="62" text-anchor="middle" font-size="40" font-weight="bold" fill="#1976D2" opacity="0.15">?</text><circle cx="50" cy="50" r="42" fill="none" stroke="#1976D2" stroke-width="0.5" opacity="0.08" stroke-dasharray="5 5"><animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="15s" repeatCount="indefinite"/></circle></svg>'
    },
    contact: {
      cls:'mg-3d-envelope',anim:'mg-illust--float',
      pos:{top:'12%',left:'3%'},
      svg:'<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g11" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#1E88E5"/></linearGradient></defs><rect x="10" y="25" width="100" height="60" rx="6" fill="url(#g11)" opacity="0.1" stroke="#1976D2" stroke-width="1"/><polyline points="10,25 60,60 110,25" fill="none" stroke="#1976D2" stroke-width="1.5" opacity="0.15"/><line x1="10" y1="85" x2="40" y2="55" stroke="#1976D2" stroke-width="0.8" opacity="0.1"/><line x1="110" y1="85" x2="80" y2="55" stroke="#1976D2" stroke-width="0.8" opacity="0.1"/><circle cx="95" cy="20" r="12" fill="#1976D2" opacity="0.12"><animate attributeName="opacity" values="0.12;0.2;0.12" dur="3s" repeatCount="indefinite"/></circle><text x="95" y="25" text-anchor="middle" font-size="14" fill="white" opacity="0.3">1</text></svg>'
    },
    app: {
      cls:'mg-3d-phone',anim:'mg-illust--float',
      pos:{top:'10%',right:'3%'},
      svg:'<svg viewBox="0 0 70 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g12" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs><rect x="5" y="5" width="60" height="110" rx="10" fill="url(#g12)" opacity="0.1" stroke="#1976D2" stroke-width="1.5"/><rect x="10" y="20" width="50" height="75" rx="2" fill="url(#g12)" opacity="0.05"/><rect x="25" y="8" width="20" height="4" rx="2" fill="#1976D2" opacity="0.1"/><circle cx="35" cy="103" r="5" fill="none" stroke="#1976D2" stroke-width="1" opacity="0.12"/><rect x="15" y="30" width="30" height="3" rx="1" fill="#1976D2" opacity="0.08"/><rect x="15" y="38" width="22" height="3" rx="1" fill="#1976D2" opacity="0.06"/><circle cx="52" cy="35" r="8" fill="none" stroke="#42a5f5" stroke-width="0.8" opacity="0.1"><animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/></circle></svg>'
    }
  };

  /* map section IDs */
  var sectionMap = {hero:'hero',about:'about',services:'services',laws:'laws',
    assistant:'assistant',team:'team',monitor:'monitor',testimonials:'testimonials',
    pricing:'pricing',faq:'faq',contact:'contact',app:'app'};

  Object.keys(sectionMap).forEach(function(sectionId){
    var secEl = document.getElementById(sectionId);
    if(!secEl || !illust[sectionId]) return;
    if(secEl.querySelector('.mg-illust')) return;

    var cfg = illust[sectionId];
    var wrapper = document.createElement('div');
    wrapper.className = 'mg-3d-scene';
    wrapper.setAttribute('aria-hidden','true');
    Object.keys(cfg.pos).forEach(function(k){wrapper.style[k]=cfg.pos[k];});

    var obj = document.createElement('div');
    obj.className = 'mg-3d-obj mg-illust ' + cfg.cls + ' ' + cfg.anim;
    obj.innerHTML = cfg.svg;

    wrapper.appendChild(obj);
    secEl.style.position = 'relative';
    secEl.style.overflow = 'hidden';
    secEl.appendChild(wrapper);
  });

  /* parallax on mouse move for 3D illustrations (desktop) */
  if(!isMobile()){
    document.addEventListener('mousemove',function(e){
      var mx = (e.clientX / window.innerWidth - 0.5) * 2;
      var my = (e.clientY / window.innerHeight - 0.5) * 2;
      $$('.mg-3d-scene').forEach(function(scene){
        var r = scene.getBoundingClientRect();
        if(r.top < window.innerHeight && r.bottom > 0){
          var obj = scene.querySelector('.mg-3d-obj');
          if(obj) obj.style.transform = 'rotateY('+(mx*8)+'deg) rotateX('+(-my*5)+'deg)';
        }
      });
    },{passive:true});
  }
}

/* ================================================================
   INIT ALL PREMIUM MOTION GRAPHICS
   ================================================================ */
function initPremiumMotion(){
  if(isReduced) return;

  /* Immediate — lightweight class additions */
  initGradientText();
  initElasticButtons();
  initGlowRings();
  initShineSweep();
  initPulseRings();
  initCornerBrackets();
  initBorderAnim();
  document.documentElement.style.scrollBehavior='smooth';

  /* Delayed 200ms — DOM-creating systems */
  setTimeout(function(){
    initBlobs();
    initSVGDraw();
    initRevealLines();
    initSectionProgress();
    initDataBars();
    initAccentLines();
    initParticleFields();
  }, 200);

  /* Delayed 500ms — heavier decorative systems */
  setTimeout(function(){
    initGeometricDecos();
    init3DIllustrations();
    initConnectors();
    initTiltGlow();
  }, 500);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPremiumMotion);
} else {
  initPremiumMotion();
}

})();