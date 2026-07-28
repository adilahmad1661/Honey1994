/* ============================================================================
   Golden Hive Admin — UI helpers: icons, formatters, toast, modal, dialogs
   ============================================================================ */
(function (global) {
  'use strict';

  /* --------------------------------------------------------------- icons */
  var I = {
    dashboard: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 15h7v6H3z"/>',
    editor: '<path d="M4 5h16v14H4z"/><path d="M4 9h16M9 9v10"/>',
    media: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 14l4-4 4 4 3-3 4 4"/><circle cx="8.5" cy="8.5" r="1.4"/>',
    products: '<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 21V11"/>',
    orders: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21.9 8H6.2"/>',
    customers: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6M18 20a5.5 5.5 0 0 0-2-4.3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13.4H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 20 10.6h1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    dots: '<circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    dollar: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21.9 8H6.2"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    box: '<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 21V11"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    truck: '<path d="M3 15V6a1 1 0 0 1 1-1h11v10"/><path d="M15 8h4l3 3v4h-3"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    image: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 14l4-4 4 4 3-3 4 4"/><circle cx="8.5" cy="8.5" r="1.4"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 17l-5.2 2.6 1-5.9L3.5 9.7l5.9-.9z"/>',
  };

  function icon(name, opts) {
    opts = opts || {};
    var fill = opts.fill ? 'currentColor' : 'none';
    var stroke = opts.fill ? 'none' : 'currentColor';
    return (
      '<svg viewBox="0 0 24 24" fill="' + fill + '" stroke="' + stroke +
      '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      (I[name] || '') + '</svg>'
    );
  }

  /* ----------------------------------------------------------- formatters */
  function symbol() {
    try { return (Store.settings.get().currencySymbol) || '$'; } catch (e) { return '$'; }
  }
  var fmt = {
    money: function (n) {
      var v = Number(n || 0);
      return symbol() + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    num: function (n) { return Number(n || 0).toLocaleString('en-US'); },
    date: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    initials: function (str) {
      return (str || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2)
        .map(function (p) { return p[0].toUpperCase(); }).join('');
    },
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var STATUS_BADGE = {
    published: 'green', draft: 'amber', archived: 'gray',
    paid: 'green', fulfilled: 'blue', pending: 'amber', cancelled: 'red', refunded: 'gray',
    active: 'green', blocked: 'red',
  };
  function statusBadge(status) {
    return '<span class="badge ' + (STATUS_BADGE[status] || 'gray') + '">' + esc(status) + '</span>';
  }

  /* --------------------------------------------------------------- toast */
  function toast(message, type) {
    var host = document.getElementById('toasts');
    if (!host) { host = document.createElement('div'); host.id = 'toasts'; document.body.appendChild(host); }
    var el = document.createElement('div');
    el.className = 'toast ' + (type === 'error' ? 'err' : type === 'ok' ? 'ok' : '');
    el.innerHTML = (type ? icon(type === 'error' ? 'close' : 'check') : '') + '<span>' + esc(message) + '</span>';
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
  }

  /* --------------------------------------------------------------- modal */
  function modal(opts) {
    // opts: { title, subtitle, body(html), footer(html), wide, drawer, onMount(root) }
    close();
    var back = document.createElement('div');
    back.className = 'modal-backdrop' + (opts.drawer ? ' drawer-wrap' : '');
    back.id = 'gh-modal';
    var box = document.createElement('div');
    box.className = 'modal' + (opts.wide ? ' wide' : '') + (opts.drawer ? ' drawer' : '');
    box.innerHTML =
      '<div class="modal-head"><div style="flex:1"><h3>' + esc(opts.title || '') + '</h3>' +
      (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') + '</div>' +
      '<button class="icon-btn" data-close aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : '');
    back.appendChild(box);
    document.body.appendChild(back);
    document.body.style.overflow = 'hidden';

    back.addEventListener('click', function (e) {
      if (e.target === back || e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', escClose);
    if (opts.onMount) opts.onMount(box);
    return box;
  }
  function escClose(e) { if (e.key === 'Escape') close(); }
  function close() {
    var m = document.getElementById('gh-modal');
    if (m) m.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', escClose);
  }

  function confirmDialog(opts, onConfirm) {
    modal({
      title: opts.title || 'Are you sure?',
      subtitle: opts.message || '',
      body: '',
      footer:
        '<button class="btn btn-ghost" data-close>Cancel</button>' +
        '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-confirm>' +
        esc(opts.confirmLabel || 'Confirm') + '</button>',
      onMount: function (root) {
        root.querySelector('[data-confirm]').addEventListener('click', function () {
          close();
          onConfirm();
        });
      },
    });
  }

  /* --------------------------------------------------------------- misc */
  function emptyState(iconName, title, sub) {
    return (
      '<div class="empty">' + icon(iconName) +
      '<div class="t">' + esc(title) + '</div>' +
      (sub ? '<div style="margin-top:4px">' + esc(sub) + '</div>' : '') + '</div>'
    );
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms || 200);
    };
  }

  global.UI = {
    icon: icon, fmt: fmt, esc: esc, statusBadge: statusBadge,
    toast: toast, modal: modal, closeModal: close, confirm: confirmDialog,
    emptyState: emptyState, debounce: debounce,
  };
})(window);
