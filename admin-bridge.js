/* ===== ADMIN BRIDGE - Applies admin panel settings to live pages ===== */
(function(){
'use strict';

// Apply appearance settings (colors, radius)
function applyAppearance(){
  try {
    var data = JSON.parse(localStorage.getItem('me_appearance'));
    if(!data) return;
    var root = document.documentElement;
    if(data.primary) root.style.setProperty('--primary', data.primary);
    if(data.accent) root.style.setProperty('--accent', data.accent);
    if(data.success) root.style.setProperty('--success', data.success);
    if(data.danger) root.style.setProperty('--danger', data.danger);
    if(data.radius) root.style.setProperty('--radius', data.radius + 'px');
  } catch(e){}
}

// Apply pricing settings
function applyPricing(){
  try {
    var data = JSON.parse(localStorage.getItem('me_pricing'));
    if(!data) return;
    var cards = document.querySelectorAll('.pricing-card');
    cards.forEach(function(card){
      var tier = card.dataset.tier;
      if(tier && data[tier]){
        var amountEl = card.querySelector('.pricing-card__amount');
        if(amountEl && data[tier].price){
          amountEl.setAttribute('data-monthly', data[tier].price);
          amountEl.textContent = data[tier].price;
        }
        if(amountEl && data[tier].priceYearly){
          amountEl.setAttribute('data-yearly', data[tier].priceYearly);
        }
      }
    });
  } catch(e){}
}

// Apply contact info
function applyContact(){
  try {
    var data = JSON.parse(localStorage.getItem('me_content_contact'));
    if(!data) return;
    if(data.phone){
      document.querySelectorAll('[data-admin="phone"]').forEach(function(el){ el.textContent = data.phone; });
    }
    if(data.email){
      document.querySelectorAll('[data-admin="email"]').forEach(function(el){ el.textContent = data.email; });
    }
    if(data.address){
      document.querySelectorAll('[data-admin="address"]').forEach(function(el){ el.textContent = data.address; });
    }
    if(data.hours){
      document.querySelectorAll('[data-admin="hours"]').forEach(function(el){ el.textContent = data.hours; });
    }
    if(data.whatsapp){
      document.querySelectorAll('.whatsapp-float').forEach(function(el){
        el.href = 'https://wa.me/' + data.whatsapp.replace(/[^0-9]/g, '');
      });
    }
  } catch(e){}
}

// Apply hero stats
function applyHeroStats(){
  try {
    var data = JSON.parse(localStorage.getItem('me_content_hero'));
    if(!data) return;
    if(data.cases){
      var el = document.querySelector('.hero-stat__num[data-count]');
      if(el && el.closest('.hero-stat')){
        var stats = document.querySelectorAll('.hero-stat__num');
        if(stats[0] && data.cases) stats[0].setAttribute('data-count', data.cases);
        if(stats[1] && data.successRate) stats[1].setAttribute('data-count', data.successRate);
        if(stats[2] && data.years) stats[2].setAttribute('data-count', data.years);
        if(stats[3] && data.clients) stats[3].setAttribute('data-count', data.clients);
      }
    }
  } catch(e){}
}

// Apply team members (dynamic)
function applyTeam(){
  try {
    var data = JSON.parse(localStorage.getItem('me_content_team'));
    if(!data || !data.length) return;
    var grid = document.querySelector('.team-grid');
    if(!grid) return;
    // Remove old dynamic members (keep static director cards)
    var old = grid.querySelectorAll('.team-card-dynamic');
    old.forEach(function(el){ el.remove(); });
    // Append new members from admin panel
    data.forEach(function(member, idx){
      var card = document.createElement('div');
      card.className = 'team-card team-card-dynamic glass reveal-up revealed';
      card.innerHTML = '<div class="team-card__photo"><div class="team-avatar"><i class="fas fa-user-tie"></i></div></div>'
        + '<h3>' + escapeText(member.name) + '</h3>'
        + '<p class="team-role">' + escapeText(member.role) + '</p>'
        + '<p class="team-desc">' + escapeText(member.desc) + '</p>'
        + '<div class="team-card__social">'
        + (member.linkedin ? '<a href="' + escapeAttr(member.linkedin) + '"><i class="fab fa-linkedin-in"></i></a>' : '')
        + (member.email ? '<a href="mailto:' + escapeAttr(member.email) + '"><i class="fas fa-envelope"></i></a>' : '')
        + (member.whatsapp ? '<a href="https://wa.me/' + escapeAttr(member.whatsapp) + '"><i class="fab fa-whatsapp"></i></a>' : '')
        + '</div>';
      grid.appendChild(card);
    });
  } catch(e){}
}

// Apply services
function applyServices(){
  try {
    var data = JSON.parse(localStorage.getItem('me_content_services'));
    if(!data || !data.length) return;
    var grid = document.querySelector('.services-grid');
    if(!grid) return;
    grid.innerHTML = '';
    var icons = ['fa-building','fa-chart-line','fa-users','fa-gavel','fa-balance-scale','fa-file-contract','fa-passport','fa-briefcase'];
    data.forEach(function(svc, idx){
      var card = document.createElement('div');
      card.className = 'service-card glass reveal-up revealed';
      card.innerHTML = '<div class="service-card__icon"><i class="fas ' + (svc.icon || icons[idx % icons.length]) + '"></i></div>'
        + '<h3>' + escapeText(svc.title) + '</h3>'
        + '<p>' + escapeText(svc.desc) + '</p>';
      grid.appendChild(card);
    });
  } catch(e){}
}

// Apply testimonials
function applyTestimonials(){
  try {
    var data = JSON.parse(localStorage.getItem('me_content_testimonials'));
    if(!data || !data.length) return;
    var grid = document.querySelector('.testi-grid');
    if(!grid) return;
    grid.innerHTML = '';
    data.forEach(function(t){
      var card = document.createElement('div');
      card.className = 'testi-card glass';
      var stars = '';
      for(var i=0; i<5; i++) stars += '<i class="fas fa-star"></i>';
      card.innerHTML = '<div class="testi-stars">' + stars + '</div>'
        + '<p>' + escapeText(t.text) + '</p>'
        + '<div class="testi-author"><div class="testi-av"><i class="fas fa-user"></i></div>'
        + '<div><h4>' + escapeText(t.name) + '</h4><small>' + escapeText(t.role) + '</small></div></div>';
      grid.appendChild(card);
    });
  } catch(e){}
}

// Apply FAQ items
function applyFAQ(){
  try {
    var data = JSON.parse(localStorage.getItem('me_content_faq'));
    if(!data || !data.length) return;
    var list = document.querySelector('.faq-list');
    if(!list) return;
    list.innerHTML = '';
    data.forEach(function(item){
      var el = document.createElement('div');
      el.className = 'faq-item glass';
      el.innerHTML = '<button class="faq-q"><span>' + escapeText(item.q) + '</span><i class="fas fa-chevron-down"></i></button>'
        + '<div class="faq-a"><p>' + escapeText(item.a) + '</p></div>';
      el.querySelector('.faq-q').addEventListener('click', function(){
        el.classList.toggle('active');
      });
      list.appendChild(el);
    });
  } catch(e){}
}

// Helper: escape text for safe display
function escapeText(str){
  if(!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Helper: escape for attribute
function escapeAttr(str){
  if(!str) return '';
  return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Run all on page load
function applyAll(){
  applyAppearance();
  applyPricing();
  applyContact();
  applyHeroStats();
  applyTeam();
  applyServices();
  applyTestimonials();
  applyFAQ();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', applyAll);
} else {
  applyAll();
}

})();
