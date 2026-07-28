/* ============================================================================
   Golden Hive Admin — data layer
   Pure vanilla JS. Everything persists in the browser via localStorage, so the
   panel works by just opening the file — no server, no database, no build.
   ============================================================================ */
(function (global) {
  'use strict';

  const KEYS = {
    products: 'gh_products',
    orders: 'gh_orders',
    customers: 'gh_customers',
    content: 'gh_content',
    settings: 'gh_settings',
    media: 'gh_media',
    auth: 'gh_auth',
    seeded: 'gh_seeded_v1',
  };

  /* ------------------------------------------------------------ low level */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function uid(prefix) {
    return (prefix || 'id') + '_' + Math.random().toString(36).slice(2, 9);
  }

  /* --------------------------------------------------------------- seed */
  const IMG = {
    amber:
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80',
    pour:
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
    flowers:
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=600&q=80',
    bee:
      'https://images.unsplash.com/photo-1568526381923-caf3fd520382?auto=format&fit=crop&w=600&q=80',
    keeper:
      'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=600&q=80',
  };

  function seedProducts() {
    return [
      { id: uid('p'), title: 'Wildflower Honey', subtitle: '350 g jar', price: 14, compareAt: 18, sku: 'GH-WF-350', stock: 128, status: 'published', featured: true, badge: 'Bestseller', tags: ['raw', 'floral'], image: IMG.amber, description: 'Bright and floral, gathered across summer meadows in full bloom.', rating: 5, reviews: 128 },
      { id: uid('p'), title: 'Cedar Nut Honey', subtitle: '350 g jar', price: 19, compareAt: null, sku: 'GH-CN-350', stock: 96, status: 'published', featured: true, badge: 'Raw & Organic', tags: ['raw', 'infused'], image: IMG.pour, description: 'Silky wildflower honey slow-infused with toasted cedar nuts.', rating: 5, reviews: 96 },
      { id: uid('p'), title: 'Linden Honey', subtitle: '350 g jar', price: 16, compareAt: null, sku: 'GH-LD-350', stock: 74, status: 'published', featured: false, badge: 'Delicate', tags: ['raw', 'delicate'], image: IMG.flowers, description: 'Pale gold and mildly fresh, beloved in evening tea rituals.', rating: 5, reviews: 74 },
      { id: uid('p'), title: 'Buckwheat Honey', subtitle: '350 g jar', price: 17, compareAt: null, sku: 'GH-BW-350', stock: 4, status: 'published', featured: false, badge: 'Bold', tags: ['raw', 'dark'], image: IMG.flowers, description: 'Dark, malty and rich in iron — a honey with real character.', rating: 5, reviews: 88 },
      { id: uid('p'), title: 'Acacia Honey', subtitle: '350 g jar', price: 18, compareAt: null, sku: 'GH-AC-350', stock: 63, status: 'published', featured: false, badge: 'Raw & Organic', tags: ['raw', 'mild'], image: IMG.amber, description: 'Water-clear and gentle, the honey even honey skeptics love.', rating: 5, reviews: 63 },
      { id: uid('p'), title: 'Honeycomb Chunk', subtitle: '400 g jar', price: 24, compareAt: null, sku: 'GH-HC-400', stock: 0, status: 'draft', featured: true, badge: 'Limited', tags: ['raw', 'comb'], image: IMG.pour, description: 'A cut of natural comb sealed in raw honey, straight from the frame.', rating: 5, reviews: 41 },
    ];
  }

  function seedCustomers() {
    return [
      { id: uid('c'), name: 'Emily Matthews', email: 'emily.matthews@example.com', phone: '+1 555 0142', spent: 86, orders: 4, marketing: true, city: 'Portland', joined: daysAgo(210) },
      { id: uid('c'), name: 'James Reeves', email: 'james.reeves@example.com', phone: '+1 555 0177', spent: 51, orders: 3, marketing: true, city: 'Austin', joined: daysAgo(160) },
      { id: uid('c'), name: 'Sofia Klein', email: 'sofia.klein@example.com', phone: '+1 555 0193', spent: 32, orders: 2, marketing: false, city: 'Chicago', joined: daysAgo(120) },
      { id: uid('c'), name: 'Marcus Bell', email: 'marcus.bell@example.com', phone: '+1 555 0128', spent: 124, orders: 6, marketing: true, city: 'Denver', joined: daysAgo(300) },
      { id: uid('c'), name: 'Nina Alvarez', email: 'nina.alvarez@example.com', phone: '+1 555 0165', spent: 19, orders: 1, marketing: true, city: 'Seattle', joined: daysAgo(40) },
    ];
  }

  function seedOrders(products, customers) {
    const statuses = ['paid', 'fulfilled', 'pending', 'fulfilled', 'paid', 'cancelled'];
    const orders = [];
    let number = 1042;
    for (let i = 0; i < 14; i++) {
      const customer = customers[i % customers.length];
      const product = products[i % products.length];
      const qty = 1 + (i % 3);
      const subtotal = product.price * qty;
      const shipping = subtotal > 60 ? 0 : 6;
      const tax = +(subtotal * 0.08).toFixed(2);
      orders.push({
        id: uid('o'),
        number: number++,
        customerId: customer.id,
        customerName: customer.name,
        email: customer.email,
        status: statuses[i % statuses.length],
        items: [{ title: product.title, qty: qty, price: product.price }],
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: +(subtotal + shipping + tax).toFixed(2),
        tracking: i % 3 === 0 ? '1Z999AA1012345678' + i : '',
        placedAt: daysAgo(i * 2 + 1),
      });
    }
    return orders;
  }

  function seedContent() {
    return {
      hero: {
        eyebrow: 'Golden Hive · Private Apiary',
        heading: 'Pure Nature.',
        accent: 'Golden Perfection.',
        subheading: 'Raw wildflower honey with cedar nuts.\nNo sugar. No additives. Ever.',
        primaryLabel: 'Shop Honey',
        secondaryLabel: 'Explore Collection',
        image: IMG.amber,
      },
      about: {
        eyebrow: 'About us',
        heading: 'Three generations of beekeepers',
        body: 'Golden Hive began in 1987 with six hives behind a family orchard. Today our apiary is home to more than two hundred colonies that roam flowering meadows far from roads and industry.',
        image: IMG.keeper,
      },
      delivery: {
        eyebrow: 'Delivery',
        heading: 'From our hives to your table',
        description: 'Careful packaging, fast couriers, and honey that arrives exactly as it left the apiary.',
      },
      contact: {
        eyebrow: 'Contacts',
        heading: 'Come taste it for yourself',
        address: '14 Meadowbrook Lane, Willow Creek Valley',
        phone: '+1 (555) 010-4664',
        email: 'hello@goldenhive.farm',
        hours: 'Daily, 9:00 — 19:00',
      },
    };
  }

  function seedSettings() {
    return {
      siteName: 'Golden Hive',
      tagline: 'Private Apiary',
      email: 'hello@goldenhive.farm',
      phone: '+1 (555) 010-4664',
      address: '14 Meadowbrook Lane, Willow Creek Valley',
      currency: 'USD',
      currencySymbol: '$',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      whatsapp: '',
    };
  }

  function seedMedia() {
    return Object.keys(IMG).map(function (k) {
      return { id: uid('m'), url: IMG[k], name: k + '.jpg', alt: '' };
    });
  }

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  /* --------------------------------------------------------------- init */
  function seedIfEmpty() {
    if (localStorage.getItem(KEYS.seeded)) return;
    const products = seedProducts();
    const customers = seedCustomers();
    write(KEYS.products, products);
    write(KEYS.customers, customers);
    write(KEYS.orders, seedOrders(products, customers));
    write(KEYS.content, seedContent());
    write(KEYS.settings, seedSettings());
    write(KEYS.media, seedMedia());
    localStorage.setItem(KEYS.seeded, '1');
  }

  function resetAll() {
    Object.values(KEYS).forEach(function (k) {
      localStorage.removeItem(k);
    });
    seedIfEmpty();
  }

  /* ------------------------------------------------- generic collections */
  function collection(key) {
    return {
      all: function () {
        return read(key, []);
      },
      get: function (id) {
        return read(key, []).find(function (x) {
          return x.id === id;
        });
      },
      save: function (item) {
        const list = read(key, []);
        if (item.id) {
          const idx = list.findIndex(function (x) {
            return x.id === item.id;
          });
          if (idx >= 0) list[idx] = item;
          else list.push(item);
        } else {
          item.id = uid();
          list.push(item);
        }
        write(key, list);
        return item;
      },
      remove: function (id) {
        write(
          key,
          read(key, []).filter(function (x) {
            return x.id !== id;
          }),
        );
      },
    };
  }

  /* ----------------------------------------------------- object records */
  function record(key, fallbackFactory) {
    return {
      get: function () {
        return read(key, fallbackFactory());
      },
      set: function (value) {
        write(key, value);
        return value;
      },
    };
  }

  /* ---------------------------------------------------------------- auth */
  const auth = {
    // Demo gate only — this is client-side and NOT real security. It stops a
    // casual visitor, nothing more. Swap for a real backend before going live.
    DEFAULT_EMAIL: 'admin@goldenhive.farm',
    DEFAULT_PASSWORD: 'honey',
    login: function (email, password) {
      const ok =
        email.trim().toLowerCase() === auth.DEFAULT_EMAIL &&
        password === auth.DEFAULT_PASSWORD;
      if (ok) write(KEYS.auth, { email: email.trim(), at: Date.now() });
      return ok;
    },
    logout: function () {
      localStorage.removeItem(KEYS.auth);
    },
    current: function () {
      return read(KEYS.auth, null);
    },
    isAuthed: function () {
      return !!read(KEYS.auth, null);
    },
  };

  seedIfEmpty();

  global.Store = {
    products: collection(KEYS.products),
    orders: collection(KEYS.orders),
    customers: collection(KEYS.customers),
    media: collection(KEYS.media),
    content: record(KEYS.content, seedContent),
    settings: record(KEYS.settings, seedSettings),
    auth: auth,
    resetAll: resetAll,
    uid: uid,
  };
})(window);
