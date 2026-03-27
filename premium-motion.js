/* ================================================
   v45 - PREMIUM CINEMATIC ANIMATION ENGINE
   Non-destructive visual enhancements only
   Blobs, SVG draw, glow, shine, elastic, gradient,
   pulse, reveal lines, data bars, section progress
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
  var sections = $$('.section');
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

    var positions = [
      {top:'10%',left:'5%'},
      {top:'60%',right:'10%'},
      {top:'30%',left:'50%'}
    ];
    var count = isMobile() ? 1 : 2;

    for(var i = 0; i < count; i++){
      var blob = document.createElement('div');
      blob.className = 'mg-blob mg-blob--' + (i % 2 === 0 ? 'blue' : 'accent');
      if(i > 0) blob.classList.add('mg-blob--' + (i + 1));
      var pos = positions[(si + i) % positions.length];
      Object.keys(pos).forEach(function(k){ blob.style[k] = pos[k]; });
      blob.setAttribute('aria-hidden', 'true');
      sec.appendChild(blob);
    }
  });
}

/* ================================================================
   2. SVG DRAW ANIMATION - service card icon draw effect
   ================================================================ */
function initSVGDraw(){
  var svgDefs = {
    building: 'M3 21V7l9-4 9 4v14H3zm4-10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z',
    briefcase: 'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z',
    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    gavel: 'M1 21h12v2H1v-2zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828L5.245 8.07zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66L12.317 1zM3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657 2.828-2.828z',
    fileContract: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h5v2H8v-2z',
    comments: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
  };

  $$('.service-card__icon').forEach(function(iconWrap){
    if(iconWrap.querySelector('.mg-svg-draw')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.15';
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    var keys = Object.keys(svgDefs);
    var idx = $$('.service-card__icon').indexOf(iconWrap);
    var d = svgDefs[keys[idx % keys.length]];
    path.setAttribute('d', d);
    path.classList.add('mg-svg-draw');

    svg.appendChild(path);
    iconWrap.style.position = 'relative';
    iconWrap.appendChild(svg);

    raf(function(){
      try {
        var len = path.getTotalLength();
        path.style.setProperty('--path-length', len);
        path.setAttribute('stroke-dasharray', len);
        path.setAttribute('stroke-dashoffset', len);
      } catch(e){}
    });
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var paths = e.target.querySelectorAll('.mg-svg-draw');
        [].slice.call(paths).forEach(function(p){ p.classList.add('mg-svg-drawn'); });
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.3});

  $$('.service-card__icon').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   3. GLOW RING ON PREMIUM CARDS
   ================================================================ */
function initGlowRings(){
  $$('.pricing-card--featured, .service-card, .monitor-card').forEach(function(el){
    if(!el.classList.contains('mg-glow-ring')) el.classList.add('mg-glow-ring');
  });
}

/* ================================================================
   4. SHINE SWEEP ON CARDS
   ================================================================ */
function initShineSweep(){
  if(isMobile()) return;
  $$('.team-card, .testi-card, .about__card').forEach(function(el){
    if(!el.classList.contains('mg-shine-sweep')) el.classList.add('mg-shine-sweep');
  });
}

/* ================================================================
   5. ELASTIC BUTTON PRESS
   ================================================================ */
function initElasticButtons(){
  $$('.btn').forEach(function(btn){
    if(!btn.classList.contains('mg-elastic')) btn.classList.add('mg-elastic');
  });
}

/* ================================================================
   6. REVEAL LINE - animated underline for section heads
   ================================================================ */
function initRevealLines(){
  $$('.section__title').forEach(function(el){
    if(!el.closest('.hero') && !el.classList.contains('mg-reveal-line')){
      el.classList.add('mg-reveal-line');
    }
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        setTimeout(function(){
          e.target.classList.add('mg-reveal-line--visible');
        }, 400);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.3});

  $$('.mg-reveal-line').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   7. GRADIENT TEXT - animated gradient on hero title
   ================================================================ */
function initGradientText(){
  var heroTitle = $('.hero__title > span:first-child');
  if(heroTitle && !heroTitle.classList.contains('mg-gradient-text')){
    heroTitle.classList.add('mg-gradient-text');
  }
}

/* ================================================================
   8. PULSE RING - on status indicators
   ================================================================ */
function initPulseRings(){
  $$('.monitor-dot--lg, .chat-avatar__pulse').forEach(function(el){
    if(!el.classList.contains('mg-pulse-ring')) el.classList.add('mg-pulse-ring');
  });
}

/* ================================================================
   9. SECTION PROGRESS LINE - per section scroll progress
   ================================================================ */
function initSectionProgress(){
  $$('.section').forEach(function(sec){
    if(sec.classList.contains('hero')) return;
    if(sec.querySelector('.mg-section-line')) return;
    var line = document.createElement('div');
    line.className = 'mg-section-line';
    sec.style.position = 'relative';
    sec.appendChild(line);
  });

  var lines = $$('.mg-section-line');
  var lineSections = lines.map(function(l){ return l.parentElement; });

  var ticking = false;

  function updateLines(){
    var scrollY = window.scrollY;
    var wh = window.innerHeight;

    for(var i = 0; i < lines.length; i++){
      var sec = lineSections[i];
      var rect = sec.getBoundingClientRect();
      var secTop = rect.top + scrollY;
      var secH = sec.offsetHeight;

      if(scrollY + wh > secTop && scrollY < secTop + secH){
        var progress = (scrollY + wh - secTop) / (secH + wh);
        progress = Math.max(0, Math.min(1, progress));
        lines[i].style.width = (progress * 100) + '%';
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; raf(updateLines); }
  }, {passive:true});
}

/* ================================================================
   10. ANIMATED DATA BARS - monitor uptime visualization
   ================================================================ */
function initDataBars(){
  $$('.monitor-stat').forEach(function(stat){
    if(stat.querySelector('.mg-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'mg-bar';
    var fill = document.createElement('div');
    fill.className = 'mg-bar__fill';
    var pct = (70 + Math.random() * 30);
    bar.style.setProperty('--bar-pct', pct + '%');
    bar.appendChild(fill);
    stat.appendChild(bar);
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var bars = e.target.querySelectorAll('.mg-bar');
        [].slice.call(bars).forEach(function(bar, i){
          setTimeout(function(){
            bar.classList.add('mg-bar--animated');
          }, i * 200);
        });
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.3});

  $$('.monitor-stats').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   11. SMOOTH SCROLL
   ================================================================ */
function initScrollSnap(){
  document.documentElement.style.scrollBehavior = 'smooth';
}

/* ================================================================
   INIT ALL PREMIUM SYSTEMS
   ================================================================ */
function initPremiumMotion(){
  if(isReduced) return;

  initGradientText();
  initElasticButtons();
  initGlowRings();
  initShineSweep();
  initPulseRings();
  initScrollSnap();

  setTimeout(function(){
    initBlobs();
    initSVGDraw();
    initRevealLines();
    initSectionProgress();
    initDataBars();
  }, 200);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPremiumMotion);
} else {
  initPremiumMotion();
}

})();