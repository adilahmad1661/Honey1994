/* Golden Hive — cinematic hero.
   Two independent layers:
     1) Core reveal — plain CSS transitions, zero dependencies, runs the
        instant this (local, same-origin) script executes. This is what the
        visitor actually needs to see; it must never wait on a third-party
        network request.
     2) GSAP flourishes (slow background zoom, floating particles, cursor
        parallax) — pure enhancement. If the CDN is slow, blocked, or fails
        outright, the hero still looks and works correctly without them. */
(function () {
  'use strict';

  const hero = document.getElementById('heroLux');
  if (!hero) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) Core reveal (no GSAP, no CDN, no flash) ---------- */
  function revealCore() {
    if (REDUCED) return; // CSS already forces these fully visible.
    const items = hero.querySelectorAll('[data-hero-up]');
    items.forEach((el, i) => {
      // Staggered purely via transition-delay — same 140ms cadence as before.
      el.style.transitionDelay = (150 + i * 140) + 'ms';
      // Force one layout flush before adding the visible class so the
      // opacity:0 starting state is guaranteed to have painted first.
      void el.offsetWidth;
      el.classList.add('hero-in');
    });
  }

  /* ---------- 2) GSAP flourishes (optional, arrives whenever it arrives) */
  function startEnhancements() {
    if (REDUCED || typeof window.gsap === 'undefined') return;
    const gsap = window.gsap;

    spawnParticles(gsap);

    gsap.to('.hero-lux-zoom', {
      scale: 1.09,
      duration: 24,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    bindCursor(gsap);
  }

  function spawnParticles(gsap) {
    const particleHost = document.getElementById('heroParticles');
    if (!particleHost) return;
    const COUNT = window.innerWidth < 600 ? 12 : 26;

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'lux-particle';
      const size = 3 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = 15 + Math.random() * 80 + '%';
      particleHost.appendChild(p);

      gsap.to(p, {
        y: -(60 + Math.random() * 140),
        x: (Math.random() - 0.5) * 90,
        duration: 6 + Math.random() * 9,
        repeat: -1,
        delay: Math.random() * 8,
        ease: 'sine.inOut',
        onRepeat: () => gsap.set(p, { y: 0, x: 0 })
      });
      gsap.to(p, {
        opacity: 0.85,
        duration: 1.6 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 8,
        ease: 'sine.inOut'
      });
    }
  }

  function bindCursor(gsap) {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const bgX   = gsap.quickTo('.hero-lux-zoom', 'x', { duration: 1.1, ease: 'power2.out' });
    const bgY   = gsap.quickTo('.hero-lux-zoom', 'y', { duration: 1.1, ease: 'power2.out' });
    const dustX = gsap.quickTo('#heroParticles', 'x', { duration: 1.4, ease: 'power2.out' });
    const copyX = gsap.quickTo('#heroCopy', 'x', { duration: 0.9, ease: 'power2.out' });
    const jarX  = gsap.quickTo('#heroJar', 'x', { duration: 0.8, ease: 'power2.out' });
    const jarY  = gsap.quickTo('#heroJar', 'y', { duration: 0.8, ease: 'power2.out' });

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;
      bgX(nx * -22); bgY(ny * -14);
      dustX(nx * 26);
      copyX(nx * 8);
      jarX(nx * 20); jarY(ny * 14);
    });

    hero.addEventListener('mouseleave', () => {
      bgX(0); bgY(0); dustX(0); copyX(0); jarX(0); jarY(0);
    });
  }

  /* GSAP loads via <script async>, so it may not exist yet when this file
     runs. Poll briefly rather than trusting script order — cheap, bounded,
     and never blocks the core reveal above. */
  function waitForGSAP(attemptsLeft) {
    if (typeof window.gsap !== 'undefined') { startEnhancements(); return; }
    if (attemptsLeft <= 0) return; // CDN failed/blocked — degrade silently.
    setTimeout(() => waitForGSAP(attemptsLeft - 1), 200);
  }

  revealCore();
  waitForGSAP(25); // up to ~5s, well past any reasonable CDN fetch time.
})();
