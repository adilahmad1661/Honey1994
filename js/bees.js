/* Golden Hive — realistic bee flight layer.
   Bees wander between waypoints with eased steering, bank into turns,
   bob while hovering, and pause on "flowers" (random rest points). */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layer = document.getElementById('beeLayer');
  if (!layer || REDUCED) return;

  /* Phones and low-core devices get fewer bees, and skip the fuzzy-body
     turbulence filter — feTurbulence + feDisplacementMap is by far the most
     expensive part of the bee to rasterize each frame. */
  const IS_SMALL = window.innerWidth < 700;
  const LOW_POWER = IS_SMALL || (navigator.hardwareConcurrency || 8) <= 4;
  const BEE_COUNT = IS_SMALL ? 1 : 3;
  const TWO_PI = Math.PI * 2;

  const FUZZ = (id) => (LOW_POWER ? 'none' : `url(#fuzz-${id})`);

  /* Detailed bee: fuzzy thorax (turbulence), striped abdomen with gradient,
     veined translucent wings, legs, antennae. Wings flap via CSS. */
  function beeSVG(id, size) {
    return `
    <svg width="${size}" height="${size * 0.82}" viewBox="0 0 100 82">
      <defs>
        <radialGradient id="abd-${id}" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#FFCB4D"/>
          <stop offset="55%" stop-color="#F2A900"/>
          <stop offset="100%" stop-color="#C97B12"/>
        </radialGradient>
        <radialGradient id="thx-${id}" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stop-color="#8A6533"/>
          <stop offset="60%" stop-color="#5C3D14"/>
          <stop offset="100%" stop-color="#3B2205"/>
        </radialGradient>
        <linearGradient id="wing-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".92"/>
          <stop offset="60%" stop-color="#DCEBF5" stop-opacity=".55"/>
          <stop offset="100%" stop-color="#B9D2E3" stop-opacity=".35"/>
        </linearGradient>
        <filter id="fuzz-${id}" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/>
        </filter>
      </defs>

      <!-- far wing -->
      <g class="wing wing-far" style="--wox:46px; --woy:30px; --wfrom:-38deg; --wto:16deg">
        <ellipse cx="60" cy="16" rx="20" ry="10.5" fill="url(#wing-${id})"
                 stroke="#9FB8C9" stroke-opacity=".5" stroke-width="1" transform="rotate(-18 60 16)"/>
        <path d="M46 24 q14 -12 30 -9 M46 24 q16 -4 30 1" stroke="#9FB8C9" stroke-opacity=".45" fill="none" stroke-width=".8"/>
      </g>

      <!-- legs -->
      <g stroke="#2B1803" stroke-width="2.1" stroke-linecap="round" fill="none">
        <path d="M42 46 q-4 8 -10 10 M52 48 q-2 9 -8 12 M62 47 q0 9 -5 13"/>
      </g>

      <!-- abdomen with stripes -->
      <g filter="${FUZZ(id)}">
        <ellipse cx="66" cy="41" rx="24" ry="16" fill="url(#abd-${id})"/>
        <path d="M58 26.5 q3 14 0 28.5 M67 25.8 q3.4 15 .4 30.4 M76 28 q3 12 .6 25.4"
              stroke="#2B1803" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M88 38 q4 2.6 0 6" stroke="#2B1803" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>

      <!-- thorax (fuzzy) -->
      <ellipse cx="40" cy="40" rx="14.5" ry="13" fill="url(#thx-${id})" filter="${FUZZ(id)}"/>

      <!-- head -->
      <circle cx="24" cy="40" r="9.5" fill="#3B2205"/>
      <circle cx="20.5" cy="37.5" r="3.4" fill="#120A02"/>
      <circle cx="19.6" cy="36.4" r="1.1" fill="#CDEAF7" opacity=".85"/>
      <path d="M20 31 q-5 -7 -12 -8 M25 30 q-2 -8 -8 -12" stroke="#2B1803" stroke-width="1.7"
            fill="none" stroke-linecap="round"/>

      <!-- near wing -->
      <g class="wing" style="--wox:44px; --woy:32px; --wfrom:-30deg; --wto:26deg">
        <ellipse cx="62" cy="18" rx="23" ry="12" fill="url(#wing-${id})"
                 stroke="#9FB8C9" stroke-opacity=".6" stroke-width="1" transform="rotate(-12 62 18)"/>
        <path d="M44 27 q16 -14 34 -10 M44 27 q18 -5 34 0 M50 24 q10 -8 24 -7"
              stroke="#9FB8C9" stroke-opacity=".5" fill="none" stroke-width=".9"/>
      </g>
    </svg>`;
  }

  class Bee {
    constructor(i) {
      this.el = document.createElement('div');
      this.el.className = 'bee';
      const size = 34 + Math.random() * 22;             // varied bee sizes
      this.el.innerHTML = beeSVG(i, size);
      layer.appendChild(this.el);

      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight * 0.5;
      this.vx = 0; this.vy = 0;
      this.speed = 0.9 + Math.random() * 0.7;
      this.phase = Math.random() * TWO_PI;              // bob phase
      this.resting = 0;
      this.pickTarget();
    }

    pickTarget() {
      const w = window.innerWidth, h = window.innerHeight;
      this.tx = 40 + Math.random() * (w - 80);
      this.ty = 120 + Math.random() * (h * 0.66); // stay below the header band
      // Occasionally rest (hover in place) when arriving
      this.willRest = Math.random() < 0.35;
    }

    step(dt, t) {
      if (this.resting > 0) {
        this.resting -= dt;
        // gentle hover drift while resting
        this.x += Math.sin(t * 0.004 + this.phase) * 0.18;
        this.y += Math.cos(t * 0.006 + this.phase) * 0.22;
      } else {
        const dx = this.tx - this.x, dy = this.ty - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 26) {
          if (this.willRest) this.resting = 900 + Math.random() * 1600;
          this.pickTarget();
        } else {
          // eased steering toward target + wander noise
          const desiredX = (dx / dist) * this.speed;
          const desiredY = (dy / dist) * this.speed;
          this.vx += (desiredX - this.vx) * 0.03 * dt * 0.06;
          this.vy += (desiredY - this.vy) * 0.03 * dt * 0.06;
          this.vx += Math.sin(t * 0.0021 + this.phase * 3) * 0.02;
          this.vy += Math.cos(t * 0.0017 + this.phase * 2) * 0.02;
          this.x += this.vx * dt * 0.06;
          this.y += this.vy * dt * 0.06;
        }
      }

      // wing-buzz bobbing
      const bob = Math.sin(t * 0.02 + this.phase) * 1.6;

      // face direction of travel; bank slightly into turns
      const facingLeft = this.vx < 0;
      const bank = Math.max(-18, Math.min(18, this.vy * 9)) * (facingLeft ? -1 : 1);

      this.el.style.transform =
        `translate3d(${this.x}px, ${this.y + bob}px, 0) ` +
        `scaleX(${facingLeft ? -1 : 1}) rotate(${bank}deg)`;
    }
  }

  const bees = [];
  for (let i = 0; i < BEE_COUNT; i++) bees.push(new Bee(i));

  let last = performance.now();
  let running = true;

  function frame(t) {
    const dt = Math.min(48, t - last);
    last = t;
    for (const b of bees) b.step(dt, t);
    if (running) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Pause the loop when the tab is hidden to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  // Keep targets in-bounds after resize
  window.addEventListener('resize', () => {
    for (const b of bees) b.pickTarget();
  }, { passive: true });
})();
