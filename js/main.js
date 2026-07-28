/* Golden Hive — navigation, scroll reveal, stat counters, reviews slider, form */
(function () {
  'use strict';

  /* ---------- Sticky header shadow ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  function closeNav() {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mainNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) closeNav();
  });

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

  function observeReveals(root = document) {
    root.querySelectorAll('.reveal, .reveal-scale').forEach((el) => revealObserver.observe(el));
  }
  observeReveals();

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      counterObserver.unobserve(entry.target);
      animateCount(entry.target, parseInt(entry.target.dataset.count, 10));
    }
  }, { threshold: 0.6 });
  counters.forEach((c) => counterObserver.observe(c));

  function animateCount(el, target) {
    const DURATION = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + '+';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Active nav highlighting ---------- */
  const sections = ['catalog', 'about', 'delivery', 'reviews', 'contacts']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = new Map(
    [...document.querySelectorAll('.main-nav a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a])
  );

  const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const link = navLinks.get(entry.target.id);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Reviews slider ---------- */
  const track = document.getElementById('reviewTrack');
  const prev = document.getElementById('revPrev');
  const next = document.getElementById('revNext');

  if (track && prev && next) {
    const cardStride = () => {
      const card = track.querySelector('.review-card');
      return card ? card.getBoundingClientRect().width + 22 : 340;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -cardStride(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: cardStride(), behavior: 'smooth' }));
  }

  /* ---------- Contact form (client-side demo validation) ---------- */
  const form = document.getElementById('orderForm');
  if (!form) return;

  const nameInput = document.getElementById('fName');
  const phoneInput = document.getElementById('fPhone');
  const errName = document.getElementById('errName');
  const errPhone = document.getElementById('errPhone');
  const successMsg = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('formSubmit');

  const PHONE_RE = /^[+\d][\d\s().-]{6,18}$/;

  function setError(input, errEl, message) {
    errEl.textContent = message;
    input.classList.toggle('invalid', Boolean(message));
    return !message;
  }

  function validateName() {
    return setError(nameInput, errName, nameInput.value.trim().length >= 2 ? '' : 'Please enter your name.');
  }

  function validatePhone() {
    return setError(
      phoneInput, errPhone,
      PHONE_RE.test(phoneInput.value.trim()) ? '' : 'Please enter a valid phone number.'
    );
  }

  nameInput.addEventListener('blur', validateName);
  phoneInput.addEventListener('blur', validatePhone);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const okName = validateName();
    const okPhone = validatePhone();
    if (!okName) { nameInput.focus(); return; }
    if (!okPhone) { phoneInput.focus(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    /* Demo site: no backend — simulate a short send delay */
    setTimeout(() => {
      submitBtn.textContent = 'Send request';
      submitBtn.disabled = false;
      successMsg.hidden = false;
      form.reset();
      setTimeout(() => { successMsg.hidden = true; }, 6000);
    }, 900);
  });
})();
