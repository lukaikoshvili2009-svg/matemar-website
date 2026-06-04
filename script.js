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

  /* ---------- Client logos ---------- */
  const clients = [
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
  if (logoWrap) {
    clients.forEach(([ka, en]) => {
      const a = document.createElement('div');
      a.className = 'logo';
      a.innerHTML = `<span data-ka="${ka}" data-en="${en}">${ka}</span>`;
      logoWrap.appendChild(a);
    });
    // re-apply language so the freshly created logos pick up current language
    applyLang(curLang());
    // re-register reveal for the new logos
    if ('IntersectionObserver' in window) {
      const lio = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
      }, { threshold: 0.12 });
      $$('.logo', logoWrap).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = (i % 8) * 40 + 'ms';
        lio.observe(el);
      });
    }
  }

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
