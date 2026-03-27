/* ================================================
   v43 — COMPLETE MOTION GRAPHICS ENGINE
   Professional animated-video-like experience
   22 animation systems — law firm website
   ================================================ */
(function(){
'use strict';

/* ===== UTILITIES ===== */
var raf = requestAnimationFrame;
var $ = function(s,c){ return (c||document).querySelector(s); };
var $$ = function(s,c){ return [].slice.call((c||document).querySelectorAll(s)); };
var lerp = function(a,b,t){ return a + (b - a) * t; };
var isMobile = function(){ return window.innerWidth <= 1024; };

/* ================================================================
   1. SCROLL PROGRESS BAR — top of viewport
   ================================================================ */
function initScrollProgress(){
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var lastV = 0;
  window.addEventListener('scroll', function(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if(h > 0) bar.style.width = ((window.scrollY / h) * 100) + '%';
    /* thicken bar on fast scroll */
    var v = Math.abs(window.scrollY - lastV);
    bar.style.height = Math.min(3 + v * 0.04, 6) + 'px';
    lastV = window.scrollY;
  }, {passive:true});
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

  /* trail particles */
  var TRAIL = 8, trail = [];
  for(var i = 0; i < TRAIL; i++){
    var t = document.createElement('div');
    t.className = 'mg-cursor-trail';
    t.style.opacity = String((1 - i/TRAIL) * 0.25);
    t.style.width = t.style.height = (4 - i * 0.35) + 'px';
    document.body.appendChild(t);
    trail.push({el:t, x:0, y:0});
  }

  var mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  (function loop(){
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
    raf(loop);
  })();

  /* hover targets */
  var targets = $$('a, button, .btn, .glass, .service-card, .about__card, .team-card, .testi-card, .pricing-card, .faq-item, .contact-info__card, .library-cat, .monitor-card');
  targets.forEach(function(el){
    el.addEventListener('mouseenter', function(){ cursor.classList.add('mg-cursor--hover'); dot.classList.add('mg-cursor-dot--hover'); });
    el.addEventListener('mouseleave', function(){ cursor.classList.remove('mg-cursor--hover'); dot.classList.remove('mg-cursor-dot--hover'); });
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

  /* parallax on scroll (desktop) */
  if(!isMobile()){
    window.addEventListener('scroll', function(){
      var scrollY = window.scrollY;
      $$('.mg-shape').forEach(function(shape){
        var speed = parseFloat(shape.style.getPropertyValue('--pspeed')) || 0.02;
        var rect = shape.parentElement.getBoundingClientRect();
        shape.style.transform = 'translateY(' + (rect.top * speed) + 'px) rotate(' + (scrollY * speed * 2) + 'deg)';
      });
    }, {passive:true});
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

  /* scroll parallax */
  window.addEventListener('scroll', function(){
    var scrollY = window.scrollY;
    if(scrollY > window.innerHeight) return;
    var ratio = scrollY / window.innerHeight;
    content.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
    content.style.opacity = String(1 - ratio * 1.2);
    if(particles) particles.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
    if(canvas) canvas.style.transform = 'translateY(' + (scrollY * 0.1) + 'px)';
  }, {passive:true});

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
  window.addEventListener('scroll', function(){
    ind.classList.toggle('mg-scroll-hidden', window.scrollY > 100);
  }, {passive:true});
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

  /* floating dots connected by lines */
  var DOTS = isMobile() ? 30 : 55;
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

  function draw(){
    ctx.clearRect(0, 0, w, h);
    var CONNECT_DIST = 120;
    var MOUSE_DIST = 160;

    for(var i = 0; i < dots.length; i++){
      var d = dots[i];
      d.x += d.vx;
      d.y += d.vy;
      if(d.x < 0 || d.x > w) d.vx *= -1;
      if(d.y < 0 || d.y > h) d.vy *= -1;

      /* mouse repulsion */
      var dx = d.x - mouseX, dy = d.y - mouseY;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < MOUSE_DIST && dist > 0){
        d.x += (dx / dist) * 1.5;
        d.y += (dy / dist) * 1.5;
      }

      /* draw dot */
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fill();

      /* connect to nearby dots */
      for(var j = i+1; j < dots.length; j++){
        var d2 = dots[j];
        var ddx = d.x - d2.x, ddy = d.y - d2.y;
        var dd = Math.sqrt(ddx*ddx + ddy*ddy);
        if(dd < CONNECT_DIST){
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d2.x, d2.y);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.08 * (1 - dd/CONNECT_DIST)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      /* connect to mouse */
      if(dist < MOUSE_DIST){
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = 'rgba(66,165,245,' + (0.15 * (1 - dist/MOUSE_DIST)) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    raf(draw);
  }

  /* only animate when hero is visible */
  var heroVisible = true;
  var heroObs = new IntersectionObserver(function(entries){
    heroVisible = entries[0].isIntersecting;
  }, {threshold:0});
  heroObs.observe(canvas.parentElement);

  (function loop(){
    if(heroVisible) draw();
    raf(loop);
  })();
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