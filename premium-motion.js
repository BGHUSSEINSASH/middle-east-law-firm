/* ================================================
   v45 — PREMIUM CINEMATIC ANIMATION ENGINE
   Advanced motion graphics systems
   Text splits, wipes, blobs, SVG draw, scroll-linked
   ================================================ */
(function(){
'use strict';

var raf = requestAnimationFrame;
var $ = function(s,c){ return (c||document).querySelector(s); };
var $$ = function(s,c){ return [].slice.call((c||document).querySelectorAll(s)); };
var isMobile = function(){ return window.innerWidth <= 768; };
var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   1. SPLIT TEXT REVEAL — word + character staggered animation
   ================================================================ */
function initSplitText(){
  var targets = $$('.section__title, .hero__title > span:first-child');
  targets.forEach(function(el){
    if(el.closest('.hero') && el.classList.contains('hero__rotating-wrap')) return;
    if(el.dataset.mgSplit) return;
    el.dataset.mgSplit = '1';

    var text = el.textContent.trim();
    if(!text) return;
    var words = text.split(/\s+/);
    var html = '';
    var charIndex = 0;

    words.forEach(function(word, wi){
      html += '<span class="mg-split-word">';
      for(var i = 0; i < word.length; i++){
        var delay = (charIndex * 0.03) + 's';
        html += '<span class="mg-split-char" style="transition-delay:' + delay + '">' + word[i] + '</span>';
        charIndex++;
      }
      html += '</span>';
      if(wi < words.length - 1) html += '<span class="mg-split-space"> </span>';
    });

    el.innerHTML = html;
    el.classList.add('mg-split-target');
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('mg-split-revealed');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.2, rootMargin:'0px 0px -40px 0px'});

  $$('.mg-split-target').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   2. SECTION WIPE REVEALS — cinematic clip-path transitions
   ================================================================ */
function initWipeReveals(){
  var wipeTypes = ['mg-wipe', 'mg-wipe--up', 'mg-wipe--center'];
  var grids = $$('.services-grid, .about__visual, .team-grid, .testi-grid, .pricing-grid');

  grids.forEach(function(grid, gi){
    var wipeClass = wipeTypes[gi % wipeTypes.length];
    var items = grid.children;
    for(var i = 0; i < items.length; i++){
      if(!items[i].classList.contains('mg-wipe')){
        items[i].classList.add('mg-wipe');
        if(wipeClass !== 'mg-wipe') items[i].classList.add(wipeClass.replace('mg-wipe--','mg-wipe--'));
      }
    }
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        /* stagger wipes within same parent */
        var parent = e.target.parentElement;
        var siblings = parent ? [].slice.call(parent.querySelectorAll('.mg-wipe:not(.mg-wipe--visible)')) : [];
        var index = siblings.indexOf(e.target);
        setTimeout(function(){
          e.target.classList.add('mg-wipe--visible');
        }, Math.max(0, index) * 120);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.1, rootMargin:'0px 0px -50px 0px'});

  $$('.mg-wipe').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   3. MORPHING BLOBS — organic animated backgrounds
   ================================================================ */
function initBlobs(){
  var sections = $$('.section');
  var blobSections = [];
  for(var i = 0; i < sections.length; i++){
    /* only add to alt sections and hero */
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
   4. SVG DRAW ANIMATION — service card icon draw effect
   ================================================================ */
function initSVGDraw(){
  /* inject SVG icons into service cards for draw animation */
  var svgDefs = {
    building: 'M3 21V7l9-4 9 4v14H3zm4-10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z',
    briefcase: 'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z',
    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    gavel: 'M1 21h12v2H1v-2zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828L5.245 8.07zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66L12.317 1zM3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657 2.828-2.828z',
    fileContract: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h5v2H8v-2z',
    comments: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
  };

  $$('.service-card__icon').forEach(function(iconWrap){
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

    /* calculate path length */
    svg.appendChild(path);
    iconWrap.style.position = 'relative';
    iconWrap.appendChild(svg);

    /* set path length after DOM insertion */
    raf(function(){
      try {
        var len = path.getTotalLength();
        path.style.setProperty('--path-length', len);
        path.setAttribute('stroke-dasharray', len);
        path.setAttribute('stroke-dashoffset', len);
      } catch(e){}
    });
  });

  /* trigger draw on scroll */
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
   5. CINEMATIC HERO ENTRANCE — scale + blur + fade
   ================================================================ */
function initCinemaEntrance(){
  var hero = $('.hero');
  if(!hero) return;
  var badge = $('.hero__badge');
  var title = $('.hero__title');
  var sub = $('.hero__sub');
  var btns = $('.hero__btns');
  var stats = $('.hero__stats');

  var items = [badge, title, sub, btns, stats].filter(Boolean);
  items.forEach(function(el, i){
    el.classList.add('mg-cinema-enter');
    el.style.transitionDelay = (0.2 + i * 0.15) + 's';
  });

  /* trigger after page load */
  function trigger(){
    items.forEach(function(el){ el.classList.add('mg-cinema-visible'); });
  }

  var loader = $('.page-loader');
  if(loader){
    var check = setInterval(function(){
      if(loader.style.display === 'none' || getComputedStyle(loader).opacity === '0'){
        clearInterval(check);
        raf(trigger);
      }
    }, 100);
    setTimeout(trigger, 3500);
  } else {
    setTimeout(trigger, 300);
  }
}

/* ================================================================
   6. SCROLL VELOCITY EFFECTS — dynamic blur/skew on scroll
   ================================================================ */
function initScrollVelocity(){
  if(isMobile() || isReduced) return;
  var heroTitle = $('.hero__title');
  if(!heroTitle) return;

  var lastScroll = 0;
  var velocity = 0;
  var smoothVelocity = 0;

  function onScroll(){
    velocity = Math.abs(window.scrollY - lastScroll);
    lastScroll = window.scrollY;
  }

  window.addEventListener('scroll', onScroll, {passive:true});

  var running = true;
  function loop(){
    if(!running) return;
    smoothVelocity += (velocity - smoothVelocity) * 0.1;
    velocity *= 0.92;

    var blur = Math.min(smoothVelocity * 0.06, 2.5);
    var skew = Math.min(smoothVelocity * 0.03, 1.5);

    if(blur > 0.1){
      heroTitle.style.filter = 'blur(' + blur + 'px)';
      heroTitle.style.transform = 'skewY(' + (window.scrollY > lastScroll ? -skew : skew) + 'deg)';
    } else {
      heroTitle.style.filter = '';
      heroTitle.style.transform = '';
    }

    raf(loop);
  }

  /* only run when hero visible */
  var heroObs = new IntersectionObserver(function(entries){
    running = entries[0].isIntersecting;
    if(running) loop();
  }, {threshold:0});
  var hero = $('.hero');
  if(hero) heroObs.observe(hero);
}

/* ================================================================
   7. SCALE ENTRANCE FOR CARDS — smoother than stagger
   ================================================================ */
function initScaleEntrance(){
  $$('.about__card, .contact-info__card, .library-cat').forEach(function(el){
    el.classList.add('mg-scale-in');
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var siblings = e.target.parentElement
          ? [].slice.call(e.target.parentElement.querySelectorAll('.mg-scale-in'))
          : [e.target];
        var idx = siblings.indexOf(e.target);
        setTimeout(function(){
          e.target.classList.add('mg-scale-visible');
        }, idx * 100);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.15});

  $$('.mg-scale-in').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   8. GLOW RING ON PREMIUM CARDS
   ================================================================ */
function initGlowRings(){
  $$('.pricing-card--featured, .service-card, .monitor-card').forEach(function(el){
    el.classList.add('mg-glow-ring');
  });
}

/* ================================================================
   9. SHINE SWEEP ON CARDS
   ================================================================ */
function initShineSweep(){
  if(isMobile()) return;
  $$('.team-card, .testi-card, .about__card').forEach(function(el){
    el.classList.add('mg-shine-sweep');
  });
}

/* ================================================================
   10. ELASTIC BUTTON PRESS
   ================================================================ */
function initElasticButtons(){
  $$('.btn').forEach(function(btn){
    btn.classList.add('mg-elastic');
  });
}

/* ================================================================
   11. REVEAL LINE — animated underline for section heads
   ================================================================ */
function initRevealLines(){
  $$('.section__title').forEach(function(el){
    if(!el.closest('.hero')) el.classList.add('mg-reveal-line');
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        setTimeout(function(){
          e.target.classList.add('mg-reveal-line--visible');
        }, 400); /* delay to start after text reveal */
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.3});

  $$('.mg-reveal-line').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   12. FADE BLUR ENTRANCE — for text descriptions
   ================================================================ */
function initFadeBlur(){
  $$('.section__sub, .about__content p, .service-card p').forEach(function(el){
    el.classList.add('mg-fade-blur');
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var parent = e.target.parentElement;
        var siblings = parent ? [].slice.call(parent.querySelectorAll('.mg-fade-blur:not(.mg-fade-blur-visible)')) : [];
        var idx = siblings.indexOf(e.target);
        setTimeout(function(){
          e.target.classList.add('mg-fade-blur-visible');
        }, Math.max(0, idx) * 80);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.15, rootMargin:'0px 0px -30px 0px'});

  $$('.mg-fade-blur').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   13. GRADIENT TEXT — animated gradient on hero title
   ================================================================ */
function initGradientText(){
  var heroTitle = $('.hero__title > span:first-child');
  if(heroTitle) heroTitle.classList.add('mg-gradient-text');
}

/* ================================================================
   14. PULSE RING — on status indicators
   ================================================================ */
function initPulseRings(){
  $$('.monitor-dot--lg, .chat-avatar__pulse').forEach(function(el){
    el.classList.add('mg-pulse-ring');
  });
}

/* ================================================================
   15. SLIDE FROM SIDES — alternating entrance
   ================================================================ */
function initSlideFromSides(){
  $$('.about-feat').forEach(function(el, i){
    el.classList.add(i % 2 === 0 ? 'mg-slide-left' : 'mg-slide-right');
    el.style.transitionDelay = (i * 0.1) + 's';
  });

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('mg-slide-visible');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.2});

  $$('.mg-slide-left, .mg-slide-right').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   16. SECTION PROGRESS LINE — per section scroll progress
   ================================================================ */
function initSectionProgress(){
  $$('.section').forEach(function(sec){
    if(sec.classList.contains('hero')) return;
    var line = document.createElement('div');
    line.className = 'mg-section-line';
    sec.style.position = 'relative';
    sec.appendChild(line);
  });

  var lines = $$('.mg-section-line');
  var lineSections = lines.map(function(l){ return l.parentElement; });

  var lastScroll = 0;
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
   17. HORIZONTAL SCROLL SECTION — laws library categories
   ================================================================ */
function initHorizontalScroll(){
  var track = $('.library-categories');
  if(!track || isMobile()) return;

  var container = track.parentElement;
  if(!container) return;

  /* check if there are enough items to warrant horizontal scroll */
  var items = track.children;
  if(items.length < 5) return;

  track.classList.add('mg-hscroll__track');
  container.classList.add('mg-hscroll');
  container.style.height = (items.length * 80) + 'px';

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var rect = container.getBoundingClientRect();
      var progress = -rect.top / (rect.height - window.innerHeight);
      progress = Math.max(0, Math.min(1, progress));
      var maxScroll = track.scrollWidth - container.offsetWidth;
      track.style.transform = 'translateX(' + (-progress * maxScroll) + 'px)';
    });
  }, {threshold:Array.from({length:20}, function(_,i){ return i/20; })});

  /* use scroll position for horizontal movement */
  window.addEventListener('scroll', function(){
    var rect = container.getBoundingClientRect();
    if(rect.top > window.innerHeight || rect.bottom < 0) return;
    var progress = -rect.top / (rect.height - window.innerHeight);
    progress = Math.max(0, Math.min(1, progress));
    var maxScroll = track.scrollWidth - container.offsetWidth;
    track.style.transform = 'translateX(' + (-progress * maxScroll) + 'px)';
  }, {passive:true});
}

/* ================================================================
   18. 3D PERSPECTIVE SPACE — for pricing cards
   ================================================================ */
function init3DPerspective(){
  if(isMobile()) return;
  var pricingGrid = $('.pricing-grid');
  if(pricingGrid) pricingGrid.classList.add('mg-3d-space');

  $$('.pricing-card').forEach(function(card){
    card.classList.add('mg-3d-card');
  });
}

/* ================================================================
   19. ANIMATED DATA BARS — monitor uptime visualization
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
   20. SMOOTH SCROLL SNAP HINT — subtle indicator
   ================================================================ */
function initScrollSnap(){
  /* add smooth scroll behavior globally */
  document.documentElement.style.scrollBehavior = 'smooth';
}

/* ================================================================
   INIT ALL PREMIUM SYSTEMS
   ================================================================ */
function initPremiumMotion(){
  if(isReduced) return; /* respect prefers-reduced-motion */

  initCinemaEntrance();
  initGradientText();
  initElasticButtons();
  initGlowRings();
  initShineSweep();
  initPulseRings();
  initScrollSnap();

  /* delay heavier systems slightly for faster initial paint */
  setTimeout(function(){
    initSplitText();
    initWipeReveals();
    initBlobs();
    initSVGDraw();
    initScaleEntrance();
    initRevealLines();
    initFadeBlur();
    initSlideFromSides();
    initSectionProgress();
    initDataBars();
    init3DPerspective();
  }, 200);

  /* delay non-critical after first paint */
  setTimeout(function(){
    initScrollVelocity();
    initHorizontalScroll();
  }, 800);
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initPremiumMotion);
} else {
  initPremiumMotion();
}

})();
