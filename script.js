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

  /* ---------- Color swatches (homepage — plain colors, no codes) ---------- */
  const palette = ['#f7f3ea','#e9d9c0','#f4b400','#ff7a45','#ff5a3c','#e8492c','#c0392b','#8a4dd6','#5b3aa3','#2f7de1','#1f5fb5','#0fb5ba','#0a8f88','#1aa05a','#7bbf3a','#d8e0c4','#cfd8e6','#9aa7bd','#54637d','#2b3a55','#16213e','#3a2e28','#7a5c45','#d4a373'];
  const swatchWrap = $('#swatches');
  function renderHomeSwatches(list) {
    if (!swatchWrap || !list || !list.length) return;
    swatchWrap.innerHTML = '';
    const frag = document.createDocumentFragment();
    list.forEach(c => {
      const hex = typeof c === 'string' ? c : (c && c.hex);
      if (!hex) return;
      const d = document.createElement('div');
      d.className = 'swatch';
      d.style.background = hex;
      d.title = hex;
      frag.appendChild(d);
    });
    swatchWrap.appendChild(frag);
  }
  renderHomeSwatches(palette);

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

  /* ---------- Gallery (name on top, photo below; overridden by content/clients.json) ---------- */
  const galleryFallback = [
    {name_ka:'ანაგი',name_en:'Anagi'},{name_ka:'სონეტ ქონსთრაქშენ',name_en:'Sonet Construction'},
    {name_ka:'გალილეო',name_en:'Galileo'},{name_ka:'დელუქს დეველოპმენტი',name_en:'Deluxe Development'},
    {name_ka:'დეველოპმენტ ჯორჯია',name_en:'Development Georgia'},{name_ka:'დრიმ ჰაუსი',name_en:'Dream House'},
    {name_ka:'ბაბილონი',name_en:'Babiloni'},{name_ka:'ანდრია დეველოპმენტი',name_en:'Andria Development'},
    {name_ka:'ფრესკო გრუპი',name_en:'Fresco Group'},{name_ka:'ფორო ბეტონი',name_en:'Foro Beton'},
    {name_ka:'სასტუმრო გუდაური ინ',name_en:'Gudauri Inn Hotel'},{name_ka:'სასტუმრო ათუ',name_en:'ATU Hotel'},
    {name_ka:'გეო გრინი',name_en:'Geo Green'},{name_ka:'ვესადენი',name_en:'Vesadeni'},
    {name_ka:'China Metallurgical Group',name_en:'China Metallurgical Group'},{name_ka:'მშენებელი 7',name_en:'Mshenebeli 7'}
  ];
  const galleryWrap = $('#clientLogos');
  function renderGallery(list) {
    if (!galleryWrap || !list || !list.length) return;
    galleryWrap.innerHTML = '';
    list.forEach(item => {
      const ka = item.name_ka || item.name_en || '';
      const en = item.name_en || item.name_ka || '';
      const card = document.createElement('div');
      card.className = 'gcard';
      const name = document.createElement('div');
      name.className = 'gcard__name';
      setBilingual(name, ka, en);
      name.textContent = ka;
      const photo = document.createElement('div');
      photo.className = 'gcard__photo';
      if (item.image) {
        const im = document.createElement('img');
        im.src = item.image; im.alt = ka; im.loading = 'lazy';
        photo.appendChild(im);
      } else {
        photo.classList.add('is-empty');
        photo.textContent = (ka || '•').trim().charAt(0);
      }
      card.append(name, photo);
      galleryWrap.appendChild(card);
    });
    applyLang(curLang());
    revealNew($$('.gcard', galleryWrap), 40);
  }
  renderGallery(galleryFallback);

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

  /* ---------- Products dropdown menu in the nav (with sub-product flyout) ---------- */
  function renderProductsMenu(items) {
    const menu = document.getElementById('productsMenu');
    if (!menu || !items || !items.length) return;
    menu.innerHTML = '';
    items.forEach((p, i) => {
      if (p.slug === 'color-catalog') return; // colors are handled by the separate "ფერები" link
      const href = p.slug ? ('product.html?id=' + encodeURIComponent(p.slug)) : ('product.html?i=' + i);
      const subs = Array.isArray(p.subproducts) ? p.subproducts.filter(s => s && (s.name_ka || s.name_en)) : [];
      const item = document.createElement('div');
      item.className = 'nav__mitem' + (subs.length ? ' has-sub' : '');
      const a = document.createElement('a');
      a.href = href;
      const t = document.createElement('span');
      setBilingual(t, p.title_ka, p.title_en || p.title_ka);
      t.textContent = p.title_ka || p.title_en || '';
      a.append(t);
      if (subs.length) { const car = document.createElement('span'); car.className = 'nav__mcaret'; car.textContent = '›'; a.appendChild(car); }
      item.appendChild(a);
      if (subs.length) {
        const fly = document.createElement('div'); fly.className = 'nav__flyout';
        subs.forEach(s => {
          const sa = document.createElement('a'); sa.href = href;
          const st = document.createElement('span');
          setBilingual(st, s.name_ka, s.name_en || s.name_ka);
          st.textContent = s.name_ka || s.name_en || '';
          sa.appendChild(st);
          fly.appendChild(sa);
        });
        item.appendChild(fly);
      }
      menu.appendChild(item);
    });
    applyLang(curLang());
  }

  /* ---------- Site texts + contact (overridden by content/settings.json) ---------- */
  function telHref(num) {
    const digits = (num || '').replace(/[^\d]/g, '').replace(/^995/, '');
    return digits ? 'tel:+995' + digits : '#';
  }
  let heroTimer = null;
  function setupHeroSlider(slides) {
    const wrap = document.getElementById('heroSlides');
    const dots = document.getElementById('heroDots');
    const hero = document.querySelector('.hero');
    if (!wrap || !hero || !slides.length) return;
    hero.classList.add('has-slider');
    wrap.innerHTML = ''; if (dots) dots.innerHTML = '';
    slides.forEach((sl, idx) => {
      const d = document.createElement('div');
      d.className = 'hero__slide' + (idx === 0 ? ' active' : '');
      d.style.backgroundImage = sl.image
        ? "linear-gradient(rgba(11,21,48,.66), rgba(11,21,48,.82)), url('" + sl.image + "')"
        : "radial-gradient(120% 120% at 80% -10%,#1a2f66,#0d1b3e)";
      wrap.appendChild(d);
      if (dots && slides.length > 1) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'hero__dot' + (idx === 0 ? ' active' : '');
        b.setAttribute('aria-label', 'Slide ' + (idx + 1));
        b.addEventListener('click', () => go(idx));
        dots.appendChild(b);
      }
    });
    let cur = 0;
    function paint(i) {
      [...wrap.children].forEach((c, k) => c.classList.toggle('active', k === i));
      if (dots) [...dots.children].forEach((c, k) => c.classList.toggle('active', k === i));
      const sl = slides[i];
      setBilingual($('#heroTitleMain'), sl.title_ka, sl.title_en || sl.title_ka);
      setBilingual($('#heroLead'), sl.lead_ka, sl.lead_en || sl.lead_ka);
      applyLang(curLang());
    }
    function go(i) { cur = (i + slides.length) % slides.length; paint(cur); restart(); }
    function restart() { if (heroTimer) clearTimeout(heroTimer); if (slides.length > 1) heroTimer = setTimeout(() => go(cur + 1), 5500); }
    paint(0); restart();
  }

  function applySettings(s) {
    if (!s) return;
    if (s.hero) {
      setBilingual($('#heroTitleMain'), s.hero.title_ka, s.hero.title_en);
      setBilingual($('#heroTitleAccent'), s.hero.title_accent_ka, s.hero.title_accent_en);
      setBilingual($('#heroLead'), s.hero.lead_ka, s.hero.lead_en);
      const hero = document.querySelector('.hero');
      const slides = Array.isArray(s.hero.slides) ? s.hero.slides.filter(sl => sl && (sl.image || sl.title_ka || sl.title_en || sl.lead_ka || sl.lead_en)) : [];
      if (hero) {
        if (slides.length) {
          hero.style.backgroundImage = '';
          hero.classList.remove('has-bg');
          setupHeroSlider(slides);
        } else if (s.hero.image) {
          hero.style.backgroundImage = "linear-gradient(rgba(11,21,48,.74), rgba(11,21,48,.86)), url('" + s.hero.image + "')";
          hero.style.backgroundSize = 'cover';
          hero.style.backgroundPosition = 'center';
          hero.classList.add('has-bg');
        } else {
          hero.style.backgroundImage = '';
          hero.classList.remove('has-bg');
        }
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

  /* ---------- Editable site texts (from /content/texts.json) ---------- */
  function applyTexts(t) {
    if (!t) return;
    $$('[data-key]').forEach(el => {
      const parts = el.getAttribute('data-key').split('.');
      let v = t;
      for (const p of parts) { v = v && v[p]; }
      if (v && (v.ka != null || v.en != null)) setBilingual(el, v.ka, v.en);
    });
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
    loadJSON('content/clients.json'),
    loadJSON('content/texts.json'),
    loadJSON('content/colors.json')
  ]).then(([settings, products, clientsData, texts, colorsData]) => {
    if (texts) applyTexts(texts);
    if (settings) applySettings(settings);
    if (products && Array.isArray(products.items)) renderProducts(products.items);
    if (clientsData && Array.isArray(clientsData.items) && clientsData.items.length) renderGallery(clientsData.items);
    if (colorsData && Array.isArray(colorsData.items) && colorsData.items.length) {
      const items = colorsData.items, n = 24, step = Math.max(1, Math.floor(items.length / n)), sample = [];
      for (let i = 0; i < items.length && sample.length < n; i += step) sample.push(items[i]);
      renderHomeSwatches(sample);
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
