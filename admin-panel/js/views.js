/* ============================================================================
   Golden Hive Admin — views (one renderer per section)
   Each view renders into a container element and wires its own events.
   ============================================================================ */
(function (global) {
  'use strict';
  var icon = UI.icon, fmt = UI.fmt, esc = UI.esc, toast = UI.toast;

  /* ======================================================== DASHBOARD */
  function dashboard(el) {
    var orders = Store.orders.all();
    var products = Store.products.all();
    var customers = Store.customers.all();

    var paid = orders.filter(function (o) { return o.status === 'paid' || o.status === 'fulfilled'; });
    var revenue = paid.reduce(function (s, o) { return s + o.total; }, 0);
    var pending = orders.filter(function (o) { return o.status === 'pending'; }).length;
    var lowStock = products.filter(function (p) { return p.stock > 0 && p.stock <= 5; });
    var outStock = products.filter(function (p) { return p.stock === 0; });

    // last 14 days revenue buckets
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      days.push({ date: d, total: 0 });
    }
    orders.forEach(function (o) {
      var od = new Date(o.placedAt); od.setHours(0, 0, 0, 0);
      var bucket = days.find(function (x) { return x.date.getTime() === od.getTime(); });
      if (bucket && (o.status === 'paid' || o.status === 'fulfilled')) bucket.total += o.total;
    });

    var top = products.slice().sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 5);
    var recent = orders.slice().sort(function (a, b) { return new Date(b.placedAt) - new Date(a.placedAt); }).slice(0, 6);

    el.innerHTML =
      '<div class="page-head"><div><h1>Dashboard</h1><p>A live look at your store, from this browser.</p></div>' +
      '<button class="btn btn-primary" data-nav="products/new">' + icon('plus') + 'New product</button></div>' +

      '<div class="grid stat-grid" style="margin-bottom:16px">' +
        statCard('Revenue', fmt.money(revenue), '+12.4%', 'up', 'dollar', true) +
        statCard('Orders', fmt.num(orders.length), '+8.1%', 'up', 'cart', false) +
        statCard('Customers', fmt.num(customers.length), '+3.2%', 'up', 'users', false) +
        statCard('Products', fmt.num(products.length), pending + ' pending', 'up', 'box', false) +
      '</div>' +

      '<div class="two-col">' +
        '<div class="panel"><div class="section-title"><h3>Revenue · last 14 days</h3>' +
          '<span class="badge honey">Live</span></div><div style="padding:16px">' + chart(days) + '</div></div>' +
        '<div class="panel"><div class="section-title"><h3>Top products</h3></div><div style="padding:8px 18px 14px">' +
          top.map(function (p, idx) {
            return '<div class="list-row"><span class="rank">' + (idx + 1) + '</span>' +
              '<div style="flex:1;min-width:0"><div class="cell-title" style="font-size:13px">' + esc(p.title) + '</div>' +
              '<div class="cell-sub">' + p.reviews + ' reviews · ' + p.stock + ' in stock</div></div>' +
              '<strong>' + fmt.money(p.price) + '</strong></div>';
          }).join('') +
        '</div></div>' +
      '</div>' +

      '<div class="two-col" style="margin-top:16px">' +
        '<div class="panel"><div class="section-title"><h3>Recent orders</h3>' +
          '<a class="link" data-nav="orders">View all</a></div>' +
          '<table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th class="right">Total</th></tr></thead><tbody>' +
          recent.map(function (o) {
            return '<tr data-open-order="' + o.id + '" style="cursor:pointer"><td class="mono"><strong>#' + o.number + '</strong></td>' +
              '<td>' + esc(o.customerName) + '</td><td>' + UI.statusBadge(o.status) + '</td>' +
              '<td class="right"><strong>' + fmt.money(o.total) + '</strong></td></tr>';
          }).join('') +
          '</tbody></table></div>' +
        '<div class="panel"><div class="section-title"><h3>Stock alerts</h3></div><div style="padding:8px 18px 14px">' +
          (lowStock.length + outStock.length === 0
            ? '<div style="padding:20px 0;color:var(--subtle);font-size:13px">Everything is well stocked. 🍯</div>'
            : outStock.concat(lowStock).map(function (p) {
                return '<div class="list-row"><div style="flex:1"><div class="cell-title" style="font-size:13px">' + esc(p.title) + '</div>' +
                  '<div class="cell-sub">SKU ' + esc(p.sku) + '</div></div>' +
                  (p.stock === 0 ? '<span class="badge red">Out of stock</span>' : '<span class="badge amber">' + p.stock + ' left</span>') + '</div>';
              }).join('')) +
        '</div></div>' +
      '</div>';

    el.querySelectorAll('[data-open-order]').forEach(function (row) {
      row.addEventListener('click', function () { openOrder(row.getAttribute('data-open-order')); });
    });
  }

  function statCard(label, value, delta, dir, ico, gold) {
    return '<div class="panel stat"><div class="ico' + (gold ? ' gold' : '') + '">' + icon(ico) + '</div>' +
      '<div class="label">' + label + '</div><div class="value">' + value + '</div>' +
      '<span class="delta ' + dir + '">' + icon('up') + delta + '</span></div>';
  }

  function chart(days) {
    var max = Math.max.apply(null, days.map(function (d) { return d.total; }).concat([1]));
    var w = 520, h = 190, pad = 8, bw = (w - pad * 2) / days.length;
    var bars = days.map(function (d, i) {
      var bh = Math.max(2, (d.total / max) * (h - 30));
      var x = pad + i * bw;
      return '<rect x="' + (x + 3) + '" y="' + (h - bh - 18) + '" width="' + (bw - 6) + '" height="' + bh +
        '" rx="4" fill="url(#gh-bar)"><title>' + d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ': ' + fmt.money(d.total) + '</title></rect>' +
        '<text x="' + (x + bw / 2) + '" y="' + (h - 4) + '" text-anchor="middle" font-size="9" fill="var(--subtle)">' + d.date.getDate() + '</text>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="gh-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a900"/><stop offset="1" stop-color="#f7cf7f"/></linearGradient></defs>' +
      bars + '</svg>';
  }

  /* ========================================================= PRODUCTS */
  var productFilter = '';
  function products(el) {
    var all = Store.products.all();
    var q = productFilter.toLowerCase();
    var list = all.filter(function (p) {
      return !q || p.title.toLowerCase().indexOf(q) >= 0 || (p.sku || '').toLowerCase().indexOf(q) >= 0;
    });

    el.innerHTML =
      '<div class="page-head"><div><h1>Products</h1><p>' + all.length + ' products in your catalog</p></div>' +
      '<button class="btn btn-primary" data-add>' + icon('plus') + 'Add product</button></div>' +
      '<div class="toolbar"><div class="search">' + icon('search') +
      '<input placeholder="Search products…" value="' + esc(productFilter) + '" data-search></div></div>' +
      '<div class="panel">' +
      (list.length === 0 ? UI.emptyState('products', 'No products found', 'Try a different search or add one.') :
      '<table><thead><tr><th>Product</th><th>Status</th><th>Stock</th><th class="right">Price</th><th></th></tr></thead><tbody>' +
      list.map(function (p) {
        var stockCell = p.stock === 0 ? '<span class="badge red">Out</span>'
          : p.stock <= 5 ? '<span style="color:var(--warning);font-weight:600">' + p.stock + ' left</span>'
          : '<span class="muted">' + p.stock + ' in stock</span>';
        return '<tr><td><div class="cell-main"><img src="' + esc(p.image) + '" alt="" loading="lazy">' +
          '<div><div class="cell-title">' + esc(p.title) + '</div><div class="cell-sub">' + esc(p.sku || '') + '</div></div></div></td>' +
          '<td>' + UI.statusBadge(p.status) + '</td><td>' + stockCell + '</td>' +
          '<td class="right"><strong>' + fmt.money(p.price) + '</strong></td>' +
          '<td class="right nowrap">' +
          '<button class="icon-btn" data-edit="' + p.id + '" title="Edit">' + icon('edit') + '</button>' +
          '<button class="icon-btn" data-dupe="' + p.id + '" title="Duplicate">' + icon('copy') + '</button>' +
          '<button class="icon-btn" data-del="' + p.id + '" title="Delete">' + icon('trash') + '</button></td></tr>';
      }).join('') + '</tbody></table>') + '</div>';

    var search = el.querySelector('[data-search]');
    if (search) search.addEventListener('input', UI.debounce(function () {
      productFilter = search.value; var pos = search.selectionStart;
      products(el); var s2 = el.querySelector('[data-search]'); if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
    }, 180));

    var addBtn = el.querySelector('[data-add]');
    if (addBtn) addBtn.addEventListener('click', function () { editProduct(null, el); });
    el.querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { editProduct(b.getAttribute('data-edit'), el); }); });
    el.querySelectorAll('[data-dupe]').forEach(function (b) { b.addEventListener('click', function () {
      var p = Store.products.get(b.getAttribute('data-dupe'));
      var copy = Object.assign({}, p, { id: '', title: p.title + ' (copy)', status: 'draft', featured: false });
      Store.products.save(copy); toast('Product duplicated', 'ok'); products(el);
    }); });
    el.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () {
      var p = Store.products.get(b.getAttribute('data-del'));
      UI.confirm({ title: 'Delete product?', message: '“' + p.title + '” will be removed permanently.', confirmLabel: 'Delete', danger: true }, function () {
        Store.products.remove(p.id); toast('Product deleted', 'ok'); products(el);
      });
    }); });
  }

  function editProduct(id, host) {
    var p = id ? Store.products.get(id) : { id: '', title: '', subtitle: '', price: '', compareAt: '', sku: '', stock: 0, status: 'draft', featured: false, badge: '', tags: [], image: '', description: '', rating: 5, reviews: 0 };
    UI.modal({
      title: id ? 'Edit product' : 'New product',
      wide: true,
      body:
        '<div class="thumb-pick" style="margin-bottom:16px"><img class="preview" data-preview src="' + esc(p.image || '') + '" alt="" onerror="this.style.opacity=.3">' +
        '<div style="flex:1"><div class="field" style="margin:0"><label>Image URL</label>' +
        '<input data-f="image" value="' + esc(p.image || '') + '" placeholder="https://…"></div>' +
        '<div class="hint">Paste a link, or copy one from the Media page.</div></div></div>' +
        '<div class="field"><label>Title</label><input data-f="title" value="' + esc(p.title) + '" placeholder="Wildflower Honey"></div>' +
        '<div class="row2"><div class="field"><label>Subtitle</label><input data-f="subtitle" value="' + esc(p.subtitle || '') + '" placeholder="350 g jar"></div>' +
        '<div class="field"><label>SKU</label><input data-f="sku" value="' + esc(p.sku || '') + '" placeholder="GH-WF-350"></div></div>' +
        '<div class="row3"><div class="field"><label>Price</label><div class="input-money"><span>$</span><input data-f="price" type="number" step="0.01" value="' + esc(p.price) + '"></div></div>' +
        '<div class="field"><label>Compare at</label><div class="input-money"><span>$</span><input data-f="compareAt" type="number" step="0.01" value="' + esc(p.compareAt || '') + '"></div></div>' +
        '<div class="field"><label>Stock</label><input data-f="stock" type="number" value="' + esc(p.stock) + '"></div></div>' +
        '<div class="row2"><div class="field"><label>Badge</label><input data-f="badge" value="' + esc(p.badge || '') + '" placeholder="Bestseller"></div>' +
        '<div class="field"><label>Status</label><select data-f="status"><option value="draft"' + (p.status === 'draft' ? ' selected' : '') + '>Draft</option><option value="published"' + (p.status === 'published' ? ' selected' : '') + '>Published</option><option value="archived"' + (p.status === 'archived' ? ' selected' : '') + '>Archived</option></select></div></div>' +
        '<div class="field"><label>Description</label><textarea data-f="description" placeholder="Bright and floral…">' + esc(p.description || '') + '</textarea></div>' +
        '<div class="toggle-row"><div><div class="t-label">Featured</div><div class="t-hint">Highlight on the homepage</div></div>' +
        '<label class="toggle"><input type="checkbox" data-f="featured"' + (p.featured ? ' checked' : '') + '><span class="track"></span></label></div>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>' + (id ? 'Save changes' : 'Create product') + '</button>',
      onMount: function (root) {
        var img = root.querySelector('[data-f="image"]'), prev = root.querySelector('[data-preview]');
        img.addEventListener('input', function () { prev.src = img.value; prev.style.opacity = 1; });
        root.querySelector('[data-save]').addEventListener('click', function () {
          function val(f) { var e = root.querySelector('[data-f="' + f + '"]'); return e.type === 'checkbox' ? e.checked : e.value; }
          if (!val('title').trim()) { toast('Title is required', 'error'); return; }
          var saved = Object.assign({}, p, {
            title: val('title').trim(), subtitle: val('subtitle'), sku: val('sku'),
            price: parseFloat(val('price')) || 0, compareAt: val('compareAt') ? parseFloat(val('compareAt')) : null,
            stock: parseInt(val('stock'), 10) || 0, badge: val('badge'), status: val('status'),
            description: val('description'), image: val('image'), featured: val('featured'),
            tags: p.tags || [],
          });
          Store.products.save(saved);
          UI.closeModal(); toast(id ? 'Product saved' : 'Product created', 'ok'); products(host);
        });
      },
    });
  }

  /* =========================================================== ORDERS */
  var orderFilter = '', orderStatus = 'all';
  function orders(el) {
    var all = Store.orders.all().sort(function (a, b) { return new Date(b.placedAt) - new Date(a.placedAt); });
    var q = orderFilter.toLowerCase();
    var list = all.filter(function (o) {
      if (orderStatus !== 'all' && o.status !== orderStatus) return false;
      return !q || String(o.number).indexOf(q) >= 0 || o.customerName.toLowerCase().indexOf(q) >= 0 || (o.email || '').toLowerCase().indexOf(q) >= 0;
    });
    var revenue = all.filter(function (o) { return o.status === 'paid' || o.status === 'fulfilled'; }).reduce(function (s, o) { return s + o.total; }, 0);

    el.innerHTML =
      '<div class="page-head"><div><h1>Orders</h1><p>' + all.length + ' orders · ' + fmt.money(revenue) + ' net revenue</p></div></div>' +
      '<div class="toolbar"><div class="search">' + icon('search') + '<input placeholder="Search order #, name or email…" value="' + esc(orderFilter) + '" data-search></div>' +
      '<select data-status style="max-width:180px">' + ['all', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'].map(function (s) {
        return '<option value="' + s + '"' + (orderStatus === s ? ' selected' : '') + '>' + (s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="panel">' +
      (list.length === 0 ? UI.emptyState('orders', 'No orders found') :
      '<table><thead><tr><th>Order</th><th>Customer</th><th class="hide-sm">Date</th><th>Status</th><th class="right">Total</th></tr></thead><tbody>' +
      list.map(function (o) {
        return '<tr data-open="' + o.id + '" style="cursor:pointer"><td class="mono"><strong>#' + o.number + '</strong></td>' +
          '<td><div class="cell-title">' + esc(o.customerName) + '</div><div class="cell-sub">' + esc(o.email) + '</div></td>' +
          '<td class="hide-sm muted">' + fmt.date(o.placedAt) + '</td><td>' + UI.statusBadge(o.status) + '</td>' +
          '<td class="right"><strong>' + fmt.money(o.total) + '</strong></td></tr>';
      }).join('') + '</tbody></table>') + '</div>';

    var search = el.querySelector('[data-search]');
    if (search) search.addEventListener('input', UI.debounce(function () {
      orderFilter = search.value; var pos = search.selectionStart; orders(el);
      var s2 = el.querySelector('[data-search]'); if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
    }, 180));
    var sel = el.querySelector('[data-status]');
    if (sel) sel.addEventListener('change', function () { orderStatus = sel.value; orders(el); });
    el.querySelectorAll('[data-open]').forEach(function (r) { r.addEventListener('click', function () { openOrder(r.getAttribute('data-open')); }); });
  }

  function openOrder(id) {
    var o = Store.orders.get(id);
    if (!o) return;
    var itemsHtml = o.items.map(function (it) {
      return '<div class="list-row"><span class="rank">' + it.qty + '×</span><div style="flex:1"><div class="cell-title" style="font-size:13px">' + esc(it.title) + '</div>' +
        '<div class="cell-sub">' + fmt.money(it.price) + ' each</div></div><strong>' + fmt.money(it.price * it.qty) + '</strong></div>';
    }).join('');
    UI.modal({
      title: 'Order #' + o.number,
      subtitle: fmt.date(o.placedAt) + ' · ' + o.customerName,
      wide: true,
      body:
        '<div style="margin-bottom:16px">' + itemsHtml + '</div>' +
        '<div style="border-top:1px solid var(--border);padding-top:12px;font-size:13px">' +
        totalRow('Subtotal', fmt.money(o.subtotal)) + totalRow('Shipping', fmt.money(o.shipping)) + totalRow('Tax', fmt.money(o.tax)) +
        '<div class="list-row" style="border:0;padding-top:8px"><strong style="flex:1">Total</strong><strong style="font-size:16px">' + fmt.money(o.total) + '</strong></div></div>' +
        '<div class="row2" style="margin-top:8px"><div class="field" style="margin:0"><label>Status</label>' +
        '<select data-status>' + ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'].map(function (s) {
          return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field" style="margin:0"><label>Tracking number</label><input data-track value="' + esc(o.tracking || '') + '" placeholder="1Z…" class="mono"></div></div>' +
        '<div style="margin-top:14px;font-size:12px;color:var(--subtle)">Shipping to ' + esc(o.email) + '</div>',
      footer: '<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-primary" data-save>Save order</button>',
      onMount: function (root) {
        root.querySelector('[data-save]').addEventListener('click', function () {
          o.status = root.querySelector('[data-status]').value;
          o.tracking = root.querySelector('[data-track]').value;
          Store.orders.save(o); UI.closeModal(); toast('Order updated', 'ok');
          global.App.refresh();
        });
      },
    });
  }
  function totalRow(label, val) { return '<div class="list-row" style="padding:5px 0"><span style="flex:1;color:var(--muted)">' + label + '</span><span>' + val + '</span></div>'; }

  /* ======================================================== CUSTOMERS */
  var custFilter = '';
  function customers(el) {
    var all = Store.customers.all().sort(function (a, b) { return b.spent - a.spent; });
    var q = custFilter.toLowerCase();
    var list = all.filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) >= 0 || c.email.toLowerCase().indexOf(q) >= 0; });
    var lifetime = all.reduce(function (s, c) { return s + c.spent; }, 0);

    el.innerHTML =
      '<div class="page-head"><div><h1>Customers</h1><p>' + all.length + ' customers · ' + fmt.money(lifetime) + ' lifetime value</p></div>' +
      '<button class="btn btn-primary" data-add>' + icon('plus') + 'Add customer</button></div>' +
      '<div class="toolbar"><div class="search">' + icon('search') + '<input placeholder="Search name or email…" value="' + esc(custFilter) + '" data-search></div></div>' +
      '<div class="panel">' +
      (list.length === 0 ? UI.emptyState('customers', 'No customers found') :
      '<table><thead><tr><th>Customer</th><th class="hide-sm">Orders</th><th class="right">Lifetime spend</th><th></th></tr></thead><tbody>' +
      list.map(function (c) {
        return '<tr data-open="' + c.id + '" style="cursor:pointer"><td><div class="cell-main">' +
          '<span class="avatar" style="width:34px;height:34px">' + fmt.initials(c.name) + '</span>' +
          '<div><div class="cell-title">' + esc(c.name) + '</div><div class="cell-sub">' + esc(c.email) + '</div></div></div></td>' +
          '<td class="hide-sm muted">' + c.orders + '</td><td class="right"><strong>' + fmt.money(c.spent) + '</strong></td>' +
          '<td class="right">' + (c.marketing ? '<span class="badge blue">Subscribed</span>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>') + '</div>';

    var search = el.querySelector('[data-search]');
    if (search) search.addEventListener('input', UI.debounce(function () {
      custFilter = search.value; var pos = search.selectionStart; customers(el);
      var s2 = el.querySelector('[data-search]'); if (s2) { s2.focus(); s2.setSelectionRange(pos, pos); }
    }, 180));
    el.querySelector('[data-add]').addEventListener('click', function () { editCustomer(null, el); });
    el.querySelectorAll('[data-open]').forEach(function (r) { r.addEventListener('click', function () { openCustomer(r.getAttribute('data-open'), el); }); });
  }

  function openCustomer(id, host) {
    var c = Store.customers.get(id);
    var theirOrders = Store.orders.all().filter(function (o) { return o.customerId === id; })
      .sort(function (a, b) { return new Date(b.placedAt) - new Date(a.placedAt); });
    UI.modal({
      title: c.name, subtitle: c.email + ' · joined ' + fmt.date(c.joined),
      body:
        '<div class="grid stat-grid" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px">' +
        '<div class="panel stat" style="padding:12px"><div class="label">Spent</div><div class="value" style="font-size:18px">' + fmt.money(c.spent) + '</div></div>' +
        '<div class="panel stat" style="padding:12px"><div class="label">Orders</div><div class="value" style="font-size:18px">' + c.orders + '</div></div>' +
        '<div class="panel stat" style="padding:12px"><div class="label">City</div><div class="value" style="font-size:18px">' + esc(c.city || '—') + '</div></div></div>' +
        '<h4 style="margin:0 0 8px;font-size:13px">Order history</h4>' +
        (theirOrders.length ? theirOrders.map(function (o) {
          return '<div class="list-row"><span class="mono"><strong>#' + o.number + '</strong></span>' +
            '<span class="muted" style="flex:1">' + fmt.date(o.placedAt) + '</span>' + UI.statusBadge(o.status) +
            '<strong>' + fmt.money(o.total) + '</strong></div>';
        }).join('') : '<div class="muted" style="font-size:13px">No orders yet.</div>'),
      footer: '<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-secondary" data-edit>Edit details</button>',
      onMount: function (root) { root.querySelector('[data-edit]').addEventListener('click', function () { UI.closeModal(); editCustomer(id, host); }); },
    });
  }

  function editCustomer(id, host) {
    var c = id ? Store.customers.get(id) : { id: '', name: '', email: '', phone: '', city: '', spent: 0, orders: 0, marketing: false, joined: new Date().toISOString() };
    UI.modal({
      title: id ? 'Edit customer' : 'Add customer',
      body:
        '<div class="field"><label>Full name</label><input data-f="name" value="' + esc(c.name) + '"></div>' +
        '<div class="row2"><div class="field"><label>Email</label><input data-f="email" value="' + esc(c.email) + '"></div>' +
        '<div class="field"><label>Phone</label><input data-f="phone" value="' + esc(c.phone || '') + '"></div></div>' +
        '<div class="field"><label>City</label><input data-f="city" value="' + esc(c.city || '') + '"></div>' +
        '<div class="toggle-row"><div><div class="t-label">Marketing emails</div><div class="t-hint">Only with consent</div></div>' +
        '<label class="toggle"><input type="checkbox" data-f="marketing"' + (c.marketing ? ' checked' : '') + '><span class="track"></span></label></div>',
      footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Save</button>',
      onMount: function (root) {
        root.querySelector('[data-save]').addEventListener('click', function () {
          function val(f) { var e = root.querySelector('[data-f="' + f + '"]'); return e.type === 'checkbox' ? e.checked : e.value; }
          if (!val('email').trim()) { toast('Email is required', 'error'); return; }
          Store.customers.save(Object.assign({}, c, { name: val('name'), email: val('email'), phone: val('phone'), city: val('city'), marketing: val('marketing') }));
          UI.closeModal(); toast('Customer saved', 'ok'); customers(host);
        });
      },
    });
  }

  /* ==================================================== WEBSITE EDITOR */
  var contentTab = 'hero';
  function content(el) {
    var c = Store.content.get();
    var tabs = ['hero', 'about', 'delivery', 'contact'];
    el.innerHTML =
      '<div class="page-head"><div><h1>Website content</h1><p>Edit the words and images on your homepage.</p></div></div>' +
      '<div class="pill-tabs">' + tabs.map(function (t) {
        return '<button data-tab="' + t + '"' + (contentTab === t ? ' class="active"' : '') + '>' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>';
      }).join('') + '</div>' +
      '<div class="panel" style="padding:20px;max-width:680px" data-form></div>';

    el.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { contentTab = b.getAttribute('data-tab'); content(el); }); });
    renderContentForm(el.querySelector('[data-form]'), c);
  }

  function renderContentForm(host, c) {
    var f = {
      hero: [['eyebrow', 'Eyebrow', 'text'], ['heading', 'Heading', 'text'], ['accent', 'Heading (gold line)', 'text'], ['subheading', 'Subheading', 'area'], ['primaryLabel', 'Primary button', 'text'], ['secondaryLabel', 'Secondary button', 'text'], ['image', 'Product image URL', 'text']],
      about: [['eyebrow', 'Eyebrow', 'text'], ['heading', 'Heading', 'text'], ['body', 'Body text', 'area'], ['image', 'Photo URL', 'text']],
      delivery: [['eyebrow', 'Eyebrow', 'text'], ['heading', 'Heading', 'text'], ['description', 'Description', 'area']],
      contact: [['eyebrow', 'Eyebrow', 'text'], ['heading', 'Heading', 'text'], ['address', 'Address', 'text'], ['phone', 'Phone', 'text'], ['email', 'Email', 'text'], ['hours', 'Opening hours', 'text']],
    };
    var section = c[contentTab] || {};
    host.innerHTML = f[contentTab].map(function (row) {
      var key = row[0], label = row[1], type = row[2];
      var v = esc(section[key] || '');
      return '<div class="field"><label>' + label + '</label>' +
        (type === 'area' ? '<textarea data-f="' + key + '">' + v + '</textarea>' : '<input data-f="' + key + '" value="' + v + '">') + '</div>';
    }).join('') +
      '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px"><button class="btn btn-primary" data-save>' + icon('check') + 'Save changes</button></div>';

    host.querySelector('[data-save]').addEventListener('click', function () {
      var all = Store.content.get();
      var sec = {};
      f[contentTab].forEach(function (row) { sec[row[0]] = host.querySelector('[data-f="' + row[0] + '"]').value; });
      all[contentTab] = Object.assign({}, section, sec);
      Store.content.set(all);
      toast('Content saved', 'ok');
    });
  }

  /* ============================================================ MEDIA */
  function media(el) {
    var items = Store.media.all();
    el.innerHTML =
      '<div class="page-head"><div><h1>Media</h1><p>' + items.length + ' images. Add by URL and reuse anywhere.</p></div>' +
      '<button class="btn btn-primary" data-add>' + icon('plus') + 'Add image</button></div>' +
      (items.length === 0 ? '<div class="panel">' + UI.emptyState('image', 'No media yet') + '</div>' :
      '<div class="media-grid">' + items.map(function (m) {
        return '<div class="media-item"><img src="' + esc(m.url) + '" alt="" loading="lazy" onerror="this.style.opacity=.3">' +
          '<div class="meta"><span class="n">' + esc(m.name) + '</span>' +
          '<span class="nowrap"><button class="icon-btn" data-copy="' + esc(m.url) + '" title="Copy URL">' + icon('copy') + '</button>' +
          '<button class="icon-btn" data-del="' + m.id + '" title="Delete">' + icon('trash') + '</button></span></div></div>';
      }).join('') + '</div>');

    el.querySelector('[data-add]').addEventListener('click', function () {
      UI.modal({
        title: 'Add image', body:
          '<div class="field"><label>Image URL</label><input data-url placeholder="https://…"></div>' +
          '<div class="field"><label>Name</label><input data-name placeholder="hero-jar.jpg"></div>',
        footer: '<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Add</button>',
        onMount: function (root) {
          root.querySelector('[data-save]').addEventListener('click', function () {
            var url = root.querySelector('[data-url]').value.trim();
            if (!url) { toast('URL is required', 'error'); return; }
            Store.media.save({ id: '', url: url, name: root.querySelector('[data-name]').value.trim() || 'image.jpg', alt: '' });
            UI.closeModal(); toast('Image added', 'ok'); media(el);
          });
        },
      });
    });
    el.querySelectorAll('[data-copy]').forEach(function (b) { b.addEventListener('click', function () {
      var url = b.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(url);
      toast('URL copied', 'ok');
    }); });
    el.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () {
      Store.media.remove(b.getAttribute('data-del')); toast('Image deleted', 'ok'); media(el);
    }); });
  }

  /* ========================================================= SETTINGS */
  function settings(el) {
    var s = Store.settings.get();
    el.innerHTML =
      '<div class="page-head"><div><h1>Settings</h1><p>Business details and social profiles.</p></div></div>' +
      '<div class="panel" style="padding:20px;max-width:680px">' +
      '<h4 style="margin:0 0 14px;font-size:13px">Business</h4>' +
      '<div class="row2"><div class="field"><label>Business name</label><input data-f="siteName" value="' + esc(s.siteName) + '"></div>' +
      '<div class="field"><label>Tagline</label><input data-f="tagline" value="' + esc(s.tagline) + '"></div></div>' +
      '<div class="row2"><div class="field"><label>Email</label><input data-f="email" value="' + esc(s.email) + '"></div>' +
      '<div class="field"><label>Phone</label><input data-f="phone" value="' + esc(s.phone) + '"></div></div>' +
      '<div class="field"><label>Address</label><input data-f="address" value="' + esc(s.address) + '"></div>' +
      '<div class="row2"><div class="field"><label>Currency</label><select data-f="currency">' +
      ['USD', 'EUR', 'GBP', 'PKR', 'AED'].map(function (c) { return '<option' + (s.currency === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>Currency symbol</label><input data-f="currencySymbol" value="' + esc(s.currencySymbol) + '"></div></div>' +
      '<h4 style="margin:18px 0 14px;font-size:13px">Social</h4>' +
      '<div class="field"><label>Instagram</label><input data-f="instagram" value="' + esc(s.instagram || '') + '"></div>' +
      '<div class="field"><label>Facebook</label><input data-f="facebook" value="' + esc(s.facebook || '') + '"></div>' +
      '<div class="field"><label>WhatsApp</label><input data-f="whatsapp" value="' + esc(s.whatsapp || '') + '" placeholder="Digits with country code"></div>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:6px"><button class="btn btn-primary" data-save>' + icon('check') + 'Save settings</button></div>' +
      '</div>' +
      '<div class="panel" style="padding:20px;max-width:680px;margin-top:16px"><h4 style="margin:0 0 6px;font-size:13px">Danger zone</h4>' +
      '<p class="muted" style="font-size:12px;margin:0 0 12px">Reset all demo data (products, orders, customers, content) back to the seeded defaults.</p>' +
      '<button class="btn btn-secondary" data-reset>' + icon('reset') + 'Reset all data</button></div>';

    el.querySelector('[data-save]').addEventListener('click', function () {
      var next = Object.assign({}, s);
      el.querySelectorAll('[data-f]').forEach(function (e) { next[e.getAttribute('data-f')] = e.value; });
      Store.settings.set(next); toast('Settings saved', 'ok'); global.App.refreshChrome();
    });
    el.querySelector('[data-reset]').addEventListener('click', function () {
      UI.confirm({ title: 'Reset all data?', message: 'Every product, order and edit returns to the demo defaults.', confirmLabel: 'Reset', danger: true }, function () {
        Store.resetAll(); toast('Data reset', 'ok'); global.App.go('dashboard');
      });
    });
  }

  global.Views = {
    dashboard: dashboard, products: products, orders: orders,
    customers: customers, content: content, media: media, settings: settings,
  };
})(window);
