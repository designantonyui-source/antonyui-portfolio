/* =============================================================
   ANTONY BOZHATARNYK — Portfolio shared JS
   -------------------------------------------------------------
   Loaded in <head> WITHOUT `defer` on purpose: the theme must be
   applied before first paint to avoid a flash of the wrong theme.
   Everything else waits for DOMContentLoaded.
   ============================================================= */
(function () {
  'use strict';

  var THEMES = ['dark', 'light'];
  var DEFAULT_THEME = 'dark';
  var THEME_COLORS = { dark: '#262624', light: '#f5f3ef' };
  var RULER_WIDTH = 28;
  var RULER_MIN_VIEWPORT = 1041;   // rulers are hidden by CSS at <=1040px
  var MOBILE_BREAKPOINT = '(min-width: 641px)';

  /* ---------- helpers ---------- */

  // localStorage throws in private mode and some sandboxed frames — never let it break the page.
  var storage = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) { /* non-fatal */ }
    }
  };

  // Run a layout-reading handler at most once per animation frame.
  function rafThrottle(handler) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        handler();
      });
    };
  }

  function each(selector, root, fn) {
    var nodes = (root || document).querySelectorAll(selector);
    Array.prototype.forEach.call(nodes, fn);
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ---------- theme ---------- */

  var currentTheme = null;

  // Single source of truth for theme state: attribute, buttons, meta tag, embeds.
  function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) theme = DEFAULT_THEME;
    currentTheme = theme;

    document.documentElement.setAttribute('data-theme', theme);

    THEMES.forEach(function (name) {
      var btn = document.getElementById('btn-' + name);
      if (!btn) return;
      var isActive = name === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);

    // Keep embedded iframes in sync (same-tab contexts only).
    each('iframe', document, function (frame) {
      try {
        frame.contentWindow.postMessage({ type: 'theme', value: theme }, '*');
      } catch (e) { /* cross-origin — ignore */ }
    });
  }

  // Public API — referenced by the inline onclick handlers in the nav.
  window.setTheme = function (theme) {
    storage.set('theme', theme);
    applyTheme(theme);
  };

  // Runs before first paint. The buttons don't exist yet; applyTheme guards for that.
  applyTheme(storage.get('theme') || DEFAULT_THEME);

  // Re-apply once the buttons exist so their active/aria state is correct.
  onReady(function () { applyTheme(currentTheme); });

  /* ---------- mobile menu ---------- */

  onReady(function () {
    var btn = document.getElementById('nav-menu-btn');
    var panel = document.getElementById('nav-mobile');
    if (!btn || !panel) return;

    function setMenu(open) {
      panel.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function () {
      setMenu(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Close after navigating from the panel.
    each('a', panel, function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    // Escape closes the menu and returns focus to the toggle.
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (btn.getAttribute('aria-expanded') !== 'true') return;
      setMenu(false);
      btn.focus();
    });

    // Reset on the way up to the desktop layout so the state can't get stuck.
    var mq = window.matchMedia(MOBILE_BREAKPOINT);
    var onChange = function (event) { if (event.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);   // Safari < 14
  });

  /* ---------- current nav link ---------- */

  onReady(function () {
    // Normalise directory URLs and explicit index.html to one value so that
    // /blog/ and /blog/index.html both match the same nav link.
    var here = window.location.pathname.replace(/index\.html$/, '');

    each('.nav-links a, .nav-mobile-inner a', document, function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('mailto:') === 0) return;

      var hash = href.split('#')[1] || '';
      var pathPart = href.split('#')[0].split('?')[0];

      // Case-study pages live under /work/, but the nav has no item of their
      // own, so the home page's "Work" section link stays current there.
      if (hash === 'work' && /\/work\//.test(here)) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        return;
      }

      if (!pathPart) return;   // same-page anchor with no matching page

      var resolved;
      try {
        resolved = new URL(pathPart, window.location.href).pathname.replace(/index\.html$/, '');
      } catch (e) {
        return;   // malformed href — ignore
      }

      if (resolved !== here) return;
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });
  });

  /* ---------- scroll progress bar ---------- */

  onReady(function () {
    var bar = document.getElementById('progress-bar');
    if (!bar) return;

    var update = function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = scrollable > 0 ? (window.scrollY / scrollable * 100) + '%' : '0%';
    };

    var schedule = rafThrottle(update);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  });

  /* ---------- page rulers ---------- */

  onReady(function () {
    var left = document.createElement('div');
    var right = document.createElement('div');
    left.className = 'ruler-wrap ruler-left';
    right.className = 'ruler-wrap ruler-right';
    document.body.appendChild(left);
    document.body.appendChild(right);

    function build(side) {
      var viewportH = window.innerHeight;
      var scrollTop = Math.round(window.scrollY);
      var lineX = side === 'left' ? RULER_WIDTH - 1 : 1;
      // Numbers sit in the middle of the space beside the line.
      var textX = side === 'left' ? Math.round((RULER_WIDTH - 1) / 2) : Math.round(RULER_WIDTH / 2) + 1;
      var startAbs = Math.ceil(scrollTop / 10) * 10;   // snap to the nearest 10px
      var ticks = '';
      var labels = '';

      for (var absY = startAbs; absY <= scrollTop + viewportH + 10; absY += 10) {
        var y = absY - scrollTop;
        if (y < 0 || y > viewportH) continue;

        var isMajor = absY % 50 === 0;
        var isMedium = !isMajor && absY % 25 === 0;
        var tickLength = isMajor ? 9 : isMedium ? 5 : 3;
        var x1 = side === 'left' ? lineX - tickLength : lineX;
        var x2 = side === 'right' ? lineX + tickLength : lineX;

        ticks += '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y +
                 '" stroke="var(--faint)" stroke-width="1" shape-rendering="crispEdges"/>';

        if (isMajor) {
          // Rotated -90deg about the anchor so numbers read bottom-to-top.
          labels += '<text x="' + textX + '" y="' + y + '" font-size="8"' +
                    ' font-family="\'Geist Mono\', monospace" fill="var(--faint)"' +
                    ' text-anchor="middle" dominant-baseline="middle"' +
                    ' transform="rotate(-90 ' + textX + ' ' + y + ')">' + absY + '</text>';
        }
      }

      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + RULER_WIDTH + '"' +
             ' height="' + viewportH + '" shape-rendering="crispEdges">' +
             '<line x1="' + lineX + '" y1="0" x2="' + lineX + '" y2="' + viewportH +
             '" stroke="var(--border)" stroke-width="1"/>' + ticks + labels + '</svg>';
    }

    function render() {
      // CSS hides the rulers on narrow viewports, so skip the work — and drop
      // any markup left over from a wider window.
      if (window.innerWidth < RULER_MIN_VIEWPORT) {
        if (left.firstChild) left.textContent = '';
        if (right.firstChild) right.textContent = '';
        return;
      }
      left.innerHTML = build('left');
      right.innerHTML = build('right');
    }

    var schedule = rafThrottle(render);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    render();
  });

  /* ---------- read time ---------- */

  onReady(function () {
    var el = document.getElementById('read-time');
    if (!el) return;

    // Prefer the article body so nav/footer chrome isn't counted.
    var source = document.querySelector('.article-body') || document.body;
    var words = (source.textContent || '').trim().split(/\s+/).filter(Boolean).length;

    el.textContent = Math.max(1, Math.ceil(words / 200)) + ' min read';
  });

  /* ---------- lightbox ---------- */

  onReady(function () {
    var images = [];
    each('img.case-img, .img-row img', document, function (img) {
      // Work-card thumbnails are links, and the nav avatar is decorative.
      if (img.closest('a.work-card') || img.closest('.nav-logo') || img.classList.contains('nav-avatar')) return;
      if (!img.getAttribute('src')) return;
      images.push(img);
    });
    if (!images.length) return;   // don't inject a lightbox on pages that don't need one

    var overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image preview');
    // No src attribute: an empty src would trigger a request for the page itself.
    overlay.innerHTML = '<button type="button" class="lb-close" aria-label="Close image preview">\u2715</button><img alt="">';
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector('img');
    var lbClose = overlay.querySelector('.lb-close');
    var lastFocused = null;

    function open(src, alt) {
      lbImg.setAttribute('src', src);
      lbImg.setAttribute('alt', alt || '');
      overlay.classList.add('open');
      document.body.classList.add('lb-locked');
      lastFocused = document.activeElement;
      lbClose.focus();
    }

    function close() {
      if (!overlay.classList.contains('open')) return;
      overlay.classList.remove('open');
      document.body.classList.remove('lb-locked');
      lbImg.removeAttribute('src');
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      lastFocused = null;
    }

    images.forEach(function (img) {
      img.classList.add('img-zoomable');
      // Make the image operable from the keyboard, not just by mouse.
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge image: ' + (img.getAttribute('alt') || 'screenshot'));

      img.addEventListener('click', function () { open(img.src, img.alt); });
      img.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open(img.src, img.alt);
      });
    });

    // Click the backdrop (not the image) to close.
    overlay.addEventListener('click', function (event) {
      if (event.target !== lbImg) close();
    });
    lbClose.addEventListener('click', close);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
  });

})();
