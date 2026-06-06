/* ===== Matemar — site interactions ===== */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Language toggle (ka / en) ---------- */
  const STORAGE_KEY = 'matemar-lang';
  const labels = {
    ka: { back: 'ზემოთ', sent: 'მადლობა! მალე დაგიკავშირდებით.', fill: 'გთხოვთ შეავსოთ სახელი და ტელეფონი.' },
    en: { back: 'Top', sent: 'Thank you! We will contact you shortly.', fill: 'Please fill in your name and phone.' }
  };

  function applyLang(lang) {
    document.documentElement.lang = lang;
    $$('[data-ka]').forEach(el => {
      const val = el.getAttribute('data-' + lang);
      if (val !== null) el.textContent = val;
    });
    $$('.lang__btn').forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.dataset.lang = lang;
  }

  let initial = 'ka';
  try { initial = localStorage.getItem(STORAGE_KEY) || 'ka'; } catch (e) {}
  applyLang(initial);

  $$('.lang__btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  const curLang = () => document.documentElement.dataset.lang || 'ka';

  /* ---------- Mobile nav ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  if (burger && nav) {
    const toggle = (open) => {
      const isOpen = open ?? !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', isOpen);
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    };
    burger.addEventListener('click', () => toggle());
    $$('a', nav).forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ---------- Header shadow on scroll + back to top ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.classList.toggle('is-visible', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = [
    '.about__content', '.about__media', '.pcard', '.vv__card',
    '.step', '.logo', '.swatch', '.section__head', '.contact__info', '.contact__form-wrap'
  ];
  const toReveal = $$(revealTargets.join(','));
  toReveal.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 8) * 50 + 'ms';
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    toReveal.forEach(el => io.observe(el));
  } else {
    toReveal.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const isYear = target > 1900;
    const dur = 1400;
    const start = performance.now();
    const from = isYear ? target - 25 : 0;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (target - from) * eased);
      el.textContent = val + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- Color swatches ---------- */
  const palette = [
    ['#f7f3ea', 'Cream'], ['#e9d9c0', 'Sand'], ['#f4b400', 'Amber'], ['#ff7a45', 'Coral'],
    ['#ff5a3c', 'Sunset'], ['#e8492c', 'Brick'], ['#c0392b', 'Crimson'], ['#8a4dd6', 'Violet'],
    ['#5b3aa3', 'Indigo'], ['#2f7de1', 'Azure'], ['#1f5fb5', 'Cobalt'], ['#0fb5ba', 'Teal'],
    ['#0a8f88', 'Pine'], ['#1aa05a', 'Emerald'], ['#7bbf3a', 'Lime'], ['#d8e0c4', 'Sage'],
    ['#cfd8e6', 'Mist'], ['#9aa7bd', 'Slate'], ['#54637d', 'Steel'], ['#2b3a55', 'Navy'],
    ['#16213e', 'Ink'], ['#3a2e28', 'Espresso'], ['#7a5c45', 'Walnut'], ['#d4a373', 'Caramel']
  ];
  const isLight = (hex) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  };
  const swatchWrap = $('#swatches');
  if (swatchWrap) {
    palette.forEach(([hex, name]) => {
      const d = document.createElement('div');
      d.className = 'swatch' + (isLight(hex) ? ' is-light' : '');
      d.style.background = hex;
      d.title = name + ' ' + hex;
      d.innerHTML = `<span>${hex.toUpperCase()}</span>`;
      swatchWrap.appendChild(d);
    });
  }

  /* ---------- Reveal helper for dynamically added nodes ---------- */
  function revealNew(els, stepMs) {
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i % 8) * (stepMs || 40) + 'ms'; io2.observe(el); });
  }

  function setBilingual(el, ka, en) {
    if (!el) return;
    if (ka != null && ka !== '') el.setAttribute('data-ka', ka);
    if (en != null && en !== '') el.setAttribute('data-en', en);
  }

  /* ---------- Client logos (fallback list; overridden by content/clients.json) ---------- */
  const clientsFallback = [
    ['ანაგი', 'Anagi'], ['სონეტ ქონსთრაქშენ', 'Sonet Construction'],
    ['გალილეო', 'Galileo'], ['დელუქს დეველოპმენტი', 'Deluxe Development'],
    ['დეველოპმენტ ჯორჯია', 'Development Georgia'], ['დრიმ ჰაუსი', 'Dream House'],
    ['ბაბილონი', 'Babiloni'], ['ანდრია დეველოპმენტი', 'Andria Development'],
    ['ფრესკო გრუპი', 'Fresco Group'], ['ფორო ბეტონი', 'Foro Beton'],
    ['სასტუმრო გუდაური ინ', 'Gudauri Inn Hotel'], ['სასტუმრო ათუ', 'ATU Hotel'],
    ['გეო გრინი', 'Geo Green'], ['ვესადენი', 'Vesadeni'],
    ['China Metallurgical Group', 'China Metallurgical Group'], ['მშენებელი 7', 'Mshenebeli 7']
  ];
  const logoWrap = $('#clientLogos');
  function renderClients(list) {
    if (!logoWrap || !list || !list.length) return;
    logoWrap.innerHTML = '';
    list.forEach(([ka, en]) => {
      const a = document.createElement('div');
      a.className = 'logo';
      const span = document.createElement('span');
      setBilingual(span, ka, en || ka);
      span.textContent = ka;
      a.appendChild(span);
      logoWrap.appendChild(a);
    });
    applyLang(curLang());
    revealNew($$('.logo', logoWrap), 40);
  }
  renderClients(clientsFallback);

  /* ---------- Products (overridden by content/products.json) ---------- */
  const productsGrid = $('#productsGrid');
  function renderProducts(items) {
    if (!productsGrid || !items || !items.length) return;
    productsGrid.innerHTML = '';
    items.forEach((p, i) => {
      const art = document.createElement('a');
      art.className = 'pcard';
      art.href = p.slug ? ('product.html?id=' + encodeURIComponent(p.slug)) : ('product.html?i=' + i);
      art.style.setProperty('--accent', p.color || '#2f7de1');
      const icon = document.createElement('div');
      icon.className = 'pcard__icon';
      icon.textContent = p.icon || '🎨';
      const h3 = document.createElement('h3');
      setBilingual(h3, p.title_ka, p.title_en || p.title_ka);
      h3.textContent = p.title_ka || p.title_en || '';
      const desc = document.createElement('p');
      setBilingual(desc, p.desc_ka, p.desc_en || p.desc_ka);
      desc.textContent = p.desc_ka || p.desc_en || '';
      const more = document.createElement('span');
      more.className = 'pcard__more';
      setBilingual(more, 'ვრცლად →', 'Learn more →');
      more.textContent = 'ვრცლად →';
      art.append(icon, h3, desc, more);
      productsGrid.appendChild(art);
    });
    applyLang(curLang());
    revealNew($$('.pcard', productsGrid), 50);
    renderProductsMenu(items);
  }

  /* ---------- Products dropdown menu in the nav ---------- */
  function renderProductsMenu(items) {
    const menu = document.getElementById('productsMenu');
    if (!menu || !items || !items.length) return;
    menu.innerHTML = '';
    items.forEach((p, i) => {
      const a = document.createElement('a');
      a.href = p.slug ? ('product.html?id=' + encodeURIComponent(p.slug)) : ('product.html?i=' + i);
      const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = p.color || '#2f7de1';
      const t = document.createElement('span');
      setBilingual(t, p.title_ka, p.title_en || p.title_ka);
      t.textContent = p.title_ka || p.title_en || '';
      a.append(dot, t);
      menu.appendChild(a);
    });
    applyLang(curLang());
  }

  /* ---------- Site texts + contact (overridden by content/settings.json) ---------- */
  function telHref(num) {
    const digits = (num || '').replace(/[^\d]/g, '').replace(/^995/, '');
    return digits ? 'tel:+995' + digits : '#';
  }
  function applySettings(s) {
    if (!s) return;
    if (s.hero) {
      setBilingual($('#heroTitleMain'), s.hero.title_ka, s.hero.title_en);
      setBilingual($('#heroTitleAccent'), s.hero.title_accent_ka, s.hero.title_accent_en);
      setBilingual($('#heroLead'), s.hero.lead_ka, s.hero.lead_en);
      const heroImg = $('#heroImage'), heroVis = $('#heroVisual');
      if (heroImg && heroVis) {
        if (s.hero.image) { heroImg.src = s.hero.image; heroVis.classList.add('has-photo'); }
        else { heroVis.classList.remove('has-photo'); }
      }
    }
    if (s.about) {
      setBilingual($('#aboutP1'), s.about.p1_ka, s.about.p1_en);
      setBilingual($('#aboutP2'), s.about.p2_ka, s.about.p2_en);
      setBilingual($('#visionText'), s.about.vision_ka, s.about.vision_en);
      setBilingual($('#valuesText'), s.about.values_ka, s.about.values_en);
    }
    if (s.contact) {
      const c = s.contact;
      if (c.phone1) { $$('.js-phone1').forEach(el => el.textContent = c.phone1); $$('.js-tel1').forEach(a => a.href = telHref(c.phone1)); }
      if (c.phone2) { $$('.js-phone2').forEach(el => el.textContent = c.phone2); $$('.js-tel2').forEach(a => a.href = telHref(c.phone2)); }
      if (c.email)  { $$('.js-email').forEach(el => el.textContent = c.email); $$('.js-mail').forEach(a => a.href = 'mailto:' + c.email); }
      if (c.facebook) $$('.js-fb').forEach(a => a.href = c.facebook);
      setBilingual($('#contactAddress'), c.address_ka, c.address_en);
    }
    applyLang(curLang());
  }

  /* ---------- Load editable content from /content/*.json ---------- */
  function loadJSON(path) {
    return fetch(path, { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  Promise.all([
    loadJSON('content/settings.json'),
    loadJSON('content/products.json'),
    loadJSON('content/clients.json')
  ]).then(([settings, products, clientsData]) => {
    if (settings) applySettings(settings);
    if (products && Array.isArray(products.items)) renderProducts(products.items);
    if (clientsData && Array.isArray(clientsData.items) && clientsData.items.length) {
      renderClients(clientsData.items.map(c => [c.name_ka || c.name_en || '', c.name_en || c.name_ka || '']));
    }
  });

  /* ---------- Contact form (client-side only) ---------- */
  const form = $('#contactForm');
  const hint = $('#formHint');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name').value.trim();
      const phone = $('#phone').value.trim();
      const l = curLang();
      if (!name || !phone) {
        hint.textContent = labels[l].fill;
        hint.className = 'form__hint err';
        return;
      }
      hint.textContent = labels[l].sent;
      hint.className = 'form__hint ok';
      form.reset();
    });
  }
})();
