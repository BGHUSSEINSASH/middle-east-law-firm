/* ================================================
   v44 — OPTIMIZED MOTION GRAPHICS ENGINE
   22 animation systems — consolidated scroll, RAF-gated
   ================================================ */
(function(){
'use strict';

/* ===== UTILITIES ===== */
var raf = requestAnimationFrame;
var caf = cancelAnimationFrame;
var $ = function(s,c){ return (c||document).querySelector(s); };
var $$ = function(s,c){ return [].slice.call((c||document).querySelectorAll(s)); };
var lerp = function(a,b,t){ return a + (b - a) * t; };
var _mobile;
var isMobile = function(){ if(_mobile === undefined) _mobile = window.innerWidth <= 1024; return _mobile; };
window.addEventListener('resize', function(){ _mobile = undefined; }, {passive:true});

/* ===== UNIFIED SCROLL BUS — replaces 4 separate listeners ===== */
var scrollBus = [];
var _scrollTick = false;
function registerScroll(fn){ scrollBus.push(fn); }
window.addEventListener('scroll', function(){
  if(_scrollTick) return;
  _scrollTick = true;
  raf(function(){
    var scrollY = window.scrollY;
    for(var i = 0; i < scrollBus.length; i++) scrollBus[i](scrollY);
    _scrollTick = false;
  });
}, {passive:true});

/* ===== TAB VISIBILITY — pause heavy loops when tab hidden ===== */
var tabVisible = true;
document.addEventListener('visibilitychange', function(){
  tabVisible = !document.hidden;
});

/* ================================================================
   1. SCROLL PROGRESS BAR — top of viewport
   ================================================================ */
function initScrollProgress(){
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var lastV = 0;
  registerScroll(function(scrollY){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if(h > 0) bar.style.width = ((scrollY / h) * 100) + '%';
    var v = Math.abs(scrollY - lastV);
    bar.style.height = Math.min(3 + v * 0.04, 6) + 'px';
    lastV = scrollY;
  });
}

/* ================================================================
   2. MAGNETIC CURSOR + CURSOR TRAIL (desktop)
   ================================================================ */
function initCursor(){
  if(isMobile()) return;

  var cursor = document.createElement('div');
  cursor.className = 'mg-cursor';
  var dot = document.createElement('div');
  dot.className = 'mg-cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(dot);

  /* trail particles — reduced from 8 to 5 */
  var TRAIL = 5, trail = [];
  for(var i = 0; i < TRAIL; i++){
    var t = document.createElement('div');
    t.className = 'mg-cursor-trail';
    t.style.opacity = String((1 - i/TRAIL) * 0.25);
    t.style.width = t.style.height = (4 - i * 0.5) + 'px';
    document.body.appendChild(t);
    trail.push({el:t, x:0, y:0});
  }

  var mx = 0, my = 0, cx = 0, cy = 0, cursorActive = false, cursorRaf = 0;
  document.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    if(!cursorActive){ cursorActive = true; cursorLoop(); }
  });

  /* stop cursor loop after 2s idle */
  var idleTimer;
  function resetIdle(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){ cursorActive = false; }, 2000);
  }
  document.addEventListener('mousemove', resetIdle);

  function cursorLoop(){
    if(!cursorActive || !tabVisible){ return; }
    cx = lerp(cx, mx, 0.12);
    cy = lerp(cy, my, 0.12);
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    for(var i = 0; i < trail.length; i++){
      var prev = i === 0 ? {x:cx,y:cy} : trail[i-1];
      trail[i].x = lerp(trail[i].x, prev.x, 0.22);
      trail[i].y = lerp(trail[i].y, prev.y, 0.22);
      trail[i].el.style.left = trail[i].x + 'px';
      trail[i].el.style.top  = trail[i].y + 'px';
    }
    cursorRaf = raf(cursorLoop);
  }

  /* hover targets — delegated instead of per-element */
  document.addEventListener('mouseover', function(e){
    if(e.target.closest('a, button, .btn, .glass, .service-card, .about__card, .team-card, .testi-card, .pricing-card, .faq-item, .contact-info__card, .library-cat, .monitor-card')){
      cursor.classList.add('mg-cursor--hover'); dot.classList.add('mg-cursor-dot--hover');
    }
  });
  document.addEventListener('mouseout', function(e){
    if(e.target.closest('a, button, .btn, .glass, .service-card, .about__card, .team-card, .testi-card, .pricing-card, .faq-item, .contact-info__card, .library-cat, .monitor-card')){
      cursor.classList.remove('mg-cursor--hover'); dot.classList.remove('mg-cursor-dot--hover');
    }
  });

  /* magnetic pull on CTA buttons */
  $$('.btn--primary, .btn--gold, .btn--outline').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width/2;
      var y = e.clientY - r.top - r.height/2;
      btn.style.transform = 'translate(' + (x*0.15) + 'px,' + (y*0.15) + 'px)';
    });
    btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
  });
}

/* ================================================================
   3. STAGGER REVEAL — grid items animate in one-by-one
   ================================================================ */
function initStagger(){
  var grids = $$('.services-grid, .library-stats, .library-categories, .team-grid, .testi-grid, .pricing-grid, .app-stats, .contact-info, .hero__stats, .monitor-grid, .monitor-stats, .about__visual, .about__features');
  grids.forEach(function(grid){
    var ch = grid.children;
    for(var i = 0; i < ch.length; i++){
      ch[i].classList.add('stagger-item');
      ch[i].style.setProperty('--stagger', i);
    }
  });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('stagger-visible'); obs.unobserve(e.target); }
    });
  }, {threshold:0.15, rootMargin:'0px 0px -30px 0px'});
  $$('.stagger-item').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   4. PARALLAX FLOATING SHAPES — subtle background shapes per section
   ================================================================ */
function initParallaxShapes(){
  var shapeTypes = ['mg-shape--circle','mg-shape--ring','mg-shape--square','mg-shape--dot','mg-shape--cross'];
  $$('.section').forEach(function(sec){
    if(sec.querySelector('.hero__content')) return;
    var container = document.createElement('div');
    container.className = 'mg-shapes';
    container.setAttribute('aria-hidden','true');
    var count = 4 + Math.floor(Math.random()*2);
    for(var i = 0; i < count; i++){
      var s = document.createElement('div');
      s.className = 'mg-shape ' + shapeTypes[i % shapeTypes.length];
      s.style.cssText = 'left:' + (5+Math.random()*90) + '%;top:' + (5+Math.random()*90) + '%;animation-delay:' + (i*1.5) + 's;animation-duration:' + (14+Math.random()*10) + 's;--pspeed:' + (0.02+Math.random()*0.03);
      container.appendChild(s);
    }
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';
    sec.appendChild(container);
  });

  /* parallax on scroll (desktop) — cached DOM refs */
  if(!isMobile()){
    var shapes = $$('.mg-shape');
    var shapeSpeeds = shapes.map(function(s){ return parseFloat(s.style.getPropertyValue('--pspeed')) || 0.02; });
    var shapeParents = shapes.map(function(s){ return s.parentElement; });
    registerScroll(function(scrollY){
      for(var i = 0; i < shapes.length; i++){
        var rect = shapeParents[i].getBoundingClientRect();
        shapes[i].style.transform = 'translateY(' + (rect.top * shapeSpeeds[i]) + 'px) rotate(' + (scrollY * shapeSpeeds[i] * 2) + 'deg)';
      }
    });
  }
}

/* ================================================================
   5. TEXT REVEAL — section titles fade+slide into view
   ================================================================ */
function initTextReveal(){
  $$('.section__title').forEach(function(el){
    if(!el.closest('.hero')) el.classList.add('mg-text-reveal');
  });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('mg-text-revealed'); obs.unobserve(e.target); }
    });
  }, {threshold:0.3});
  $$('.mg-text-reveal').forEach(function(el){ obs.observe(el); });
}

/* ================================================================
   6. 3D CARD TILT + SHINE OVERLAY — premium hover effect
   ================================================================ */
function initTilt(){
  if(isMobile()) return;
  $$('.service-card, .pricing-card, .team-card, .about__card, .monitor-card').forEach(function(card){
    /* add shine layer */
    var shine = document.createElement('div');
    shine.className = 'mg-card-shine';
    card.style.position = 'relative';
    card.appendChild(shine);

    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(800px) rotateX(' + (-y*6) + 'deg) rotateY(' + (x*6) + 'deg) translateY(-4px)';
      shine.style.background = 'radial-gradient(circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, rgba(255,255,255,0.07) 0%, transparent 60%)';
    });
    card.addEventListener('mouseleave', function(){
      card.style.transform = '';
      shine.style.background = '';
    });
  });
}

/* ================================================================
   7. COUNTER ANIMATION — hero stats + monitor stats
   ================================================================ */
function initCounters(){
  $$('.hero-stat__num[data-count], .monitor-stat__num[data-count]').forEach(function(el){
    var obs = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){
        var target = parseInt(el.dataset.count, 10);
        var duration = 2000;
        var start = performance.now();
        function tick(now){
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 4);
          el.textContent = Math.round(target * eased).toLocaleString();
          if(progress < 1) raf(tick);
        }
        raf(tick);
        obs.unobserve(el);
      }
    }, {threshold:0.5});
    obs.observe(el);
  });
}

/* ================================================================
   8. GRADIENT BORDER ANIMATION — featured pricing card
   ================================================================ */
function initGradientBorders(){
  $$('.pricing-card--featured, .library-cta__box').forEach(function(el){
    el.classList.add('mg-gradient-border');
  });
}

/* ================================================================
   9. HERO PARALLAX DEPTH + MOUSE PARALLAX
   ================================================================ */
function initHeroParallax(){
  var hero = $('.hero');
  var content = $('.hero__content');
  var particles = $('.hero__particles');
  var canvas = $('.hero__canvas');
  if(!hero || !content) return;
  var wh = window.innerHeight;
  window.addEventListener('resize', function(){ wh = window.innerHeight; }, {passive:true});

  /* scroll parallax — unified bus */
  registerScroll(function(scrollY){
    if(scrollY > wh) return;
    var ratio = scrollY / wh;
    content.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
    content.style.opacity = String(1 - ratio * 1.2);
    if(particles) particles.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
    if(canvas) canvas.style.transform = 'translateY(' + (scrollY * 0.1) + 'px)';
  });

  /* mouse parallax (desktop) */
  if(!isMobile()){
    hero.addEventListener('mousemove', function(e){
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      content.style.setProperty('--mx', (x*8) + 'px');
      content.style.setProperty('--my', (y*8) + 'px');
      if(particles){
        particles.style.setProperty('--mx', (x*-15) + 'px');
        particles.style.setProperty('--my', (y*-15) + 'px');
      }
    });
  }
}

/* ================================================================
   10. TYPING BADGE — typewriter effect on hero badge
   ================================================================ */
function initTypingBadge(){
  var badge = $('.hero__badge span');
  if(!badge) return;
  var text = badge.textContent;
  badge.textContent = '';
  badge.style.borderRight = '2px solid rgba(255,255,255,0.5)';
  var i = 0;
  function type(){
    if(i <= text.length){
      badge.textContent = text.substring(0, i);
      i++;
      setTimeout(type, 50);
    } else {
      setTimeout(function(){ badge.style.borderRight = 'none'; }, 600);
    }
  }
  setTimeout(type, 800);
}

/* ================================================================
   11. MONITOR PULSE — live status blinking
   ================================================================ */
function initSlackMonitor(){
  $$('.monitor-status').forEach(function(s){
    setInterval(function(){
      s.classList.add('monitor-pulse');
      setTimeout(function(){ s.classList.remove('monitor-pulse'); }, 600);
    }, 3000 + Math.random() * 2000);
  });
  /* uptime bar segments */
  $$('.uptime-bar').forEach(function(bar){
    var segs = bar.querySelectorAll('.uptime-segment');
    var obs = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){
        [].slice.call(segs).forEach(function(seg,i){
          setTimeout(function(){ seg.classList.add('uptime-animate'); }, i * 30);
        });
        obs.unobserve(bar);
      }
    }, {threshold:0.3});
    obs.observe(bar);
  });
}

/* ================================================================
   12. SECTION TRANSITIONS — section--visible class
   ================================================================ */
function initSectionTransitions(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting) e.target.classList.add('section--visible');
    });
  }, {threshold:0.05, rootMargin:'0px 0px -80px 0px'});
  $$('.section').forEach(function(s){ obs.observe(s); });
}

/* ================================================================
   13. BUTTON RIPPLE — click ripple effect on all buttons
   ================================================================ */
function initRipple(){
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.btn');
    if(!btn) return;
    var ripple = document.createElement('span');
    ripple.className = 'mg-ripple';
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2;
    ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size/2) + 'px;top:' + (e.clientY - r.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function(){ ripple.remove(); }, 700);
  });
}

/* ================================================================
   14. PAGE LOAD ORCHESTRATION — staggered hero entrance
   ================================================================ */
function initPageLoad(){
  document.body.classList.add('mg-loading');

  var done = false;
  function orchestrate(){
    if(done) return;
    done = true;
    document.body.classList.remove('mg-loading');
    document.body.classList.add('mg-loaded');
    var selectors = ['.hero__badge', '.hero__title', '.hero__sub', '.hero__btns', '.hero__stats'];
    selectors.forEach(function(sel, i){
      var el = $(sel);
      if(el){
        el.style.animationDelay = (0.15 + i * 0.13) + 's';
        el.classList.add('mg-hero-enter');
      }
    });
  }

  /* wait for loader to disappear */
  var check = setInterval(function(){
    var loader = $('.page-loader');
    if(!loader || loader.style.display === 'none' || getComputedStyle(loader).opacity === '0'){
      clearInterval(check);
      raf(orchestrate);
    }
  }, 100);
  /* fallback */
  setTimeout(orchestrate, 4000);
}

/* ================================================================
   15. FLOATING ICON MICRO-ANIMATIONS
   ================================================================ */
function initFloatingIcons(){
  $$('.service-card__icon, .about__card-icon, .monitor-stat__icon').forEach(function(icon, i){
    icon.classList.add('mg-float-icon');
    icon.style.animationDelay = (i * 0.4) + 's';
  });
}

/* ================================================================
   16. HERO SCROLL INDICATOR FADE
   ================================================================ */
function initScrollIndicator(){
  var ind = $('.hero__scroll');
  if(!ind) return;
  registerScroll(function(scrollY){
    ind.classList.toggle('mg-scroll-hidden', scrollY > 100);
  });
}

/* ================================================================
   17. DYNAMIC HERO PARTICLES (JS-injected extras)
   ================================================================ */
function initDynamicParticles(){
  var c = $('.hero__particles');
  if(!c) return;
  for(var i = 0; i < 14; i++){
    var p = document.createElement('span');
    p.className = 'hero__particle hero__particle--dynamic';
    var sz = 2 + Math.random() * 4;
    p.style.cssText = 'left:' + (Math.random()*100) + '%;top:' + (Math.random()*100) + '%;animation-duration:' + (8+Math.random()*16) + 's;animation-delay:' + (Math.random()*10) + 's;width:' + sz + 'px;height:' + sz + 'px;opacity:' + (0.04+Math.random()*0.1);
    c.appendChild(p);
  }
}

/* ================================================================
   18. SECTION NAVIGATION DOTS — right-side dots (desktop)
   ================================================================ */
function initSectionNav(){
  if(isMobile()) return;
  var nav = document.createElement('div');
  nav.className = 'mg-section-nav';
  nav.setAttribute('aria-hidden','true');

  var sections = $$('.section[id]');
  sections.forEach(function(sec){
    var d = document.createElement('div');
    d.className = 'mg-section-dot';
    d.dataset.target = sec.id;
    d.addEventListener('click', function(){ sec.scrollIntoView({behavior:'smooth'}); });
    nav.appendChild(d);
  });
  document.body.appendChild(nav);

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var d = nav.querySelector('[data-target="' + e.target.id + '"]');
      if(d){
        if(e.isIntersecting){
          $$('.mg-section-dot').forEach(function(x){ x.classList.remove('active'); });
          d.classList.add('active');
        }
      }
    });
  }, {threshold:0.3});
  sections.forEach(function(s){ obs.observe(s); });
}

/* ================================================================
   19. TESTIMONIAL AUTO-GLOW — rotating highlight
   ================================================================ */
function initTestiGlow(){
  var cards = $$('.testi-card');
  if(!cards.length) return;
  var idx = 0;
  setInterval(function(){
    cards.forEach(function(c){ c.classList.remove('mg-testi-glow'); });
    cards[idx % cards.length].classList.add('mg-testi-glow');
    idx++;
  }, 3000);
}

/* ================================================================
   20. ABOUT FEATURE LINE-DRAW ICONS
   ================================================================ */
function initLineDrawIcons(){
  $$('.about-feat i').forEach(function(icon){
    icon.classList.add('mg-line-draw');
  });
}

/* ================================================================
   21. SCROLL-TRIGGERED COUNTER FOR ABOUT CARDS
   ================================================================ */
function initAboutCounters(){
  $$('.about__card h3').forEach(function(el){
    var obs = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){
        el.classList.add('mg-about-counted');
        obs.unobserve(el);
      }
    }, {threshold:0.5});
    obs.observe(el);
  });
}

/* ================================================================
   22. ANIMATED BACKGROUND MESH (hero canvas enhancement)
   ================================================================ */
function initBackgroundMesh(){
  var canvas = document.getElementById('heroCanvas');
  if(!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;

  function resize(){
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  /* floating dots connected by lines — optimized: fewer dots, squared distance */
  var DOTS = isMobile() ? 20 : 38;
  var dots = [];
  var w, h;
  function initDots(){
    w = canvas.width / dpr;
    h = canvas.height / dpr;
    dots = [];
    for(var i = 0; i < DOTS; i++){
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 1.5 + Math.random() * 1.5
      });
    }
  }
  initDots();
  window.addEventListener('resize', initDots);

  var mouseX = -1000, mouseY = -1000;
  if(!isMobile()){
    canvas.parentElement.addEventListener('mousemove', function(e){
      var rect = canvas.parentElement.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', function(){
      mouseX = -1000; mouseY = -1000;
    });
  }

  var CONNECT_DIST2 = 120 * 120;   /* squared for faster comparison */
  var MOUSE_DIST2 = 160 * 160;
  var CONNECT_DIST = 120;
  var MOUSE_DIST = 160;

  function draw(){
    ctx.clearRect(0, 0, w, h);

    for(var i = 0; i < dots.length; i++){
      var d = dots[i];
      d.x += d.vx;
      d.y += d.vy;
      if(d.x < 0 || d.x > w) d.vx *= -1;
      if(d.y < 0 || d.y > h) d.vy *= -1;

      /* mouse repulsion — squared distance */
      var dx = d.x - mouseX, dy = d.y - mouseY;
      var dist2 = dx*dx + dy*dy;
      if(dist2 < MOUSE_DIST2 && dist2 > 0){
        var dist = Math.sqrt(dist2);
        d.x += (dx / dist) * 1.5;
        d.y += (dy / dist) * 1.5;
      }

      /* draw dot */
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fill();

      /* connect to nearby dots — skip sqrt when beyond threshold */
      for(var j = i+1; j < dots.length; j++){
        var d2 = dots[j];
        var ddx = d.x - d2.x, ddy = d.y - d2.y;
        var dd2 = ddx*ddx + ddy*ddy;
        if(dd2 < CONNECT_DIST2){
          var dd = Math.sqrt(dd2);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d2.x, d2.y);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.08 * (1 - dd/CONNECT_DIST)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      /* connect to mouse */
      if(dist2 < MOUSE_DIST2){
        var distM = Math.sqrt(dist2);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = 'rgba(66,165,245,' + (0.15 * (1 - distM/MOUSE_DIST)) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  /* only animate when hero is visible AND tab is active */
  var heroVisible = true;
  var meshRaf = 0;
  var heroObs = new IntersectionObserver(function(entries){
    heroVisible = entries[0].isIntersecting;
    if(heroVisible && tabVisible) meshLoop();
  }, {threshold:0});
  heroObs.observe(canvas.parentElement);

  document.addEventListener('visibilitychange', function(){
    if(!document.hidden && heroVisible) meshLoop();
  });

  function meshLoop(){
    if(!heroVisible || !tabVisible){ return; }
    draw();
    meshRaf = raf(meshLoop);
  }
  meshLoop();
}

/* ================================================================
   INIT ALL SYSTEMS
   ================================================================ */
function initMotionGraphics(){
  initScrollProgress();
  initCursor();
  initStagger();
  initParallaxShapes();
  initTextReveal();
  initTilt();
  initCounters();
  initGradientBorders();
  initHeroParallax();
  initTypingBadge();
  initSlackMonitor();
  initSectionTransitions();
  initRipple();
  initPageLoad();
  initFloatingIcons();
  initScrollIndicator();
  initDynamicParticles();
  initSectionNav();
  initTestiGlow();
  initLineDrawIcons();
  initAboutCounters();
  initBackgroundMesh();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initMotionGraphics);
} else {
  initMotionGraphics();
}

})();