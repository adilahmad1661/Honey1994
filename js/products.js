/* Golden Hive — catalog data + premium product cards (photo media, badges, rating, meta, cart CTA) */
(function () {
  'use strict';

  const IMG = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;

  // three verified real honey-jar photographs, tinted per variety via CSS filter
  const JAR_AMBER   = IMG('photo-1587049352851-8d4e89133924'); // amber jar + twine
  const JAR_FLOWERS = IMG('photo-1471943311424-646960669fbc'); // jar + white flowers
  const POUR        = IMG('photo-1558642452-9d2a7deb7f62');     // dipper pouring into jar

  const PRODUCTS = [
    {
      name: 'Wildflower Honey',
      desc: 'Bright and floral, gathered across summer meadows in full bloom.',
      price: 14, weight: '350 g', reviews: 128,
      badge: 'Bestseller', badgeType: 'gold',
      img: JAR_AMBER, pos: '50% 52%', filter: 'saturate(1.05)',
      alt: 'Glass jar of amber wildflower honey tied with twine'
    },
    {
      name: 'Cedar Nut Honey',
      desc: 'Silky wildflower honey slow-infused with toasted cedar nuts.',
      price: 19, weight: '350 g', reviews: 96,
      badge: 'Raw & Organic', badgeType: 'green',
      img: POUR, pos: '50% 58%', filter: 'brightness(.92) saturate(1.1) contrast(1.05)',
      alt: 'Honey dipper drizzling raw cedar nut honey into a jar'
    },
    {
      name: 'Linden Honey',
      desc: 'Pale gold and mildly fresh, beloved in evening tea rituals.',
      price: 16, weight: '350 g', reviews: 74,
      badge: 'Delicate', badgeType: 'soft',
      img: JAR_FLOWERS, pos: '50% 42%', filter: 'brightness(1.42) saturate(.72) contrast(.96)',
      alt: 'Jar of pale linden honey beside soft white blossoms'
    },
    {
      name: 'Buckwheat Honey',
      desc: 'Dark, malty and rich in iron — a honey with real character.',
      price: 17, weight: '350 g', reviews: 88,
      badge: 'Bold', badgeType: 'dark',
      img: JAR_FLOWERS, pos: '50% 46%', filter: 'brightness(.82) saturate(1.08) contrast(1.05)',
      flip: true,
      alt: 'Dark jar of buckwheat honey beside white flowers'
    },
    {
      name: 'Acacia Honey',
      desc: 'Water-clear and gentle, the honey even honey skeptics love.',
      price: 18, weight: '350 g', reviews: 63,
      badge: 'Raw & Organic', badgeType: 'green',
      img: JAR_AMBER, pos: '52% 50%', filter: 'brightness(1.24) saturate(.62) hue-rotate(-6deg)',
      alt: 'Glass jar of light clear acacia honey with a wooden dipper'
    },
    {
      name: 'Honeycomb Chunk',
      desc: 'A cut of natural comb sealed in raw honey, straight from the frame.',
      price: 24, weight: '400 g', reviews: 41,
      badge: 'Limited', badgeType: 'gold',
      img: POUR, pos: '50% 72%', filter: 'saturate(1.08) contrast(1.04)',
      alt: 'Raw honey being poured, comb sealed inside the jar'
    }
  ];

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.6l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 3.6z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M12 20.2S4.6 15.6 4.6 10.4A4 4 0 0 1 12 8a4 4 0 0 1 7.4 2.4c0 5.2-7.4 9.8-7.4 9.8z" stroke-linejoin="round"/></svg>',
    jar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6.5" y="7" width="11" height="13" rx="2.8"/><path d="M8.5 7V5.8A1.3 1.3 0 0 1 9.8 4.5h4.4a1.3 1.3 0 0 1 1.3 1.3V7M6.5 12.5h11" stroke-linecap="round"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 4c-9 0-14 5-14 11 0 2.5 1.5 5 1.5 5S9 21 12 21c6 0 8-6 8-17z" stroke-linejoin="round"/><path d="M6.5 19.5C9 14 13 10.5 17 8.5" stroke-linecap="round"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21.9 8H6.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    comb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3l4 2.3v4.6L12 12l-4-2.3V5.1L12 3zM7 12.4l4 2.3v4.6L7 21l-4-2.3v-4.6l4-2.3zM17 12.4l4 2.3v4.6L17 21l-4-2.3v-4.6l4-2.3z" stroke-linejoin="round"/></svg>'
  };

  function cardHTML(p) {
    return `
    <article class="product-card reveal">
      <div class="pc-media">
        <img class="${p.flip ? 'pc-flip' : ''}" src="${p.img}" alt="${p.alt}" loading="lazy" width="700" height="640" style="object-position:${p.pos};filter:${p.filter || 'none'}">
        <span class="pc-badge pc-badge--${p.badgeType}">${ICONS.star}${p.badge}</span>
        <button class="pc-heart" type="button" aria-label="Add ${p.name} to wishlist" aria-pressed="false">${ICONS.heart}</button>
        <svg class="pc-wave" viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,22 C70,34 140,8 205,16 C270,24 340,32 400,14 L400,34 L0,34 Z" fill="#FFFDF7"/>
          <path d="M0,22 C70,34 140,8 205,16 C270,24 340,32 400,14" fill="none" stroke="#F2A900" stroke-width="2.5" opacity=".85"/>
        </svg>
        <span class="pc-hex" aria-hidden="true">${ICONS.comb}</span>
      </div>
      <div class="pc-body">
        <h3>${p.name}</h3>
        <p class="pc-desc">${p.desc}</p>
        <div class="pc-stars" aria-label="Rated 5 out of 5 stars from ${p.reviews} reviews">
          <span aria-hidden="true">★★★★★</span><small>(${p.reviews} reviews)</small>
        </div>
        <div class="pc-meta">
          <span>${ICONS.jar}<span class="pc-meta-txt"><strong>${p.weight}</strong><small>Net Weight</small></span></span>
          <span>${ICONS.leaf}<span class="pc-meta-txt"><strong>100%</strong><small>Organic</small></span></span>
        </div>
        <div class="pc-foot">
          <span class="pc-price">$${p.price}.00</span>
          <a class="btn btn-honey pc-cart" href="#contacts" data-product="${p.name}">Add to Cart ${ICONS.cart}</a>
        </div>
      </div>
    </article>`;
  }

  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(cardHTML).join('');

  grid.addEventListener('click', (e) => {
    // wishlist heart toggle
    const heart = e.target.closest('.pc-heart');
    if (heart) {
      const liked = heart.classList.toggle('liked');
      heart.setAttribute('aria-pressed', String(liked));
      return;
    }
    // pre-fill the enquiry message from "Add to Cart"
    const btn = e.target.closest('[data-product]');
    if (btn) {
      const msg = document.getElementById('fMsg');
      if (msg) msg.value = `Hi! I'd like to order a jar of ${btn.dataset.product}.`;
    }
  });
})();
