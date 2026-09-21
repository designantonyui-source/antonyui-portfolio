/* =============================================================
   ANTON BOZHATARNYK — Portfolio shared JS
   -------------------------------------------------------------
   Loaded in <head> WITHOUT `defer` on purpose: the theme must be
   applied before first paint to avoid a flash of the wrong theme.
   Everything else waits for DOMContentLoaded.
   ============================================================= */
(function () {
  'use strict';

  var THEMES = ['dark', 'light'];
  var DEFAULT_THEME = 'dark';
  var THEME_COLORS = { dark: '#0f0f0e', light: '#fafafa' };
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

      // Section anchor links (e.g. #expertise or ../index.html#expertise) are not page links.
      // They should only be active if the current URL hash actually matches.
      if (href.indexOf('#') !== -1) {
        var hash = href.split('#')[1];
        if (!hash || window.location.hash !== '#' + hash) return;
      }

      var pathPart = href.split('#')[0].split('?')[0];
      if (!pathPart) return;   // same-page anchor — nothing to compare

      var resolved;
      try {
        resolved = new URL(pathPart, window.location.href).pathname.replace(/index\.html$/, '');
      } catch (e) {
        return;   // malformed href — ignore
      }

      // Exact page match, or a section match so that case studies
      // (/work/priwatt) and blog posts still light up Work / Blog.
      var isCurrent = resolved === here || (resolved !== '/' && here.indexOf(resolved) === 0);
      if (!isCurrent) return;

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

  /* ---------- hero glyph field (ALTERNATIVE — off by default) ---------- */
  // To switch back to the falling 0/1 field, put
  // <canvas class="code-bg" aria-hidden="true"></canvas> in the hero.
  // This module finds no canvas and returns immediately
  // otherwise, so it costs one querySelector on the pages that don't use it.

  /* ---------- preloader: token boot sequence ---------- */
  // Types three design tokens behind a progress bar, then wipes the overlay.
  // Shown once per session; under reduced motion (or without storage) it never
  // appears and the page renders statically. Two fail-safes keep the overlay
  // from ever trapping the page: CSS can hide .done on its own, and the hard
  // timeout below force-completes the sequence no matter what.

  onReady(function () {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    function dismiss() {
      pre.classList.add('done');
    }

    // Seen this session, or motion is reduced → skip entirely, page is static.
    var seen = null;
    try { seen = window.sessionStorage.getItem('ab:preloader'); } catch (e) { /* private mode */ }
    if (seen || (reduceMotion && reduceMotion.matches)) {
      if (!(reduceMotion && reduceMotion.matches)) dismiss();
      else pre.classList.add('done');       // no reveal animation either — just remove the overlay
      return;
    }

    // Hard fallback: whatever happens, the overlay is gone within 5s.
    var failsafe = setTimeout(function () {
      dismiss();
      try { window.sessionStorage.setItem('ab:preloader', '1'); } catch (e) {}
    }, 5000);

    var LINES = [
      { k: '--accent', v: '#fc4f00' },
      { k: '--type', v: 'Inter Display' },
      { k: '--grid', v: '12col · 28px' }
    ];

    var lineEls = pre.querySelectorAll('.preloader-line');
    var kEls = pre.querySelectorAll('.pl-k');
    var vEls = pre.querySelectorAll('.pl-v');
    var caret = pre.querySelector('.pl-caret');
    var statusEl = document.getElementById('pl-status');
    var pctEl = document.getElementById('pl-pct');
    var fillEl = pre.querySelector('.preloader-fill');
    if (!lineEls.length || !kEls.length || !vEls.length || !fillEl) { dismiss(); return; }

    var total = 0;
    LINES.forEach(function (l) { total += l.k.length + l.v.length; });
    var doneChars = 0;

    function progress() {
      var p = doneChars / total;
      fillEl.style.width = (p * 100).toFixed(1) + '%';
      if (pctEl) pctEl.textContent = Math.round(p * 100) + '%';
    }

    var li = 0;
    function typeLine() {
      if (li >= LINES.length) { finish(); return; }
      var line = LINES[li];
      var phase = 'k', ci = 0;
      if (lineEls[li]) lineEls[li].classList.add('is-typing');   // reveals the colon too
      if (caret && lineEls[li]) lineEls[li].appendChild(caret);   // caret rides the active line
      (function step() {
        ci++;
        if (phase === 'k') kEls[li].textContent = line.k.slice(0, ci);
        else vEls[li].textContent = line.v.slice(0, ci);
        doneChars++;
        progress();
        var phaseLen = phase === 'k' ? line.k.length : line.v.length;
        if (ci >= phaseLen) {
          if (phase === 'k') { phase = 'v'; ci = 0; }
          else { li++; setTimeout(typeLine, 90); return; }
        }
        setTimeout(step, 22 + Math.random() * 26);
      })();
    }

    function finish() {
      if (statusEl) statusEl.textContent = 'design system ready';
      setTimeout(function () {
        clearTimeout(failsafe);
        if (caret) caret.style.display = 'none';
        dismiss();
        try { window.sessionStorage.setItem('ab:preloader', '1'); } catch (e) {}
      }, 380);
    }

    progress();
    setTimeout(typeLine, 250);
  });

  // A slow monospace "telemetry" field behind the hero copy — decorative only.
  //
  // Two things worth knowing about this loop:
  //   1. The `prefers-reduced-motion` block at the end of styles.css can only
  //      cancel CSS animation. A requestAnimationFrame loop ignores it, so the
  //      media query is honoured here: under reduced motion we paint exactly one
  //      static frame and never start the loop.
  //   2. It stops drawing whenever the hero leaves the viewport or the tab is
  //      hidden, so an idle page costs nothing.

  onReady(function () {
    if (!document.querySelector('.code-bg')) return;
    if (!window.requestAnimationFrame) return;          // no rAF — leave the colour field

    var CELL_W = 13;          // one Geist Mono advance at 12px, plus air between streams
    var CELL_H = 17;
    var FONT = '12px "Geist Mono", ui-monospace, monospace';
    var MAX_FPS = 30;         // a drift this slow gains nothing from 60
    var POINTER_R = 150;      // highlight radius, px
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var layers = [];

    // Deterministic per-cell glyph, so the grid is never stored and the same time
    // bucket always yields the same frame.
    function glyphFor(col, row, bucket) {
      var n = (col * 73856093) ^ (row * 19349663) ^ (bucket * 83492791);
      return (n & 1) ? '1' : '0';
    }

    // Read the live tokens so the field follows the theme without a hard-coded palette.
    function palette() {
      var styles = window.getComputedStyle(document.documentElement);
      return {
        trail: styles.getPropertyValue('--text').trim() || '#dddddd',
        head: styles.getPropertyValue('--orange').trim() || '#fc4f00'
      };
    }

    // A column of falling glyphs: a head row, a trail length, and a slow speed.
    function newStream(rows, scatter) {
      var len = 6 + Math.floor(Math.random() * 12);
      return {
        head: scatter ? Math.random() * (rows + len) - len : -Math.random() * 6,
        len: len,
        speed: 1.6 + Math.random() * 3.4,
        // A minority of columns carry the orange "signal"; the rest stay neutral.
        signal: Math.random() < 0.24
      };
    }

    // Sizes the backing store and returns fresh geometry + streams.
    // Deliberately side-effect free apart from the canvas dimensions: it must NOT
    // touch the live layer's loop bookkeeping or the canvas.__glyphLayer pointer,
    // or the rAF loop and its IntersectionObserver end up bound to a dead object.
    function build(canvas) {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      // Cap the device pixel ratio: 3x triples the fill area for no visible gain.
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      var ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) return null;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = FONT;
      ctx.textBaseline = 'top';

      var rows = Math.ceil(h / CELL_H) + 1;
      var cols = Math.ceil(w / CELL_W);
      var streams = [];
      for (var c = 0; c < cols; c++) streams.push(newStream(rows, true));

      return { ctx: ctx, w: w, h: h, rows: rows, streams: streams };
    }

    function paint(layer, dt) {
      var ctx = layer.ctx;
      var pal = layer.pal;
      var px = layer.pointer;
      var bucket = Math.floor(layer.t / 0.26);          // glyphs mutate ~4x/sec

      ctx.clearRect(0, 0, layer.w, layer.h);

      for (var c = 0; c < layer.streams.length; c++) {
        var s = layer.streams[c];
        s.head += s.speed * dt;

        if (s.head - s.len > layer.rows) {              // fully past the bottom — recycle
          var fresh = newStream(layer.rows, false);
          s.head = fresh.head; s.len = fresh.len; s.speed = fresh.speed; s.signal = fresh.signal;
        }

        var x = c * CELL_W;

        for (var d = 0; d < s.len; d++) {
          var row = Math.floor(s.head - d);
          if (row < 0 || row >= layer.rows) continue;

          // Quadratic falloff gives a soft tail instead of a hard-edged block.
          var fade = 1 - d / s.len;
          var alpha = fade * fade * 0.4;
          if (alpha < 0.012) continue;

          if (px.active) {
            var dx = x - px.x, dy = (row * CELL_H) - px.y;
            var dist2 = dx * dx + dy * dy;
            if (dist2 < POINTER_R * POINTER_R) {
              alpha += (1 - dist2 / (POINTER_R * POINTER_R)) * 0.24;
            }
          }

          ctx.globalAlpha = Math.min(alpha, 0.7);
          ctx.fillStyle = (d === 0 && s.signal) ? pal.head : pal.trail;
          ctx.fillText(glyphFor(s.signal ? c : c + 7, row, bucket), x, row * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
    }

    function stop(layer) {
      if (layer.raf === null) return;
      window.cancelAnimationFrame(layer.raf);
      layer.raf = null;
    }

    function start(layer) {
      if (layer.raf !== null) return;
      var minDelta = 1 / MAX_FPS;

      function frame(now) {
        layer.raf = window.requestAnimationFrame(frame);
        var t = now / 1000;
        // Clamp dt so returning to a backgrounded tab doesn't teleport the streams.
        var dt = layer.last ? Math.min(t - layer.last, 0.1) : minDelta;
        if (dt < minDelta) return;                      // frame-rate cap
        layer.last = t;
        layer.t += dt;
        paint(layer, dt);
      }

      layer.raf = window.requestAnimationFrame(frame);
    }

    // Single gate for every reason to run or not: on-screen, tab visible, motion allowed.
    function sync(layer) {
      if (reduceMotion.matches) {
        layer.t = 3.2;                                  // one fixed, pleasant frame
        paint(layer, 0);
        stop(layer);
        return;
      }
      if (layer.visible && !document.hidden) start(layer); else stop(layer);
    }

    function syncAll() {
      layers.forEach(sync);
    }

    // --- one layer per hero on the page ---
    each('.code-bg', document, function (canvas) {
      var geo = build(canvas);
      if (!geo) return;
      var layer = {
        canvas: canvas, ctx: geo.ctx, w: geo.w, h: geo.h, rows: geo.rows,
        streams: geo.streams, t: 0, raf: null, last: 0, visible: true,
        pal: palette(), pointer: { x: 0, y: 0, active: false }
      };
      canvas.__glyphLayer = layer;   // set once, never reassigned
      layers.push(layer);
    });
    if (!layers.length) return;

    // Pointer highlight, measured against each canvas box.
    window.addEventListener('pointermove', function (event) {
      layers.forEach(function (layer) {
        var rect = layer.canvas.getBoundingClientRect();
        var inside = event.clientX >= rect.left && event.clientX <= rect.right &&
                     event.clientY >= rect.top && event.clientY <= rect.bottom;
        layer.pointer.active = inside;
        if (inside) {
          layer.pointer.x = event.clientX - rect.left;
          layer.pointer.y = event.clientY - rect.top;
        }
      });
    }, { passive: true });

    document.addEventListener('visibilitychange', syncAll);   // stop while the tab is hidden

    // React if the OS setting changes mid-session.
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function () {
        layers.forEach(function (layer) { layer.pal = palette(); layer.last = 0; });
        syncAll();
      });
    }

    // Re-read the tokens when the theme flips.
    if (window.MutationObserver) {
      new window.MutationObserver(function () {
        layers.forEach(function (layer) { layer.pal = palette(); });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // Keep the backing store in step with the box. A ResizeObserver covers the
    // cases a window 'resize' listener misses: webfonts swapping in and re-wrapping
    // the hero copy, and the portrait image settling. Rebuilding only sets the
    // canvas attributes — its on-screen size is CSS-driven, so there's no feedback loop.
    function rebuild(layer) {
      var geo = build(layer.canvas);
      if (!geo) return;
      // Copy the geometry IN PLACE. Assigning the whole object would clobber
      // raf/visible/t/pointer, orphaning the running loop and letting the
      // IntersectionObserver drive a discarded object — which spawns a second
      // loop on the same canvas.
      layer.ctx = geo.ctx;
      layer.w = geo.w;
      layer.h = geo.h;
      layer.rows = geo.rows;
      layer.streams = geo.streams;
      layer.last = 0;                 // dt must not span the resize
      sync(layer);                    // start() is a no-op while the loop is live
    }

    var onBoxChange = rafThrottle(function () { layers.forEach(rebuild); });

    if (window.ResizeObserver) {
      var ro = new window.ResizeObserver(onBoxChange);
      layers.forEach(function (layer) { ro.observe(layer.canvas); });
    } else {
      window.addEventListener('resize', onBoxChange, { passive: true });
    }

    // Stop drawing while the hero is off-screen — the single biggest battery save.
    if (window.IntersectionObserver) {
      var io = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var layer = entry.target.__glyphLayer;
          if (!layer) return;
          layer.visible = entry.isIntersecting;
          sync(layer);
        });
      }, { rootMargin: '120px' });
      layers.forEach(function (layer) { io.observe(layer.canvas); });
    }

    syncAll();
  });

})();
