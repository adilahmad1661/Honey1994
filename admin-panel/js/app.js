/* ============================================================================
   Golden Hive Admin — shell, router, auth bootstrap
   ============================================================================ */
(function (global) {
  'use strict';
  var icon = UI.icon, esc = UI.esc;

  var ROUTES = {
    dashboard: { view: 'dashboard', title: 'Dashboard' },
    content: { view: 'content', title: 'Website content' },
    media: { view: 'media', title: 'Media' },
    products: { view: 'products', title: 'Products' },
    orders: { view: 'orders', title: 'Orders' },
    customers: { view: 'customers', title: 'Customers' },
    settings: { view: 'settings', title: 'Settings' },
  };

  var NAV = [
    { group: 'Overview', items: [['dashboard', 'Dashboard', 'dashboard']] },
    { group: 'Content', items: [['content', 'Website Editor', 'editor'], ['media', 'Media', 'media']] },
    { group: 'Catalog', items: [['products', 'Products', 'products'], ['orders', 'Orders', 'orders'], ['customers', 'Customers', 'customers']] },
    { group: 'Configuration', items: [['settings', 'Settings', 'settings']] },
  ];

  var current = 'dashboard';

  function brandMark() {
    return '<svg viewBox="0 0 48 48" fill="none" width="30" height="30" aria-hidden="true">' +
      '<path d="M24 6l14 8v16l-14 8-14-8V14l14-8z" stroke="#b4670a" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M24 14c3.6 0 6 2.6 6 6.4 0 5-3.8 8.6-6 10.6-2.2-2-6-5.6-6-10.6 0-3.8 2.4-6.4 6-6.4z" fill="#f2a900"/>' +
      '<path d="M19.3 19h9.4M18.9 23.4h10.2M20.4 27.6h7.2" stroke="#241503" stroke-width="1.7" stroke-linecap="round"/></svg>';
  }

  /* --------------------------------------------------------------- login */
  function renderLogin() {
    var root = document.getElementById('root');
    root.innerHTML =
      '<div class="login-wrap"><div class="login-card">' +
      '<div class="login-brand">' + brandMark() +
      '<h1 class="display">Golden Hive Admin</h1><p class="muted" style="margin:2px 0 0;font-size:13px">Sign in to manage your store</p></div>' +
      '<form id="login-form">' +
      '<div class="field"><label>Email</label><input type="email" id="lg-email" value="admin@goldenhive.farm" autocomplete="username"></div>' +
      '<div class="field"><label>Password</label><input type="password" id="lg-pass" placeholder="••••••" autocomplete="current-password"></div>' +
      '<button class="btn btn-primary btn-block" type="submit" style="margin-top:4px">Sign in</button>' +
      '</form>' +
      '<div class="login-hint">Demo login — email <code>admin@goldenhive.farm</code> · password <code>honey</code></div>' +
      '</div></div>';

    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('lg-email').value;
      var pass = document.getElementById('lg-pass').value;
      if (Store.auth.login(email, pass)) {
        UI.toast('Welcome back', 'ok');
        renderShell();
        go(location.hash.replace('#', '') || 'dashboard');
      } else {
        UI.toast('Wrong email or password', 'error');
      }
    });
  }

  /* --------------------------------------------------------------- shell */
  function renderShell() {
    var s = Store.settings.get();
    var user = Store.auth.current() || { email: 'admin' };
    var root = document.getElementById('root');
    root.innerHTML =
      '<div class="app">' +
      '<div class="backdrop" id="backdrop"></div>' +
      '<aside class="sidebar" id="sidebar">' +
      '<div class="sidebar-head">' + brandMark() +
      '<div class="brand-lockup"><div><div class="name">' + esc(s.siteName || 'Golden Hive') + '</div>' +
      '<div class="sub">Admin</div></div></div></div>' +
      '<nav class="nav" id="nav"></nav>' +
      '<div class="sidebar-foot"><a class="view-site" href="../index.html" target="_blank"><span class="dot"></span>View live site</a></div>' +
      '</aside>' +
      '<div class="main">' +
      '<header class="topbar"><button class="burger" id="burger" aria-label="Menu">' + icon('dashboard') + '</button>' +
      '<h2 id="page-title">Dashboard</h2>' +
      '<button class="btn btn-ghost btn-sm" id="logout">' + icon('logout') + '<span class="hide-sm">Sign out</span></button>' +
      '<span class="avatar" title="' + esc(user.email) + '">' + UI.fmt.initials(user.email) + '</span></header>' +
      '<main class="content" id="view"></main>' +
      '</div></div>';

    renderNav();
    document.getElementById('logout').addEventListener('click', function () {
      Store.auth.logout(); UI.toast('Signed out'); renderLogin();
    });
    var burger = document.getElementById('burger'), sidebar = document.getElementById('sidebar'), backdrop = document.getElementById('backdrop');
    burger.addEventListener('click', function () { sidebar.classList.add('open'); backdrop.classList.add('show'); });
    backdrop.addEventListener('click', function () { sidebar.classList.remove('open'); backdrop.classList.remove('show'); });
  }

  function renderNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var pending = Store.orders.all().filter(function (o) { return o.status === 'pending'; }).length;
    var counts = { products: Store.products.all().length, orders: pending || '', customers: Store.customers.all().length };
    nav.innerHTML = NAV.map(function (g) {
      return '<div class="nav-group"><div class="nav-group-label">' + g.group + '</div>' +
        g.items.map(function (it) {
          var route = it[0], label = it[1], ico = it[2];
          var count = counts[route];
          return '<a class="nav-link' + (current === route ? ' active' : '') + '" data-route="' + route + '" href="#' + route + '">' +
            icon(ico) + '<span>' + label + '</span>' + (count ? '<span class="count">' + count + '</span>' : '') + '</a>';
        }).join('') + '</div>';
    }).join('');

    nav.querySelectorAll('[data-route]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        go(a.getAttribute('data-route'));
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('backdrop').classList.remove('show');
      });
    });
  }

  /* -------------------------------------------------------------- router */
  function go(route) {
    var addProduct = false;
    if (route === 'products/new') { route = 'products'; addProduct = true; }
    if (!ROUTES[route]) route = 'dashboard';
    current = route;
    if (location.hash !== '#' + route) history.replaceState(null, '', '#' + route);

    if (!document.getElementById('view')) renderShell();
    document.getElementById('page-title').textContent = ROUTES[route].title;
    renderNav();
    var view = document.getElementById('view');
    view.innerHTML = '';
    Views[ROUTES[route].view](view);
    view.scrollTop = 0;
    window.scrollTo(0, 0);
    if (addProduct) { var b = view.querySelector('[data-add]'); if (b) b.click(); }
  }

  // Global nav hooks used inside views (data-nav attributes)
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-nav]');
    if (t) { e.preventDefault(); go(t.getAttribute('data-nav')); }
  });

  window.addEventListener('hashchange', function () {
    var route = location.hash.replace('#', '');
    if (route && route !== current && Store.auth.isAuthed()) go(route);
  });

  /* --------------------------------------------------------- public API */
  global.App = {
    go: go,
    refresh: function () { go(current); },
    refreshChrome: function () { renderShell(); go(current); },
  };

  /* ------------------------------------------------------------- boot */
  function boot() {
    if (Store.auth.isAuthed()) {
      renderShell();
      go(location.hash.replace('#', '') || 'dashboard');
    } else {
      renderLogin();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
