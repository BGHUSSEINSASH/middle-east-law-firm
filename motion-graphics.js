/* ================================================
   v36 — MOTION GRAPHICS ENGINE
   Advanced animations, parallax, stagger effects
   ================================================ */
(function(){
'use strict';

/* ===== SMOOTH SCROLL PROGRESS BAR ===== */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = (window.scrollY / h) * 100;
  progressBar.style.width = p + '%';
}, {passive: true});

/* ===== MAGNETIC CURSOR (desktop only) ===== */
if(window.innerWidth > 1024){
  const cursor = document.createElement('div');
  cursor.className = 'mg-cursor';
  const cursorDot = document.createElement('div');
  cursorDot.className = 'mg-cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; });
  (function loop(){ cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12; cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a, button, .btn, .glass, .service-card, .about__card, .team-card, .testi-card, .pricing-card, .faq-item, .contact-info__card, .library-cat, .monitor-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('mg-cursor--hover'); cursorDot.classList.add('mg-cursor-dot--hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('mg-cursor--hover'); cursorDot.classList.remove('mg-cursor-dot--hover'); });
  });
}

/* ===== STAGGER REVEAL SYSTEM ===== */
function initStagger(){
  const grids = document.querySelectorAll('.services-grid, .library-stats, .library-categories, .team-grid, .testi-grid, .pricing-grid, .app-stats, .contact-info, .hero__stats, .monitor-grid, .monitor-stats');
  grids.forEach(grid => {
    const children = grid.children;
    for(let i = 0; i < children.length; i++){
      children[i].classList.add('stagger-item');
      children[i].style.setProperty('--stagger', i);
    }
  });
  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('stagger-visible');
        staggerObs.unobserve(e.target);
      }
    });
  }, {threshold: 0.15, rootMargin: '0px 0px -30px 0px'});
  document.querySelectorAll('.stagger-item').forEach(el => staggerObs.observe(el));
}

/* ===== PARALLAX FLOATING SHAPES ===== */
function initParallaxShapes(){
  const sections = document.querySelectorAll('.section');
  sections.forEach((sec, idx) => {
    if(sec.querySelector('.hero__content')) return;
    const shapeContainer = document.createElement('div');
    shapeContainer.className = 'mg-shapes';
    shapeContainer.setAttribute('aria-hidden', 'true');
    const shapes = ['mg-shape--circle', 'mg-shape--ring', 'mg-shape--square'];
    for(let i = 0; i < 3; i++){
      const shape = document.createElement('div');
      shape.className = 'mg-shape ' + shapes[i % 3];
      shape.style.cssText = 'left:' + (10 + Math.random()*80) + '%;top:' + (10 + Math.random()*80) + '%;animation-delay:' + (i*1.2) + 's;animation-duration:' + (12 + Math.random()*8) + 's';
      shapeContainer.appendChild(shape);
    }
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';
    sec.appendChild(shapeContainer);
  });
}

/* ===== TEXT REVEAL ANIMATION ===== */
function initTextReveal(){
  document.querySelectorAll('.section__title').forEach(el => {
    if(!el.closest('.hero')) el.classList.add('mg-text-reveal');
  });
  const textObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('mg-text-revealed');
        textObs.unobserve(e.target);
      }
    });
  }, {threshold: 0.3});
  document.querySelectorAll('.mg-text-reveal').forEach(el => textObs.observe(el));
}

/* ===== TILT EFFECT ON CARDS ===== */
function initTilt(){
  if(window.innerWidth <= 1024) return;
  document.querySelectorAll('.service-card, .pricing-card, .team-card, .about__card, .monitor-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(800px) rotateX(' + (-y*4) + 'deg) rotateY(' + (x*4) + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ===== COUNTER MORPH (enhanced) ===== */
function initMorphCounters(){
  document.querySelectorAll('.monitor-stat__num[data-count]').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting){
        const target = parseInt(el.dataset.count);
        let current = 0;
        const duration = 1800;
        const startTime = performance.now();
        function update(now){
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          current = Math.round(target * eased);
          el.textContent = current.toLocaleString();
          if(progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        obs.unobserve(el);
      }
    }, {threshold: 0.5});
    obs.observe(el);
  });
}

/* ===== GRADIENT BORDER ANIMATION ===== */
function initGradientBorders(){
  document.querySelectorAll('.pricing-card--featured, .library-cta__box').forEach(el => {
    el.classList.add('mg-gradient-border');
  });
}

/* ===== HERO PARALLAX DEPTH ===== */
function initHeroParallax(){
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero__content');
  if(!hero || !heroContent) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if(scrollY > window.innerHeight) return;
    heroContent.style.transform = 'translateY(' + (scrollY * 0.25) + 'px)';
    heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.85));
  }, {passive: true});
}

/* ===== TYPING EFFECT FOR HERO ===== */
function initTypingBadge(){
  const badge = document.querySelector('.hero__badge span');
  if(!badge) return;
  const text = badge.textContent;
  badge.textContent = '';
  badge.style.borderRight = '2px solid rgba(255,255,255,0.5)';
  let i = 0;
  function type(){
    if(i <= text.length){
      badge.textContent = text.substring(0, i);
      i++;
      setTimeout(type, 60);
    } else {
      badge.style.borderRight = 'none';
    }
  }
  setTimeout(type, 800);
}

/* ===== Slack Monitor Live Pulse ===== */
function initSlackMonitor(){
  const statuses = document.querySelectorAll('.monitor-status');
  if(!statuses.length) return;
  statuses.forEach(s => {
    setInterval(() => {
      s.classList.add('monitor-pulse');
      setTimeout(() => s.classList.remove('monitor-pulse'), 600);
    }, 3000 + Math.random() * 2000);
  });
  // Animate the uptime bars
  document.querySelectorAll('.uptime-bar').forEach(bar => {
    const segments = bar.querySelectorAll('.uptime-segment');
    const obs = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting){
        segments.forEach((seg, i) => {
          setTimeout(() => seg.classList.add('uptime-animate'), i * 30);
        });
        obs.unobserve(bar);
      }
    }, {threshold: 0.3});
    obs.observe(bar);
  });
}

/* ===== SMOOTH SECTION TRANSITIONS ===== */
function initSectionTransitions(){
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('section--visible');
      }
    });
  }, {threshold: 0.05, rootMargin: '0px 0px -80px 0px'});
  document.querySelectorAll('.section').forEach(s => sectionObs.observe(s));
}

/* ===== INIT ALL ===== */
function initMotionGraphics(){
  initStagger();
  initParallaxShapes();
  initTextReveal();
  initTilt();
  initMorphCounters();
  initGradientBorders();
  initHeroParallax();
  initTypingBadge();
  initSlackMonitor();
  initSectionTransitions();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initMotionGraphics);
} else {
  initMotionGraphics();
}

})();